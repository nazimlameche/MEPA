import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_MODEL   = process.env.MISTRAL_MODEL ?? 'mistral-small-latest';
const MISTRAL_URL     = 'https://api.mistral.ai/v1/chat/completions';

interface MistralResponse {
  choices: { message: { content: string } }[];
}

const ScoreResponseSchema = z.object({
  'clarté_objectif':  z.object({ score: z.number().min(0).max(25), feedback: z.string() }),
  'contexte':         z.object({ score: z.number().min(0).max(25), feedback: z.string() }),
  'format_sortie':    z.object({ score: z.number().min(0).max(25), feedback: z.string() }),
  'sécurité_données': z.object({
    score:     z.number().min(0).max(25),
    pii_found: z.array(z.string()),
    feedback:  z.string(),
  }),
  total_score:     z.number().min(0).max(100),
  global_feedback: z.string(),
  passed:          z.boolean(),
});

// CNIL : aucune PII dans ce prompt système — le sujet est générique, la réponse de l'élève est anonymisée
const buildSystemPrompt = (subject: string, userPrompt: string) => `
Tu es un évaluateur pédagogique expert en IA et en prompt engineering.

L'élève devait : "${subject}"

L'élève a écrit ce prompt : "${userPrompt}"

Évalue ce prompt selon 4 critères et réponds UNIQUEMENT avec le JSON ci-dessous, sans texte avant ni après, sans balises markdown.

Critères d'évaluation :

1. clarté_objectif (0-25 points) : L'objectif est-il exprimé clairement dès le début sans ambiguïté ?
   - objectif_explicite : 0 (absent), 10 (vague) ou 15 (clair et précis)
   - sans_ambiguïté : 0 (ambigu) ou 10 (précis)

2. contexte (0-25 points) : L'IA a-t-elle un rôle ou une situation à partir de laquelle travailler ?
   - rôle_donné : 0 (absent) ou 12 (rôle ou situation précisée)
   - public_cible : 0 (absent) ou 13 (public ou usage mentionné)

3. format_sortie (0-25 points) : Le type et la forme de la réponse attendue sont-ils précisés ?
   - type_réponse : 0 (absent) ou 15 (type précisé : liste, tableau, étapes, texte court…)
   - longueur_langue : 0 (absent) ou 10 (longueur ou langue précisée si pertinent)

4. sécurité_données (0-25 points) : Le prompt contient-il des données personnelles identifiantes ?
   - Toujours 25/25 SAUF :
     - prénom + âge identifiable → -15
     - numéro de téléphone ou email → score = 0 (disqualifiant)
     - nom de famille → -10
   - Si des données personnelles sont trouvées, les lister dans pii_found

total_score = somme des 4 scores (0-100)
passed = true si total_score >= 90, false sinon

Le champ "global_feedback" doit :
- Être formulé comme un conseil positif et personnalisé (max 2 phrases)
- Identifier la principale force du prompt
- Suggérer UNE amélioration concrète et spécifique
- NE PAS utiliser de phrases génériques comme "recommence en structurant ta demande" ou "essaie d'être plus clair"
- Utiliser "tu" et être bienveillant — l'utilisateur est un collégien/lycéen

JSON attendu (valeurs fictives — remplace par les valeurs réelles de ton évaluation) :
{
  "clarté_objectif":  { "score": 20, "feedback": "L'objectif est clair mais le contexte manque de précision." },
  "contexte":         { "score": 12, "feedback": "Tu as donné un rôle à l'IA, mais le public cible n'est pas mentionné." },
  "format_sortie":    { "score": 10, "feedback": "Aucun format de sortie précisé. Demander une liste ou un tableau ?" },
  "sécurité_données": { "score": 25, "pii_found": [], "feedback": "Aucune donnée personnelle détectée." },
  "total_score": 67,
  "global_feedback": "Tu as bien posé la base de ta demande ! Pour aller plus loin, précise quel format tu attends : une liste numérotée, un texte court ou un tableau ?",
  "passed": false
}
`.trim();

export async function POST(req: NextRequest) {
  if (!MISTRAL_API_KEY) {
    return NextResponse.json({ message: 'MISTRAL_API_KEY manquant.' }, { status: 500 });
  }

  const body = await req.json() as { exerciseId?: string; subject?: string; userPrompt?: string };
  const { exerciseId, subject, userPrompt } = body;

  if (!subject || !userPrompt || userPrompt.trim().length < 10) {
    return NextResponse.json({ message: 'Prompt trop court.' }, { status: 400 });
  }

  let raw: string;
  try {
    const res = await fetch(MISTRAL_URL, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'X-No-Cache':    '1', // CNIL : zero-retention
      },
      body: JSON.stringify({
        model:           MISTRAL_MODEL,
        messages:        [{ role: 'user', content: buildSystemPrompt(subject, userPrompt) }],
        temperature:     0.2,
        max_tokens:      1024,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({})) as Record<string, unknown>;
      console.error('[Mistral] error', res.status, JSON.stringify(errBody));
      return NextResponse.json({ message: `Erreur Mistral ${res.status}.`, detail: errBody }, { status: 502 });
    }

    const data = await res.json() as MistralResponse;
    raw = data.choices[0]?.message?.content ?? '';
  } catch {
    return NextResponse.json({ message: 'Impossible de contacter Mistral.' }, { status: 502 });
  }

  // Parsing + validation Zod
  let parsed: z.infer<typeof ScoreResponseSchema>;
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    parsed = ScoreResponseSchema.parse(JSON.parse(cleaned));
  } catch {
    console.error('[score] parse error — raw:', raw.slice(0, 300));
    return NextResponse.json(
      { message: 'Réponse Mistral non parseable. Réessaie.' },
      { status: 422 },
    );
  }

  // Persister la tentative en base (best-effort — ne bloque pas la réponse)
  try {
    const backendUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      // CNIL : userPrompt stocké ici uniquement si pii_found est vide (vérifié par Mistral)
      await fetch(`${backendUrl}/api/prompting/attempts`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': authHeader,
          'X-No-Cache':    '1', // CNIL
        },
        body: JSON.stringify({
          exerciseId:  exerciseId ?? subject.slice(0, 50),
          userPrompt:  parsed['sécurité_données'].pii_found.length === 0 ? userPrompt : '[redacted]',
          totalScore:  parsed.total_score,
          passed:      parsed.passed,
          scoreDetail: parsed,
        }),
      });
    }
  } catch {
    // Silencieux — le scoring fonctionne même sans persistance
  }

  return NextResponse.json(parsed);
}

import { NextRequest, NextResponse } from 'next/server';
import type { PromptScoreOutput } from '@/lib/types/prompting';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL   = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// CNIL : aucune PII dans ce prompt système — le sujet est générique, la réponse de l'élève est anonymisée
const buildSystemPrompt = (subject: string, userPrompt: string) => `
Tu es un évaluateur pédagogique expert en IA et en prompt engineering.

L'élève devait : "${subject}"

L'élève a écrit ce prompt : "${userPrompt}"

Évalue ce prompt en JSON strict selon ces 3 critères. Réponds UNIQUEMENT avec le JSON, sans texte avant ni après, sans balises markdown.

{
  "total_score": <nombre entre 0 et 100>,
  "passed": <true si total_score === 100>,
  "steps": {
    "structure": {
      "score": <0 à 33>,
      "passed": <boolean>,
      "feedback": "<phrase courte en français>",
      "suggestions": ["<suggestion 1>", "<suggestion 2>"]
    },
    "pii_check": {
      "score": <0 à 33>,
      "passed": <boolean>,
      "pii_found": ["<élément PII trouvé>"],
      "feedback": "<phrase courte en français>"
    },
    "output_format": {
      "score": <0 à 34>,
      "passed": <boolean>,
      "feedback": "<phrase courte en français>",
      "suggestions": ["<suggestion 1>"]
    }
  },
  "global_feedback": "<message d'encouragement court en français, adapté au score>"
}

Critères d'évaluation :
- structure (0-33) : Le prompt a-t-il un contexte clair, un objectif précis, des contraintes utiles ?
- pii_check (0-33) : Le prompt contient-il des données personnelles (nom, prénom, adresse, école, email, téléphone) ? Si oui, score = 0 et lister les PII trouvées dans pii_found.
- output_format (0-34) : Le prompt précise-t-il le format de la réponse attendue (longueur, structure, langue, niveau) ?

total_score = structure.score + pii_check.score + output_format.score
passed = true UNIQUEMENT si total_score === 100
`.trim();

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ message: 'GEMINI_API_KEY manquant.' }, { status: 500 });
  }

  const body = await req.json() as { subject?: string; userPrompt?: string };
  const { subject, userPrompt } = body;

  if (!subject || !userPrompt || userPrompt.trim().length < 10) {
    return NextResponse.json({ message: 'Prompt trop court.' }, { status: 400 });
  }

  const geminiBody = {
    contents: [{ parts: [{ text: buildSystemPrompt(subject, userPrompt) }] }],
    generationConfig: {
      temperature:     0.2,
      maxOutputTokens: 1024,
    },
  };

  let raw: string;
  try {
    const res = await fetch(GEMINI_URL, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-No-Cache':   '1', // CNIL : zero-retention
      },
      body: JSON.stringify(geminiBody),
    });

    if (!res.ok) {
      return NextResponse.json({ message: 'Erreur Gemini.' }, { status: 502 });
    }

    const data = await res.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  } catch {
    return NextResponse.json({ message: 'Impossible de contacter Gemini.' }, { status: 502 });
  }

  // Parsing + validation minimale
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed  = JSON.parse(cleaned) as PromptScoreOutput;

    if (
      typeof parsed.total_score !== 'number' ||
      typeof parsed.passed      !== 'boolean' ||
      !parsed.steps?.structure  ||
      !parsed.steps?.pii_check  ||
      !parsed.steps?.output_format
    ) {
      throw new Error('Structure JSON invalide');
    }

    // Persister la tentative en base (best-effort — ne bloque pas la réponse)
    try {
      const backendUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        await fetch(`${backendUrl}/api/prompting/attempts`, {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': authHeader,
            'X-No-Cache':    '1', // CNIL
          },
          body: JSON.stringify({
            exerciseId:  subject.slice(0, 50),
            userPrompt,
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
  } catch {
    // Retry implicite : on retourne une erreur 422 pour que le client puisse réessayer
    return NextResponse.json(
      { message: 'Réponse Gemini non parseable. Réessaie.' },
      { status: 422 }
    );
  }
}

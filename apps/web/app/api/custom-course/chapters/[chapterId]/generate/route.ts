import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import type { ParcoursChapter } from '@/lib/types/custom-course';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_MODEL   = process.env.MISTRAL_MODEL ?? 'mistral-small-latest';
const MISTRAL_URL     = 'https://api.mistral.ai/v1/chat/completions';

// ─── Zod schema (snake_case strict — rejette correctIndex) ──────────────────
const CourseBlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'),       content:       z.string() }),
  z.object({ type: z.literal('story'),      title:         z.string(), narrative: z.string(), moral: z.string() }),
  z.object({ type: z.literal('quiz'),       question:      z.string(), options: z.array(z.string()).min(2), correct_index: z.number(), explanation: z.string() }),
  z.object({ type: z.literal('fill_blank'), sentence:      z.string(), blank_word: z.string(), hint: z.string() }),
  z.object({ type: z.literal('tip'),        content:       z.string() }),
  z.object({ type: z.literal('prompting_challenge'), numero: z.number(), titre: z.string(), consigne: z.string() }),
]);

const GeneratedChapterSchema = z.object({
  title:  z.string(),
  blocks: z.array(CourseBlockSchema).min(1),
});

type GeneratedChapterContent = z.infer<typeof GeneratedChapterSchema>;

// ─── Sanitisation CNIL ──────────────────────────────────────────────────────
// CNIL: les centres d'intérêt généraux (sport, musique…) ne sont pas des PII —
// seules les données identifiantes (âge exact, prénom, école, adresse) sont retirées.
function sanitizeTheme(theme: string): string {
  const sanitized = theme
    .replace(/\b\d{1,2}\s*ans\b/gi, '')                                              // CNIL: âge exact
    .replace(/\b(je\s+m['']appelle|mon\s+prénom\s+est?|appelle[-\s]moi)\s+\S+/gi, '') // CNIL: prénom
    .replace(/\b(mon|ma|notre)\s+(école|lycée|collège|classe|prof|professeur)\b/gi, 'mon établissement') // CNIL: école
    .replace(/\b(rue|avenue|boulevard|impasse|allée)\s+[^\s,]+/gi, '')               // CNIL: adresse
    .trim();
  return sanitized || 'un sujet de ton choix';
}

const LEVEL_LABEL: Record<string, string> = {
  college: 'collégiens (11-15 ans)',
  lycee:   'lycéens (15-18 ans)',
  adulte:  'adultes',
};

// ─── Directives pédagogiques par chapitre ───────────────────────────────────
// Ancre chaque chapitre sur l'angle IA explicite — évite la dérive vers un cours
// générique sur le thème (sécurité des données en général, écologie, etc.).
const CHAPTER_IA_DIRECTIVES: Record<string, string> = {
  'comprendre-ia':
    "Explique ce qu'est l'intelligence artificielle : comment elle apprend (données, modèles), " +
    "comment elle est utilisée au quotidien, et illustre avec des exemples concrets dans le domaine « ${theme} ».",
  'bon-prompting':
    "Explique comment rédiger un bon prompt à destination d'une IA : contexte, clarté, format attendu, itération. " +
    "Utilise des mises en situation dans le domaine « ${theme} » (ex : demander à une IA d'analyser une performance, générer un plan d'entraînement…).",
  'securite':
    "Explique les risques liés à l'usage des IA pour la vie privée : quelles données les IA collectent et retiennent, " +
    "comment les protéger, pourquoi ne jamais partager de données personnelles dans un prompt. " +
    "Illustre avec des cas concrets dans le domaine « ${theme} ».",
  'impact-environnemental':
    "Explique l'empreinte carbone et énergétique de l'IA : coût de l'entraînement des grands modèles, " +
    "consommation des datacenters, bilan par requête. " +
    "Illustre avec des exemples dans le domaine « ${theme} » pour rendre les ordres de grandeur concrets.",
  'ethique':
    "Explique les enjeux éthiques propres à l'IA : biais algorithmiques, hallucinations, décisions automatisées, " +
    "droits d'auteur, impact sur l'emploi, responsabilité. " +
    "Illustre avec des exemples dans le domaine « ${theme} ».",
};

// ─── Prompts Mistral ─────────────────────────────────────────────────────────

function buildAtelierPrompt(theme: string, levelLabel: string): string {
  return `Tu es un concepteur pédagogique spécialisé dans l'éducation numérique.
Tu vas créer un atelier de prompting IA pour des élèves qui s'intéressent à : ${theme}
Écris exactement 3 activités. Chaque activité demande à l'élève de formuler un prompt à une IA.
Les activités doivent :
- Être formulées comme des défis ludiques liés à "${theme}" ("Demande à l'IA de...", "Essaie de demander à l'IA...")
- Challenger l'élève à ne PAS partager de données personnelles (prénom, école, adresse, âge exact) — sans lui dire explicitement de ne pas les partager
- Avoir un titre court et accrocheur lié à ${theme}
Règles absolues :
- Langage adapté à des ${levelLabel}
- Aucun contenu inapproprié, jamais de données personnelles dans les questions
Retourne UNIQUEMENT un JSON valide sans markdown :
{
  "title": "Atelier prompting — ${theme}",
  "blocks": [
    { "type": "prompting_challenge", "numero": 1, "titre": "...", "consigne": "..." },
    { "type": "prompting_challenge", "numero": 2, "titre": "...", "consigne": "..." },
    { "type": "prompting_challenge", "numero": 3, "titre": "...", "consigne": "..." }
  ]
}`;
}

function buildChapterPrompt(
  theme: string,
  chapterTitle: string,
  levelLabel: string,
  iaDirective: string,
): string {
  return `Tu génères un chapitre de cours sur l'IA pour des ${levelLabel} qui s'intéressent à : ${theme}

Objectif pédagogique du chapitre "${chapterTitle}" :
${iaDirective}

Contraintes absolues :
- Chaque bloc doit traiter l'IA, pas uniquement le thème ${theme} de façon isolée
- Les exemples et anecdotes doivent toujours relier l'IA au domaine "${theme}"
- Langage adapté à des ${levelLabel}
- Jamais de données personnelles dans le contenu
- Entre 5 et 7 blocs variés, le dernier doit être un quiz sur l'IA

Types de blocs disponibles : text, story, quiz, fill_blank, tip
Format JSON strict (snake_case uniquement — correct_index PAS correctIndex) :
{
  "title": "...",
  "blocks": [
    { "type": "text", "content": "..." },
    { "type": "story", "title": "...", "narrative": "...", "moral": "..." },
    { "type": "quiz", "question": "...", "options": ["...","...","...","..."], "correct_index": 0, "explanation": "..." },
    { "type": "fill_blank", "sentence": "...", "blank_word": "...", "hint": "..." },
    { "type": "tip", "content": "..." }
  ]
}`;
}

interface MistralResponse {
  choices: { message: { content: string } }[];
}

async function callMistral(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!MISTRAL_API_KEY) throw new Error('MISTRAL_API_KEY manquant');

  const res = await fetch(MISTRAL_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${MISTRAL_API_KEY}`,
      'X-No-Cache':    '1', // CNIL: zero-retention
    },
    body: JSON.stringify({
      model:           MISTRAL_MODEL,
      messages:        [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      temperature:     0.7,
      max_tokens:      2048,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, unknown>;
    console.error('[Mistral] error', res.status, JSON.stringify(err));
    throw new Error(`Mistral HTTP ${res.status}`);
  }

  const data = await res.json() as MistralResponse;
  return data.choices[0]?.message?.content ?? '';
}

// ─── Route handler ───────────────────────────────────────────────────────────

interface RouteParams {
  params: Promise<{ chapterId: string }>;
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const token   = session?.accessToken;
  if (!token) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
  }

  const { chapterId } = await params;

  // 1. Récupérer le chapitre (avec relations parcours pour theme/level)
  let chapter: ParcoursChapter & { parcours?: { theme: string; level: string } };
  try {
    chapter = await apiClient.get<ParcoursChapter & { parcours?: { theme: string; level: string } }>(
      `/custom-course/chapters/${chapterId}`,
      token,
    );
  } catch {
    return NextResponse.json({ message: 'Chapitre introuvable' }, { status: 404 });
  }

  // 2. Idempotent — ne pas regénérer si déjà prêt (mais retry si 'error')
  if (chapter.status === 'ready' || chapter.status === 'completed') {
    return NextResponse.json({ content: chapter.content });
  }

  const theme      = chapter.parcours?.theme   ?? 'général';
  const level      = chapter.parcours?.level   ?? 'college';
  const levelLabel = LEVEL_LABEL[level]        ?? 'élèves';
  // CNIL: retire uniquement les données identifiantes (âge, prénom, école, adresse)
  const safeTheme  = sanitizeTheme(theme);

  const isAtelier = chapter.chapterKey === 'atelier-prompting';

  const rawDirective = CHAPTER_IA_DIRECTIVES[chapter.chapterKey] ?? CHAPTER_IA_DIRECTIVES['comprendre-ia'];
  const iaDirective  = rawDirective.replace(/\$\{theme\}/g, safeTheme);

  const systemPrompt = isAtelier
    ? 'Tu es un concepteur pédagogique spécialisé dans l\'éducation numérique pour des professeurs et élèves.'
    : 'Tu es un professeur expert en intelligence artificielle. Tu génères des chapitres de cours sur l\'IA adaptés aux jeunes. Chaque bloc de contenu doit traiter l\'IA — pas uniquement le thème de l\'élève. Réponds UNIQUEMENT en JSON valide.';

  const userPrompt = isAtelier
    ? buildAtelierPrompt(safeTheme, levelLabel)
    : buildChapterPrompt(safeTheme, chapter.title, levelLabel, iaDirective);

  console.log(`[generate-chapter] theme="${theme}" → safeTheme="${safeTheme}" | key=${chapter.chapterKey} | level=${level}`);

  let content: GeneratedChapterContent;
  try {
    const raw     = await callMistral(systemPrompt, userPrompt);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed  = GeneratedChapterSchema.parse(JSON.parse(cleaned));
    content       = parsed;
  } catch (err) {
    console.error('[generate-chapter] parse error', err);
    // Marquer le chapitre en erreur dans NestJS
    try {
      await apiClient.put(`/custom-course/chapters/${chapterId}/content`, { status: 'error', content: {} }, token);
    } catch { /* best-effort */ }
    return NextResponse.json({ message: 'Erreur lors de la génération. Réessaie.' }, { status: 500 });
  }

  // 3. Persister dans NestJS
  try {
    await apiClient.put(
      `/custom-course/chapters/${chapterId}/content`,
      { status: 'ready', content },
      token,
    );
  } catch (err) {
    console.error('[generate-chapter] save error', err);
    return NextResponse.json({ message: 'Erreur lors de la sauvegarde.' }, { status: 500 });
  }

  return NextResponse.json({ content });
}

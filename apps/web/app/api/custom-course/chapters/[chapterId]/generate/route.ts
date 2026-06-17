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

// ─── Anonymisation CNIL ─────────────────────────────────────────────────────
// CNIL: le thème brut n'est jamais envoyé à Mistral — on l'anonymise en catégorie
function anonymizeInterest(interest: string): string {
  const lower = interest.toLowerCase().trim();
  const categories: [RegExp, string][] = [
    [/foot|soccer|rugby|basket|tennis|sport|athl/i,    'un sport populaire'],
    [/manga|anime|dessin|bd|comic/i,                   "une forme d'art visuel japonais ou occidental"],
    [/music|chant|guitare|piano|rap|hip.?hop|jazz/i,   'la musique et ses pratiques'],
    [/jeu|gaming|video.?game|minecraft|fortnite/i,     'les jeux vidéo'],
    [/cuisine|recette|gastronomie|pâtisserie/i,        "l'art culinaire"],
    [/voyage|pays|géographie|culture/i,                'les voyages et la géographie'],
    [/science|physique|chimie|biologie|espace/i,       'les sciences naturelles'],
    [/histoire|guerre|empire|civilisation/i,           "l'histoire et les civilisations"],
    [/code|programm|informatique|robot/i,              "l'informatique et la programmation"],
    [/film|cinéma|série|netflix/i,                     'le cinéma et les séries'],
    [/animal|chien|chat|nature|écologie/i,             'la nature et les animaux'],
    [/mode|vêtement|style|fashion/i,                   'la mode et le style'],
  ];
  for (const [pattern, category] of categories) {
    if (pattern.test(lower)) return category;
  }
  return 'un domaine de connaissance populaire';
}

const LEVEL_LABEL: Record<string, string> = {
  college: 'collégiens (11-15 ans)',
  lycee:   'lycéens (15-18 ans)',
  adulte:  'adultes',
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

function buildChapterPrompt(theme: string, chapterTitle: string, levelLabel: string): string {
  return `Génère le chapitre "${chapterTitle}" pour un élève qui s'intéresse à : ${theme}
Entre 5 et 7 blocs variés, terminé par un quiz.
Types disponibles : text, story, quiz, fill_blank, tip
Règles :
- Langage adapté à des ${levelLabel}
- Utilise des exemples concrets liés à "${theme}" pour illustrer chaque concept
- Jamais de données personnelles dans le contenu
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
  // CNIL: anonymisation du thème avant injection dans le prompt
  const anonTheme  = anonymizeInterest(theme);

  const isAtelier = chapter.chapterKey === 'atelier-prompting';
  const systemPrompt = isAtelier
    ? 'Tu es un concepteur pédagogique spécialisé dans l\'éducation numérique pour des professeurs et élèves.'
    : 'Tu es un professeur expert en intelligence artificielle, spécialisé dans l\'enseignement aux collégiens et lycéens. Génère un chapitre de cours sur l\'IA, personnalisé selon les intérêts de l\'élève. Règles strictes : contenu adapté au niveau indiqué, exemples liés au thème, jamais de données personnelles, répondre UNIQUEMENT en JSON valide.';

  const userPrompt = isAtelier
    ? buildAtelierPrompt(anonTheme, levelLabel)
    : buildChapterPrompt(anonTheme, chapter.title, levelLabel);

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

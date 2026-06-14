import { NextRequest, NextResponse } from 'next/server';
import type { CourseFormData, GeneratedCourseOutput } from '@/lib/types/custom-course';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL   = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// CNIL : anonymisation du centre d'intérêt avant injection dans le prompt
// Le mot exact de l'utilisateur n'est jamais envoyé à Gemini
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
  college: 'un collégien (11-15 ans)',
  lycee:   'un lycéen (15-18 ans)',
  adulte:  'un adulte ou étudiant universitaire',
};

function buildPrompt(data: CourseFormData, anonymizedInterest: string): string {
  const levelLabel = LEVEL_LABEL[data.level] ?? 'un élève';

  return `
Tu es un pédagogue expert en intelligence artificielle. Génère un cours engageant sur l'IA et ses usages, adapté à ${levelLabel}, en utilisant comme fil conducteur ${anonymizedInterest}.

Le cours doit expliquer un concept lié à l'IA (ex : biais algorithmiques, données d'entraînement, reconnaissance d'image, recommandation, etc.) en l'illustrant avec des exemples concrets tirés de ${anonymizedInterest}.

Contexte pédagogique : ${data.context}

Contraintes :
- Entre 4 et 7 blocs au total
- Mélanger les types de blocs pour maintenir l'engagement
- Langage adapté au niveau scolaire indiqué
- Tous les textes en français
- Ne pas mentionner de noms de personnes réelles, d'entreprises spécifiques de manière promotionnelle, ni de données personnelles

Réponds UNIQUEMENT avec ce JSON strict, sans texte avant ni après, sans balises markdown :

{
  "title": "<titre du cours en français>",
  "level": "${data.level}",
  "estimated_duration_minutes": <nombre entier entre 5 et 15>,
  "blocks": [
    // Entre 4 et 7 blocs. Types disponibles :
    // { "type": "text", "content": "<markdown allégé : **gras** autorisé>" }
    // { "type": "quiz", "question": "...", "options": ["A","B","C","D"], "correct_index": <0-3>, "explanation": "..." }
    // { "type": "fill_blank", "sentence": "phrase avec ___", "blank_word": "mot", "hint": "indice" }
    // { "type": "story", "title": "...", "narrative": "...", "moral": "..." }
    // { "type": "tip", "content": "..." }
  ]
}
`.trim();
}

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ message: 'GEMINI_API_KEY manquant.' }, { status: 500 });
  }

  const body = await req.json() as Partial<CourseFormData>;
  const { interest, level, context } = body;

  if (!interest?.trim() || !level || !context?.trim()) {
    return NextResponse.json({ message: 'Données manquantes.' }, { status: 400 });
  }

  if (!['college', 'lycee', 'adulte'].includes(level)) {
    return NextResponse.json({ message: 'Niveau invalide.' }, { status: 400 });
  }

  // CNIL : anonymisation avant envoi à Gemini
  const anonymizedInterest = anonymizeInterest(interest);

  const prompt = buildPrompt({ interest, level, context }, anonymizedInterest);

  const geminiBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature:     0.7,
      maxOutputTokens: 2048,
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

  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed  = JSON.parse(cleaned) as GeneratedCourseOutput;

    if (
      typeof parsed.title                      !== 'string' ||
      typeof parsed.estimated_duration_minutes !== 'number' ||
      !Array.isArray(parsed.blocks)            ||
      parsed.blocks.length < 2
    ) {
      throw new Error('Structure JSON invalide');
    }

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { message: 'Réponse Gemini non parseable. Réessaie.' },
      { status: 422 }
    );
  }
}

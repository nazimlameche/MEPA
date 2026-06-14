import { NextRequest, NextResponse } from 'next/server';

type FrontendLevel = 'college' | 'lycee' | 'universite' | 'teacher';

// Map frontend level choices to backend role values
const LEVEL_TO_ROLE: Record<FrontendLevel, 'student' | 'teacher'> = {
  college:    'student',
  lycee:      'student',
  universite: 'student',
  teacher:    'teacher',
};

interface RegisterBody {
  email:     string;
  password:  string;
  level:     FrontendLevel;
  birthYear: number;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: RegisterBody;
  try {
    body = (await req.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ message: 'Corps de requête invalide.' }, { status: 400 });
  }

  const { email, password, level, birthYear } = body;

  if (!email || !password || !level || !birthYear) {
    return NextResponse.json({ message: 'Tous les champs sont requis.' }, { status: 400 });
  }

  const role = LEVEL_TO_ROLE[level];
  if (!role) {
    return NextResponse.json({ message: 'Niveau invalide.' }, { status: 400 });
  }

  const apiUrl = process.env['API_URL'] ?? 'http://localhost:3001';

  try {
    const res = await fetch(`${apiUrl}/api/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password, role, birthYear }),
    });

    const data: unknown = await res.json();

    if (!res.ok) {
      const msg = (data as { message?: string }).message ?? "Une erreur est survenue.";
      return NextResponse.json({ message: msg }, { status: res.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Impossible de contacter le serveur.' }, { status: 503 });
  }
}

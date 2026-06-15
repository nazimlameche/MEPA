import { NextRequest, NextResponse } from 'next/server';
import { SIGNUP_ROLES, type SignupRole } from '@ai-edu/shared';

interface RegisterBody {
  email:     string;
  password:  string;
  role:      SignupRole;
  birthYear: number;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: RegisterBody;
  try {
    body = (await req.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ message: 'Corps de requête invalide.' }, { status: 400 });
  }

  const { email, password, role, birthYear } = body;

  if (!email || !password || !role || !birthYear) {
    return NextResponse.json({ message: 'Tous les champs sont requis.' }, { status: 400 });
  }

  if (!(SIGNUP_ROLES as readonly string[]).includes(role)) {
    return NextResponse.json({ message: 'Rôle invalide.' }, { status: 400 });
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

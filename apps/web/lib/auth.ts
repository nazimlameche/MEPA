import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role?: string;
      xp?: number;
      level?: number;
      streakDays?: number;
    };
  }
  interface User {
    role?: string;
    xp?: number;
    level?: number;
    streakDays?: number;
  }
}

interface ApiLoginResponse {
  accessToken: string;
}

interface ApiProfile {
  id: string;
  role: string;
  xp: number;
  level: number;
  streakDays: number;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const apiUrl = process.env['API_URL'] ?? 'http://localhost:3001';

        const res = await fetch(`${apiUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        });

        if (!res.ok) return null;

        const { accessToken } = (await res.json()) as ApiLoginResponse;

        const profileRes = await fetch(`${apiUrl}/api/users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!profileRes.ok) return null;

        const profile = (await profileRes.json()) as ApiProfile;

        return {
          id: profile.id,
          email: credentials.email as string,
          role: profile.role,
          xp: profile.xp,
          level: profile.level,
          streakDays: profile.streakDays,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token['role'] = user.role;
        token['xp'] = user.xp;
        token['level'] = user.level;
        token['streakDays'] = user.streakDays;
        token['userId'] = user.id;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token['userId'] as string;
      session.user.role = token['role'] as string;
      session.user.xp = token['xp'] as number;
      session.user.level = token['level'] as number;
      session.user.streakDays = token['streakDays'] as number;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
});

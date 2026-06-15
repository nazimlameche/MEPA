import NextAuth, { type NextAuthResult } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      email: string;
      name?: string | null;
      role?: string | null;
      xp?: number;
      level?: number;
      streakDays?: number;
      needsRoleSelection?: boolean;
    };
  }
  interface User {
    role?:               string | null;
    xp?:                 number;
    level?:              number;
    streakDays?:         number;
    apiToken?:           string;
    needsRoleSelection?: boolean;
  }
}

interface ApiLoginResponse {
  token: string;
}

interface ApiOAuthResponse {
  token:              string;
  userId:             string;
  role:               string | null;
  needsRoleSelection: boolean;
}

interface ApiProfile {
  id:         string;
  role:       string | null;
  xp:         number;
  level:      number;
  streakDays: number;
}

const _nextAuth: NextAuthResult = NextAuth({
  providers: [
    Google({
      clientId:     process.env['AUTH_GOOGLE_ID']!,
      clientSecret: process.env['AUTH_GOOGLE_SECRET']!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email:    { label: 'Email',       type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const apiUrl = process.env['API_URL'] ?? 'http://localhost:3001';

        try {
          const res = await fetch(`${apiUrl}/api/auth/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email: credentials.email, password: credentials.password }),
          });

          if (!res.ok) return null;

          const { token } = (await res.json()) as ApiLoginResponse;

          const profileRes = await fetch(`${apiUrl}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!profileRes.ok) return null;

          const profile = (await profileRes.json()) as ApiProfile;

          return {
            id:         profile.id,
            email:      credentials.email as string,
            role:       profile.role,
            xp:         profile.xp,
            level:      profile.level,
            streakDays: profile.streakDays,
            apiToken:   token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, user, profile }) {
      if (account?.provider === 'google') {
        const email = profile?.email ?? user.email;
        if (!email) return false;

        const apiUrl       = process.env['API_URL'] ?? 'http://localhost:3001';
        const oauthSecret  = process.env['AUTH_OAUTH_SECRET'];

        try {
          const res = await fetch(`${apiUrl}/api/auth/oauth`, {
            method:  'POST',
            headers: {
              'Content-Type':   'application/json',
              'x-oauth-secret': oauthSecret ?? '',
            },
            body: JSON.stringify({ email, provider: 'google' }),
          });

          if (!res.ok) return false;

          const data = (await res.json()) as ApiOAuthResponse;

          // Attach API token and flags to the user object for the jwt callback
          user.apiToken           = data.token;
          user.id                 = data.userId;
          user.role               = data.role;
          user.needsRoleSelection = data.needsRoleSelection;
        } catch {
          return false;
        }
      }
      return true;
    },

    jwt({ token, user, trigger, session: sessionUpdate }) {
      if (user) {
        token['role']               = user.role;
        token['xp']                 = user.xp;
        token['level']              = user.level;
        token['streakDays']         = user.streakDays;
        token['userId']             = user.id;
        token['apiToken']           = user.apiToken;
        token['needsRoleSelection'] = user.needsRoleSelection ?? false;
      }
      // update() called from client (e.g. after role onboarding)
      if (trigger === 'update' && sessionUpdate) {
        const upd = sessionUpdate as unknown as { needsRoleSelection?: boolean; role?: string | null };
        if (upd.needsRoleSelection !== undefined) token['needsRoleSelection'] = upd.needsRoleSelection;
        if (upd.role !== undefined) token['role'] = upd.role;
      }
      return token;
    },

    session({ session, token }) {
      session.user.id                 = (token['userId'] as string | undefined) ?? '';
      session.user.role               = (token['role'] as string | null | undefined) ?? null;
      session.user.xp                 = (token['xp'] as number | undefined) ?? 0;
      session.user.level              = (token['level'] as number | undefined) ?? 1;
      session.user.streakDays         = (token['streakDays'] as number | undefined) ?? 0;
      session.user.needsRoleSelection = (token['needsRoleSelection'] as boolean | undefined) ?? false;
      const apiToken = token['apiToken'] as string | undefined;
      if (apiToken !== undefined) session.accessToken = apiToken;
      return session;
    },

    redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: '/login',
    error:  '/login',
  },
  session: { strategy: 'jwt' },
});

export const handlers: NextAuthResult['handlers'] = _nextAuth.handlers;
export const auth:     NextAuthResult['auth']     = _nextAuth.auth;
export const signIn:   NextAuthResult['signIn']   = _nextAuth.signIn;
export const signOut:  NextAuthResult['signOut']  = _nextAuth.signOut;

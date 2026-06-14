const BASE_URL = `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'}/api`;

interface FetchOptions extends RequestInit {
  token?: string;
}

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...rest, headers });

  if (!res.ok) {
    const error = (await res.json().catch(() => ({ message: 'Erreur inconnue' }))) as { message?: string };
    throw new Error(error.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

function withToken(token: string | undefined): Pick<FetchOptions, 'token'> {
  return token !== undefined ? { token } : {};
}

export const apiClient = {
  get: <T>(path: string, token?: string) => request<T>(path, { method: 'GET', ...withToken(token) }),
  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), ...withToken(token) }),
  patch: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...withToken(token) }),
  delete: <T>(path: string, token?: string) => request<T>(path, { method: 'DELETE', ...withToken(token) }),
};

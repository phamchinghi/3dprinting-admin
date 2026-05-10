export const BASE_URL = 'http://localhost:8081';
const REFRESH_TOKEN_KEY = 'tini-admin-refresh-token';

let _accessToken: string | null = null;

export const getAccessToken  = () => _accessToken;
export const setAccessToken  = (t: string | null) => { _accessToken = t; };

export const getRefreshToken = (): string | null => {
  try { return localStorage.getItem(REFRESH_TOKEN_KEY); }
  catch { return null; }
};
export const setRefreshToken = (t: string | null) => {
  try {
    if (t) localStorage.setItem(REFRESH_TOKEN_KEY, t);
    else   localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch { /* ignore */ }
};

export const clearTokens = () => { setAccessToken(null); setRefreshToken(null); };

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

interface ServerResponse<T> {
  status: 'SUCCESS' | 'ERROR';
  message: string;
  data: T;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  userId: string;
  name: string;
  role: string;
  email: string | null;
}

async function rawFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers as Record<string, string> ?? {}) },
  });
  const json: ServerResponse<T> = await res.json();
  if (!res.ok || json.status === 'ERROR') throw new ApiError(json.message ?? 'Request failed', res.status);
  return json.data;
}

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (_accessToken) headers['Authorization'] = `Bearer ${_accessToken}`;
  return rawFetch<T>(path, { ...options, headers });
}

export const authApi = {
  adminLogin: (body: { username: string; password: string }) =>
    rawFetch<AuthData>('/api/admin/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  refresh: (refreshToken: string) =>
    rawFetch<AuthData>('/api/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),

  logout: (refreshToken: string) =>
    rawFetch<null>('/api/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
};

async function fetchProtected<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    return await authFetch<T>(path, options);
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401) throw err;

    const rt = getRefreshToken();
    if (!rt) throw err;

    const refreshed = await rawFetch<AuthData>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: rt }),
    });
    setAccessToken(refreshed.accessToken);
    setRefreshToken(refreshed.refreshToken);
    return authFetch<T>(path, options);
  }
}

export const api = {
  get:    <T>(path: string)               => fetchProtected<T>(path),
  post:   <T>(path: string, body: unknown) => fetchProtected<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => fetchProtected<T>(path, { method: 'PUT',   body: JSON.stringify(body) }),
  delete: <T>(path: string)               => fetchProtected<T>(path, { method: 'DELETE' }),
};

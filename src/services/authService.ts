const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const TOKEN_KEY = 'cerebrus_token';
const UID_KEY   = 'cerebrus_uid';
const EMAIL_KEY = 'cerebrus_email';

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUid(): string | null {
  return localStorage.getItem(UID_KEY);
}

export function getEmail(): string | null {
  return localStorage.getItem(EMAIL_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(UID_KEY);
  localStorage.removeItem(EMAIL_KEY);
}

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Login failed (${res.status})`);
  }

  const data: { access_token: string; token_type: string } = await res.json();
  localStorage.setItem(TOKEN_KEY, data.access_token);

  try {
    const payload = JSON.parse(atob(data.access_token.split('.')[1]));
    if (payload.sub)   localStorage.setItem(UID_KEY,   payload.sub);
    if (payload.email) localStorage.setItem(EMAIL_KEY, payload.email);
  } catch {
    // Non-critical
  }
}

export async function register(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Registration failed (${res.status})`);
  }
}

// ─── Chat History ───────────────────────────────────────────────────────────

export interface StoredChatMessage {
  id: number;
  uid: string;
  session_id: string;
  role: 'user' | 'assistant';
  message: string;
  created_at: string;
}

export async function fetchChatHistory(sessionId?: string): Promise<StoredChatMessage[]> {
  const token = getToken();
  if (!token) return [];

  const queryParam = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : '';
  const res = await fetch(`${API_BASE}/chat/${queryParam}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return [];

  const json = await res.json().catch(() => ({}));
  return json.data ?? [];
}


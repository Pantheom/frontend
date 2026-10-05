import { getToken } from './authService';

export interface GroqModelOption {
  id: string;
  label: string;
}

export type GeminiModelOption = GroqModelOption;

export const GROQ_MODELS: GroqModelOption[] = [
  { id: 'openai/gpt-oss-120b', label: 'openai/gpt-oss-120b (high tier)' },
  { id: 'llama-3.1-8b-instant', label: 'llama-3.1-8b-instant (low tier)' },
];

export const GEMINI_MODELS = GROQ_MODELS;

export interface CompareResult {
  text: string;
  latencyMs: number;
  totalTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  model?: string;
  /** Cerebrus only */
  source?: string;
  tier?: string;
}

/** Calls Groq directly from the browser with the user's own API key. */
export async function queryGroqDirect(
  prompt: string,
  apiKey: string,
  model: string,
): Promise<CompareResult> {
  const start = performance.now();
  let res: Response;
  try {
    res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch {
    throw new Error('Network error reaching the Groq API.');
  }

  if (!res.ok) {
    let detail = '';
    try {
      const errJson = await res.json();
      detail = errJson?.error?.message ?? '';
    } catch {
      /* ignore */
    }
    if (res.status === 401) throw new Error('Invalid Groq API key.');
    if (res.status === 403) throw new Error(`Groq rejected the key or access was denied. ${detail}`.trim());
    if (res.status === 429) throw new Error('Groq quota / rate limit exceeded for this key.');
    throw new Error(detail || `Groq returned HTTP ${res.status}`);
  }

  const data = await res.json();
  const latencyMs = Math.round(performance.now() - start);
  const text: string = data?.choices?.[0]?.message?.content ?? '';
  if (!text) {
    const reason = data?.choices?.[0]?.finish_reason;
    throw new Error(`Groq returned no text${reason ? ` (${reason})` : ''}.`);
  }
  const u = data?.usage;
  return {
    text,
    latencyMs,
    promptTokens: u?.prompt_tokens,
    completionTokens: u?.completion_tokens,
    totalTokens: u?.total_tokens,
    model,
  };
}

export const queryGeminiDirect = queryGroqDirect;

/** Calls the Cerebrus backend. Throws on failure (no simulator fallback). */
export async function queryCerebrusStrict(prompt: string): Promise<CompareResult> {
  const apiUrl = import.meta.env.VITE_API_BASE_URL ?? '';
  const token = getToken();
  const start = performance.now();
  const res = await fetch(`${apiUrl}/ai/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ prompt, session_id: crypto.randomUUID() }),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Session expired. Please log in again.');
    throw new Error(`Cerebrus backend returned HTTP ${res.status}`);
  }
  const data = await res.json();
  const latencyMs = Math.round(performance.now() - start);
  const tier = data.routing?.tier;
  const tierLabel = tier === 2 ? 'Tier 2 — Medium' : tier === 3 ? 'Tier 3 — Large' : 'Tier 1 — Small';
  return {
    text: data.response ?? 'No response from backend',
    latencyMs,
    source: data.source,
    tier: data.cache_hit ? undefined : tierLabel,
    promptTokens: data.token_usage?.prompt_tokens,
    completionTokens: data.token_usage?.completion_tokens,
    totalTokens: data.token_usage?.total_tokens,
    model: data.token_usage?.model,
  };
}

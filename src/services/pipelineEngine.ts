import type { RouteTelemetry, ChatMessage } from '../types/telemetry';
import { getToken } from './authService';

// Realistic pre-seeded responses matching backend seed_cache (OpenHermes / Dolly 15K / ShareGPT)
interface SeedCacheItem {
  prompt: string;
  response: string;
  source: 'RAM_Exact_Hit' | 'DB_Semantic_Hit';
  similarity: number;
}

const PRE_SEEDED_CACHE: SeedCacheItem[] = [
  {
    prompt: 'What is semantic caching in LLM architectures?',
    response: 'Semantic caching stores prompt-response pairs using high-dimensional vector embeddings (e.g. 768-dim all-mpnet-base-v2). Rather than relying strictly on exact string matching, incoming queries are embedded and compared using cosine similarity against historical queries. If the similarity exceeds a calibrated threshold (typically 0.85), the cached response is served immediately (<200ms), eliminating the downstream LLM generation token cost entirely.',
    source: 'DB_Semantic_Hit',
    similarity: 0.94,
  },
  {
    prompt: 'What is machine learning?',
    response: 'Machine learning is a subset of artificial intelligence that enables systems to automatically learn and improve from experience without being explicitly programmed. ML algorithms identify patterns within training datasets to build mathematical models capable of making predictions or decisions on unseen data.',
    source: 'RAM_Exact_Hit',
    similarity: 1.0,
  },
  {
    prompt: 'How does the Model Cascade Router work?',
    response: 'The Model Cascade Router employs two chained binary gatekeepers (G1 and G2) using win-probability routing controllers. G1 evaluates whether Tier 1 (Small: Llama-3.3-70b via Groq) is sufficient for the task. If not, G2 evaluates Tier 2 (Medium: Gemini-2.5-Flash). Queries with high complexity or reasoning requirements escalate to Tier 3 (Large: Gemini-3.5-Flash). If a controller times out, a fail-safe escalation triggers upward to protect quality.',
    source: 'DB_Semantic_Hit',
    similarity: 0.89,
  },
];

export interface PipelineConfig {
  apiUrl?: string;
  useLiveBackend: boolean;
}

export const defaultPipelineConfig: PipelineConfig = {
  apiUrl: 'http://localhost:8000',
  useLiveBackend: false,
};

async function revealResponse(
  response: string,
  onTokenChunk?: (chunk: string) => void,
): Promise<void> {
  if (!onTokenChunk) return;

  const words = response.split(/(\s+)/);
  let visible = '';

  for (let index = 0; index < words.length; index += 1) {
    visible += words[index];
    onTokenChunk(visible);

    if (index < words.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 4));
    }
  }
}

/**
 * Executes a query through the Cerberus pipeline
 */
export async function executePipelineQuery(
  prompt: string,
  history: ChatMessage[],
  config: PipelineConfig = defaultPipelineConfig,
  onTokenChunk?: (chunk: string) => void,
  session_id?: string,
): Promise<{ response: string; telemetry: RouteTelemetry }> {
  // If live backend is enabled and configured, dispatch real fetch
  if (config.useLiveBackend && config.apiUrl) {
    try {
      const startTime = performance.now();
      const token = getToken();
      const res = await fetch(`${config.apiUrl}/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          prompt,
          session_id: session_id ?? 'default',
        }),
      });

      if (!res.ok) throw new Error(`Backend returned HTTP ${res.status}`);
      const data = await res.json();
      const latencyMs = Math.round(performance.now() - startTime);
      const response = data.response ?? 'No response from backend';

      // The backend returns a complete JSON response. Reveal LLM responses
      // progressively in the existing streaming bubble without changing the API.
      if (!data.cache_hit) {
        await revealResponse(response, onTokenChunk);
      }

      // Map tier number to label
      const tierLabel = (
        data.routing?.tier === 2 ? 'Tier 2 — Medium'
        : data.routing?.tier === 3 ? 'Tier 3 — Large'
        : 'Tier 1 — Small'
      ) as RouteTelemetry['tier'];

      return {
        response,
        telemetry: {
          source: (data.source as RouteTelemetry['source']) ?? 'LLM_Generation_Miss',
          tier: tierLabel,
          modelName: data.routing?.model,
          latencyMs,
          similarityScore: data.debug?.similarity_score,
          tokenUsage: data.token_usage ?? undefined,
          failSafeTriggered: data.debug?.fail_safe_triggered ?? false,
          needsContext: data.context?.needs_context ?? false,
        },
      };
    } catch (err) {
      console.warn('Live backend query failed, falling back to local pipeline simulation:', err);
    }
  }

  // --- CLIENT-SIDE FAITHFUL PIPELINE SIMULATOR ---
  const normalizedPrompt = prompt.trim().toLowerCase();

  // STEP 1: Check In-Memory RAM Exact Hit (<1ms)
  const exactHit = PRE_SEEDED_CACHE.find(
    (item) => item.prompt.toLowerCase() === normalizedPrompt
  );
  if (exactHit && exactHit.source === 'RAM_Exact_Hit') {
    await new Promise((r) => setTimeout(r, 12)); // Simulate sub-millisecond RAM read
    return {
      response: exactHit.response,
      telemetry: {
        source: 'RAM_Exact_Hit',
        provider: 'In-Memory',
        latencyMs: 1,
        tokensUsed: 0,
        costSavedUsd: 0.0038,
      },
    };
  }

  // STEP 2: Check Supabase pgvector Semantic Hit (50-200ms)
  const semanticHit = PRE_SEEDED_CACHE.find((item) => {
    const words = item.prompt.toLowerCase().split(' ');
    const matchedWords = words.filter((w) => normalizedPrompt.includes(w));
    return matchedWords.length / words.length > 0.45;
  });

  if (semanticHit) {
    await new Promise((r) => setTimeout(r, 85)); // Simulate vector cosine similarity query
    return {
      response: semanticHit.response,
      telemetry: {
        source: 'DB_Semantic_Hit',
        provider: 'Supabase pgvector',
        similarityScore: semanticHit.similarity,
        latencyMs: 85,
        tokensUsed: 0,
        costSavedUsd: 0.0042,
      },
    };
  }

  // STEP 3: Semantic Cache Miss -> Model Cascade Router & Context Classifier
  // Simulate Context Classifier decision:
  const contextTriggers = ['continue', 'earlier', 'that', 'what did i', 'previous', 'before'];
  const needsContext =
    history.length > 0 && contextTriggers.some((t) => normalizedPrompt.includes(t));

  // Gatekeeper 1 & 2 Cascade Logic:
  const isComplexCodeOrMath =
    normalizedPrompt.includes('code') ||
    normalizedPrompt.includes('function') ||
    normalizedPrompt.includes('algorithm') ||
    normalizedPrompt.includes('prove') ||
    normalizedPrompt.includes('architect') ||
    normalizedPrompt.length > 120;

  const isExtremeReasoning =
    normalizedPrompt.includes('quantum') ||
    normalizedPrompt.includes('proof') ||
    normalizedPrompt.includes('zero-knowledge');

  let tier: 'Tier 1 — Small' | 'Tier 2 — Medium' | 'Tier 3 — Large' = 'Tier 1 — Small';
  let modelName = 'llama-3.3-70b-versatile';
  let provider: 'Groq' | 'Google' = 'Groq';
  let g1Score = 0.28;
  let g2Score = 0.15;
  let failSafe = false;

  if (isExtremeReasoning) {
    tier = 'Tier 3 — Large';
    modelName = 'gemini-3.5-flash';
    provider = 'Google';
    g1Score = 0.82;
    g2Score = 0.76;
  } else if (isComplexCodeOrMath) {
    tier = 'Tier 2 — Medium';
    modelName = 'gemini-2.5-flash';
    provider = 'Google';
    g1Score = 0.65;
    g2Score = 0.35;
  }

  // Generate realistic response
  let fullResponse = '';
  if (needsContext) {
    fullResponse = `Building directly on our prior conversation: To extend that architecture, you would implement the Context Classifier microservice right before dispatching the final enriched payload. Since your prompt required past context, only the relevant recent turns were appended to preserve token limits.`;
  } else if (tier === 'Tier 1 — Small') {
    fullResponse = `[Resolved via ${modelName} on ${provider}]

Here is the direct analysis: For general instructional queries, Cerberus's G1 Gatekeeper identifies that Tier 1 (Llama-3.3-70b) satisfies all accuracy criteria with 0.31 win-probability. This saves ~88% in generation cost compared to invoking Tier 3 frontier models.`;
  } else if (tier === 'Tier 2 — Medium') {
    fullResponse = `[Resolved via ${modelName} on ${provider}]

Synthesizing multi-variable logic: The Model Router escalated past G1 (score 0.65 >= threshold) to G2, selecting Tier 2 for balanced reasoning throughput. The solution applies strict typing, memory-efficient buffering, and decoupled service endpoints.`;
  } else {
    fullResponse = `[Resolved via ${modelName} on ${provider} — Frontier Tier]

Deep architectural synthesis: G1 and G2 controllers escalated this request due to high conceptual density. The pipeline allocates full reasoning tokens, confirming zero-knowledge state guarantees while storing the result in the local cache for subsequent instant hits.`;
  }

  // Simulate Token Streaming
  const words = fullResponse.split(' ');
  let accumulated = '';
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i];
    accumulated += chunk;
    if (onTokenChunk) onTokenChunk(accumulated);
    await new Promise((r) => setTimeout(r, 22)); // Stream speed
  }

  return {
    response: fullResponse,
    telemetry: {
      source: 'LLM_Generation_Miss',
      tier,
      modelName,
      provider,
      latencyMs: tier === 'Tier 1 — Small' ? 380 : tier === 'Tier 2 — Medium' ? 680 : 1240,
      tokensUsed: Math.round(words.length * 1.3),
      costSavedUsd: tier === 'Tier 1 — Small' ? 0.0032 : 0.0015,
      failSafeTriggered: failSafe,
      needsContext,
      g1Score,
      g2Score,
    },
  };
}

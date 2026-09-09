export type CacheSource = 'RAM_Exact_Hit' | 'DB_Semantic_Hit' | 'LLM_Generation_Miss';

export type ModelTier = 'Tier 1 — Small' | 'Tier 2 — Medium' | 'Tier 3 — Large';

export interface RouteTelemetry {
  source: CacheSource;
  tier?: ModelTier;
  modelName?: string;
  provider?: 'Groq' | 'Google' | 'In-Memory' | 'Supabase pgvector';
  similarityScore?: number;
  latencyMs: number;
  tokensSaved?: number;
  tokensUsed?: number;
  costSavedUsd?: number;
  failSafeTriggered?: boolean;
  needsContext?: boolean;
  g1Score?: number;
  g2Score?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  telemetry?: RouteTelemetry;
  isStreaming?: boolean;
}

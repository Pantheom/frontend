import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface UserMessageProps {
  text: string;
}

export function UserMessage({ text }: UserMessageProps) {
  return (
    <div className="self-end max-w-[75%] bg-surface border border-line rounded-lg px-4 py-2.5 text-sm leading-relaxed text-fog">
      {text}
    </div>
  );
}

interface TierConfig {
  label: string;
  color: string;
  badgeClass: string;
}

const TIER_LABEL: Record<string, TierConfig> = {
  RAM_Exact_Hit: {
    label: 'Cache hit',
    color: 'cache-hit',
    badgeClass: 'bg-cache-hit/15 text-cache-hit',
  },
  DB_Semantic_Hit: {
    label: 'Cache hit',
    color: 'cache-hit',
    badgeClass: 'bg-cache-hit/15 text-cache-hit',
  },
  LLM_Generation_Miss: {
    label: 'LLM call',
    color: 'cache-miss',
    badgeClass: 'bg-cache-miss/15 text-cache-miss',
  },
  Cache_Miss: {
    label: 'LLM call',
    color: 'cache-miss',
    badgeClass: 'bg-cache-miss/15 text-cache-miss',
  },
  Cache_Unavailable: {
    label: 'LLM call',
    color: 'cache-miss',
    badgeClass: 'bg-cache-miss/15 text-cache-miss',
  },
};

interface AssistantMessageProps {
  text: string;
  source?: string;
  selectedTier?: string;
  modelName?: string;
  needsContext?: boolean;
  tokensUsed?: number;
  isStreaming?: boolean;
}

export function AssistantMessage({
  text,
  source,
  selectedTier,
  modelName,
  needsContext,
  tokensUsed,
  isStreaming,
}: AssistantMessageProps) {
  const tier = (source && source in TIER_LABEL ? TIER_LABEL[source] : undefined) ?? TIER_LABEL.LLM_Generation_Miss;
  const isHit = source === 'RAM_Exact_Hit' || source === 'DB_Semantic_Hit';
  const isLlmCall = !isHit;

  return (
    <div className="max-w-[75%]">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`text-xs px-2 py-0.5 rounded font-mono ${tier.badgeClass}`}>
          {tier.label}
        </span>
        <span className="text-xs px-2 py-0.5 rounded font-mono bg-surface-elevated text-mist">
          {isLlmCall ? (selectedTier ?? 'Tier pending') : 'No LLM call'}
        </span>
        <span className="text-xs px-2 py-0.5 rounded font-mono bg-surface-elevated text-mist">
          {isLlmCall
            ? needsContext === undefined ? 'Context pending' : needsContext ? 'Context used' : 'No context'
            : 'Context not evaluated'}
        </span>
        <span className="text-xs text-muted dark:text-muted-dark text-mist font-mono">
          {isHit ? 'Cached response' : `${tokensUsed ?? 0} tokens used`}
        </span>
      </div>
      {isLlmCall && modelName && (
        <div className="mb-2 text-[11px] font-mono text-mist">
          {modelName}
        </div>
      )}
      <div className="assistant-markdown text-sm leading-relaxed text-ink dark:text-ink-dark text-fog">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 ml-1 bg-gold animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}

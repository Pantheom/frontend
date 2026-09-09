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
};

interface AssistantMessageProps {
  text: string;
  source?: string;
  tokensUsed?: number;
  tokensSaved?: number;
  isStreaming?: boolean;
}

export function AssistantMessage({
  text,
  source,
  tokensUsed,
  tokensSaved,
  isStreaming,
}: AssistantMessageProps) {
  const tier = (source && source in TIER_LABEL ? TIER_LABEL[source] : undefined) ?? TIER_LABEL.LLM_Generation_Miss;
  const isHit = source !== 'LLM_Generation_Miss';

  return (
    <div className="max-w-[75%]">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`text-xs px-2 py-0.5 rounded font-mono ${tier.badgeClass}`}>
          {tier.label}
        </span>
        <span className="text-xs text-muted dark:text-muted-dark text-mist font-mono">
          {isHit ? `saved ~${tokensSaved ?? 0} tokens` : `${tokensUsed ?? 0} tokens`}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-ink dark:text-ink-dark text-fog whitespace-pre-wrap">
        {text}
        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 ml-1 bg-gold animate-pulse align-middle" />
        )}
      </p>
    </div>
  );
}

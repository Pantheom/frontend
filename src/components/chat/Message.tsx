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
  badgeClass: string;
}

const TIER_LABEL: Record<string, TierConfig> = {
  RAM_Exact_Hit: {
    label: 'Cache hit',
    badgeClass: 'bg-cache-hit/15 text-cache-hit border border-cache-hit/20',
  },
  DB_Semantic_Hit: {
    label: 'Cache hit',
    badgeClass: 'bg-cache-hit/15 text-cache-hit border border-cache-hit/20',
  },
  LLM_Generation_Miss: {
    label: 'Generated',
    badgeClass: 'bg-mist/15 text-mist border border-mist/20',
  },
};

interface AssistantMessageProps {
  text: string;
  source?: string;
  isStreaming?: boolean;
}

export function AssistantMessage({
  text,
  source,
  isStreaming,
}: AssistantMessageProps) {
  const tier = (source && source in TIER_LABEL ? TIER_LABEL[source] : undefined) ?? TIER_LABEL.LLM_Generation_Miss;

  return (
    <div className="max-w-[75%]">
      <span className={`inline-block text-xs mb-1.5 px-2 py-0.5 rounded font-mono ${tier.badgeClass}`}>
        {tier.label}
      </span>
      <p className="text-sm leading-relaxed text-fog whitespace-pre-wrap">
        {text}
        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 ml-1 bg-gold animate-pulse align-middle" />
        )}
      </p>
    </div>
  );
}

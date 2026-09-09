interface EmptyStateProps {
  onSelectPrompt?: (prompt: string) => void;
}

export default function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  const prompts = [
    'How does the semantic cache work?',
    "What's our current cache hit rate?",
    'Explain the model routing tiers',
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center select-none py-12">
      <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-3 text-fog">
        Ask Cerberus anything.
      </h2>
      <p className="text-mist text-sm mb-8 max-w-sm leading-relaxed">
        Every request runs through the cache and router before it ever reaches an LLM.
      </p>
      <div className="flex flex-wrap gap-2.5 justify-center max-w-lg">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => onSelectPrompt?.(p)}
            className="text-sm border border-line rounded-full px-4 py-2 hover:border-gold hover:text-gold text-mist bg-surface/60 hover:bg-surface transition-colors cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

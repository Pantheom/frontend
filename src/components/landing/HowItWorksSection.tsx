export const HowItWorksSection = () => {
  const stages = [
    {
      number: '01',
      name: 'Semantic Cache',
      latency: '<1ms – 150ms',
      description: 'Checks in-memory RAM and pgvector stores to answer semantically similar prompts instantly without LLM generation.',
    },
    {
      number: '02',
      name: 'Context Classifier',
      latency: '~15ms eval',
      description: 'Determines whether conversational history is strictly required, preventing token bloat on self-contained queries.',
    },
    {
      number: '03',
      name: 'Model Router',
      latency: '~20ms cascade',
      description: 'Evaluates task complexity through chained gatekeepers to select the most cost-efficient model tier.',
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-20 md:py-28">
      <div className="max-w-[1600px] w-full mx-auto px-6 sm:px-10 lg:px-16">
        <div className="mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-gold mb-3 block">
            Three-Stage Decision Pipeline
          </span>
          <h2 className="headline font-display text-3xl md:text-5xl text-fog">
            How it works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-line divide-y md:divide-y-0 md:divide-x divide-line">
          {stages.map((stage) => (
            <div key={stage.name} className="p-8 md:p-12 space-y-6 flex flex-col justify-between bg-surface/30">
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono text-xs text-mist">
                  <span>{stage.number}</span>
                  <span className="text-gold/80">{stage.latency}</span>
                </div>
                <h3 className="font-display text-2xl text-fog">
                  {stage.name}
                </h3>
                <p className="font-body text-mist text-sm sm:text-base leading-relaxed">
                  {stage.description}
                </p>
              </div>
              <div className="pt-4 border-t border-line/40">
                <span className="font-mono text-[11px] text-mist/70 uppercase">
                  Zero modification to model weights
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

import { CacheTag } from '../ui/CacheTag';
import { CheckCircle2, Zap } from 'lucide-react';

export const ConcreteExampleSection = () => {
  return (
    <section id="example" className="w-full border-t border-line py-20 md:py-28">
      <div className="max-w-[1600px] w-full mx-auto px-6 sm:px-10 lg:px-16">
        <div className="mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-gold mb-3 block">
            Observable Latency & Cost Differences
          </span>
          <h2 className="headline font-display text-3xl md:text-5xl text-fog mb-4">
            See exactly why a response was fast
          </h2>
          <p className="font-body text-mist text-base sm:text-lg max-w-2xl leading-relaxed">
            Every prompt resolved through Cerberus surfaces its operational origin. High-frequency queries skip model computation entirely, while novel requests route dynamically to the right tier.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Card A: Cache Hit */}
          <div className="p-8 md:p-10 rounded border border-line bg-surface flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-mist uppercase">Common Query • Semantic Match</span>
                <CacheTag source="DB_Semantic_Hit" similarityScore={0.92} latencyMs={84} />
              </div>

              <div className="bg-void/70 p-4 rounded border border-line-light font-body text-sm text-fog/90">
                <span className="text-mist font-mono text-xs block mb-1">PROMPT:</span>
                "What is token optimization in LLM applications?"
              </div>

              <div className="space-y-2 text-sm sm:text-base text-fog font-body leading-relaxed">
                <p>
                  Token optimization comprises architectural patterns—such as semantic caching, cascaded model routing, and selective context attachment—that eliminate redundant generation costs and reduce end-to-end user latency.
                </p>
              </div>
            </div>

            <div className="pt-5 border-t border-line-light flex items-center justify-between text-xs font-mono">
              <span className="text-cache-hit flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>0 tokens consumed ($0.0000)</span>
              </span>
              <span className="text-mist">Saved 320 tokens</span>
            </div>
          </div>

          {/* Card B: Cache Miss with Model Router */}
          <div className="p-8 md:p-10 rounded border border-line bg-surface flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-mist uppercase">Novel Task • Cascade Escalation</span>
                <CacheTag source="LLM_Generation_Miss" tier="Tier 1 — Small" latencyMs={420} />
              </div>

              <div className="bg-void/70 p-4 rounded border border-line-light font-body text-sm text-fog/90">
                <span className="text-mist font-mono text-xs block mb-1">PROMPT:</span>
                "Implement a TypeScript debounce utility function with immediate execution support."
              </div>

              <div className="bg-void p-3 rounded font-mono text-xs text-fog/80 overflow-x-auto border border-line-light">
                <code>{`export function debounce<T extends (...args: any[]) => any>(
  fn: T, 
  waitMs: number, 
  immediate = false
) { /* routed to Llama-3.3-70b */ }`}</code>
              </div>
            </div>

            <div className="pt-5 border-t border-line-light flex items-center justify-between text-xs font-mono">
              <span className="text-mist flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
                <span>Groq Llama-3.3-70b (G1 Score: 0.31)</span>
              </span>
              <span className="text-gold">88% cost reduction vs Tier 3</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

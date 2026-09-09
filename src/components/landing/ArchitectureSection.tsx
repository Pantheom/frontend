import { ArrowRight, ShieldCheck, Database, Cpu, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ArchitectureSection = () => {
  return (
    <section id="architecture" className="w-full border-t border-line py-20 md:py-28">
      <div className="max-w-[1600px] w-full mx-auto px-6 sm:px-10 lg:px-16">
        <div className="mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-gold mb-3 block">
            Hub-and-Spoke Topology
          </span>
          <h2 className="headline font-display text-3xl md:text-5xl text-fog mb-4">
            Strict service isolation
          </h2>
          <p className="font-body text-mist text-base sm:text-lg max-w-2xl leading-relaxed">
            Each microservice functions as a sealed black box on AWS Free Tier. No microservice ever communicates with another directly; every exchange routes through the Centralized Backend with JSON-only payloads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Service 1 */}
          <div className="p-8 rounded border border-line bg-surface/40 space-y-5">
            <div className="w-10 h-10 rounded border border-line flex items-center justify-center text-cache-hit">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl text-fog">Cerberus Semantic Cache</h3>
            <p className="text-sm text-mist leading-relaxed font-body">
              Two-tier storage with in-memory LRU RAM (&lt;1ms) and Supabase pgvector cosine similarity (&gt;0.85 threshold). Includes an internal zero-shot DeBERTa gatekeeper to keep personal data out of shared vector tables.
            </p>
            <div className="pt-3">
              <span className="font-mono text-xs text-cache-hit bg-cache-hit-muted px-2.5 py-1 rounded">
                Isolated Supabase pgvector
              </span>
            </div>
          </div>

          {/* Service 2 */}
          <div className="p-8 rounded border border-line bg-surface/40 space-y-5">
            <div className="w-10 h-10 rounded border border-line flex items-center justify-center text-gold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl text-fog">Model Cascade Router</h3>
            <p className="text-sm text-mist leading-relaxed font-body">
              Evaluates queries via dual RouteLLM controllers. 53% of queries resolve on Tier 1 (Llama-3.3-70b via Groq), 20% on Tier 2 (Gemini-2.5-Flash), and 27% escalate to Tier 3 (Gemini-3.5-Flash) with fail-safe escalation.
            </p>
            <div className="pt-3">
              <span className="font-mono text-xs text-gold bg-gold-muted px-2.5 py-1 rounded">
                Config-Driven • No DB Dependency
              </span>
            </div>
          </div>

          {/* Service 3 */}
          <div className="p-8 rounded border border-line bg-surface/40 space-y-5">
            <div className="w-10 h-10 rounded border border-line flex items-center justify-center text-mist">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl text-fog">Context Classifier</h3>
            <p className="text-sm text-mist leading-relaxed font-body">
              Executes binary context classification (<code className="text-fog font-mono">needs_context: true/false</code>). Self-contained queries skip conversational history retrieval entirely, preserving prompt token bandwidth.
            </p>
            <div className="pt-3">
              <span className="font-mono text-xs text-mist bg-surface border border-line px-2.5 py-1 rounded">
                Sliding-Window DB History
              </span>
            </div>
          </div>
        </div>

        {/* Central Hub Bar */}
        <div className="mt-8 p-8 rounded border border-line bg-surface flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-6 h-6 text-gold shrink-0" />
            <div>
              <span className="font-display text-base text-fog block font-medium">Stateless Centralized Backend (Hub)</span>
              <span className="text-sm text-mist font-body">Brokers all inter-service hops, validates session tokens, and logs telemetry.</span>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-mono text-gold hover:text-gold-hover transition-colors whitespace-nowrap px-4 py-2 rounded bg-gold/10 border border-gold/30 hover:bg-gold/20"
          >
            <span>Explore Live Telemetry</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

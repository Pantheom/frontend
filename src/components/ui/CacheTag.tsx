import React from 'react';
import type { CacheSource, ModelTier } from '../../types/telemetry';
import { Zap, Database, Cpu, AlertTriangle } from 'lucide-react';

interface CacheTagProps {
  source: CacheSource;
  tier?: ModelTier;
  similarityScore?: number;
  latencyMs?: number;
  failSafeTriggered?: boolean;
  compact?: boolean;
}

export const CacheTag: React.FC<CacheTagProps> = ({
  source,
  tier,
  similarityScore,
  latencyMs,
  failSafeTriggered,
  compact = false,
}) => {
  const getSourceDetails = () => {
    switch (source) {
      case 'RAM_Exact_Hit':
        return {
          label: 'RAM HIT',
          fullLabel: 'RAM Exact Hit (<1ms)',
          icon: Zap,
          textColor: 'text-cache-hit',
          bgColor: 'bg-cache-hit-muted',
          borderColor: 'border-cache-hit/30',
        };
      case 'DB_Semantic_Hit':
        return {
          label: similarityScore ? `DB HIT (${(similarityScore * 100).toFixed(0)}%)` : 'DB HIT',
          fullLabel: similarityScore
            ? `DB Semantic Hit (${(similarityScore * 100).toFixed(1)}% cosine similarity)`
            : 'DB Semantic Hit',
          icon: Database,
          textColor: 'text-cache-hit',
          bgColor: 'bg-cache-hit-muted',
          borderColor: 'border-cache-hit/30',
        };
      case 'LLM_Generation_Miss':
        return {
          label: tier ? `MISS • ${tier.split('—')[1]?.trim() || tier}` : 'LLM MISS',
          fullLabel: tier ? `LLM Generation Miss (${tier})` : 'LLM Generation Miss',
          icon: Cpu,
          textColor: 'text-mist',
          bgColor: 'bg-surface',
          borderColor: 'border-line',
        };
    }
  };

  const details = getSourceDetails();
  const IconComponent = details.icon;

  return (
    <div className="inline-flex items-center gap-1.5 font-mono text-xs select-none">
      {/* Primary Status Tag */}
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border transition-colors ${details.textColor} ${details.bgColor} ${details.borderColor}`}
        title={details.fullLabel}
      >
        <IconComponent className="w-3 h-3 shrink-0" />
        <span className="font-medium tracking-wide">
          {compact ? details.label : details.label}
        </span>
      </span>

      {/* Latency badge if present */}
      {latencyMs !== undefined && (
        <span className="text-mist/80 text-[11px] px-1.5 py-0.5 rounded bg-surface border border-line-light">
          {latencyMs < 1 ? '<1ms' : `${latencyMs}ms`}
        </span>
      )}

      {/* Fail-safe escalation tag */}
      {failSafeTriggered && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-cache-fail/40 bg-cache-fail-muted text-cache-fail text-[11px]"
          title="Fail-safe escalation triggered: Model Router elevated tier to protect quality"
        >
          <AlertTriangle className="w-3 h-3" />
          <span>ESCALATED</span>
        </span>
      )}
    </div>
  );
};

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CacheTag } from '../components/ui/CacheTag';
import {
  ArrowLeft,
  Zap,
  DollarSign,
  Clock,
  Cpu,
  Layers,
  Search,
  Filter,
  Code,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import type { CacheSource, ModelTier } from '../types/telemetry';

interface RequestAuditLog {
  id: string;
  timestamp: string;
  prompt: string;
  source: CacheSource;
  tier?: ModelTier;
  model: string;
  provider: string;
  latencyMs: number;
  tokensBilled: number;
  costSavedUsd: number;
  g1Score?: number;
  g2Score?: number;
  needsContext: boolean;
  failSafeTriggered: boolean;
}

const SAMPLE_LOGS: RequestAuditLog[] = [
  {
    id: 'req_9812_01',
    timestamp: '02:04:12',
    prompt: 'What is semantic caching in LLM architectures?',
    source: 'DB_Semantic_Hit',
    model: 'all-mpnet-base-v2 (768-dim)',
    provider: 'Supabase pgvector',
    latencyMs: 74,
    tokensBilled: 0,
    costSavedUsd: 0.0042,
    needsContext: false,
    failSafeTriggered: false,
  },
  {
    id: 'req_9812_02',
    timestamp: '02:02:45',
    prompt: 'What is machine learning?',
    source: 'RAM_Exact_Hit',
    model: 'LRU In-Memory Dict',
    provider: 'In-Memory',
    latencyMs: 0.8,
    tokensBilled: 0,
    costSavedUsd: 0.0038,
    needsContext: false,
    failSafeTriggered: false,
  },
  {
    id: 'req_9812_03',
    timestamp: '01:58:20',
    prompt: 'Implement a TypeScript debounce utility function with immediate execution support.',
    source: 'LLM_Generation_Miss',
    tier: 'Tier 1 — Small',
    model: 'llama-3.3-70b-versatile',
    provider: 'Groq',
    latencyMs: 390,
    tokensBilled: 210,
    costSavedUsd: 0.0031,
    g1Score: 0.28,
    needsContext: false,
    failSafeTriggered: false,
  },
  {
    id: 'req_9812_04',
    timestamp: '01:54:02',
    prompt: 'Synthesize the inter-service isolation principles of hub-and-spoke backend systems.',
    source: 'LLM_Generation_Miss',
    tier: 'Tier 2 — Medium',
    model: 'gemini-2.5-flash',
    provider: 'Google',
    latencyMs: 640,
    tokensBilled: 380,
    costSavedUsd: 0.0018,
    g1Score: 0.64,
    g2Score: 0.38,
    needsContext: false,
    failSafeTriggered: false,
  },
  {
    id: 'req_9812_05',
    timestamp: '01:49:15',
    prompt: 'Explain quantum key distribution algorithms with zero-knowledge proof requirements.',
    source: 'LLM_Generation_Miss',
    tier: 'Tier 3 — Large',
    model: 'gemini-3.5-flash',
    provider: 'Google',
    latencyMs: 1280,
    tokensBilled: 740,
    costSavedUsd: 0.0,
    g1Score: 0.84,
    g2Score: 0.79,
    needsContext: false,
    failSafeTriggered: false,
  },
  {
    id: 'req_9812_06',
    timestamp: '01:42:33',
    prompt: 'Continue that explanation and contrast BB84 with E91 protocols.',
    source: 'LLM_Generation_Miss',
    tier: 'Tier 3 — Large',
    model: 'gemini-3.5-flash',
    provider: 'Google',
    latencyMs: 1350,
    tokensBilled: 860,
    costSavedUsd: 0.0,
    g1Score: 0.81,
    g2Score: 0.75,
    needsContext: true,
    failSafeTriggered: false,
  },
];

export const DashboardPage = () => {
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<RequestAuditLog | null>(SAMPLE_LOGS[0]);

  const filteredLogs = SAMPLE_LOGS.filter((log) => {
    const matchesSource = filterSource === 'ALL' || log.source === filterSource;
    const matchesQuery =
      log.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-void text-fog font-body selection:bg-gold/20 selection:text-gold">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-void/95 border-b border-line px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-mist hover:text-fog transition-colors font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Overview</span>
          </Link>
          <div className="h-4 w-px bg-line" />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gold" />
            <span className="font-display text-sm tracking-wider text-fog font-semibold">
              CERBERUS TELEMETRY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/chat"
            className="text-xs uppercase tracking-wider font-mono font-medium px-4 py-1.5 rounded bg-gold text-void hover:bg-gold-hover transition-colors"
          >
            Open Chat Surface →
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10 space-y-10">
        {/* Title & System Status */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs text-gold uppercase tracking-widest block mb-2">
              Bento Telemetry Observability
            </span>
            <h1 className="headline font-display text-3xl md:text-4xl text-fog font-semibold">
              Pipeline Performance
            </h1>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-mist">
            <span className="w-2 h-2 rounded-full bg-cache-hit animate-pulse" />
            <span>Telemetry Broker Synchronized (AWS Free Tier)</span>
          </div>
        </div>

        {/* Bento Grid KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Cache Hit Rate */}
          <div className="p-6 rounded-lg border border-line bg-surface/50 space-y-3">
            <div className="flex items-center justify-between text-mist">
              <span className="text-xs font-mono uppercase">Cache Hit Rate</span>
              <Zap className="w-4 h-4 text-cache-hit" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl text-fog font-semibold">68.4%</span>
              <span className="font-mono text-xs text-cache-hit">+14.2% vs baseline</span>
            </div>
            <p className="text-xs text-mist font-body">
              RAM exact hits (&lt;1ms) + pgvector cosine hits (&gt;0.85 threshold)
            </p>
          </div>

          {/* KPI 2: Dollar Cost Reduction */}
          <div className="p-6 rounded-lg border border-line bg-surface/50 space-y-3">
            <div className="flex items-center justify-between text-mist">
              <span className="text-xs font-mono uppercase">Cost Reduction</span>
              <DollarSign className="w-4 h-4 text-cache-hit" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl text-fog font-semibold">73.8%</span>
              <span className="font-mono text-xs text-cache-hit">$1.42 saved today</span>
            </div>
            <p className="text-xs text-mist font-body">
              Calculated against raw Gemini 3.5 Frontier baseline pricing
            </p>
          </div>

          {/* KPI 3: Mean Latency */}
          <div className="p-6 rounded-lg border border-line bg-surface/50 space-y-3">
            <div className="flex items-center justify-between text-mist">
              <span className="text-xs font-mono uppercase">Avg Turn Latency</span>
              <Clock className="w-4 h-4 text-mist" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl text-fog font-semibold">184ms</span>
              <span className="font-mono text-xs text-mist">weighted avg</span>
            </div>
            <p className="text-xs text-mist font-body">
              Includes &lt;1ms RAM hits, 85ms DB hits, and routed misses
            </p>
          </div>
        </div>

        {/* Secondary Bento Grid: Router Breakdown & Context Classifier */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Model Router Distribution (calibrated from architecture doc) */}
          <div className="lg:col-span-2 p-6 rounded-lg border border-line bg-surface/40 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-gold uppercase block">Model Cascade Distribution</span>
                <h3 className="font-display text-xl text-fog font-medium">RouteLLM Controller Gatekeepers</h3>
              </div>
              <Cpu className="w-4 h-4 text-mist" />
            </div>

            {/* Distribution Bar */}
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-surface flex overflow-hidden border border-line-light">
                <div style={{ width: '53.3%' }} className="bg-cache-hit" title="Tier 1 Small: 53.3%" />
                <div style={{ width: '20.0%' }} className="bg-gold" title="Tier 2 Medium: 20.0%" />
                <div style={{ width: '26.7%' }} className="bg-cache-miss" title="Tier 3 Large: 26.7%" />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-mist">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cache-hit" />
                  <span>Tier 1: Small (53.3%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gold" />
                  <span>Tier 2: Medium (20.0%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cache-miss" />
                  <span>Tier 3: Large (26.7%)</span>
                </span>
              </div>
            </div>

            {/* Tier Spec Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-line-light font-mono text-xs">
              <div className="p-3 rounded bg-surface border border-line-light space-y-1">
                <span className="text-cache-hit font-medium block">Tier 1 — Small</span>
                <span className="text-fog text-xs block">llama-3.3-70b</span>
                <span className="text-[10px] text-mist">Groq Provider • G1 Score &lt; 0.35</span>
              </div>
              <div className="p-3 rounded bg-surface border border-line-light space-y-1">
                <span className="text-gold font-medium block">Tier 2 — Medium</span>
                <span className="text-fog text-xs block">gemini-2.5-flash</span>
                <span className="text-[10px] text-mist">Google Provider • G2 Score &lt; 0.60</span>
              </div>
              <div className="p-3 rounded bg-surface border border-line-light space-y-1">
                <span className="text-mist font-medium block">Tier 3 — Large</span>
                <span className="text-fog text-xs block">gemini-3.5-flash</span>
                <span className="text-[10px] text-mist">Google Frontier • High Complexity</span>
              </div>
            </div>
          </div>

          {/* Context Classifier Efficiency Card */}
          <div className="p-6 rounded-lg border border-line bg-surface/40 space-y-6 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-gold uppercase block">Context Classifier</span>
                <Layers className="w-4 h-4 text-mist" />
              </div>
              <h3 className="font-display text-xl text-fog font-medium">History Optimization</h3>
              <p className="text-xs text-mist leading-relaxed font-body">
                Binary decision (<code className="font-mono text-fog">needs_context</code>) determines if prior user turns must be attached.
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded bg-surface border border-line-light flex items-center justify-between">
                <span className="text-mist">Self-Contained (Bypassed)</span>
                <span className="text-cache-hit font-medium">81.4%</span>
              </div>
              <div className="p-3 rounded bg-surface border border-line-light flex items-center justify-between">
                <span className="text-mist">Context Attached</span>
                <span className="text-fog font-medium">18.6%</span>
              </div>
            </div>

            <div className="pt-4 border-t border-line-light flex items-center gap-2 text-xs font-mono text-mist">
              <CheckCircle2 className="w-3.5 h-3.5 text-cache-hit" />
              <span>Saves ~600 tokens/query on bypassed turns</span>
            </div>
          </div>
        </div>

        {/* Live Request Stream / Audit Log */}
        <div className="p-6 rounded-lg border border-line bg-surface/40 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs text-gold uppercase block">Centralized Hub Logs</span>
              <h3 className="font-display text-xl text-fog font-medium">Real-Time Request Stream</h3>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-mist absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter prompts..."
                  className="pl-8 pr-3 py-1.5 rounded bg-surface border border-line text-xs text-fog placeholder:text-mist outline-none font-mono focus:border-gold/40 w-48"
                />
              </div>

              <div className="flex items-center gap-1 font-mono text-xs">
                <Filter className="w-3.5 h-3.5 text-mist mr-1" />
                {['ALL', 'RAM_Exact_Hit', 'DB_Semantic_Hit', 'LLM_Generation_Miss'].map((src) => (
                  <button
                    key={src}
                    onClick={() => setFilterSource(src)}
                    className={`px-2 py-1 rounded text-[11px] transition-colors ${
                      filterSource === src
                        ? 'bg-gold/15 text-gold border border-gold/40'
                        : 'text-mist hover:text-fog bg-surface border border-line-light'
                    }`}
                  >
                    {src === 'ALL' ? 'All' : src.replace('_', ' ').split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table & Inspector Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Log Table */}
            <div className="lg:col-span-2 overflow-x-auto border border-line rounded">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-surface border-b border-line text-mist">
                  <tr>
                    <th className="p-3">Time</th>
                    <th className="p-3">Prompt</th>
                    <th className="p-3">Source</th>
                    <th className="p-3">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-light">
                  {filteredLogs.map((log) => {
                    const isSelected = selectedLog?.id === log.id;
                    return (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-gold/5' : 'hover:bg-surface/50'
                        }`}
                      >
                        <td className="p-3 text-mist whitespace-nowrap">{log.timestamp}</td>
                        <td className="p-3 font-body text-fog/90 max-w-xs truncate">{log.prompt}</td>
                        <td className="p-3 whitespace-nowrap">
                          <CacheTag source={log.source} compact />
                        </td>
                        <td className="p-3 text-mist whitespace-nowrap">{log.latencyMs}ms</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Selected Log Inspector Drawer */}
            <div className="p-4 rounded border border-line bg-surface space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-line-light pb-2">
                <span className="text-fog font-medium flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-gold" />
                  <span>Payload Trace</span>
                </span>
                <span className="text-mist text-[10px]">{selectedLog?.id}</span>
              </div>

              {selectedLog ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-mist uppercase block">Prompt</span>
                    <p className="font-body text-xs text-fog mt-0.5">{selectedLog.prompt}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-line-light">
                    <div>
                      <span className="text-mist block">Resolution Source</span>
                      <span className="text-fog">{selectedLog.source}</span>
                    </div>
                    <div>
                      <span className="text-mist block">Selected Tier</span>
                      <span className="text-fog">{selectedLog.tier || 'In-Memory Cache'}</span>
                    </div>
                    <div>
                      <span className="text-mist block">Serving Provider</span>
                      <span className="text-fog">{selectedLog.provider}</span>
                    </div>
                    <div>
                      <span className="text-mist block">Serving Latency</span>
                      <span className="text-fog">{selectedLog.latencyMs}ms</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-line-light">
                    <span className="text-[10px] text-mist uppercase block mb-1">Raw JSON Telemetry</span>
                    <pre className="p-2.5 rounded bg-void text-[11px] text-mist overflow-x-auto border border-line-light">
                      {JSON.stringify(
                        {
                          request_id: selectedLog.id,
                          source: selectedLog.source,
                          tier: selectedLog.tier,
                          latency_ms: selectedLog.latencyMs,
                          g1_score: selectedLog.g1Score,
                          g2_score: selectedLog.g2Score,
                          needs_context: selectedLog.needsContext,
                          fail_safe_triggered: selectedLog.failSafeTriggered,
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-mist">Select a log row to inspect</div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-line py-8 px-8 max-w-7xl mx-auto flex items-center justify-between text-xs font-mono text-mist mt-12">
        <span>CERBERUS • Telemetry & Observability Hub</span>
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-fog transition-colors">Overview</Link>
          <Link to="/chat" className="text-gold hover:underline">Chat Surface</Link>
        </div>
      </footer>
    </div>
  );
};

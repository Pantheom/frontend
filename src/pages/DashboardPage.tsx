import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  User,
  LogOut,
} from 'lucide-react';
import type { RequestAuditLog } from '../types/telemetry';
import { isAuthenticated, getUid, logout } from '../services/authService';
import { loadUserDashboardData, type UserDashboardStats } from '../services/telemetryService';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<RequestAuditLog[]>([]);
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<RequestAuditLog | null>(null);

  const uid = getUid();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    loadUserDashboardData()
      .then((data) => {
        setLogs(data.logs);
        setStats(data.stats);
        if (data.logs.length > 0) {
          setSelectedLog(data.logs[0]);
        }
      })
      .catch((err) => {
        console.error('Failed to load user dashboard telemetry:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [navigate]);

  const filteredLogs = logs.filter((log) => {
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
          {uid && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-surface border border-line text-[11px] font-mono text-mist">
              <User className="w-3 h-3 text-gold" />
              <span className="truncate max-w-[140px]" title={uid}>
                {uid.slice(0, 8)}...
              </span>
            </div>
          )}
          <Link
            to="/chat"
            className="text-xs uppercase tracking-wider font-mono font-medium px-4 py-1.5 rounded bg-gold text-void hover:bg-gold-hover transition-colors"
          >
            Open Chat Surface →
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-xs font-mono text-mist hover:text-red-400 flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-surface border border-transparent hover:border-line transition-colors"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10 space-y-10">
        {/* Title & System Status */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs text-gold uppercase tracking-widest block mb-2">
              User Observability • Full Chat History
            </span>
            <h1 className="headline font-display text-3xl md:text-4xl text-fog font-semibold">
              Pipeline Performance
            </h1>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-mist">
            <span className="w-2 h-2 rounded-full bg-cache-hit animate-pulse" />
            <span>
              {isLoading
                ? 'Syncing User Telemetry...'
                : `Active Telemetry (${stats?.totalRequests || 0} Turns Processed)`}
            </span>
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
              <span className="font-display text-3xl text-fog font-semibold">
                {stats ? `${stats.cacheHitRate}%` : '0%'}
              </span>
              <span className="font-mono text-xs text-cache-hit">
                {stats && stats.totalRequests > 0
                  ? `${Math.round((stats.cacheHitRate / 100) * stats.totalRequests)} hits`
                  : 'live metric'}
              </span>
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
              <span className="font-display text-3xl text-fog font-semibold">
                {stats ? `${stats.costReductionPct}%` : '0%'}
              </span>
              <span className="font-mono text-xs text-cache-hit">
                ${stats ? stats.costSavedUsd.toFixed(2) : '0.00'} saved
              </span>
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
              <span className="font-display text-3xl text-fog font-semibold">
                {stats ? `${stats.avgLatencyMs}ms` : '0ms'}
              </span>
              <span className="font-mono text-xs text-mist">weighted avg</span>
            </div>
            <p className="text-xs text-mist font-body">
              Includes &lt;1ms RAM hits, 85ms DB hits, and routed misses
            </p>
          </div>

          {/* KPI 4: Total User Turns */}
          <div className="p-6 rounded-lg border border-line bg-surface/50 space-y-3">
            <div className="flex items-center justify-between text-mist">
              <span className="text-xs font-mono uppercase">Total Queries</span>
              <Layers className="w-4 h-4 text-gold" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl text-fog font-semibold">
                {stats ? stats.totalRequests : 0}
              </span>
              <span className="font-mono text-xs text-gold">full history</span>
            </div>
            <p className="text-xs text-mist font-body">
              All persisted user turns across every chat session
            </p>
          </div>
        </div>

        {/* Secondary Bento Grid: Router Breakdown & Context Classifier */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Model Router Distribution */}
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
                <div
                  style={{ width: `${stats?.tierDistribution.tier1Pct ?? 0}%` }}
                  className="bg-cache-hit transition-all duration-500"
                  title={`Tier 1 Small: ${stats?.tierDistribution.tier1Pct ?? 0}%`}
                />
                <div
                  style={{ width: `${stats?.tierDistribution.tier2Pct ?? 0}%` }}
                  className="bg-gold transition-all duration-500"
                  title={`Tier 2 Medium: ${stats?.tierDistribution.tier2Pct ?? 0}%`}
                />
                <div
                  style={{ width: `${stats?.tierDistribution.tier3Pct ?? 0}%` }}
                  className="bg-cache-miss transition-all duration-500"
                  title={`Tier 3 Large: ${stats?.tierDistribution.tier3Pct ?? 0}%`}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-mist">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cache-hit" />
                  <span>Tier 1: Small ({stats?.tierDistribution.tier1Pct ?? 0}%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gold" />
                  <span>Tier 2: Medium ({stats?.tierDistribution.tier2Pct ?? 0}%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cache-miss" />
                  <span>Tier 3: Large ({stats?.tierDistribution.tier3Pct ?? 0}%)</span>
                </span>
              </div>
            </div>

            {/* Tier Spec Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-line-light font-mono text-xs">
              <div className="p-3 rounded bg-surface border border-line-light space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-cache-hit font-medium block">Tier 1 — Small</span>
                  <span className="text-mist text-[10px]">
                    {stats?.tierDistribution.tier1Count ?? 0} calls
                  </span>
                </div>
                <span className="text-fog text-xs block font-mono">gpt oss 20B</span>
                <span className="text-[10px] text-mist">Open-Source • G1 Score &lt; 0.35</span>
              </div>
              <div className="p-3 rounded bg-surface border border-line-light space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gold font-medium block">Tier 2 — Medium</span>
                  <span className="text-mist text-[10px]">
                    {stats?.tierDistribution.tier2Count ?? 0} calls
                  </span>
                </div>
                <span className="text-fog text-xs block font-mono">gemini 3.1 flash lite</span>
                <span className="text-[10px] text-mist">Google Provider • G2 Score &lt; 0.60</span>
              </div>
              <div className="p-3 rounded bg-surface border border-line-light space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-mist font-medium block">Tier 3 — Large</span>
                  <span className="text-mist text-[10px]">
                    {stats?.tierDistribution.tier3Count ?? 0} calls
                  </span>
                </div>
                <span className="text-fog text-xs block font-mono">gemini 3.5 flash</span>
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
                <span className="text-cache-hit font-medium">
                  {stats ? `${stats.contextEfficiency.selfContainedPct}%` : '0%'}
                </span>
              </div>
              <div className="p-3 rounded bg-surface border border-line-light flex items-center justify-between">
                <span className="text-mist">Context Attached</span>
                <span className="text-fog font-medium">
                  {stats ? `${stats.contextEfficiency.contextAttachedPct}%` : '0%'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-line-light flex items-center gap-2 text-xs font-mono text-mist">
              <CheckCircle2 className="w-3.5 h-3.5 text-cache-hit" />
              <span>
                Saves ~{stats ? stats.contextEfficiency.tokensSavedEstimate.toLocaleString() : 0} tokens on bypassed turns
              </span>
            </div>
          </div>
        </div>

        {/* Live Request Stream / Audit Log */}
        <div className="p-6 rounded-lg border border-line bg-surface/40 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs text-gold uppercase block">User Request Audit</span>
              <h3 className="font-display text-xl text-fog font-medium">Historical Query Stream</h3>
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-mist italic">
                        Loading user chat history telemetry...
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-mist">
                        <div className="flex flex-col items-center gap-2">
                          <span>No request logs found for this user.</span>
                          <Link to="/chat" className="text-xs text-gold hover:underline font-medium">
                            Send queries in the Chat Surface to populate telemetry →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
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
                    })
                  )}
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
                          user_id: uid,
                          source: selectedLog.source,
                          tier: selectedLog.tier,
                          latency_ms: selectedLog.latencyMs,
                          tokens_billed: selectedLog.tokensBilled,
                          cost_saved_usd: selectedLog.costSavedUsd,
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

export default DashboardPage;

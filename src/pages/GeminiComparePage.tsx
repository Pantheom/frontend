import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Menu, ArrowLeft } from 'lucide-react';
import NavRail from '../components/chat/NavRail';
import { isAuthenticated } from '../services/authService';
import {
  GROQ_MODELS,
  queryGroqDirect,
  queryCerebrusStrict,
  type CompareResult,
} from '../services/geminiVsCerebrus';

type PanelState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'done'; result: CompareResult };

const KEY_STORAGE = 'cerebrus_compare_groq_key';

function Panel({
  title,
  subtitle,
  state,
  className = '',
}: {
  title: string;
  subtitle: string;
  state: PanelState;
  className?: string;
}) {
  const r = state.status === 'done' ? state.result : null;
  return (
    <section className={`flex-1 min-w-0 flex flex-col border border-line rounded bg-surface ${className}`}>
      <header className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-line flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-fog">{title}</div>
          <div className="text-xs font-mono text-mist truncate max-w-[200px] sm:max-w-none">{subtitle}</div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 text-xs sm:text-sm text-fog">
        {state.status === 'idle' && <span className="text-mist/60 italic">Answer will appear here.</span>}
        {state.status === 'loading' && <span className="text-mist animate-pulse">Generating…</span>}
        {state.status === 'error' && <span className="text-red-400">{state.message}</span>}
        {r && (
          <div className="assistant-markdown text-xs sm:text-sm leading-relaxed text-ink dark:text-ink-dark text-fog">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{r.text}</ReactMarkdown>
          </div>
        )}
      </div>
      {r && (
        <footer className="px-3.5 sm:px-4 py-2 border-t border-line text-[11px] sm:text-xs font-mono text-mist flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1">
          <span>{r.latencyMs} ms</span>
          {r.totalTokens != null && <span>{r.totalTokens} tokens</span>}
          {r.model && <span className="truncate max-w-[140px]">{r.model}</span>}
          {r.source && <span>{r.source}</span>}
          {r.tier && <span>{r.tier}</span>}
        </footer>
      )}
    </section>
  );
}

export function GeminiComparePage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [remember, setRemember] = useState(false);
  const [model, setModel] = useState(GROQ_MODELS[0].id);
  const [groq, setGroq] = useState<PanelState>({ status: 'idle' });
  const [cerebrus, setCerebrus] = useState<PanelState>({ status: 'idle' });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'both' | 'groq' | 'cerebrus'>('both');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    const local = localStorage.getItem(KEY_STORAGE);
    if (local) {
      setApiKey(local);
      setRemember(true);
    } else {
      setApiKey(sessionStorage.getItem(KEY_STORAGE) ?? '');
    }
  }, [navigate]);

  const persistKey = (key: string, keep: boolean) => {
    localStorage.removeItem(KEY_STORAGE);
    sessionStorage.removeItem(KEY_STORAGE);
    if (!key) return;
    (keep ? localStorage : sessionStorage).setItem(KEY_STORAGE, key);
  };

  const busy = groq.status === 'loading' || cerebrus.status === 'loading';

  const handleRun = async () => {
    const p = prompt.trim();
    if (!p || busy) return;
    const key = apiKey.trim();
    persistKey(key, remember);

    setCerebrus({ status: 'loading' });
    const cerebrusCall = queryCerebrusStrict(p)
      .then((result) => setCerebrus({ status: 'done', result }))
      .catch((e: Error) => setCerebrus({ status: 'error', message: e.message }));

    let groqCall: Promise<void>;
    if (!key) {
      setGroq({ status: 'error', message: 'Add your Groq API key above to run Groq.' });
      groqCall = Promise.resolve();
    } else {
      setGroq({ status: 'loading' });
      groqCall = queryGroqDirect(p, key, model)
        .then((result) => setGroq({ status: 'done', result }))
        .catch((e: Error) => setGroq({ status: 'error', message: e.message }));
    }
    await Promise.allSettled([cerebrusCall, groqCall]);
  };

  const inputCls =
    'bg-void border border-line rounded px-2.5 py-1.5 text-xs sm:text-sm text-fog focus:outline-none focus:border-gold';

  return (
    <div className="flex h-screen h-[100dvh] bg-void text-fog font-body overflow-hidden">
      <NavRail
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 p-3.5 sm:p-6 gap-3 sm:gap-4 overflow-y-auto md:overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden p-1.5 rounded text-mist hover:text-fog hover:bg-surface border border-line-light transition-colors"
              aria-label="Open navigation"
            >
              <Menu className="w-4 h-4 text-gold" />
            </button>
            <h1 className="font-display text-base sm:text-lg tracking-wide">
              Compare: Groq vs Cerebrus
            </h1>
          </div>

          <Link
            to="/chat"
            className="text-xs font-mono text-gold hover:underline flex items-center gap-1"
          >
            <span>Chat</span>
            <ArrowLeft className="w-3 h-3 rotate-180" />
          </Link>
        </div>

        {/* API Key and Model Config Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 bg-surface/40 p-3 rounded border border-line-light">
          <input
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Your Groq API key"
            className={`${inputCls} w-full sm:w-64 md:w-72`}
          />
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className={`${inputCls} w-full sm:w-auto`}
          >
            {GROQ_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <label className="text-xs text-mist flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>Remember key</span>
          </label>
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-gold hover:underline"
          >
            Get a key
          </a>
          <span className="text-[11px] text-mist/70 hidden lg:inline">Key stays in your browser.</span>
        </div>

        {/* Prompt Input & Trigger */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleRun();
              }
            }}
            rows={2}
            placeholder="Enter a prompt to send to both…"
            className={`${inputCls} flex-1 resize-none`}
          />
          <button
            onClick={handleRun}
            disabled={busy || !prompt.trim()}
            className="px-5 py-2 sm:py-0 rounded border border-gold text-gold hover:bg-gold/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm font-medium cursor-pointer"
          >
            {busy ? 'Running…' : 'Compare'}
          </button>
        </div>

        {/* Mobile View Tab Switcher (< 768px) */}
        <div className="flex md:hidden border border-line rounded p-0.5 bg-surface text-xs font-mono">
          <button
            onClick={() => setMobileTab('both')}
            className={`flex-1 py-1.5 rounded transition-colors ${
              mobileTab === 'both' ? 'bg-gold/20 text-gold font-medium' : 'text-mist'
            }`}
          >
            Both (Stacked)
          </button>
          <button
            onClick={() => setMobileTab('groq')}
            className={`flex-1 py-1.5 rounded transition-colors ${
              mobileTab === 'groq' ? 'bg-gold/20 text-gold font-medium' : 'text-mist'
            }`}
          >
            Groq
          </button>
          <button
            onClick={() => setMobileTab('cerebrus')}
            className={`flex-1 py-1.5 rounded transition-colors ${
              mobileTab === 'cerebrus' ? 'bg-gold/20 text-gold font-medium' : 'text-mist'
            }`}
          >
            Cerebrus
          </button>
        </div>

        {/* Comparison Panels */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 sm:gap-4">
          <Panel
            title="Groq"
            subtitle={model}
            state={groq}
            className={mobileTab === 'cerebrus' ? 'hidden md:flex' : 'flex'}
          />
          <Panel
            title="Cerebrus"
            subtitle="Cache + cascade router"
            state={cerebrus}
            className={mobileTab === 'groq' ? 'hidden md:flex' : 'flex'}
          />
        </div>
      </main>
    </div>
  );
}

export default GeminiComparePage;

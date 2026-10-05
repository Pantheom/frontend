import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

function Panel({ title, subtitle, state }: { title: string; subtitle: string; state: PanelState }) {
  const r = state.status === 'done' ? state.result : null;
  return (
    <section className="flex-1 min-w-0 flex flex-col border border-line rounded bg-surface">
      <header className="px-4 py-3 border-b border-line">
        <div className="text-sm font-medium text-fog">{title}</div>
        <div className="text-xs font-mono text-mist">{subtitle}</div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 text-sm text-fog">
        {state.status === 'idle' && <span className="text-mist/60 italic">Answer will appear here.</span>}
        {state.status === 'loading' && <span className="text-mist animate-pulse">Generating…</span>}
        {state.status === 'error' && <span className="text-red-400">{state.message}</span>}
        {r && (
          <div className="assistant-markdown text-sm leading-relaxed text-ink dark:text-ink-dark text-fog">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{r.text}</ReactMarkdown>
          </div>
        )}
      </div>
      {r && (
        <footer className="px-4 py-2 border-t border-line text-xs font-mono text-mist flex flex-wrap gap-x-4 gap-y-1">
          <span>{r.latencyMs} ms</span>
          {r.totalTokens != null && <span>{r.totalTokens} tokens</span>}
          {r.model && <span>{r.model}</span>}
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
    'bg-void border border-line rounded px-2.5 py-1.5 text-sm text-fog focus:outline-none focus:border-gold';

  return (
    <div className="flex h-screen bg-void text-fog font-body overflow-hidden">
      <NavRail />
      <main className="flex-1 flex flex-col min-w-0 p-6 gap-4">
        <h1 className="font-display text-lg tracking-wide">Compare: Groq vs Cerebrus</h1>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Your Groq API key"
            className={`${inputCls} w-72`}
          />
          <select value={model} onChange={(e) => setModel(e.target.value)} className={inputCls}>
            {GROQ_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <label className="text-xs text-mist flex items-center gap-1.5">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember on this device
          </label>
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-gold hover:underline"
          >
            Get a key
          </a>
          <span className="text-xs text-mist/70">Key stays in your browser and goes only to Groq.</span>
        </div>

        <div className="flex gap-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleRun();
              }
            }}
            rows={3}
            placeholder="Enter a prompt to send to both…"
            className={`${inputCls} flex-1 resize-none`}
          />
          <button
            onClick={handleRun}
            disabled={busy || !prompt.trim()}
            className="px-5 rounded border border-gold text-gold hover:bg-gold/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {busy ? 'Running…' : 'Compare'}
          </button>
        </div>

        <div className="flex-1 min-h-0 flex gap-4">
          <Panel title="Groq" subtitle={model} state={groq} />
          <Panel title="Cerebrus" subtitle="Cache + cascade router" state={cerebrus} />
        </div>
      </main>
    </div>
  );
}

export default GeminiComparePage;

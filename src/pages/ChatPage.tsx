import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavRail from '../components/chat/NavRail';
import ChatHeader from '../components/chat/ChatHeader';
import ChatThread, { type ChatThreadMessage } from '../components/chat/ChatThread';
import Composer from '../components/chat/Composer';
import { executePipelineQuery } from '../services/pipelineEngine';
import { isAuthenticated, getUid, fetchChatHistory, type StoredChatMessage } from '../services/authService';
import { saveUserTelemetryLog } from '../services/telemetryService';
import type { ChatMessage } from '../types/telemetry';

export function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatThreadMessage[]>([]);
  const [historyItems, setHistoryItems] = useState<StoredChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<{
    text: string;
    source?: string;
  } | null>(null);
  const [hitCount, setHitCount] = useState(0);
  const [totalQueries, setTotalQueries] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chatTitle, setChatTitle] = useState('New conversation');

  // Auth guard and initial history load for current user
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    setIsLoadingHistory(true);
    fetchChatHistory()
      .then((rows) => {
        if (rows && rows.length > 0) {
          setHistoryItems(rows);
          const loaded: ChatThreadMessage[] = rows.map((r) => ({
            id: `msg_db_${r.id}`,
            role: r.role,
            text: r.message,
          }));
          setMessages(loaded);

          const firstUser = rows.find((r) => r.role === 'user');
          if (firstUser) {
            setChatTitle(
              firstUser.message.length > 28
                ? `${firstUser.message.slice(0, 28)}...`
                : firstUser.message
            );
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load chat history:', err);
      })
      .finally(() => {
        setIsLoadingHistory(false);
      });
  }, [navigate]);

  // Fixed session per user — use uid stored at login time
  const sessionId = getUid() ?? 'default';

  // Calculate hit rate percentage: hits ÷ total messages so far
  const hitRate = totalQueries > 0 ? Math.round((hitCount / totalQueries) * 100) : 0;

  const handleSend = async (content: string) => {
    if (!content.trim() || isProcessing) return;

    // Set first message as title if new conversation
    if (messages.length === 0) {
      setChatTitle(content.length > 28 ? `${content.slice(0, 28)}...` : content);
    }

    const userMessage: ChatThreadMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      text: content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);
    setStreamingMessage({ text: '', source: 'LLM_Generation_Miss' });

    // Map existing thread messages for pipeline history context
    const pipelineHistory: ChatMessage[] = messages.map((m) => ({
      id: m.id || `hist_${Date.now()}`,
      role: m.role,
      content: m.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

    try {
      const result = await executePipelineQuery(
        content,
        pipelineHistory,
        {
          useLiveBackend: true,
          apiUrl: import.meta.env.VITE_API_BASE_URL ?? '',
        },
        (chunk) => {
          setStreamingMessage({
            text: chunk,
            source: 'LLM_Generation_Miss',
          });
        },
        sessionId,
      );

      const isHit = result.telemetry.source === 'RAM_Exact_Hit' || result.telemetry.source === 'DB_Semantic_Hit';
      const assistantMessage: ChatThreadMessage = {
        id: `msg_asst_${Date.now()}`,
        role: 'assistant',
        text: result.response,
        source: result.telemetry.source,
        tier: result.telemetry.tier,
        modelName: result.telemetry.modelName,
        needsContext: result.telemetry.needsContext,
        latencyMs: result.telemetry.latencyMs,
        tokenUsage: result.telemetry.tokenUsage,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Keep in-memory history updated for this session
      setHistoryItems((prev) => [
        ...prev,
        {
          id: Date.now(),
          uid: sessionId,
          session_id: sessionId,
          role: 'user',
          message: content,
          created_at: new Date().toISOString(),
        },
        {
          id: Date.now() + 1,
          uid: sessionId,
          session_id: sessionId,
          role: 'assistant',
          message: result.response,
          created_at: new Date().toISOString(),
        },
      ]);

      // Persist telemetry audit log for this user UUID
      saveUserTelemetryLog(sessionId, {
        id: `req_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        prompt: content,
        source: result.telemetry.source,
        tier: result.telemetry.tier,
        model: result.telemetry.modelName ?? (isHit ? 'LRU In-Memory Dict' : 'gpt oss 20B'),
        provider: result.telemetry.provider ?? (result.telemetry.source === 'RAM_Exact_Hit' ? 'In-Memory' : 'Supabase pgvector'),
        latencyMs: result.telemetry.latencyMs,
        tokensBilled: result.telemetry.tokenUsage?.total_tokens ?? 0,
        costSavedUsd: result.telemetry.costSavedUsd ?? (isHit ? 0.0038 : 0.002),
        needsContext: result.telemetry.needsContext ?? false,
        failSafeTriggered: result.telemetry.failSafeTriggered ?? false,
        g1Score: result.telemetry.g1Score,
        g2Score: result.telemetry.g2Score,
      });

      // Update telemetry hit stats & running session total
      setTotalQueries((prev) => prev + 1);
      if (isHit) {
        setHitCount((prev) => prev + 1);
      }

      // Accumulate session-level tokens (only on real LLM calls)
      if (result.telemetry.tokenUsage?.total_tokens) {
        setTotalTokens((prev) => prev + result.telemetry.tokenUsage!.total_tokens!);
      }
    } catch (err) {
      console.error('Pipeline execution error:', err);
      const errorMessage: ChatThreadMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        text: 'Cerberus encountered an error communicating with the model cascade router.',
        source: 'LLM_Generation_Miss',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setStreamingMessage(null);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setStreamingMessage(null);
    setIsProcessing(false);
    setChatTitle('New conversation');
    setHistoryOpen(false);
    setHitCount(0);
    setTotalQueries(0);
    setTotalTokens(0);
  };

  const handleToggleHistory = () => {
    setHistoryOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-void text-fog font-body overflow-hidden selection:bg-gold/20 selection:text-gold">
      {/* Slim 2-Pane Navigation Rail */}
      <NavRail
        onNewChat={handleNewChat}
        onToggleHistory={handleToggleHistory}
        historyOpen={historyOpen}
      />

      {/* Main Conversation Pane */}
      <div className="flex-1 flex flex-col min-w-0 bg-void relative">
        {/* Header with live earned cache stat */}
        <ChatHeader title={chatTitle} hitRate={hitRate} totalTokens={totalTokens} />

        {/* Conversation Thread */}
        <ChatThread
          messages={messages}
          onSelectPrompt={handleSend}
          streamingMessage={streamingMessage}
        />

        {/* Minimal Composer */}
        <Composer onSend={handleSend} disabled={isProcessing} />

        {/* History Flyout Drawer */}
        {historyOpen && (
          <aside className="absolute inset-y-0 left-0 w-72 bg-surface border-r border-line p-4 z-20 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <span className="text-xs font-mono font-medium uppercase text-mist">
                Chat History
              </span>
              <button
                onClick={() => setHistoryOpen(false)}
                className="text-xs text-mist hover:text-fog transition-colors"
              >
                Close ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {isLoadingHistory ? (
                <div className="text-xs text-mist/60 p-2 italic">Loading history...</div>
              ) : historyItems.filter((item) => item.role === 'user').length === 0 ? (
                <div className="text-xs text-mist/60 p-2 italic">No previous queries found.</div>
              ) : (
                historyItems
                  .filter((item) => item.role === 'user')
                  .slice()
                  .reverse()
                  .map((item, idx) => (
                    <button
                      key={item.id || idx}
                      onClick={() => {
                        if (messages.length === 0) {
                          setMessages(
                            historyItems.map((r) => ({
                              id: `msg_db_${r.id}`,
                              role: r.role,
                              text: r.message,
                            }))
                          );
                        }
                        setTimeout(() => {
                          const target = document.getElementById(`msg_db_${item.id}`);
                          if (target) {
                            target.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 50);
                        setHistoryOpen(false);
                      }}
                      className="w-full text-left p-2.5 rounded text-xs text-mist hover:text-fog hover:bg-surface-elevated transition-colors truncate border border-transparent hover:border-line-light"
                      title={item.message}
                    >
                      "{item.message}"
                    </button>
                  ))
              )}
            </div>
            <button
              onClick={handleNewChat}
              className="mt-4 w-full py-2 text-xs font-medium rounded border border-line hover:border-gold text-fog transition-colors"
            >
              Clear Current Thread
            </button>
          </aside>
        )}
      </div>
    </div>
  );
}

export default ChatPage;

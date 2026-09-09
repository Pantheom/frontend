import { useState } from 'react';
import NavRail from '../components/chat/NavRail';
import ChatHeader from '../components/chat/ChatHeader';
import ChatThread, { type ChatThreadMessage } from '../components/chat/ChatThread';
import Composer from '../components/chat/Composer';
import { executePipelineQuery } from '../services/pipelineEngine';
import type { ChatMessage } from '../types/telemetry';

export function ChatPage() {
  const [messages, setMessages] = useState<ChatThreadMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<{
    text: string;
    source?: string;
    tokensUsed?: number;
    tokensSaved?: number;
  } | null>(null);
  const [hitCount, setHitCount] = useState(0);
  const [totalQueries, setTotalQueries] = useState(0);
  const [tokensSavedTotal, setTokensSavedTotal] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chatTitle, setChatTitle] = useState('New conversation');

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
    setStreamingMessage({ text: '', source: 'LLM_Generation_Miss', tokensUsed: 0, tokensSaved: 0 });

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
        undefined,
        (chunk) => {
          setStreamingMessage({
            text: chunk,
            source: 'LLM_Generation_Miss',
            tokensUsed: Math.round(chunk.split(' ').length * 1.3),
            tokensSaved: 0,
          });
        }
      );

      const isHit = result.telemetry.source === 'RAM_Exact_Hit' || result.telemetry.source === 'DB_Semantic_Hit';
      const tokensSaved = isHit ? (result.telemetry.tokensSaved ?? 0) : 0;
      const tokensUsed = result.telemetry.tokensUsed ?? 0;

      const assistantMessage: ChatThreadMessage = {
        id: `msg_asst_${Date.now()}`,
        role: 'assistant',
        text: result.response,
        source: result.telemetry.source,
        tokensUsed,
        tokensSaved,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update telemetry hit stats & running session total
      setTotalQueries((prev) => prev + 1);
      if (isHit) {
        setHitCount((prev) => prev + 1);
        setTokensSavedTotal((prev) => prev + tokensSaved);
      }
    } catch (err) {
      console.error('Pipeline execution error:', err);
      const errorMessage: ChatThreadMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        text: 'Cerberus encountered an error communicating with the model cascade router.',
        source: 'LLM_Generation_Miss',
        tokensUsed: 0,
        tokensSaved: 0,
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
    setTokensSavedTotal(0);
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
        <ChatHeader title={chatTitle} hitRate={hitRate} tokensSavedTotal={tokensSavedTotal} />

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
                Recent Queries
              </span>
              <button
                onClick={() => setHistoryOpen(false)}
                className="text-xs text-mist hover:text-fog transition-colors"
              >
                Close ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {[
                'What is semantic caching in LLM architectures?',
                'What is machine learning?',
                'How does the Model Cascade Router work?',
                'Explain quantum key distribution algorithms',
              ].map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    handleSend(query);
                    setHistoryOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded text-xs text-mist hover:text-fog hover:bg-surface-elevated transition-colors truncate border border-transparent hover:border-line-light"
                  title={query}
                >
                  "{query}"
                </button>
              ))}
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

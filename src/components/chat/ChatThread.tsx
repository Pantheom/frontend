import { useEffect, useRef } from 'react';
import { UserMessage, AssistantMessage } from './Message';
import EmptyState from './EmptyState';

export interface ChatThreadMessage {
  id?: string;
  role: 'user' | 'assistant';
  text: string;
  source?: string;
  tier?: string;
  modelName?: string;
  needsContext?: boolean;
  tokensUsed?: number;
}

interface ChatThreadProps {
  messages?: ChatThreadMessage[];
  onSelectPrompt?: (prompt: string) => void;
  streamingMessage?: { text: string; source?: string; tokensUsed?: number } | null;
}

export default function ChatThread({
  messages = [],
  onSelectPrompt,
  streamingMessage,
}: ChatThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  if (messages.length === 0 && !streamingMessage) {
    return <EmptyState onSelectPrompt={onSelectPrompt} />;
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6">
      {messages.map((m, i) =>
        m.role === 'user' ? (
          <UserMessage key={m.id || i} text={m.text} />
        ) : (
          <AssistantMessage
            key={m.id || i}
            text={m.text}
            source={m.source}
            selectedTier={m.tier}
            modelName={m.modelName}
            needsContext={m.needsContext}
            tokensUsed={m.tokensUsed}
          />
        )
      )}

      {/* Streaming assistant message in flight */}
      {streamingMessage && (
        <AssistantMessage
          text={streamingMessage.text || 'Processing query through cache & cascade router...'}
          source={streamingMessage.source || 'LLM_Generation_Miss'}
          tokensUsed={streamingMessage.tokensUsed}
          isStreaming={true}
        />
      )}

      <div ref={scrollRef} aria-hidden="true" />
    </div>
  );
}

import React, { useState, useRef } from 'react';

interface ComposerProps {
  onSend?: (value: string) => void;
  disabled?: boolean;
}

export default function Composer({ onSend, disabled }: ComposerProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend?.(value.trim());
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  return (
    <div className="border-t border-line p-4 bg-void">
      <div className="flex items-end gap-2 border border-line rounded-lg px-4 py-2.5 bg-surface focus-within:border-gold/50 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask anything"
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed max-h-40 text-fog placeholder:text-mist"
        />
        <button
          type="button"
          onClick={handleSend}
          className="text-sm font-medium text-gold disabled:text-mist/40 transition-colors pb-0.5 cursor-pointer disabled:cursor-not-allowed"
          disabled={!value.trim() || disabled}
        >
          Send
        </button>
      </div>
    </div>
  );
}

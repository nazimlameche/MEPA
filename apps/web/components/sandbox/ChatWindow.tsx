'use client';

import { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { useSandbox } from '@/hooks/useSandbox';

export default function ChatWindow() {
  const { messages, input, setInput, send, loading } = useSandbox();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void send();
  }

  return (
    <div
      className="flex flex-col flex-1 min-h-0 overflow-hidden"
      style={{
        background:   'var(--color-surface)',
        border:       '1px solid var(--color-border)',
        borderRadius: '8px',
      }}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-64">
        {messages.length === 0 && (
          <p className="text-center text-sm py-8" style={{ color: 'var(--color-muted)' }}>
            Pose une question sur l&apos;IA pour commencer…
          </p>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} moderated={msg.moderated ?? false} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div
              className="px-4 py-2.5"
              style={{
                background:   'var(--color-surface)',
                border:       '1px solid var(--color-border)',
                borderRadius: '8px 8px 8px 2px',
              }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full animate-bounce"
                    style={{ background: 'var(--color-border-strong)', animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-3 flex gap-2"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écris ton message…"
          disabled={loading}
          maxLength={2000}
          className="flex-1 px-4 py-2 text-sm outline-none transition-colors duration-200"
          style={{
            background:   'var(--color-bg)',
            border:       '1px solid var(--color-border)',
            borderRadius: '8px',
            color:        'var(--color-ink)',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="h-9 w-9 flex items-center justify-center transition-colors duration-200 disabled:opacity-40"
          style={{
            background:   'var(--color-accent)',
            color:        '#fff',
            borderRadius: '8px',
            border:       'none',
          }}
          onMouseEnter={e => { if (input.trim() && !loading) e.currentTarget.style.background = 'var(--color-accent-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-accent)'; }}
          aria-label="Envoyer"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

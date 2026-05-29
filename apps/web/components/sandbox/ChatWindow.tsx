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
    <div className="flex flex-col bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-64">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            Pose une question sur l&apos;IA pour commencer…
          </p>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} moderated={msg.moderated ?? false} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-surface-200 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-2 w-2 rounded-full bg-gray-300 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-surface-200 p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écris ton message…"
          disabled={loading}
          maxLength={2000}
          className="flex-1 rounded-xl border border-surface-200 px-4 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="h-9 w-9 rounded-xl bg-primary-500 flex items-center justify-center text-white hover:bg-primary-600 transition disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

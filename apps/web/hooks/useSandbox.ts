'use client';

import { useState } from 'react';
import type { SandboxMessage } from '@/types';

export function useSandbox() {
  const [messages, setMessages] = useState<SandboxMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function send() {
    const content = input.trim();
    if (!content) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setLoading(true);

    try {
      const res = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/api/sandbox/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        credentials: 'include',
      });

      if (!res.ok) throw new Error('API error');

      const data = (await res.json()) as { reply: string; moderated: boolean };
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, moderated: data.moderated }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Une erreur est survenue. Réessaie dans quelques instants.', moderated: false },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return { messages, input, setInput, send, loading };
}

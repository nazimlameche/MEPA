'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { SandboxMessage } from '@/types';

export function useSandbox() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<SandboxMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Restore chat history on mount
  useEffect(() => {
    const token = session?.accessToken;
    if (!token) return;
    fetch(`${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'}/api/sandbox/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then((data: Array<{ role: string; content: string }> | null) => {
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content, moderated: false })));
        }
      })
      .catch(() => { /* best-effort */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  async function send() {
    const content = input.trim();
    if (!content) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setLoading(true);

    try {
      const token = session?.accessToken;
      const res = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/api/sandbox/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content }),
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

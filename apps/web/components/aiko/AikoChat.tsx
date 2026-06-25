'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AikoChatProps {
  /** Contenu sérialisé envoyé en contexte à Mistral — jamais de PII */
  context: string;
  /** Titre affiché dans l'en-tête du chat */
  chapterTitle?: string;
  /** Placeholder de l'input */
  inputPlaceholder?: string;
  /** Message affiché quand la conversation est vide */
  emptyStateMessage?: string;
}

export default function AikoChat({
  context,
  chapterTitle,
  inputPlaceholder = 'Pose ta question…',
  emptyStateMessage = "Pose-moi une question sur ce chapitre, je suis là pour t'aider !",
}: AikoChatProps) {
  const { data: session }           = useSession();
  const [open, setOpen]             = useState(false);
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const bottomRef                   = useRef<HTMLDivElement>(null);
  const inputRef                    = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const token = session?.accessToken;
    if (!token) { toast.error('Non authentifié'); return; }

    const userMsg: Message = { role: 'user', content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post<{ reply: string }>(
        '/aiko/chat',
        { messages: updated, context },
        token,
      );
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (err) {
      console.error('[AikoChat]', err);
      toast.error('AIKO ne répond pas. Réessaie dans un instant.');
      // Retire le message utilisateur si l'appel a échoué
      setMessages(prev => prev.slice(0, -1));
      setInput(trimmed);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(); }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Ouvrir AIKO"
        style={{
          position:     'fixed',
          bottom:       '24px',
          right:        '24px',
          zIndex:       50,
          width:        '52px',
          height:       '52px',
          borderRadius: '50%',
          background:   open ? 'var(--color-primary-dark)' : 'var(--color-primary)',
          border:       '2px solid rgba(255,255,255,0.12)',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          cursor:       'pointer',
          boxShadow:    '0 4px 24px rgba(76,31,212,0.45)',
          transition:   'background 0.2s ease',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={22} color="#fff" />
            </motion.span>
          ) : (
            <motion.span key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Bot size={22} color="#fff" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position:     'fixed',
              bottom:       '88px',
              right:        '24px',
              zIndex:       50,
              width:        'min(360px, calc(100vw - 32px))',
              height:       '460px',
              borderRadius: '16px',
              background:   'var(--color-surface-card)',
              border:       '1px solid var(--color-surface-border)',
              boxShadow:    '0 8px 40px rgba(0,0,0,0.5)',
              display:      'flex',
              flexDirection: 'column',
              overflow:     'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding:        '12px 16px',
                borderBottom:   '1px solid var(--color-surface-border)',
                display:        'flex',
                alignItems:     'center',
                gap:            '10px',
                flexShrink:     0,
              }}
            >
              <div
                style={{
                  width:        '32px',
                  height:       '32px',
                  borderRadius: '50%',
                  background:   'rgba(76,31,212,0.2)',
                  border:       '1px solid rgba(76,31,212,0.4)',
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent: 'center',
                  flexShrink:   0,
                }}
              >
                <Bot size={16} style={{ color: 'var(--color-primary-light)' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>AIKO</p>
                {chapterTitle && (
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chapterTitle}
                  </p>
                )}
              </div>
              <div
                style={{
                  marginLeft:   'auto',
                  fontSize:     '0.65rem',
                  color:        'var(--color-xp)',
                  background:   'rgba(16,185,129,0.1)',
                  border:       '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '20px',
                  padding:      '2px 8px',
                  whiteSpace:   'nowrap',
                  flexShrink:   0,
                }}
              >
                Assistant IA
              </div>
            </div>

            {/* Messages */}
            <div
              style={{
                flex:       1,
                overflowY:  'auto',
                padding:    '12px',
                display:    'flex',
                flexDirection: 'column',
                gap:        '8px',
              }}
            >
              {messages.length === 0 && (
                <div
                  style={{
                    flex:           1,
                    display:        'flex',
                    flexDirection:  'column',
                    alignItems:     'center',
                    justifyContent: 'center',
                    gap:            '8px',
                    color:          'var(--color-text-muted)',
                    textAlign:      'center',
                    padding:        '24px',
                  }}
                >
                  <Bot size={32} style={{ color: 'var(--color-primary-light)', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.8rem', margin: 0 }}>
                    {emptyStateMessage}
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    alignSelf:    msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth:     '85%',
                    padding:      '8px 12px',
                    borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    background:   msg.role === 'user'
                      ? 'var(--color-primary)'
                      : 'rgba(255,255,255,0.05)',
                    border:       msg.role === 'user'
                      ? 'none'
                      : '1px solid var(--color-surface-border)',
                    fontSize:     '0.825rem',
                    color:        'var(--color-text-primary)',
                    lineHeight:   '1.45',
                    whiteSpace:   'pre-wrap',
                    wordBreak:    'break-word',
                  }}
                >
                  {msg.content}
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    alignSelf:    'flex-start',
                    padding:      '8px 12px',
                    borderRadius: '12px 12px 12px 4px',
                    background:   'rgba(255,255,255,0.05)',
                    border:       '1px solid var(--color-surface-border)',
                    display:      'flex',
                    alignItems:   'center',
                    gap:          '6px',
                    color:        'var(--color-text-muted)',
                    fontSize:     '0.8rem',
                  }}
                >
                  <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                  AIKO réfléchit…
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              style={{
                padding:      '10px 12px',
                borderTop:    '1px solid var(--color-surface-border)',
                display:      'flex',
                gap:          '8px',
                alignItems:   'center',
                flexShrink:   0,
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={inputPlaceholder}
                maxLength={500}
                disabled={loading}
                style={{
                  flex:         1,
                  padding:      '8px 12px',
                  borderRadius: '8px',
                  background:   'rgba(255,255,255,0.06)',
                  border:       '1px solid var(--color-surface-border)',
                  color:        'var(--color-text-primary)',
                  fontSize:     '0.825rem',
                  outline:      'none',
                  transition:   'border-color 0.2s ease',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-surface-border)')}
              />
              <motion.button
                onClick={() => void sendMessage()}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                disabled={!input.trim() || loading}
                aria-label="Envoyer"
                style={{
                  width:        '36px',
                  height:       '36px',
                  borderRadius: '8px',
                  background:   input.trim() && !loading ? 'var(--color-primary)' : 'rgba(255,255,255,0.06)',
                  border:       'none',
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent: 'center',
                  cursor:       input.trim() && !loading ? 'pointer' : 'not-allowed',
                  flexShrink:   0,
                  transition:   'background 0.2s ease',
                }}
              >
                <Send size={15} style={{ color: input.trim() && !loading ? '#fff' : 'var(--color-text-muted)' }} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyframe for spinner */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

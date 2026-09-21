import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Building, CheckCheck } from 'lucide-react';
import { subscribeToMessages } from '../../firebase/realtime';
import { sendMessage } from '../../firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import type { MessageDocument } from '../../types/firebaseModels';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string | null;
  recipientId: string;
  recipientName: string;
  propertyTitle?: string;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  conversationId,
  recipientId,
  recipientName,
  propertyTitle
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageDocument[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !conversationId) return;

    const unsubscribe = subscribeToMessages(conversationId, (liveMessages) => {
      setMessages(liveMessages);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });

    return () => unsubscribe();
  }, [isOpen, conversationId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !conversationId || sending) return;

    setSending(true);
    const text = inputText;
    setInputText('');

    try {
      await sendMessage(conversationId, user.id, recipientId, text);
    } catch (err) {
      console.error('Failed to send message:', err);
      setInputText(text); // Restore on failure
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        height: '100%',
        backgroundColor: 'var(--bg-card)',
        borderLeft: '1px solid var(--border-medium)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-xl)',
        animation: 'slideLeft 0.25s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              backgroundColor: 'var(--gold-primary)',
              color: 'var(--gold-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700
            }}>
              {recipientName ? recipientName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                {recipientName}
              </div>
              {propertyTitle && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Building size={12} />
                  {propertyTitle}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-icon"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Feed */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-secondary)', padding: '2rem 1rem' }}>
              <Building size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Direct Negotiation Channel</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Send a message to discuss pricing, viewings, or property verification in real time.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId === user?.id;
              return (
                <div
                  key={m.messageId}
                  style={{
                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: isMine ? '1.1rem 1.1rem 0.2rem 1.1rem' : '1.1rem 1.1rem 1.1rem 0.2rem',
                      backgroundColor: isMine ? 'var(--gold-primary)' : 'var(--bg-secondary)',
                      color: isMine ? 'var(--gold-text)' : 'var(--text-primary)',
                      border: isMine ? 'none' : '1px solid var(--border-medium)',
                      fontSize: '0.9rem',
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {m.message}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.7rem',
                    color: 'var(--text-secondary)',
                    marginTop: '0.2rem'
                  }}>
                    <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMine && <CheckCheck size={12} style={{ opacity: 0.7 }} />}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="btn btn-primary btn-sm"
            style={{ height: '42px', width: '42px', padding: 0, borderRadius: 'var(--radius-md)' }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

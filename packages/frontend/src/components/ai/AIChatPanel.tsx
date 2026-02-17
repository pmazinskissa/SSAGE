import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Send, Bot } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAI } from '../../context/AIContext';
import { useAIChat } from '../../hooks/useAIChat';
import AIChatMessage from './AIChatMessage';

export default function AIChatPanel() {
  const { chatOpen, setChatOpen, model } = useAI();
  const { slug: courseSlug, moduleSlug, lessonSlug } = useParams<{
    slug: string;
    moduleSlug?: string;
    lessonSlug?: string;
  }>();
  const { messages, streaming, error, sendMessage, clearHistory } = useAIChat();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [chatOpen]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || streaming || !courseSlug) return;
    setInput('');
    sendMessage(text, courseSlug, moduleSlug || '', lessonSlug || '');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover transition-colors flex items-center justify-center hover:shadow-xl"
            title="AI Assistant"
          >
            <Bot size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat popup */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-40 w-[520px] max-w-[calc(100vw-2rem)] h-[680px] max-h-[calc(100vh-6rem)] bg-white border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/50">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-primary" />
                <span className="text-sm font-semibold text-text-primary">AI Assistant</span>
                {model && (
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                    {model}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearHistory}
                  className="p-1.5 rounded-md hover:bg-surface text-text-secondary hover:text-text-primary transition-colors"
                  title="Clear history"
                >
                  <Trash2 size={15} />
                </button>
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-1.5 rounded-md hover:bg-surface text-text-secondary hover:text-text-primary transition-colors"
                  title="Close"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Bot size={24} className="text-primary" />
                  </div>
                  <p className="text-sm font-medium text-text-primary mb-1">
                    Hi! I'm your AI learning assistant.
                  </p>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Ask me about the current lesson, request explanations of concepts, or get help applying the material to your own context.
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <AIChatMessage
                    key={i}
                    role={msg.role}
                    content={msg.content}
                    streaming={streaming && i === messages.length - 1 && msg.role === 'assistant'}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-2 bg-error/10 border-t border-error/20">
                <p className="text-xs text-error">{error}</p>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-border bg-white p-3">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question..."
                  rows={1}
                  disabled={streaming}
                  className="flex-1 resize-none px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50 max-h-24"
                  style={{ minHeight: '38px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={streaming || !input.trim()}
                  className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

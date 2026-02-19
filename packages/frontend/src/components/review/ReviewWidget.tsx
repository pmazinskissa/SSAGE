import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, X, Send, Check } from 'lucide-react';
import { api } from '../../lib/api';

const ANNOTATION_TYPES = ['general', 'bug', 'content', 'design', 'ux'] as const;
type AnnotationType = (typeof ANNOTATION_TYPES)[number];

const TYPE_LABELS: Record<AnnotationType, string> = {
  general: 'General',
  bug: 'Bug',
  content: 'Content',
  design: 'Design',
  ux: 'UX',
};

export default function ReviewWidget() {
  const location = useLocation();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [type, setType] = useState<AnnotationType>('general');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  // Check if review mode is enabled on mount
  useEffect(() => {
    api.getReviewStatus()
      .then((res) => setEnabled(res.enabled))
      .catch(() => setEnabled(false));
  }, []);

  // Reset form on navigation
  useEffect(() => {
    setText('');
    setType('general');
    setSuccess(false);
  }, [location.pathname]);

  const handleSubmit = useCallback(async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await api.createReviewAnnotation({
        page_path: location.pathname,
        page_title: document.title || undefined,
        annotation_text: text.trim(),
        annotation_type: type,
      });
      setSuccess(true);
      setSessionCount((c) => c + 1);
      setText('');
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error('[ReviewWidget] Submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  }, [text, type, location.pathname, submitting]);

  // Don't render if not enabled or still loading
  if (enabled !== true) return null;

  return (
    <>
      {/* FAB button — bottom-left, amber */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 left-6 z-40 w-14 h-14 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-colors flex items-center justify-center hover:shadow-xl"
            title="Leave review annotation"
          >
            <MessageSquarePlus size={24} />
            {sessionCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                {sessionCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-6 z-40 w-96 max-w-[calc(100vw-2rem)] bg-white border border-amber-200 rounded-2xl shadow-xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-amber-900">Review Annotation</h3>
                <p className="text-xs text-amber-700 truncate max-w-[260px]" title={location.pathname}>
                  {location.pathname}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-amber-600 hover:text-amber-800 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Type pills */}
            <div className="px-4 pt-3 flex flex-wrap gap-1.5">
              {ANNOTATION_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    type === t
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <div className="px-4 py-3">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Describe the issue or suggestion..."
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
              />
            </div>

            {/* Footer */}
            <div className="px-4 pb-3 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {sessionCount > 0 && `${sessionCount} submitted this session`}
              </span>
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || submitting}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {success ? (
                  <>
                    <Check size={16} />
                    Saved
                  </>
                ) : submitting ? (
                  'Saving...'
                ) : (
                  <>
                    <Send size={16} />
                    Submit
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

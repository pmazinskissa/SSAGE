import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Star } from 'lucide-react';
import { api } from '../../lib/api';
import Button from './Button';

/* ------------------------------------------------------------------ */
/*  Rating scale — 5 shades from light to dark using the theme primary */
/* ------------------------------------------------------------------ */
const RATING_OPACITIES = [0.15, 0.30, 0.50, 0.75, 1.0];

interface FeedbackModalProps {
  courseSlug: string;
  onClose: () => void;
}

export default function FeedbackModal({ courseSlug, onClose }: FeedbackModalProps) {
  const [feedbackText, setFeedbackText] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!feedbackText.trim()) return;
    setSubmitting(true);
    try {
      await api.submitFeedback({
        course_slug: courseSlug,
        feedback_text: feedbackText.trim(),
        submitter_name: submitterName.trim() || undefined,
        rating: rating > 0 ? rating : undefined,
      });
      setSubmitted(true);
    } catch {
      alert('Failed to submit feedback. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-md overflow-hidden rounded-2xl shadow-2xl ring-1 ring-primary/10"
        >
          {/* Purple header bar */}
          <div className="px-6 pt-5 pb-4 bg-gradient-to-r from-primary to-primary-hover">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-white" />
                <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  Share Feedback
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-white/70 hover:text-white transition-colors rounded-md"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body — Soft style */}
          <div className="bg-surface">
            <div className="p-6">
              {submitted ? (
                <div className="text-center py-4 p-6 bg-white rounded-xl shadow-sm">
                  <div className="flex justify-center mb-3">
                    <Star size={32} className="text-success" />
                  </div>
                  <p className="text-success font-semibold">Thank you for your feedback!</p>
                  <p className="text-sm text-text-secondary mt-2">
                    Your input helps us improve the course.
                  </p>
                  <Button onClick={onClose} className="mt-4 text-sm bg-primary hover:bg-primary-hover shadow-lg shadow-primary/25">
                    Close
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-text-primary">
                      Your feedback <span className="text-error">*</span>
                    </label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Share your thoughts, suggestions, or report any issues..."
                      className="w-full h-32 p-3.5 text-sm focus:outline-none resize-none transition-colors border-2 border-border bg-white shadow-sm rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/15 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-text-primary">
                      Rating <span className="text-text-secondary/60 font-normal">(optional)</span>
                    </label>
                    <div className="grid grid-cols-5 gap-0">
                      {[1, 2, 3, 4, 5].map((val) => {
                        const filled = rating > 0 && val <= rating;
                        const opacity = RATING_OPACITIES[val - 1];
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setRating(rating === val ? 0 : val)}
                            className={`py-2.5 text-sm font-semibold transition-all border border-primary/20 ${
                              val === 1 ? 'rounded-l-lg' : ''
                            } ${val === 5 ? 'rounded-r-lg' : ''} ${
                              val > 1 ? '-ml-px' : ''
                            } ${
                              filled
                                ? 'z-10 relative'
                                : 'bg-white text-text-secondary hover:bg-primary-light hover:text-primary'
                            }`}
                            style={filled ? {
                              backgroundColor: `color-mix(in srgb, var(--color-primary) ${Math.round(opacity * 100)}%, white)`,
                              color: opacity >= 0.5 ? 'white' : 'var(--color-primary)',
                            } : undefined}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-text-secondary">Poor</span>
                      <span className="text-[10px] text-text-secondary">Excellent</span>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-text-primary">
                      Your name <span className="text-text-secondary/60 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={submitterName}
                      onChange={(e) => setSubmitterName(e.target.value)}
                      placeholder="Anonymous"
                      className="w-full px-3.5 py-2.5 text-sm focus:outline-none transition-colors border-2 border-border bg-white shadow-sm rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/15 focus:bg-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="tertiary" onClick={onClose} className="text-sm text-text-secondary">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!feedbackText.trim() || submitting}
                      className="text-sm bg-primary hover:bg-primary-hover shadow-lg shadow-primary/25"
                    >
                      {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight, SkipForward } from 'lucide-react';
import { api } from '../lib/api';
import { useCourse } from '../context/CourseContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { TopographicBg } from '../components/ui/Backgrounds';
import { springBounce, fadeInUp } from '../lib/animations';

export default function FeedbackPage() {
  const { slug } = useParams<{ slug: string }>();
  const { course } = useCourse();
  const [feedbackText, setFeedbackText] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!feedbackText.trim() || !slug) return;
    setSubmitting(true);
    try {
      await api.submitFeedback({
        course_slug: slug,
        feedback_text: feedbackText.trim(),
        submitter_name: submitterName.trim() || undefined,
      });
      setSubmitted(true);
    } catch {
      alert('Failed to submit feedback. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div>
      <div className="relative">
        <TopographicBg />
        <div className="relative max-w-lg mx-auto px-6 py-12">
          <motion.div
            variants={springBounce}
            initial="hidden"
            animate="visible"
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageSquare size={32} className="text-primary" />
            </div>
          </motion.div>

          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1
              className="text-2xl font-bold text-text-primary"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              How was the course?
            </h1>
            <p className="text-text-secondary mt-2 text-sm">
              Your feedback helps us improve {course?.title || 'the course'}.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <Card elevation={1} className="p-6">
              {submitted ? (
                <div className="text-center py-4">
                  <p className="text-success font-semibold text-lg">Thank you for your feedback!</p>
                  <p className="text-sm text-text-secondary mt-2">
                    Your input helps us improve the course.
                  </p>
                  <Link
                    to={`/courses/${slug}/completion`}
                    className="inline-flex items-center gap-2 mt-6 px-6 py-3 text-sm font-medium text-white bg-success rounded-button hover:opacity-90 transition-opacity"
                  >
                    View Course Completion
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      Your feedback <span className="text-error">*</span>
                    </label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Share your thoughts, suggestions, or report any issues..."
                      className="w-full h-32 p-3 text-sm border border-border rounded-input focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      Your name <span className="text-text-secondary/60">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={submitterName}
                      onChange={(e) => setSubmitterName(e.target.value)}
                      placeholder="Anonymous"
                      className="w-full px-3 py-2 text-sm border border-border rounded-input focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Link
                      to={`/courses/${slug}/completion`}
                      className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <SkipForward size={14} />
                      Skip
                    </Link>
                    <Button
                      onClick={handleSubmit}
                      disabled={!feedbackText.trim() || submitting}
                      className="text-sm"
                    >
                      {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

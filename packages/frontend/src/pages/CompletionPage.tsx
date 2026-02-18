import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Clock, Award, ArrowLeft, MessageSquare, BookOpen, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { useCourse } from '../context/CourseContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FeedbackModal from '../components/ui/FeedbackModal';
import { TopographicBg } from '../components/ui/Backgrounds';
import { springBounce, fadeInUp, stagger } from '../lib/animations';
import type { CourseProgress } from '@playbook/shared';

export default function CompletionPage() {
  const { slug } = useParams<{ slug: string }>();
  const { course, navTree } = useCourse();
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api.getProgress(slug)
      .then(setProgress)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-prose mx-auto px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-surface rounded w-full" />
          <div className="h-8 bg-surface rounded w-3/4" />
        </div>
      </div>
    );
  }

  const totalTimeMinutes = Math.round((progress?.total_time_seconds || 0) / 60);
  const hours = Math.floor(totalTimeMinutes / 60);
  const mins = totalTimeMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const completedDate = progress?.completed_at
    ? new Date(progress.completed_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div>
      {/* Celebration hero with gradient mesh */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <div
            className="absolute w-[500px] h-[500px] rounded-full opacity-25 blur-[100px] animate-[meshFloat1_12s_ease-in-out_infinite]"
            style={{ background: 'var(--color-primary)', top: '-10%', left: '-5%' }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-[100px] animate-[meshFloat2_14s_ease-in-out_infinite]"
            style={{ background: 'var(--color-success)', top: '20%', right: '-8%' }}
          />
          <div
            className="absolute w-[350px] h-[350px] rounded-full opacity-15 blur-[100px] animate-[meshFloat3_10s_ease-in-out_infinite]"
            style={{ background: 'var(--color-accent)', bottom: '-15%', left: '30%' }}
          />
        </div>

        <div className="relative max-w-2xl mx-auto px-6 pt-12 pb-10">
          {/* Trophy animation */}
          <motion.div
            className="flex justify-center mb-8"
            variants={springBounce}
            initial="hidden"
            animate="visible"
          >
            <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center">
              <Trophy size={48} className="text-success" />
            </div>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1
              className="text-3xl font-bold text-text-primary"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Course Complete!
            </h1>
            <p className="text-text-secondary mt-2">
              Congratulations on completing {course?.title || 'the course'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content section with topo background */}
      <div className="relative">
        <TopographicBg />
        <div className="relative max-w-2xl mx-auto px-6 py-10">
          {/* Summary cards */}
          <motion.div
            className="grid grid-cols-2 gap-4 mb-10"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {completedDate && (
              <motion.div variants={fadeInUp}>
                <Card elevation={1} className="p-4 text-center">
                  <Award size={20} className="text-primary mx-auto mb-2" />
                  <p className="text-xs text-text-secondary">Completed</p>
                  <p className="text-sm font-semibold text-text-primary">{completedDate}</p>
                </Card>
              </motion.div>
            )}
            <motion.div variants={fadeInUp}>
              <Card elevation={1} className="p-4 text-center">
                <Clock size={20} className="text-primary mx-auto mb-2" />
                <p className="text-xs text-text-secondary">Total Time</p>
                <p className="text-sm font-semibold text-text-primary">{timeStr}</p>
              </Card>
            </motion.div>
          </motion.div>

          {/* Course summary — what you learned */}
          {navTree && navTree.modules.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={20} className="text-primary" />
                <h2
                  className="text-lg font-semibold text-text-primary"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  What You Learned
                </h2>
              </div>
              {course?.description && (
                <p className="text-sm text-text-secondary mb-5 leading-relaxed">
                  {course.description}
                </p>
              )}
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-primary/20" />

                <div className="space-y-4">
                  {navTree.modules.map((mod, idx) => (
                    <div key={mod.slug} className="relative flex gap-4">
                      {/* Numbered circle on the line */}
                      <div className="relative z-10 flex-shrink-0 w-[31px] h-[31px] rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-sm shadow-primary/25">
                        {idx + 1}
                      </div>
                      {/* Module card */}
                      <Card elevation={0} className="flex-1 p-4">
                        <h3 className="text-sm font-semibold text-text-primary mb-2">{mod.title}</h3>
                        {mod.objectives.length > 0 && (
                          <ul className="space-y-1.5">
                            {mod.objectives.map((obj, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                                <CheckCircle2 size={13} className="text-success mt-0.5 flex-shrink-0" />
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Per-module KC scores */}
          {progress?.knowledge_checks && progress.knowledge_checks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-10"
            >
              <h2
                className="text-lg font-semibold text-text-primary mb-4"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Knowledge Check Scores
              </h2>
              <div className="space-y-3">
                {progress.knowledge_checks.map((kc) => (
                  <Card key={kc.module_slug} elevation={0} className="p-4 flex items-center justify-between">
                    <span className="text-sm text-text-primary capitalize">
                      {kc.module_slug.replace(/-/g, ' ')}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        kc.score >= 80 ? 'text-success' : kc.score >= 60 ? 'text-warning' : 'text-error'
                      }`}
                    >
                      {kc.score}% ({kc.correct_answers}/{kc.total_questions})
                    </span>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Feedback */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              variant="tertiary"
              onClick={() => setShowFeedback(true)}
              className="flex items-center gap-2 text-sm"
            >
              <MessageSquare size={16} />
              Share Feedback
            </Button>
          </motion.div>

          {showFeedback && slug && (
            <FeedbackModal courseSlug={slug} onClose={() => setShowFeedback(false)} />
          )}

          {/* Back to course */}
          <motion.div
            className="flex justify-center pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              to={`/courses/${slug}`}
              className="flex items-center gap-2 text-sm text-link hover:underline"
            >
              <ArrowLeft size={16} />
              Back to Course Overview
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

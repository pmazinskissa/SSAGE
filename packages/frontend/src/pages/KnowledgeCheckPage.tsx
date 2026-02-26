import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardCheck } from 'lucide-react';
import { pageTransition } from '../lib/animations';
import { useKnowledgeCheck } from '../hooks/useKnowledgeCheck';
import { useCourse } from '../context/CourseContext';
import { QuestionCard, KnowledgeCheckSummary } from '../components/knowledge-check';
import { GradientMesh, TopographicBg } from '../components/ui/Backgrounds';
import { api } from '../lib/api';
import type { KnowledgeCheckQuestion, KnowledgeCheckResult, QuestionResult } from '@playbook/shared';

function checkAnswer(question: KnowledgeCheckQuestion, answer: any): boolean {
  switch (question.type) {
    case 'multiple-choice-single':
      return answer === question.correct_option;
    case 'multiple-choice-multi': {
      const selected = (answer as string[]).sort();
      const correct = [...question.correct_options].sort();
      return selected.length === correct.length && selected.every((v, i) => v === correct[i]);
    }
    case 'true-false':
      return answer === question.correct_answer;
    case 'matching': {
      const matches = answer as Record<string, string>;
      return question.pairs.every((p) => matches[p.id] === p.id);
    }
    case 'drag-to-rank': {
      const order = answer as string[];
      return question.correct_order.every((id, i) => id === order[i]);
    }
    case 'fill-in-blank': {
      const fills = answer as Record<number, string>;
      let blankIdx = 0;
      return question.segments.every((seg) => {
        if (seg.type !== 'blank') return true;
        const userAnswer = (fills[blankIdx] || '').trim().toLowerCase();
        const acceptable = seg.accept
          ? seg.accept.map((a) => a.toLowerCase())
          : [seg.value.toLowerCase()];
        blankIdx++;
        return acceptable.includes(userAnswer);
      });
    }
    default:
      return false;
  }
}

type PageMode = 'loading' | 'active' | 'summary' | 'review';

export default function KnowledgeCheckPage() {
  const { slug, moduleSlug } = useParams<{ slug: string; moduleSlug: string }>();
  const { data, loading, error } = useKnowledgeCheck(slug, moduleSlug);
  const { navTree, refreshNavTree } = useCourse();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, { correct: boolean; explanation: string }>>({});
  const [mode, setMode] = useState<PageMode>('loading');
  const [courseCompleted, setCourseCompleted] = useState(false);
  const submittedRef = useRef(false);
  const savedAnswersLoadedRef = useRef(false);

  const questions = data?.questions || [];

  // Load saved answers on mount (once questions are available)
  useEffect(() => {
    if (!slug || !moduleSlug || questions.length === 0 || savedAnswersLoadedRef.current) return;
    savedAnswersLoadedRef.current = true;

    api.getKnowledgeCheckAnswers(slug, moduleSlug)
      .then((response) => {
        if (response.status === 'completed') {
          // Restore answers and feedbacks from saved data, then show summary
          const restoredAnswers: Record<number, any> = {};
          const restoredFeedbacks: Record<number, { correct: boolean; explanation: string }> = {};

          for (const saved of response.answers) {
            const qIdx = questions.findIndex((q) => q.id === saved.question_id);
            if (qIdx >= 0) {
              try { restoredAnswers[qIdx] = JSON.parse(saved.selected_answer); } catch { restoredAnswers[qIdx] = saved.selected_answer; }
              restoredFeedbacks[qIdx] = { correct: saved.is_correct, explanation: questions[qIdx].explanation };
            }
          }

          setAnswers(restoredAnswers);
          setFeedbacks(restoredFeedbacks);
          submittedRef.current = true; // Already submitted
          setMode('summary');
        } else if (response.status === 'in_progress') {
          // Restore draft answers and feedbacks, resume at first unanswered question
          const restoredAnswers: Record<number, any> = {};
          const restoredFeedbacks: Record<number, { correct: boolean; explanation: string }> = {};

          for (const saved of response.answers) {
            const qIdx = questions.findIndex((q) => q.id === saved.question_id);
            if (qIdx >= 0) {
              try { restoredAnswers[qIdx] = JSON.parse(saved.selected_answer); } catch { restoredAnswers[qIdx] = saved.selected_answer; }
              restoredFeedbacks[qIdx] = { correct: saved.is_correct, explanation: questions[qIdx].explanation };
            }
          }

          setAnswers(restoredAnswers);
          setFeedbacks(restoredFeedbacks);

          // Find first unanswered question
          const firstUnanswered = questions.findIndex((_, i) => restoredFeedbacks[i] === undefined);
          setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
          setMode('active');
        } else {
          // Not started — fresh KC
          setMode('active');
        }
      })
      .catch(() => {
        // On error, just start fresh
        setMode('active');
      });
  }, [slug, moduleSlug, questions]);

  // Scroll to top on question change or mode change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentIndex, mode]);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = useCallback((answer: any) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: answer }));
  }, [currentIndex]);

  const handleCheck = useCallback(() => {
    if (!currentQuestion || !slug || !moduleSlug) return;
    const correct = checkAnswer(currentQuestion, answers[currentIndex]);
    setFeedbacks((prev) => ({
      ...prev,
      [currentIndex]: { correct, explanation: currentQuestion.explanation },
    }));

    // Save draft answer to backend
    api.saveKnowledgeCheckDraft(slug, moduleSlug, {
      question_id: currentQuestion.id,
      selected_answer: JSON.stringify(answers[currentIndex]),
      is_correct: correct,
    }).catch(() => {}); // Fire-and-forget
  }, [currentQuestion, answers, currentIndex, slug, moduleSlug]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (mode === 'review') {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Back to summary from review
        setMode('summary');
      }
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // All questions answered → show summary and submit
      setMode('summary');
    }
  }, [currentIndex, questions.length, mode]);

  // Compute results for summary
  const result: KnowledgeCheckResult | null = useMemo(() => {
    if ((mode !== 'summary' && mode !== 'review') || questions.length === 0) return null;
    const results: QuestionResult[] = questions.map((q, i) => ({
      questionId: q.id,
      correct: feedbacks[i]?.correct || false,
      lesson_link: q.lesson_link,
      lesson_link_label: q.lesson_link_label,
    }));
    const correct = results.filter((r) => r.correct).length;
    return {
      total: questions.length,
      correct,
      score: (correct / questions.length) * 100,
      results,
    };
  }, [mode, questions, feedbacks]);

  // Submit KC results when summary is first shown (not for already-completed KCs)
  useEffect(() => {
    if (mode !== 'summary' || !slug || !moduleSlug || !result || submittedRef.current) return;
    submittedRef.current = true;

    const submission = {
      answers: questions.map((q, i) => ({
        question_id: q.id,
        selected_answer: JSON.stringify(answers[i]),
        is_correct: feedbacks[i]?.correct || false,
      })),
    };

    api.submitKnowledgeCheck(slug, moduleSlug, submission)
      .then((res) => {
        if (!res.alreadyCompleted) {
          setCourseCompleted(res.courseCompleted);
          refreshNavTree();
        }
      })
      .catch(() => {});
  }, [mode, slug, moduleSlug, result, questions, answers, feedbacks, refreshNavTree]);

  // Handle "Review Answers" from summary
  const handleReviewAnswers = useCallback(() => {
    setCurrentIndex(0);
    setMode('review');
  }, []);

  // Find next module info
  const nextModule = useMemo(() => {
    if (!navTree || !moduleSlug) return undefined;
    const idx = navTree.modules.findIndex((m) => m.slug === moduleSlug);
    if (idx >= 0 && idx < navTree.modules.length - 1) {
      const next = navTree.modules[idx + 1];
      return {
        slug: next.slug,
        firstLessonSlug: next.lessons[0]?.slug,
      };
    }
    return undefined;
  }, [navTree, moduleSlug]);

  if (loading || mode === 'loading') {
    return (
      <div className="max-w-prose mx-auto px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-surface rounded w-1/4" />
          <div className="h-8 bg-surface rounded w-3/4" />
          <div className="h-32 bg-surface rounded w-full mt-6" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-prose mx-auto px-6 py-12 text-center">
        <p className="text-error font-semibold">Failed to load knowledge check</p>
        <p className="text-text-secondary mt-2">{error || 'Not found'}</p>
      </div>
    );
  }

  const showQuestionView = mode === 'active' || mode === 'review';
  const isReviewMode = mode === 'review';

  return (
    <motion.div
      key={showQuestionView ? `q-${currentIndex}-${isReviewMode ? 'ro' : ''}` : 'summary'}
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Mini-hero header */}
      <section className="relative overflow-hidden">
        <GradientMesh className="opacity-40" />
        <div className="relative max-w-prose mx-auto px-6 pt-8 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck size={18} className="text-primary" />
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Knowledge Check{isReviewMode ? ' — Review' : ''}
            </p>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-text-primary"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {data.title}
          </h1>
          <p className="text-sm text-text-secondary mt-2">{data.description}</p>
        </div>
      </section>

      {/* Content area with topo background */}
      <div className="relative">
        <TopographicBg />
        <div className="relative max-w-prose mx-auto px-6 py-8">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${!showQuestionView ? 100 : ((currentIndex + (feedbacks[currentIndex] ? 1 : 0)) / questions.length) * 100}%`
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Content */}
          {!showQuestionView && result ? (
            <KnowledgeCheckSummary
              result={result}
              moduleSlug={moduleSlug || ''}
              nextModuleSlug={nextModule?.slug}
              nextModuleFirstLessonSlug={nextModule?.firstLessonSlug}
              courseCompleted={courseCompleted}
              questionLabels={questions.map((q) => ({
                id: q.id,
                lessonLink: q.lesson_link,
                lessonLinkLabel: q.lesson_link_label,
                questionText: q.question,
              }))}
              onReviewAnswers={handleReviewAnswers}
            />
          ) : currentQuestion ? (
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              answer={answers[currentIndex]}
              onAnswer={handleAnswer}
              feedback={feedbacks[currentIndex] || null}
              onCheck={handleCheck}
              onNext={handleNext}
              onPrev={handlePrev}
              isFirst={currentIndex === 0}
              isLast={currentIndex === questions.length - 1}
              moduleSlug={moduleSlug || ''}
              readOnly={isReviewMode}
            />
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

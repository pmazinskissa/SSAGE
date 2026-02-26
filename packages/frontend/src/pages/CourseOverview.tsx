import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, BookOpen, ChevronRight, PlayCircle } from 'lucide-react';
import { useCourse } from '../context/CourseContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { GradientMesh, TopographicBg } from '../components/ui/Backgrounds';
import { fadeInUp, stagger } from '../lib/animations';

function ProgressRing({ percent, size = 48, stroke = 4 }: { percent: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-white/20"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        className={percent >= 100 ? 'text-success' : 'text-white'}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  );
}

export default function CourseOverview() {
  const { slug } = useParams<{ slug: string }>();
  const { course, navTree, continueLesson } = useCourse();

  if (!course || !navTree) return null;

  const firstModule = navTree.modules[0];
  const firstLesson = firstModule?.lessons[0];
  const startLink = firstLesson
    ? `/courses/${slug}/modules/${firstModule.slug}/lessons/${firstLesson.slug}`
    : '#';

  const hasProgress = navTree.completed_lessons > 0;
  const continueLink = continueLesson
    ? `/courses/${slug}/modules/${continueLesson.moduleSlug}/lessons/${continueLesson.lessonSlug}`
    : startLink;

  const hours = Math.floor(course.estimated_duration_minutes / 60);
  const mins = course.estimated_duration_minutes % 60;
  const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="pb-16">
      {/* Hero */}
      <motion.section
        className="relative bg-gradient-to-br from-primary to-secondary px-6 sm:px-12 py-16 sm:py-24 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated gradient mesh blobs */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <div
            className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] animate-[meshFloat1_12s_ease-in-out_infinite]"
            style={{ background: 'white', top: '-10%', left: '-5%' }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[100px] animate-[meshFloat2_14s_ease-in-out_infinite]"
            style={{ background: 'var(--color-accent)', top: '20%', right: '-8%' }}
          />
          <div
            className="absolute w-[350px] h-[350px] rounded-full opacity-10 blur-[100px] animate-[meshFloat3_10s_ease-in-out_infinite]"
            style={{ background: 'white', bottom: '-15%', left: '30%' }}
          />
        </div>

        <div className="relative flex items-center justify-between gap-8">
          <div className="flex-1 max-w-3xl min-w-0">
            <motion.p
              className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Training Course
            </motion.p>
            <motion.h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              {course.title}
            </motion.h1>
            <motion.p
              className="text-base sm:text-lg text-white/70 mt-4 max-w-2xl leading-relaxed"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              {course.description}
            </motion.p>
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              <Link to={hasProgress ? continueLink : startLink}>
                <Button className="text-base px-8 py-3">
                  {hasProgress ? 'Continue Course' : 'Start Course'}
                  <ChevronRight size={18} />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Progress ring */}
          {hasProgress && (
            <motion.div
              className="hidden sm:flex flex-col items-center gap-2 shrink-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
            >
              <div className="relative">
                <ProgressRing
                  percent={Math.round((navTree.completed_lessons / Math.max(navTree.total_lessons, 1)) * 100)}
                  size={120}
                  stroke={8}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold tabular-nums leading-none text-white">
                    {Math.round((navTree.completed_lessons / Math.max(navTree.total_lessons, 1)) * 100)}%
                  </span>
                  <span className="text-[10px] text-white/60 mt-1">complete</span>
                </div>
              </div>
              <span className="text-xs font-medium text-white/70">
                {navTree.completed_lessons}/{navTree.total_lessons} lessons
              </span>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Continue where you left off banner */}
      {hasProgress && continueLesson && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="px-6 sm:px-12 py-4 bg-primary-light border-b border-border"
        >
          <Link
            to={continueLink}
            className="flex items-center gap-3 text-sm text-primary hover:underline"
          >
            <PlayCircle size={18} />
            <span>
              Continue where you left off: <strong>{continueLesson.title}</strong>
            </span>
          </Link>
        </motion.div>
      )}

      {/* Metadata row */}
      <motion.div
        className="flex flex-wrap gap-6 px-6 sm:px-12 py-6 border-b border-border"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeInUp} className="flex items-center gap-2 text-sm text-text-secondary">
          <Clock size={16} className="text-primary" />
          <span>{durationStr}</span>
        </motion.div>
        <motion.div variants={fadeInUp} className="flex items-center gap-2 text-sm text-text-secondary">
          <BookOpen size={16} className="text-primary" />
          <span>{navTree.modules.length} modules, {navTree.total_lessons} lessons</span>
        </motion.div>
        <motion.div variants={fadeInUp} className="flex items-center gap-2 text-sm text-text-secondary">
          <Users size={16} className="text-primary" />
          <span>{course.audience}</span>
        </motion.div>
      </motion.div>

      <div className="relative pb-16">
        <TopographicBg />
        <div className="relative px-6 sm:px-12 max-w-4xl mx-auto">
          {/* Narrative Synopsis */}
          {course.narrative_synopsis && (
            <motion.section
              className="mt-10"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              <Card elevation={1} className="p-6 border-l-4 border-l-accent">
                <h2
                  className="text-lg font-semibold text-text-primary mb-3"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  About This Course
                </h2>
                <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                  {course.narrative_synopsis}
                </p>
              </Card>
            </motion.section>
          )}

          {/* Module Roadmap */}
          <motion.section
            className="mt-12"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-2xl font-bold text-text-primary mb-6"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Module Roadmap
            </motion.h2>

            <div className="relative">
              {/* Vertical line connecting dots */}
              <div className="absolute left-[15px] top-9 bottom-9 w-0.5 bg-border hidden sm:block" />

              <div className="space-y-4">
                {navTree.modules.map((mod, index) => (
                  <motion.div
                    key={mod.slug}
                    variants={fadeInUp}
                    className="flex items-start gap-4"
                  >
                    {/* Timeline dot */}
                    <div className="hidden sm:flex shrink-0 pt-5">
                      <div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center relative z-10">
                        {index + 1}
                      </div>
                    </div>

                    <Card elevation={1} className="p-5 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                            Module {index + 1}
                          </p>
                          <h3 className="text-base font-semibold text-text-primary">
                            {mod.title}
                          </h3>
                          {mod.objectives.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {mod.objectives.map((obj, i) => (
                                <li key={i} className="text-sm text-text-secondary flex gap-2">
                                  <span className="text-primary mt-0.5">-</span>
                                  {obj}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="text-xs text-text-secondary whitespace-nowrap">
                          {mod.lessons.length} lessons
                          <br />
                          ~{mod.estimated_duration_minutes}m
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { api } from '../lib/api';

const HEARTBEAT_INTERVAL = 60_000; // 60 seconds
const MAX_DELTA = 120; // cap at 120 seconds
const IDLE_THRESHOLD = 120_000; // 2 minutes of no interaction = idle

function getScrollDepth(): number {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return 100;
  return Math.round((window.scrollY / docHeight) * 100);
}

export function useHeartbeat(
  courseSlug: string | undefined,
  moduleSlug: string | undefined,
  lessonSlug: string | undefined
) {
  const lastBeatRef = useRef<number>(Date.now());
  const lastInteractionRef = useRef<number>(Date.now());
  const maxScrollDepthRef = useRef<number>(0);

  useEffect(() => {
    if (!courseSlug || !moduleSlug || !lessonSlug) return;

    const now = Date.now();
    lastBeatRef.current = now;
    lastInteractionRef.current = now;
    maxScrollDepthRef.current = getScrollDepth();

    const updateInteraction = () => {
      lastInteractionRef.current = Date.now();
    };

    const updateScroll = () => {
      const depth = getScrollDepth();
      if (depth > maxScrollDepthRef.current) {
        maxScrollDepthRef.current = depth;
      }
    };

    const opts = { passive: true } as AddEventListenerOptions;
    document.addEventListener('mousemove', updateInteraction, opts);
    document.addEventListener('keydown', updateInteraction, opts);
    document.addEventListener('click', updateInteraction, opts);
    document.addEventListener('touchstart', updateInteraction, opts);
    window.addEventListener('scroll', updateScroll, opts);

    const sendBeat = () => {
      const now = Date.now();
      const totalDelta = Math.min(Math.round((now - lastBeatRef.current) / 1000), MAX_DELTA);
      const timeSinceInteraction = now - lastInteractionRef.current;
      const isIdle = timeSinceInteraction > IDLE_THRESHOLD;
      const activeDelta = isIdle
        ? Math.max(0, Math.min(Math.round((lastInteractionRef.current - lastBeatRef.current) / 1000), MAX_DELTA))
        : totalDelta;
      lastBeatRef.current = now;

      api.heartbeat(courseSlug, {
        module_slug: moduleSlug,
        lesson_slug: lessonSlug,
        time_delta_seconds: totalDelta,
        active_time_delta_seconds: activeDelta,
        scroll_depth: maxScrollDepthRef.current,
      }).catch(() => {
        // Silently fail — non-critical
      });
    };

    // Periodic heartbeat
    const interval = setInterval(sendBeat, HEARTBEAT_INTERVAL);

    // Send on tab blur
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        sendBeat();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('mousemove', updateInteraction);
      document.removeEventListener('keydown', updateInteraction);
      document.removeEventListener('click', updateInteraction);
      document.removeEventListener('touchstart', updateInteraction);
      window.removeEventListener('scroll', updateScroll);
      // Send final beat on cleanup (lesson navigation)
      sendBeat();
    };
  }, [courseSlug, moduleSlug, lessonSlug]);
}

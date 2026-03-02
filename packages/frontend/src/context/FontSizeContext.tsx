import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

const STEPS = [14, 16, 18, 20, 22]; // px
const DEFAULT_INDEX = 1; // 16px
const STORAGE_KEY = 'playbook-font-size-index';

interface FontSizeContextValue {
  canZoomIn: boolean;
  canZoomOut: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  currentSize: number;
}

const FontSizeContext = createContext<FontSizeContextValue | null>(null);

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored !== null ? parseInt(stored, 10) : DEFAULT_INDEX;
    return Number.isFinite(parsed) && parsed >= 0 && parsed < STEPS.length
      ? parsed
      : DEFAULT_INDEX;
  });

  useEffect(() => {
    const size = STEPS[index];
    document.documentElement.style.setProperty('--font-base-size', `${size}px`);
    localStorage.setItem(STORAGE_KEY, String(index));
  }, [index]);

  const zoomIn = useCallback(() => setIndex((i) => Math.min(i + 1, STEPS.length - 1)), []);
  const zoomOut = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);
  const reset = useCallback(() => setIndex(DEFAULT_INDEX), []);

  return (
    <FontSizeContext.Provider
      value={{
        canZoomIn: index < STEPS.length - 1,
        canZoomOut: index > 0,
        zoomIn,
        zoomOut,
        reset,
        currentSize: STEPS[index],
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const ctx = useContext(FontSizeContext);
  if (!ctx) throw new Error('useFontSize must be used within FontSizeProvider');
  return ctx;
}

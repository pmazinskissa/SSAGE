import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import { useCourse } from './CourseContext';

interface AIContextValue {
  available: boolean;
  model: string | null;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  loading: boolean;
  pendingMessage: { displayText: string; fullText: string } | null;
  setPendingMessage: (msg: { displayText: string; fullText: string } | null) => void;
}

const AIContext = createContext<AIContextValue>({
  available: false,
  model: null,
  chatOpen: false,
  setChatOpen: () => {},
  loading: true,
  pendingMessage: null,
  setPendingMessage: () => {},
});

export function AIProvider({ children }: { children: ReactNode }) {
  const { course } = useCourse();
  const [globalAvailable, setGlobalAvailable] = useState(false);
  const [model, setModel] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingMessage, setPendingMessage] = useState<{ displayText: string; fullText: string } | null>(null);

  useEffect(() => {
    api.getAIStatus()
      .then((status) => {
        setGlobalAvailable(status.available);
        setModel(status.model);
      })
      .catch(() => {
        setGlobalAvailable(false);
        setModel(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // AI is available only if globally enabled AND course has ai_features_enabled
  const available = globalAvailable && !!course?.ai_features_enabled;

  return (
    <AIContext.Provider value={{ available, model, chatOpen, setChatOpen, loading, pendingMessage, setPendingMessage }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  return useContext(AIContext);
}

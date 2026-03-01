import { useState, useCallback } from 'react';

const STORAGE_KEY = 'onboarding-completed';

export function useOnboarding() {
  const [completed, setCompleted] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const markComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setCompleted(true);
  }, []);

  return {
    showWalkthrough: !completed,
    markComplete,
  };
}

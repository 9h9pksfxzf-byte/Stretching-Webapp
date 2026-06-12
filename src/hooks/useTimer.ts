import { useState, useEffect, useCallback } from 'react';

export const useTimer = (initialSeconds: number, onComplete?: () => void) => {
  const [seconds, setSeconds] = useState<number>(initialSeconds);
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    let intervalId: number | null = null;

    if (isActive && seconds > 0) {
      intervalId = window.setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      if (onComplete) onComplete();
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [isActive, seconds, onComplete]);

  const start = useCallback(() => setIsActive(true), []);
  const pause = useCallback(() => setIsActive(false), []);
  const reset = useCallback(() => {
    setIsActive(false);
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  return { seconds, isActive, start, pause, reset };
};

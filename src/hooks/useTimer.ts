import { useState, useEffect, useCallback } from 'react';

export const useTimer = (initialTime: number, onComplete: () => void) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);

  // Setzt den Timer zurück, wenn sich die Dauer (Übung/Pause) ändert
  useEffect(() => {
    setTimeLeft(initialTime);
    setIsActive(false);
  }, [initialTime]);

  useEffect(() => {
    // Verwendung von return type 'any' oder window.setInterval ID um NodeJS Namespace Fehler zu umgehen
    let interval: any = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      onComplete(); // Signalisiert dem RoutineRunner, dass die Zeit um ist
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onComplete]);

  const toggle = useCallback(() => setIsActive((v) => !v), []);
  
  const skip = useCallback(() => {
    setIsActive(false);
    setTimeLeft(0);
    onComplete(); // Löst den Phasenwechsel im RoutineRunner aus
  }, [onComplete]);

  return { timeLeft, isActive, toggle, skip };
};

import { useState, useEffect, useRef } from 'react';

export const useTimer = (duration: number, onComplete: () => void) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const endTimeRef = useRef<number | null>(null);

  const playBeep = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    osc.connect(audioCtx.destination);
    osc.frequency.value = 440;
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  };

  useEffect(() => {
    if (!isActive) return;

    if (!endTimeRef.current) {
      endTimeRef.current = Date.now() + timeLeft * 1000;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((endTimeRef.current! - Date.now()) / 1000));
      
      if (remaining > 0 && remaining <= 3 && remaining !== timeLeft) {
        playBeep();
      }

      setTimeLeft(remaining);

      if (remaining === 0) {
        setIsActive(false);
        endTimeRef.current = null;
        onComplete();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  const toggle = () => {
    if (isActive) {
      endTimeRef.current = null;
    } else {
      endTimeRef.current = Date.now() + timeLeft * 1000;
    }
    setIsActive(!isActive);
  };

  const skip = () => {
    setIsActive(false);
    onComplete();
  };

  return { timeLeft, isActive, toggle, skip };
};

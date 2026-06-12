import { useState, useEffect, useCallback, useRef } from 'react';
import { playNotificationSound } from '../utils/audio';

export const useTimer = (initialSeconds: number, onComplete?: () => void) => {
  const [seconds, setSeconds] = useState<number>(initialSeconds);
  const [isActive, setIsActive] = useState<boolean>(false);
  
  // Ref, um den aktuellen Wert in Event-Handlern ohne Re-Trigger-Gefahr zu tracken
  const secondsRef = useRef(seconds);
  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    let intervalId: number | null = null;

    if (isActive && seconds > 0) {
      intervalId = window.setInterval(() => {
        const nextSeconds = secondsRef.current - 1;
        
        // Akustischer Countdown für die letzten 3 Sekunden (optional, tiefere Frequenz)
        if (nextSeconds <= 3 && nextSeconds > 0) {
          playNotificationSound(440, 0.1); 
        }

        setSeconds(nextSeconds);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      
      // Hoher, längerer Bestätigungston beim Wechsel/Abschluss
      playNotificationSound(880, 0.5);
      
      if (onComplete) onComplete();
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [isActive, seconds, onComplete]);

  // Aktivierung triggert implizit die Benutzerinteraktion für die Audio-Schnittstelle
  const start = useCallback(() => {
    setIsActive(true);
    // Ein extrem kurzer, fast unhörbarer Ton beim Klick, um den AudioContext im Browser freizuschalten
    playNotificationSound(1000, 0.01);
  }, []);

  const pause = useCallback(() => setIsActive(false), []);
  
  const reset = useCallback(() => {
    setIsActive(false);
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  return { seconds, isActive, start, pause, reset };
};

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useStore } from '../store/useStore';

export const useTimer = () => {
  const isTimerRunning = useStore((state) => state.isTimerRunning);
  const tick = useStore((state) => state.tick);
  const pauseTimer = useStore((state) => state.pauseTimer);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const lastActiveTimestamp = useRef<number>(0);

  useEffect(() => {
    if (isTimerRunning) {
      lastActiveTimestamp.current = Date.now();
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTimerRunning, tick]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App verlässt den Vordergrund: Zeitstempel sichern
        lastActiveTimestamp.current = Date.now();
      }

      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App kehrt zurück: Ermittle vergangene Sekunden im Hintergrund
        if (isTimerRunning && lastActiveTimestamp.current > 0) {
          const elapsedSeconds = Math.round((Date.now() - lastActiveTimestamp.current) / 1000);
          
          // Schleife zieht die verlorene Zeit im Store nach
          for (let i = 0; i < elapsedSeconds; i++) {
            tick();
          }
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isTimerRunning, tick]);
};

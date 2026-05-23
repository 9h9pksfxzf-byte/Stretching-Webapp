import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Exercise {
  id: string;
  name: string;
  duration: number; // in Sekunden
  breakDuration: number; // Zeit zwischen Übungen
}

interface AppState {
  library: Exercise[];
  programs: {
    kurz: string[];
    mittel: string[];
    lang: string[];
  };
  addExercise: (ex: Exercise) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      library: [
        { id: '1', name: 'Hüftbeuger', duration: 60, breakDuration: 10 },
        { id: '2', name: 'Hamstrings', duration: 60, breakDuration: 10 },
        { id: '3', name: 'Schulter-Stretch', duration: 45, breakDuration: 5 },
      ],
      programs: {
        kurz: ['1', '3'],
        mittel: ['1', '2', '3'],
        lang: ['1', '2', '3', '1', '2'],
      },
      addExercise: (ex) => set((state) => ({ library: [...state.library, ex] })),
    }),
    { name: 'stretch-storage' }
  )
);

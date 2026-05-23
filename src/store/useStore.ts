import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Exercise {
  id: string;
  name: string;
  duration: number;
  breakDuration: number;
}

export interface Program {
  id: string;
  name: string;
  timeLabel: string;
  icon: string;
  exerciseIds: string[];
}

interface AppState {
  library: Exercise[];
  programs: Program[];
  addExercise: (ex: Exercise) => void;
  addProgram: (prog: Program) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      library: [
        { id: '1', name: 'Hüftbeuger (Hip Flexor)', duration: 60, breakDuration: 10 },
        { id: '2', name: 'Hamstrings', duration: 60, breakDuration: 10 },
        { id: '3', name: 'Glutes / Piriformis', duration: 45, breakDuration: 10 },
        { id: '4', name: 'Adduktoren', duration: 45, breakDuration: 10 },
      ],
      programs: [
        { id: 'p1', name: 'Kurz', timeLabel: '15 min', icon: '⏱', exerciseIds: ['1', '3'] },
        { id: 'p2', name: 'Mittel', timeLabel: '30 min', icon: '⏳', exerciseIds: ['1', '2', '3'] },
        { id: 'p3', name: 'Matchday Prep', timeLabel: '10 min', icon: '⚽', exerciseIds: ['1', '4'] },
        { id: 'p4', name: 'Post-Legday', timeLabel: '20 min', icon: '🦵', exerciseIds: ['2', '3'] }
      ],
      addExercise: (ex) => set((state) => ({ library: [...state.library, ex] })),
      addProgram: (prog) => set((state) => ({ programs: [...state.programs, prog] })),
    }),
    { name: 'stretch-storage-v2' }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Exercise {
  id: string;
  name: string;
  bodyRegion: string;
  rating: number;
  isUnilateral: boolean; // true = Pro Seite (wird verdoppelt), false = Beidseitig
}

export interface ProgramExercise {
  exerciseId: string;
  duration: number;
  breakDuration: number;
  side?: 'Links' | 'Rechts'; // Wird nur gesetzt, wenn die Übung unilateral ist
}

export interface Program {
  id: string;
  name: string;
  timeLabel: string;
  icon: string;
  exercises: ProgramExercise[];
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
        { id: '1', name: 'Hüftbeuger (Hip Flexor)', bodyRegion: 'Hüfte', rating: 3, isUnilateral: true },
        { id: '2', name: 'Hamstrings', bodyRegion: 'Beine', rating: 4, isUnilateral: false },
        { id: '3', name: 'Glutes / Piriformis', bodyRegion: 'Gesäß', rating: 5, isUnilateral: true },
        { id: '4', name: 'Adduktoren', bodyRegion: 'Beine', rating: 2, isUnilateral: false },
      ],
      programs: [
        { 
          id: 'p1', name: 'Kurz', timeLabel: '15 min', icon: '⏱', 
          exercises: [
            { exerciseId: '1', duration: 60, breakDuration: 10, side: 'Links' },
            { exerciseId: '1', duration: 60, breakDuration: 10, side: 'Rechts' },
            { exerciseId: '3', duration: 60, breakDuration: 10, side: 'Links' },
            { exerciseId: '3', duration: 60, breakDuration: 10, side: 'Rechts' }
          ] 
        }
      ],
      addExercise: (ex) => set((state) => ({ library: [...state.library, ex] })),
      addProgram: (prog) => set((state) => ({ programs: [...state.programs, prog] })),
    }),
    { name: 'stretch-storage-v4' }
  )
);

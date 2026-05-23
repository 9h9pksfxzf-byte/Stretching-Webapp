import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Exercise {
  id: string;
  name: string;
  bodyRegion: string;
  rating: number; // Skala 1 bis 5
}

export interface ProgramExercise {
  exerciseId: string;
  duration: number;
  breakDuration: number;
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
        { id: '1', name: 'Hüftbeuger (Hip Flexor)', bodyRegion: 'Hüfte', rating: 3 },
        { id: '2', name: 'Hamstrings', bodyRegion: 'Beine', rating: 4 },
        { id: '3', name: 'Glutes / Piriformis', bodyRegion: 'Gesäß', rating: 5 },
        { id: '4', name: 'Adduktoren', bodyRegion: 'Beine', rating: 2 },
      ],
      programs: [
        { 
          id: 'p1', name: 'Kurz', timeLabel: '15 min', icon: '⏱', 
          exercises: [
            { exerciseId: '1', duration: 60, breakDuration: 10 },
            { exerciseId: '3', duration: 60, breakDuration: 10 }
          ] 
        },
        { 
          id: 'p3', name: 'Matchday Prep', timeLabel: '10 min', icon: '⚽', 
          exercises: [
            { exerciseId: '1', duration: 45, breakDuration: 5 },
            { exerciseId: '4', duration: 45, breakDuration: 5 }
          ] 
        }
      ],
      addExercise: (ex) => set((state) => ({ library: [...state.library, ex] })),
      addProgram: (prog) => set((state) => ({ programs: [...state.programs, prog] })),
    }),
    { name: 'stretch-storage-v3' }
  )
);

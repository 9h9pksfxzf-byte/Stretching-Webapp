import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Exercise {
  id: string;
  name: string;
  bodyRegion: string;
  rating: number;
  isUnilateral: boolean;
}

export interface ProgramExercise {
  exerciseId: string;
  duration: number;
  breakDuration: number;
  side?: 'Links' | 'Rechts';
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
  updateExercise: (id: string, updatedEx: Exercise) => void;
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
            { exerciseId: '1', duration: 30, breakDuration: 10, side: 'Links' },
            { exerciseId: '1', duration: 30, breakDuration: 10, side: 'Rechts' },
            { exerciseId: '3', duration: 30, breakDuration: 10, side: 'Links' },
            { exerciseId: '3', duration: 30, breakDuration: 10, side: 'Rechts' }
          ] 
        }
      ],
      addExercise: (ex) => set((state) => ({ library: [...state.library, ex] })),
      updateExercise: (id, updatedEx) => set((state) => ({
        library: state.library.map((ex) => (ex.id === id ? updatedEx : ex))
      })),
      addProgram: (prog) => set((state) => ({ programs: [...state.programs, prog] })),
    }),
    { name: 'stretch-storage-v6' }
  )
);

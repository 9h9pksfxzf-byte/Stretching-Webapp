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
  deleteExercise: (id: string) => void;
  addProgram: (prog: Program) => void;
  updateProgram: (id: string, updatedProg: Program) => void;
  deleteProgram: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      library: [{ id: '1', name: 'Hüftbeuger', bodyRegion: 'Hüfte', rating: 3, isUnilateral: true }],
      programs: [],
      addExercise: (ex) => set((state) => ({ library: [...state.library, ex] })),
      updateExercise: (id, updatedEx) => set((state) => ({
        library: state.library.map((ex) => (ex.id === id ? updatedEx : ex))
      })),
      deleteExercise: (id) => set((state) => ({
        library: state.library.filter((ex) => ex.id !== id),
        programs: state.programs.map(p => ({
          ...p,
          exercises: p.exercises.filter(ex => ex.exerciseId !== id)
        }))
      })),
      addProgram: (prog) => set((state) => ({ programs: [...state.programs, prog] })),
      updateProgram: (id, updatedProg) => set((state) => ({
        programs: state.programs.map((p) => (p.id === id ? updatedProg : p))
      })),
      deleteProgram: (id) => set((state) => ({
        programs: state.programs.filter((p) => p.id !== id)
      })),
    }),
    { name: 'stretch-storage-v9' }
  )
);

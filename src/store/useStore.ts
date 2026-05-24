import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  bodyRegion?: string;
  isUnilateral?: boolean;
  rating?: number;
}

export interface ProgramExercise {
  exerciseId: string;
  duration: number;
  breakDuration: number;
  side?: 'Links' | 'Rechts' | 'Beide';
}

export interface Program {
  id: string;
  name: string;
  timeLabel?: string;
  exercises: ProgramExercise[];
}

export interface PerformedExercise {
  exerciseId: string;
  name: string;
  side?: 'Links' | 'Rechts' | 'Beide';
  duration?: number;
  executionRating: number;
  description?: string;
}

export interface HistoryEntry {
  id: string;
  programId: string;
  programName: string;
  date: string;
  completedExercises: PerformedExercise[];
}

export interface StoreState {
  library: Exercise[];
  programs: Program[];
  history: HistoryEntry[];
  
  addHistoryEntry: (entry: HistoryEntry) => void;
  clearHistory: () => void;

  addExercise: (exercise: Exercise) => void;
  // HOTFIX: Akzeptiert jetzt (id, data) ODER nur (data), um TS2554 zu killen
  updateExercise: (idOrExercise: string | Exercise, maybeExercise?: Exercise) => void;
  deleteExercise: (id: string) => void;

  addProgram: (program: Program) => void;
  // HOTFIX: Akzeptiert ebenfalls beide Argument-Varianten
  updateProgram: (idOrProgram: string | Program, maybeProgram?: Program) => void;
  deleteProgram: (id: string) => void;
}

const INITIAL_LIBRARY: Exercise[] = [];
const INITIAL_PROGRAMS: Program[] = [];

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      library: INITIAL_LIBRARY,
      programs: INITIAL_PROGRAMS,
      history: [],

      addHistoryEntry: (entry) => 
        set((state) => ({ history: [...state.history, entry] })),
        
      clearHistory: () => 
        set(() => ({ history: [] })),

      addExercise: (exercise) => 
        set((state) => ({ library: [...state.library, exercise] })),
        
      updateExercise: (idOrExercise, maybeExercise) => 
        set((state) => {
          // Logik prüft, ob das erste Argument eine ID (String) oder das Objekt selbst ist
          const updated = typeof idOrExercise === 'string' ? maybeExercise : idOrExercise;
          if (!updated) return state;
          return {
            library: state.library.map((e) => (e.id === updated.id ? updated : e))
          };
        }),
        
      deleteExercise: (id) => 
        set((state) => ({
          library: state.library.filter((e) => e.id !== id)
        })),

      addProgram: (program) => 
        set((state) => ({ programs: [...state.programs, program] })),
        
      updateProgram: (idOrProgram, maybeProgram) => 
        set((state) => {
          const updated = typeof idOrProgram === 'string' ? maybeProgram : idOrProgram;
          if (!updated) return state;
          return {
            programs: state.programs.map((p) => (p.id === updated.id ? updated : p))
          };
        }),
        
      deleteProgram: (id) => 
        set((state) => ({
          programs: state.programs.filter((p) => p.id !== id)
        })),
    }),
    {
      name: 'stretching-app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 1. Vollständige Typendefinitionen für alle Komponenten
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
  // Dauer und Pausen müssen verpflichtend (ohne ?) sein, damit 
  // der ProgramBuilder Berechnungen ohne TS-Fehler durchführen kann.
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
  
  // Aktionen für die Historie
  addHistoryEntry: (entry: HistoryEntry) => void;
  clearHistory: () => void;

  // Aktionen für den ExerciseBuilder
  addExercise: (exercise: Exercise) => void;
  updateExercise: (exercise: Exercise) => void;
  deleteExercise: (id: string) => void;

  // Aktionen für den ProgramBuilder
  addProgram: (program: Program) => void;
  updateProgram: (program: Program) => void;
  deleteProgram: (id: string) => void;
}

// 2. Initialdaten (Nur relevant für den allerersten Start)
const INITIAL_LIBRARY: Exercise[] = [];
const INITIAL_PROGRAMS: Program[] = [];

// 3. Store-Erstellung mit globaler Persistenz
export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      library: INITIAL_LIBRARY,
      programs: INITIAL_PROGRAMS,
      history: [],

      // --- Historie Methoden ---
      addHistoryEntry: (entry) => 
        set((state) => ({ history: [...state.history, entry] })),
        
      clearHistory: () => 
        set(() => ({ history: [] })),

      // --- Exercise Methoden ---
      addExercise: (exercise) => 
        set((state) => ({ library: [...state.library, exercise] })),
        
      updateExercise: (exercise) => 
        set((state) => ({
          library: state.library.map((e) => (e.id === exercise.id ? exercise : e))
        })),
        
      deleteExercise: (id) => 
        set((state) => ({
          library: state.library.filter((e) => e.id !== id)
        })),

      // --- Program Methoden ---
      addProgram: (program) => 
        set((state) => ({ programs: [...state.programs, program] })),
        
      updateProgram: (program) => 
        set((state) => ({
          programs: state.programs.map((p) => (p.id === program.id ? program : p))
        })),
        
      deleteProgram: (id) => 
        set((state) => ({
          programs: state.programs.filter((p) => p.id !== id)
        })),
    }),
    {
      name: 'stretching-app-storage',
      storage: createJSONStorage(() => localStorage),
      // Die partialize-Einschränkung wurde entfernt. Da du Builder nutzt, 
      // muss der gesamte Zustand (Library, Programme, Historie) gesichert werden.
    }
  )
);

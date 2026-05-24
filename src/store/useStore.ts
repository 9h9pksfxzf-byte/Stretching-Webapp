import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 1. Typendefinitionen (Abgeleitet aus deinem RoutineRunner)
export interface Exercise {
  id: string;
  name: string;
  description?: string;
}

export interface ProgramExercise {
  exerciseId: string;
  duration?: number;
  breakDuration?: number;
  side?: 'Links' | 'Rechts' | 'Beide';
}

export interface Program {
  id: string;
  name: string;
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

interface StoreState {
  library: Exercise[];
  programs: Program[];
  history: HistoryEntry[];
  addHistoryEntry: (entry: HistoryEntry) => void;
  clearHistory: () => void;
}

// 2. Initialdaten
const INITIAL_LIBRARY: Exercise[] = [
  { id: 'e1', name: 'Neck Stretch', description: 'Kopf sanft zur Seite neigen.' },
  { id: 'e2', name: 'Shoulder Roll', description: 'Schultern kreisen lassen.' },
  { id: 'e3', name: 'Hamstring Stretch', description: 'Bein ausstrecken und Oberkörper nach vorne beugen.' }
];

const INITIAL_PROGRAMS: Program[] = [
  {
    id: 'p1',
    name: 'Morning Routine',
    exercises: [
      { exerciseId: 'e1', duration: 30, breakDuration: 10, side: 'Links' },
      { exerciseId: 'e1', duration: 30, breakDuration: 10, side: 'Rechts' },
      { exerciseId: 'e2', duration: 45, breakDuration: 15 }
    ]
  }
];

// 3. Store-Erstellung mit persist Middleware
export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Der initiale State
      library: INITIAL_LIBRARY,
      programs: INITIAL_PROGRAMS,
      history: [],

      // Aktionen
      addHistoryEntry: (entry: HistoryEntry) => 
        set((state) => ({
          history: [...state.history, entry]
        })),

      clearHistory: () => 
        set(() => ({
          history: []
        })),
    }),
    {
      name: 'stretching-app-storage', // Der Key, unter dem die Daten im localStorage des Browsers liegen
      storage: createJSONStorage(() => localStorage),
      
      // OPTIONAL: Wenn du willst, dass bei einem App-Update neue Übungen (library/programs) 
      // geladen werden, die Historie aber bleibt, filterst du hier den State.
      // Wenn du partialize weglässt, wird der komplette Store (inkl. Library) gespeichert.
      partialize: (state) => ({ 
        history: state.history 
      }),
    }
  )
);

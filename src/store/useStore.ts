import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface PerformedExercise {
  name: string;
  duration: number; // in Sekunden
  executionRating: number; // 1-10
  side: 'Links' | 'Rechts' | 'Beide';
  bodyRegion: string;
}

export interface HistoryEntry {
  id: string;
  programName: string;
  completedExercises: PerformedExercise[];
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  bodyRegion: string;
  isUnilateral: boolean;
  rating?: number;
  duration?: number;
}

export interface ProgramExercise {
  exerciseId: string;
  duration: number;
  breakDuration?: number;
}

export interface Program {
  id: string;
  name: string;
  exercises: ProgramExercise[];
}

interface StoreState {
  library: Exercise[];
  programs: Program[];
  history: HistoryEntry[];
  addExercise: (exercise: Omit<Exercise, 'id'>) => void;
  updateExercise: (id: string, exercise: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  addProgram: (program: Omit<Program, 'id'>) => void;
  updateProgram: (id: string, program: Partial<Program>) => void;
  deleteProgram: (id: string) => void;
  addHistoryEntry: (entry: HistoryEntry) => void;
  clearHistory: () => void;
}

// Standard-Bibliothek mit den neuen, hochpräzisen anatomischen Dehnungs-Zielen
const defaultLibrary: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Couch Stretch',
    description: 'Bringe das hintere Knie an eine Wand/Couch. Richte das Becken aktiv auf, um den M. iliopsoas und M. rectus femoris isoliert zu treffen.',
    bodyRegion: 'Hüftbeuger (M. iliopsoas)',
    isUnilateral: true,
    rating: 5,
    duration: 30
  },
  {
    id: 'ex-2',
    name: 'Tauben-Stretch (Pigeon)',
    description: 'Vorderes Bein angewinkelt ablegen. Dehnt intensiv den M. piriformis und die tiefen Außenrotatoren der Hüfte.',
    bodyRegion: 'Piriformis & Außenrotatoren',
    isUnilateral: true,
    rating: 4,
    duration: 30
  },
  {
    id: 'ex-3',
    name: 'Hamstring-Fold',
    description: 'Aus dem Hüftscharnier nach vorne beugen. Konzentration auf die Kniekehle und die gesamte ischiocrurale Muskulatur.',
    bodyRegion: 'Ischiocrurale Muskulatur (Hamstrings)',
    isUnilateral: false,
    rating: 4,
    duration: 30
  }
];

const defaultPrograms: Program[] = [
  {
    id: 'p-1',
    name: 'Hüft- & Unterkörper-Mobilität',
    exercises: [
      { exerciseId: 'ex-1', duration: 45, breakDuration: 15 },
      { exerciseId: 'ex-2', duration: 45, breakDuration: 15 },
      { exerciseId: 'ex-3', duration: 60, breakDuration: 10 }
    ]
  }
];

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      library: defaultLibrary,
      programs: defaultPrograms,
      history: [],

      addExercise: (exercise) => set((state) => ({
        library: [...state.library, { ...exercise, id: `ex-${Date.now()}` }]
      })),

      updateExercise: (id, updatedData) => set((state) => ({
        library: state.library.map((ex) => (ex.id === id ? { ...ex, ...updatedData } : ex))
      })),

      deleteExercise: (id) => set((state) => ({
        library: state.library.filter((ex) => ex.id !== id),
        programs: state.programs.map((p) => ({
          ...p,
          exercises: p.exercises.filter((pe) => pe.exerciseId !== id)
        }))
      })),

      addProgram: (program) => set((state) => ({
        programs: [...state.programs, { ...program, id: `p-${Date.now()}` }]
      })),

      updateProgram: (id, updatedData) => set((state) => ({
        programs: state.programs.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
      })),

      deleteProgram: (id) => set((state) => ({
        programs: state.programs.filter((p) => p.id !== id)
      })),

      addHistoryEntry: (entry) => set((state) => {
        const safeHistory = state.history || [];
        // Verhindert doppeltes Schreiben durch ID-Prüfung
        if (safeHistory.some(h => h.id === entry.id)) {
          return { history: safeHistory };
        }
        return { history: [...safeHistory, entry] };
      }),

      clearHistory: () => set({ history: [] })
    }),
    {
      name: 'stretching-app-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

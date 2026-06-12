import { create } from 'zustand';

// Explicit Interfaces für alle JSON-Strukturen
export type BodyRegion = 'Oberkörper' | 'Unterkörper' | 'Ganzkörper' | 'Mobilität';

export interface Exercise {
  id: string;
  name: string;
  durationInSeconds: number;
  region: BodyRegion;
}

export interface Program {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface HistoryEntry {
  id: string;
  date: string;
  programName: string;
  completedExercises: Exercise[];
}

export interface AppStateInterface {
  library: Exercise[];
  programs: Program[];
  history: HistoryEntry[];
  status: 'loading' | 'error' | 'success';
  errorMessage: string | null;
  
  // Actions
  addExercise: (exercise: Omit<Exercise, 'id'>) => void;
  updateExercise: (id: string, updated: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  deleteProgram: (id: string) => void;
  clearHistory: () => void;
  loadInitialData: () => Promise<void>;
}

export const useStore = create<AppStateInterface>((set) => ({
  library: [
    { id: '1', name: 'Couch Stretch', durationInSeconds: 45, region: 'Unterkörper' },
    { id: '2', name: 'Brustöffner', durationInSeconds: 60, region: 'Oberkörper' }
  ],
  programs: [
    {
      id: 'p1',
      name: 'Unterkörper Routine',
      exercises: [{ id: '1', name: 'Couch Stretch', durationInSeconds: 45, region: 'Unterkörper' }]
    }
  ],
  history: [],
  status: 'success',
  errorMessage: null,

  addExercise: (exercise) => set((state) => ({
    library: [...state.library, { ...exercise, id: crypto.randomUUID() }]
  })),

  updateExercise: (id, updated) => set((state) => ({
    library: state.library.map((ex) => ex.id === id ? { ...ex, ...updated } : ex)
  })),

  deleteExercise: (id) => set((state) => ({
    library: state.library.filter((ex) => ex.id !== id)
  })),

  deleteProgram: (id) => set((state) => ({
    programs: state.programs.filter((p) => p.id !== id)
  })),

  clearHistory: () => set({ history: [] }),

  loadInitialData: async () => {
    set({ status: 'loading', errorMessage: null });
    try {
      // Hier fangen wir potenzielle Fehler beim JSON/API Load ab
      set({ status: 'success' });
    } catch (error) {
      set({ 
        status: 'error', 
        errorMessage: error instanceof Error ? error.message : 'Fehler beim Laden' 
      });
    }
  }
}));

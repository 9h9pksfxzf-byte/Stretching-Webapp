import { create } from 'zustand';

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  duration: number; // in Sekunden
  isUnilateral: boolean;
  bodyRegion: string; // z.B. "Hüfte", "Beine", "Oberkörper"
  rating?: number; // 1-5 Sterne optional
}

export interface PerformedExercise {
  name: string;
  duration: number;
  executionRating: number; // 1-10 Intensität/Schmerz
  side?: 'Links' | 'Rechts' | 'Beide';
  bodyRegion?: string; // NEU: Damit das Tracking im Verlauf typensicher funktioniert
}

export interface HistoryEntry {
  id: string; // Timestamp als String
  programName: string;
  completedExercises: PerformedExercise[];
}

export interface Program {
  id: string;
  name: string;
  timeLabel?: string; // z.B. "Morgens", "Abends"
  exercises: {
    exerciseId: string;
    duration: number;
    breakDuration: number;
  }[];
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
  addHistoryEntry: (entry: Omit<HistoryEntry, 'id'>) => void;
  clearHistory: () => void;
}

// Initialer Standard-Datensatz nach sportwissenschaftlichen Standards
const defaultExercises: Exercise[] = [
  { id: '1', name: 'Hüftbeuger', description: 'Ausfallschritt-Position, Becken nach vorne schieben.', duration: 45, isUnilateral: true, bodyRegion: 'Hüfte', rating: 5 },
  { id: '2', name: 'Hamstrings', description: 'Im Sitzen ein Bein ausstrecken, mit geradem Rücken nach vorne beugen.', duration: 45, isUnilateral: true, bodyRegion: 'Beine', rating: 4 },
  { id: '3', name: 'Brustöffner', description: 'An der Wand oder im Türrahmen den Arm fixieren und den Oberkörper wegdrehen.', duration: 30, isUnilateral: true, bodyRegion: 'Oberkörper', rating: 4 }
];

const defaultPrograms: Program[] = [
  {
    id: 'p1',
    name: 'Unterkörper Mobility',
    timeLabel: 'Morgens',
    exercises: [
      { exerciseId: '1', duration: 45, breakDuration: 15 },
      { exerciseId: '2', duration: 45, breakDuration: 15 }
    ]
  }
];

export const useStore = create<StoreState>((set) => ({
  library: JSON.parse(localStorage.getItem('stretch_library') || JSON.stringify(defaultExercises)),
  programs: JSON.parse(localStorage.getItem('stretch_programs') || JSON.stringify(defaultPrograms)),
  history: JSON.parse(localStorage.getItem('stretch_history') || '[]'),

  addExercise: (exercise) => set((state) => {
    const newEx = { ...exercise, id: crypto.randomUUID() };
    const updated = [...state.library, newEx];
    localStorage.setItem('stretch_library', JSON.stringify(updated));
    return { library: updated };
  }),

  updateExercise: (id, updatedFields) => set((state) => {
    const updated = state.library.map(ex => ex.id === id ? { ...ex, ...updatedFields } : ex);
    localStorage.setItem('stretch_library', JSON.stringify(updated));
    return { library: updated };
  }),

  deleteExercise: (id) => set((state) => {
    const updated = state.library.filter(ex => ex.id !== id);
    localStorage.setItem('stretch_library', JSON.stringify(updated));
    return { library: updated };
  }),

  addProgram: (program) => set((state) => {
    const newProg = { ...program, id: crypto.randomUUID() };
    const updated = [...state.programs, newProg];
    localStorage.setItem('stretch_programs', JSON.stringify(updated));
    return { programs: updated };
  }),

  updateProgram: (id, updatedFields) => set((state) => {
    const updated = state.programs.map(p => p.id === id ? { ...p, ...updatedFields } : p);
    localStorage.setItem('stretch_programs', JSON.stringify(updated));
    return { programs: updated };
  }),

  deleteProgram: (id) => set((state) => {
    const updated = state.programs.filter(p => p.id !== id);
    localStorage.setItem('stretch_programs', JSON.stringify(updated));
    return { programs: updated };
  }),

  addHistoryEntry: (entry) => set((state) => {
    const newEntry = { ...entry, id: Date.now().toString() };
    const updated = [...state.history, newEntry];
    localStorage.setItem('stretch_history', JSON.stringify(updated));
    return { history: updated };
  }),

  clearHistory: () => set(() => {
    localStorage.removeItem('stretch_history');
    return { history: [] };
  }),
}));

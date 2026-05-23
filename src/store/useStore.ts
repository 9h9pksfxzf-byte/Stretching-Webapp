import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Exercise {
  id: string;
  name: string;
  bodyRegion: string;
  rating: number; // Globales Basis-Rating (1-5) aus der Bibliothek
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

// Datenstruktur für eine bewertete Übung im Verlauf
export interface PerformedExercise {
  exerciseId: string;
  name: string;
  side?: 'Links' | 'Rechts';
  duration: number;
  executionRating: number; // Das neue 1-10 Rating nach der Ausführung
}

// Datenstruktur für eine abgeschlossene Session im Verlauf
export interface HistoryEntry {
  id: string;
  programId: string;
  programName: string;
  date: string;
  completedExercises: PerformedExercise[];
}

interface AppState {
  library: Exercise[];
  programs: Program[];
  history: HistoryEntry[]; // Neu: Verlaufsspeicher
  addExercise: (ex: Exercise) => void;
  updateExercise: (id: string, updatedEx: Exercise) => void;
  deleteExercise: (id: string) => void;
  addProgram: (prog: Program) => void;
  updateProgram: (id: string, updatedProg: Program) => void;
  deleteProgram: (id: string) => void;
  addHistoryEntry: (entry: HistoryEntry) => void; // Neu: Funktion zum Speichern des Verlaufs
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      library: [{ id: '1', name: 'Hüftbeuger', bodyRegion: 'Hüfte', rating: 3, isUnilateral: true }],
      programs: [],
      history: [], // Initial leerer Verlauf

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

      addHistoryEntry: (entry) => set((state) => ({
        history: [entry, ...state.history] // Neueste Sessions landen oben
      })),
    }),
    { name: 'stretch-storage-v10' } // Versions-Upgrade, um Storage-Konflikte am Handy zu vermeiden
  )
);

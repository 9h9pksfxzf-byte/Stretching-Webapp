import { create } from 'zustand';

export interface LibraryExercise {
  id: string;
  name: string;
  category: string;
  duration: number; // Standarddauer in Sekunden
}

interface BuilderState {
  programName: string;
  selectedExercises: LibraryExercise[];
  activeCategory: string;
  library: LibraryExercise[];
  // Actions
  setProgramName: (name: string) => void;
  addExercise: (exercise: LibraryExercise) => void;
  removeExercise: (index: number) => void;
  setCategory: (category: string) => void;
  clearBuilder: () => void;
}

const MOCK_LIBRARY: LibraryExercise[] = [
  { id: '1', name: 'Psoas-Zwerchfell-Integration', category: 'LWS & Core', duration: 60 },
  { id: '2', name: 'Supta Matsyendrasana (Krokodil)', category: 'LWS & Core', duration: 60 },
  { id: '3', name: 'Sphinx Pose (Sanfte Extension)', category: 'LWS & Core', duration: 60 },
  { id: '4', name: "World's Greatest Stretch", category: 'Hüfte', duration: 60 },
  { id: '5', name: 'Couch Stretch', category: 'Hüfte', duration: 60 },
  { id: '6', name: '90/90 Hüftrotatoren', category: 'Hüfte', duration: 60 },
  { id: '7', name: 'Puppy Pose', category: 'Brust & BWS', duration: 60 },
];

export const useProgramBuilderStore = create<BuilderState>((set) => ({
  programName: '15 Minuten',
  selectedExercises: [],
  activeCategory: 'Alle',
  library: MOCK_LIBRARY,

  setProgramName: (programName) => set({ programName }),
  
  addExercise: (exercise) => set((state) => ({
    selectedExercises: [...state.selectedExercises, exercise]
  })),
  
  removeExercise: (index) => set((state) => ({
    selectedExercises: state.selectedExercises.filter((_, i) => i !== index)
  })),
  
  setCategory: (activeCategory) => set({ activeCategory }),
  
  clearBuilder: () => set({ programName: '', selectedExercises: [], activeCategory: 'Alle' })
}));

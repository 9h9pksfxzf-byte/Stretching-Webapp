import React from 'react';
import { create } from 'zustand';

// ==========================================
// 1. STATE MANAGEMENT (ZUSTAND STORE)
// ==========================================

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


// ==========================================
// 2. UI KOMPONENTE (NAMED EXPORT)
// ==========================================

export const ProgramBuilder: React.FC = () => {
  const {
    programName,
    selectedExercises,
    activeCategory,
    library,
    setProgramName,
    addExercise,
    removeExercise,
    setCategory
  } = useProgramBuilderStore((state) => state);

  const categories = ['Alle', ...Array.from(new Set(library.map((e) => e.category)))];

  const filteredLibrary = activeCategory === 'Alle' 
    ? library 
    : library.filter((e) => e.category === activeCategory);

  const totalDurationMin = Math.ceil(selectedExercises.reduce((acc, curr) => acc + curr.duration, 0) / 60);

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <div>
          <span style={styles.metaLabel}>ROUTINE-STRUKTURIERUNG</span>
          <input 
            type="text" 
            value={programName} 
            onChange={(e) => setProgramName(e.target.value)} 
            style={styles.nameInput}
            placeholder="Programm-Name"
          />
        </div>
        <button style={styles.cancelButton}>Abbrechen</button>
      </div>

      <div style={styles.stackSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>DEIN ABLAUF ({totalDurationMin} Min)</span>
          <span style={styles.exerciseCount}>{selectedExercises.length} Übungen</span>
        </div>
        
        <div style={styles.horizontalScroll}>
          {selectedExercises.length === 0 ? (
            <div style={styles.emptyStackPlaceholder}>
              Tippe unten auf das "+" für ein schnelles Hinzufügen
            </div>
          ) : (
            selectedExercises.map((exercise: LibraryExercise, index: number) => (
              <div key={`${exercise.id}-${index}`} style={styles.stackItem}>
                <span style={styles.stackItemNumber}>{index + 1}</span>
                <span style={styles.stackItemName}>{exercise.name}</span>
                <button 
                  onClick={() => removeExercise(index)} 
                  style={styles.removeItemButton}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={styles.filterContainer}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              ...styles.filterPill,
              backgroundColor: activeCategory === cat ? '#00e676' : '#222',
              color: activeCategory === cat ? '#000' : '#aaa',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={styles.librarySection}>
        <span style={styles.sectionTitleBottom}>AUS BIBLIOTHEK WÄHLEN</span>
        <div style={styles.verticalScroll}>
          {filteredLibrary.map((exercise: LibraryExercise) => (
            <div key={exercise.id} style={styles.exerciseCard}>
              <div style={styles.cardInfo}>
                <span style={styles.cardName}>{exercise.name}</span>
                <span style={styles.cardCategory}>{exercise.category} • {exercise.duration}s</span>
              </div>
              <button 
                onClick={() => addExercise(exercise)} 
                style={styles.addButton}
              >
                ＋
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.footer}>
        <button 
          style={{ 
            ...styles.saveButton, 
            opacity: selectedExercises.length > 0 ? 1 : 0.5 
          }}
          disabled={selectedExercises.length === 0}
        >
          PROGRAMM SPEICHERN ({totalDurationMin} MIN)
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 3. STYLES
// ==========================================

const styles = {
  screen: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxSizing: 'border-box' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 16px 10px 16px',
  },
  metaLabel: {
    fontSize: '11px',
    color: '#00e676',
    fontWeight: 'bold' as const,
    letterSpacing: '1px',
    display: 'block',
    marginBottom: '4px',
  },
  nameInput: {
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid #222',
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold' as const,
    outline: 'none',
    padding: '4px 0',
    width: '200px',
  },
  cancelButton: {
    background: '#222',
    border: 'none',
    color: '#aaa',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 'bold' as const,
  },
  stackSection: {
    backgroundColor: '#111',
    padding: '16px',
    margin: '10px 16px',
    borderRadius: '16px',
    border: '1px solid #1a1a1a',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  sectionTitle: {
    fontSize: '12px',
    color: '#666',
    fontWeight: 'bold' as const,
    letterSpacing: '1px',
  },
  sectionTitleBottom: {
    fontSize: '12px',
    color: '#666',
    fontWeight: 'bold' as const,
    letterSpacing: '1px',
    padding: '0 16px 8px 16px',
    display: 'block',
  },
  exerciseCount: {
    fontSize: '12px',
    color: '#00e676',
    fontWeight: 'bold' as const,
  },
  horizontalScroll: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto' as const,
    paddingBottom: '8px',
    WebkitOverflowScrolling: 'touch' as const,
  },
  emptyStackPlaceholder: {
    color: '#444',
    fontSize: '13px',
    fontStyle: 'italic' as const,
    padding: '10px 0',
  },
  stackItem: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #282828',
    padding: '8px 12px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
  },
  stackItemNumber: {
    background: '#00e676',
    color: '#000',
    fontSize: '11px',
    fontWeight: 'bold' as const,
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackItemName: {
    fontSize: '14px',
    fontWeight: '500' as const,
  },
  removeItemButton: {
    background: 'transparent',
    border: 'none',
    color: '#ff1744',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '0 0 0 4px',
  },
  filterContainer: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto' as const,
    padding: '0 16px 12px 16px',
    WebkitOverflowScrolling: 'touch' as const,
  },
  filterPill: {
    border: 'none',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 'bold' as const,
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.2s ease',
  },
  librarySection: {
    flexGrow: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  verticalScroll: {
    overflowY: 'auto' as const,
    padding: '0 16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    flexGrow: 1,
  },
  exerciseCard: {
    backgroundColor: '#121212',
    border: '1px solid #1c1c1c',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  cardName: {
    fontSize: '16px',
    fontWeight: 'bold' as const,
  },
  cardCategory: {
    fontSize: '12px',
    color: '#666',
  },
  addButton: {
    backgroundColor: '#1c1c1c',
    border: '1px solid #333',
    color: '#00e676',
    fontSize: '18px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  footer: {
    padding: '16px',
    backgroundColor: '#0a0a0a',
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#00e676',
    border: 'none',
    color: '#000',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    letterSpacing: '0.5px',
    boxShadow: '0 4px 20px rgba(0, 230, 118, 0.2)',
  }
};

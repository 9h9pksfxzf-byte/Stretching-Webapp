import React from 'react';
import { create } from 'zustand';

// ==========================================
// 1. STATE MANAGEMENT (ZUSTAND STORE)
// ==========================================

export interface LibraryExercise {
  id: string;
  name: string;
  category: string;
}

export interface ProgramExercise extends LibraryExercise {
  duration: number; // Individuelle Dehndauer in Sekunden
  rest: number;     // Individuelle Pausendauer in Sekunden
}

interface BuilderState {
  programName: string;
  selectedExercises: ProgramExercise[];
  activeCategory: string;
  defaultDuration: number;
  defaultRest: number;
  library: LibraryExercise[];
  // Actions
  setProgramName: (name: string) => void;
  setDefaultDuration: (seconds: number) => void;
  setDefaultRest: (seconds: number) => void;
  addExercise: (exercise: LibraryExercise) => void;
  removeExercise: (index: number) => void;
  updateExerciseTime: (index: number, duration: number, rest: number) => void;
  setCategory: (category: string) => void;
  clearBuilder: () => void;
}

const MOCK_LIBRARY: LibraryExercise[] = [
  { id: '1', name: 'Psoas-Zwerchfell-Integration', category: 'LWS & Core' },
  { id: '2', name: 'Supta Matsyendrasana (Krokodil)', category: 'LWS & Core' },
  { id: '3', name: 'Sphinx Pose (Sanfte Extension)', category: 'LWS & Core' },
  { id: '4', name: "World's Greatest Stretch", category: 'Hüfte' },
  { id: '5', name: 'Couch Stretch', category: 'Hüfte' },
  { id: '6', name: '90/90 Hüftrotatoren', category: 'Hüfte' },
  { id: '7', name: 'Puppy Pose', category: 'Brust & BWS' },
];

export const useProgramBuilderStore = create<BuilderState>((set) => ({
  programName: '15 Minuten',
  selectedExercises: [],
  activeCategory: 'Alle',
  defaultDuration: 45,
  defaultRest: 15,
  library: MOCK_LIBRARY,

  setProgramName: (programName) => set({ programName }),
  setDefaultDuration: (defaultDuration) => set({ defaultDuration }),
  setDefaultRest: (defaultRest) => set({ defaultRest }),

  addExercise: (exercise) => set((state) => ({
    selectedExercises: [
      ...state.selectedExercises, 
      { 
        ...exercise, 
        duration: state.defaultDuration, 
        rest: state.defaultRest 
      }
    ]
  })),
  
  removeExercise: (index) => set((state) => ({
    selectedExercises: state.selectedExercises.filter((_, i) => i !== index)
  })),

  updateExerciseTime: (index, duration, rest) => set((state) => {
    const updated = [...state.selectedExercises];
    updated[index] = { ...updated[index], duration, rest };
    return { selectedExercises: updated };
  }),
  
  setCategory: (activeCategory) => set({ activeCategory }),
  
  clearBuilder: () => set({ 
    programName: '15 Minuten', 
    selectedExercises: [], 
    activeCategory: 'Alle',
    defaultDuration: 45,
    defaultRest: 15
  })
}));

// ==========================================
// 2. UI PROPS INTERFACE
// ==========================================
interface ProgramBuilderProps {
  programId?: string | null;
  onClose: () => void;
}

// ==========================================
// 3. UI KOMPONENTE (NAMED EXPORT)
// ==========================================

export const ProgramBuilder: React.FC<ProgramBuilderProps> = ({ onClose }) => {
  const {
    programName,
    selectedExercises,
    activeCategory,
    defaultDuration,
    defaultRest,
    library,
    setProgramName,
    setDefaultDuration,
    setDefaultRest,
    addExercise,
    removeExercise,
    updateExerciseTime,
    setCategory,
    clearBuilder
  } = useProgramBuilderStore((state) => state);

  const categories = ['Alle', ...Array.from(new Set(library.map((e) => e.category)))];

  const filteredLibrary = activeCategory === 'Alle' 
    ? library 
    : library.filter((e) => e.category === activeCategory);

  const totalDurationSec = selectedExercises.reduce((acc, curr) => acc + curr.duration + curr.rest, 0);
  const totalDurationMin = Math.ceil(totalDurationSec / 60);

  const handleCancel = () => {
    clearBuilder();
    onClose();
  };

  return (
    <div style={styles.screen}>
      {/* Header */}
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
        <button onClick={handleCancel} style={styles.cancelButton}>Abbrechen</button>
      </div>

      {/* Standard-Vorgaben für schnelles Hinzufügen */}
      <div style={styles.globalTimeSettings}>
        <div style={styles.timeInputGroup}>
          <label style={styles.timeLabel}>⏱️ STANDARD DEHNEN (S.)</label>
          <input 
            type="number" 
            value={defaultDuration} 
            onChange={(e) => setDefaultDuration(Number(e.target.value))}
            style={styles.timeInput}
          />
        </div>
        <div style={styles.timeInputGroup}>
          <label style={styles.timeLabel}>⏸️ STANDARD PAUSE (S.)</label>
          <input 
            type="number" 
            value={defaultRest} 
            onChange={(e) => setDefaultRest(Number(e.target.value))}
            style={styles.timeInput}
          />
        </div>
      </div>

      {/* Ablauf-Stack mit individueller inline Zeitkonfiguration */}
      <div style={styles.stackSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>DEIN ABLAUF ({totalDurationMin} Min)</span>
          <span style={styles.exerciseCount}>{selectedExercises.length} Sätze</span>
        </div>
        
        <div style={styles.horizontalScroll}>
          {selectedExercises.length === 0 ? (
            <div style={styles.emptyStackPlaceholder}>
              Füge unten Übungen hinzu, um die Zeiten pro Übung anzupassen.
            </div>
          ) : (
            selectedExercises.map((exercise: ProgramExercise, index: number) => (
              <div key={`${exercise.id}-${index}`} style={styles.stackItem}>
                <div style={styles.stackItemTopRow}>
                  <span style={styles.stackItemNumber}>{index + 1}</span>
                  <span style={styles.stackItemName}>{exercise.name}</span>
                  <button 
                    onClick={() => removeExercise(index)} 
                    style={styles.removeItemButton}
                  >
                    ✕
                  </button>
                </div>

                {/* NEU: Individuelle Inputs direkt in der horizontalen Ablaufkarte */}
                <div style={styles.inlineTimeEditor}>
                  <div style={styles.inlineInputWrapper}>
                    <span style={styles.inlineInputLabel}>⏱️ Zeit:</span>
                    <input 
                      type="number"
                      value={exercise.duration}
                      onChange={(e) => updateExerciseTime(index, Number(e.target.value), exercise.rest)}
                      style={styles.inlineTimeInput}
                    />
                    <span style={styles.inlineUnit}>s</span>
                  </div>
                  <div style={styles.inlineInputWrapper}>
                    <span style={styles.inlineInputLabel}>⏸️ Pause:</span>
                    <input 
                      type="number"
                      value={exercise.rest}
                      onChange={(e) => updateExerciseTime(index, exercise.duration, Number(e.target.value))}
                      style={styles.inlineTimeInput}
                    />
                    <span style={styles.inlineUnit}>s</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Filter-Pills */}
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

      {/* Auswahl-Liste */}
      <div style={styles.librarySection}>
        <span style={styles.sectionTitleBottom}>AUS BIBLIOTHEK WÄHLEN</span>
        <div style={styles.verticalScroll}>
          {filteredLibrary.map((exercise: LibraryExercise) => (
            <div key={exercise.id} style={styles.exerciseCard}>
              <div style={styles.cardInfo}>
                <span style={styles.cardName}>{exercise.name}</span>
                <span style={styles.cardCategory}>{exercise.category}</span>
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

      {/* Fixierter Footer */}
      <div style={styles.footer}>
        <button 
          onClick={() => onClose()}
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
// 4. STYLES
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
    cursor: 'pointer',
  },
  globalTimeSettings: {
    display: 'flex',
    gap: '16px',
    padding: '0 16px 16px 16px',
    borderBottom: '1px solid #111',
  },
  timeInputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    flex: 1,
  },
  timeLabel: {
    fontSize: '10px',
    color: '#666',
    fontWeight: 'bold' as const,
    letterSpacing: '0.5px',
  },
  timeInput: {
    backgroundColor: '#111',
    border: '1px solid #222',
    borderRadius: '8px',
    color: '#fff',
    padding: '10px',
    fontSize: '15px',
    fontWeight: 'bold' as const,
    outline: 'none',
    textAlign: 'center' as const,
  },
  stackSection: {
    backgroundColor: '#111',
    padding: '16px',
    margin: '16px',
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
    gap: '12px',
    overflowX: 'auto' as const,
    paddingBottom: '10px',
    WebkitOverflowScrolling: 'touch' as const,
  },
  emptyStackPlaceholder: {
    color: '#444',
    fontSize: '13px',
    fontStyle: 'italic' as const,
    padding: '10px 0',
  },
  stackItem: {
    backgroundColor: '#161616',
    border: '1px solid #262626',
    padding: '12px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    flexShrink: 0,
    minWidth: '190px',
  },
  stackItemTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
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
    flexShrink: 0,
  },
  stackItemName: {
    fontSize: '13px',
    fontWeight: 'bold' as const,
    color: '#fff',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flexGrow: 1,
    maxWidth: '120px',
  },
  removeItemButton: {
    background: 'transparent',
    border: 'none',
    color: '#ff1744',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '0',
  },
  inlineTimeEditor: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
    backgroundColor: '#0a0a0a',
    padding: '6px 8px',
    borderRadius: '8px',
    border: '1px solid #1f1f1f',
  },
  inlineInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  inlineInputLabel: {
    fontSize: '10px',
    color: '#555',
  },
  inlineTimeInput: {
    background: 'transparent',
    border: 'none',
    color: '#00e676',
    fontSize: '12px',
    fontWeight: 'bold' as const,
    width: '28px',
    textAlign: 'right' as const,
    outline: 'none',
    padding: '0',
  },
  inlineUnit: {
    fontSize: '10px',
    color: '#555',
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
    cursor: 'pointer',
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
    cursor: 'pointer',
  }
};

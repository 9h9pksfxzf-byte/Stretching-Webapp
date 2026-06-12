import React, { useState } from 'react';
import { useStore, Exercise } from './store/useStore';
import { ProgramGrid } from './components/ProgramGrid';
import { ExerciseBuilder } from './components/ExerciseBuilder';
import { HistoryView } from './components/HistoryView';
import { RoutineRunner } from './components/RoutineRunner';

export const App: React.FC = () => {
  const { library, deleteExercise, status, errorMessage } = useStore();
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);

  if (status === 'loading') {
    return <div style={styles.centeredState}>Routine wird geladen...</div>;
  }

  if (status === 'error') {
    return <div style={{ ...styles.centeredState, color: '#cf6679' }}>Fehler: {errorMessage}</div>;
  }

  return (
    <div style={styles.appContainer}>
      {/* Top Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>FLEX<span style={{ color: '#03dac6' }}>FLOW</span></div>
        <div style={styles.navBadge}>{library.length} Übungen aktiv</div>
      </nav>

      {/* Main Content Layout */}
      <main style={styles.mainContent}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Deine Stretching-Programme</h2>
          <ProgramGrid onSelectProgram={(id: string) => setActiveProgramId(id)} />
        </section>

        <div style={styles.dashboardGrid}>
          {/* Linke Spalte: Builder und Verwaltung */}
          <div style={styles.column}>
            <ExerciseBuilder />
            
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Bibliothek verwalten</h3>
              <div style={styles.listContainer}>
                {library.map((ex: Exercise) => (
                  <div key={ex.id} style={styles.listItem}>
                    <div>
                      <div style={styles.itemName}>{ex.name}</div>
                      <div style={styles.itemMeta}>{ex.region} • {ex.durationInSeconds}s</div>
                    </div>
                    <button style={styles.btnDelete} onClick={() => deleteExercise(ex.id)}>
                      Löschen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rechte Spalte: Verlauf */}
          <div style={styles.column}>
            <HistoryView />
          </div>
        </div>
      </main>

      {/* Überlagernder Trainingsmodus (Verhindert UI-Zerschießen beim Rendern) */}
      {activeProgramId && (
        <RoutineRunner programId={activeProgramId} onClose={() => setActiveProgramId(null)} />
      )}
    </div>
  );
};

const styles = {
  appContainer: {
    backgroundColor: '#121212',
    color: '#e0e0e0',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 40px',
    backgroundColor: '#1a1a1a',
    borderBottom: '1px solid #2e2e2e'
  },
  navBrand: { fontSize: '20px', fontWeight: 800, letterSpacing: '1.5px', color: '#ffffff' },
  navBadge: { backgroundColor: '#2e2e2e', padding: '6px 12px', borderRadius: '6px', fontSize: '13px' },
  mainContent: { padding: '40px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column' as const, gap: '40px' },
  section: { display: 'flex', flexDirection: 'column' as const, gap: '20px' },
  sectionTitle: { fontSize: '22px', color: '#ffffff', margin: 0, fontWeight: 600 },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
    gap: '30px',
    alignItems: 'start'
  },
  column: { display: 'flex', flexDirection: 'column' as const, gap: '30px' },
  card: { backgroundColor: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '12px', padding: '24px' },
  cardTitle: { margin: '0 0 20px 0', fontSize: '18px', color: '#ffffff' },
  listContainer: { display: 'flex', flexDirection: 'column' as const, gap: '10px', maxHeight: '300px', overflowY: 'auto' as const },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2e2e2e',
    padding: '12px 16px',
    borderRadius: '8px'
  },
  itemName: { fontSize: '15px', fontWeight: 'bold' as const, color: '#ffffff' },
  itemMeta: { fontSize: '12px', color: '#a0a0a0', marginTop: '2px' },
  btnDelete: {
    backgroundColor: 'transparent',
    border: '1px solid #cf6679',
    color: '#cf6679',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  centeredState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#121212',
    color: '#ffffff',
    fontSize: '18px'
  }
};

export default App;

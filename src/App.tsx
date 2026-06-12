import React, { useState } from 'react';
import { useStore, Exercise } from './store/useStore';
import { ProgramGrid } from './components/ProgramGrid';
import { ExerciseBuilder } from './components/ExerciseBuilder';
import { HistoryView } from './components/HistoryView';
import { RoutineRunner } from './components/RoutineRunner';

export const App: React.FC = () => {
  const { library, deleteExercise, status, errorMessage } = useStore();
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);

  if (status === 'loading') return <div style={{ padding: '40px', textAlign: 'center' }}>Lädt...</div>;
  if (status === 'error') return <div style={{ padding: '40px', color: '#cf6679' }}>Fehler: {errorMessage}</div>;

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand">FLEX<span style={{ color: '#03dac6', fontWeight: 'bold' }}>FLOW</span></div>
        <div className="nav-badge">{library.length} Übungen gelistet</div>
      </nav>

      <main className="main-content">
        <section>
          <h2 className="section-title">Stretching Programme</h2>
          <ProgramGrid onSelectProgram={(id: string) => setActiveProgramId(id)} />
        </section>

        <div className="dashboard-layout">
          {/* Linke Spalte */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ExerciseBuilder />
            
            <div className="card">
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Bibliotheksverwaltung</h3>
              <div className="list-container">
                {library.map((ex: Exercise) => (
                  <div key={ex.id} className="list-item">
                    <div>
                      <div className="item-name">{ex.name}</div>
                      <div className="item-meta">{ex.region} • {ex.durationInSeconds}s</div>
                    </div>
                    <button className="btn-outline-danger" onClick={() => deleteExercise(ex.id)}>
                      Löschen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rechte Spalte */}
          <div>
            <HistoryView />
          </div>
        </div>
      </main>

      {activeProgramId && (
        <RoutineRunner programId={activeProgramId} onClose={() => setActiveProgramId(null)} />
      )}
    </div>
  );
};

export default App;

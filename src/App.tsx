import React, { useState } from 'react';
import { useStore, Exercise } from './store/useStore';
import { ProgramGrid } from './components/ProgramGrid';
import { ExerciseBuilder } from './components/ExerciseBuilder';
import { HistoryView } from './components/HistoryView';
import { RoutineRunner } from './components/RoutineRunner';

export const App: React.FC = () => {
  const { library, deleteExercise, status, errorMessage } = useStore();
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);

  const totalLibraryExercises = library.reduce((acc: number, _ex: Exercise) => acc + 1, 0);

  if (status === 'loading') return <div>Lädt...</div>;
  if (status === 'error') return <div>Fehler: {errorMessage}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Stretching Dashboard ({totalLibraryExercises} Übungen)</h1>
      
      {activeProgramId ? (
        <RoutineRunner programId={activeProgramId} onClose={() => setActiveProgramId(null)} />
      ) : (
        <>
          <ProgramGrid onSelectProgram={(id: string) => setActiveProgramId(id)} />
          <hr style={{ margin: '40px 0', borderColor: '#333' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            <ExerciseBuilder />
            <HistoryView />
          </div>
          <div>
            <h3>Bibliotheksverwaltung</h3>
            {library.map((ex: Exercise) => (
              <div key={ex.id}>
                {ex.name} <button onClick={() => deleteExercise(ex.id)}>Löschen</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default App;

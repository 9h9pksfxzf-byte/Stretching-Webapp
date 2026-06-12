import React from 'react';
import { useStore, HistoryEntry, Exercise } from '../store/useStore';

export const HistoryView: React.FC = () => {
  const { history, clearHistory } = useStore();

  const totalDuration = history.reduce((total: number, entry: HistoryEntry) => {
    return total + entry.completedExercises.reduce((sum: number, ex: Exercise) => sum + ex.durationInSeconds, 0);
  }, 0);

  return (
    <div>
      <h2>Verlauf (Gesamtzeit: {totalDuration}s)</h2>
      <button onClick={clearHistory}>Verlauf leeren</button>
      {history.map((entry: HistoryEntry) => (
        <div key={entry.id}>
          <h3>{entry.programName} - {entry.date}</h3>
          <ul>
            {entry.completedExercises.map((ex: Exercise) => (
              <li key={ex.id}>{ex.name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

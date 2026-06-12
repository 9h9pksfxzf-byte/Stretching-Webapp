import React, { useState } from 'react';
import { useTimer } from '../hooks/useTimer';
import { useStore } from '../store/useStore';

interface RoutineRunnerProps {
  programId: string;
  onClose: () => void;
}

export const RoutineRunner: React.FC<RoutineRunnerProps> = ({ programId, onClose }) => {
  const { programs } = useStore();
  const program = programs.find((p) => p.id === programId);
  
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  if (!program || program.exercises.length === 0) {
    return (
      <div className="workout-screen">
        <p>Keine Übungen in diesem Programm gefunden.</p>
        <button className="action-button btn-stop" onClick={onClose}>Zurück</button>
      </div>
    );
  }

  const currentExercise = program.exercises[currentIndex];

  // Timer initialisieren mit der Dauer der aktuellen Übung
  const { seconds, isActive, start, pause } = useTimer(
    currentExercise.durationInSeconds, 
    () => {
      // Callback bei Ablauf der Zeit: Nächste Übung laden oder beenden
      if (currentIndex + 1 < program.exercises.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        alert('Training erfolgreich beendet! 🎉');
        onClose();
      }
    }
  );

  return (
    <div className="workout-screen">
      <div>
        <div className="workout-progress">
          Übung {currentIndex + 1} von {program.exercises.length}
        </div>
        <h1 className="current-exercise-name">{currentExercise.name}</h1>
        <p style={{ color: '#8e8e93', marginTop: '4px' }}>Fokus: {currentExercise.region}</p>
      </div>

      {/* Zentrierter funktionaler Timer */}
      <div className="timer-circle" style={{ borderColor: isActive ? '#03dac6' : '#222' }}>
        <div className="timer-text">{seconds}s</div>
      </div>

      {/* Steuerungselemente direkt im Daumenbereich des Nutzers */}
      <div>
        <button 
          className={`action-button ${isActive ? 'btn-pause' : 'btn-start'}`} 
          onClick={isActive ? pause : start}
        >
          {isActive ? 'Pause' : 'Start Übung'}
        </button>
        
        <button className="action-button btn-stop" onClick={onClose}>
          Training abbrechen
        </button>
      </div>
    </div>
  );
};

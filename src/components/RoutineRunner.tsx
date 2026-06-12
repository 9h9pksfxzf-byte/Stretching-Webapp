import React from 'react';
import { useTimer } from '../hooks/useTimer';
import { CountdownTimer } from './CountdownTimer';
import { Exercise } from '../store/useStore';

interface RoutineRunnerProps {
  programId: string;
  onClose: () => void;
}

export const RoutineRunner: React.FC<RoutineRunnerProps> = ({ onClose }) => {
  const { seconds, isActive, start, pause } = useTimer(45, () => {
    alert('Übung beendet!');
    onClose();
  });

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Routine läuft</h2>
      <CountdownTimer seconds={seconds} />
      <button onClick={isActive ? pause : start}>{isActive ? 'Pause' : 'Start'}</button>
      <button onClick={onClose}>Schließen</button>
    </div>
  );
};

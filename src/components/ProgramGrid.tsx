import React from 'react';
import { useStore, Program, Exercise } from '../store/useStore';

interface ProgramGridProps {
  onSelectProgram: (id: string) => void;
}

export const ProgramGrid: React.FC<ProgramGridProps> = ({ onSelectProgram }) => {
  const { programs, deleteProgram } = useStore();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
      {programs.map((program: Program) => {
        const totalDuration = program.exercises.reduce((sum: number, ex: Exercise) => sum + ex.durationInSeconds, 0);
        return (
          <div key={program.id} style={{ border: '1px solid #333', padding: '16px' }}>
            <h3>{program.name}</h3>
            <p>Dauer: {totalDuration}s</p>
            <button onClick={() => onSelectProgram(program.id)}>Starten</button>
            <button onClick={() => deleteProgram(program.id)}>Löschen</button>
          </div>
        );
      })}
    </div>
  );
};

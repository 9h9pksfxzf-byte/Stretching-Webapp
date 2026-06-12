import React from 'react';
import { useStore, Program, Exercise } from '../store/useStore';

interface ProgramGridProps {
  onSelectProgram: (id: string) => void;
}

export const ProgramGrid: React.FC<ProgramGridProps> = ({ onSelectProgram }) => {
  const { programs, deleteProgram } = useStore();

  return (
    <div className="program-grid">
      {programs.map((program: Program) => {
        const totalDuration = program.exercises.reduce((sum: number, ex: Exercise) => sum + ex.durationInSeconds, 0);
        return (
          <div key={program.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '4px' }}>{program.name}</h3>
              <p style={{ fontSize: '13px', color: '#a0a0a0' }}>Dauer: {totalDuration}s • {program.exercises.length} Übungen</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => onSelectProgram(program.id)}>Starten</button>
              <button className="btn btn-outline-danger" style={{ padding: '12px' }} onClick={() => deleteProgram(program.id)}>✕</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

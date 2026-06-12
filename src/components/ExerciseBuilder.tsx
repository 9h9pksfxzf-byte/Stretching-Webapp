import React, { useState } from 'react';
import { useStore, BodyRegion } from '../store/useStore';

export const ExerciseBuilder: React.FC = () => {
  const { library, addExercise } = useStore();
  const [name, setName] = useState<string>('');
  const [region, setRegion] = useState<BodyRegion>('Oberkörper');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    addExercise({ name, durationInSeconds: 60, region });
    setName('');
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
        <select value={region} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRegion(e.target.value as BodyRegion)}>
          <option value="Oberkörper">Oberkörper</option>
          <option value="Unterkörper">Unterkörper</option>
        </select>
        <button type="submit">Hinzufügen</button>
      </form>
      <ul>
        {library.map((ex) => (
          <li key={ex.id}>{ex.name} ({ex.region})</li>
        ))}
      </ul>
    </div>
  );
};

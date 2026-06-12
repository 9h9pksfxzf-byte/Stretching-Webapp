import React, { useState } from 'react';
import { useStore, BodyRegion } from '../store/useStore';

export const ExerciseBuilder: React.FC = () => {
  const { addExercise } = useStore();
  const [name, setName] = useState<string>('');
  const [region, setRegion] = useState<BodyRegion>('Oberkörper');
  const [duration, setDuration] = useState<number>(60);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    addExercise({ name, durationInSeconds: duration, region });
    setName('');
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Neue Übung erstellen</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Name der Übung</label>
          <input 
            style={styles.input}
            placeholder="z.B. Couch Stretch" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>

        <div style={styles.row}>
          <div style={{ ...styles.inputGroup, flex: 1 }}>
            <label style={styles.label}>Fokusbereich</label>
            <select 
              style={styles.select}
              value={region} 
              onChange={(e) => setRegion(e.target.value as BodyRegion)}
            >
              <option value="Oberkörper">Oberkörper</option>
              <option value="Unterkörper">Unterkörper</option>
              <option value="Ganzkörper">Ganzkörper</option>
              <option value="Mobilität">Mobilität</option>
            </select>
          </div>

          <div style={{ ...styles.inputGroup, flex: 1 }}>
            <label style={styles.label}>Dauer (Sekunden)</label>
            <input 
              style={styles.input}
              type="number" 
              min="5"
              value={duration} 
              onChange={(e) => setDuration(Number(e.target.value))} 
            />
          </div>
        </div>

        <button type="submit" style={styles.btnSubmit}>Übung speichern</button>
      </form>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #2e2e2e',
    borderRadius: '12px',
    padding: '24px'
  },
  cardTitle: { margin: '0 0 20px 0', fontSize: '18px', color: '#ffffff' },
  form: { display: 'flex', flexDirection: 'column' as const, gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column' as const, gap: '6px' },
  label: { fontSize: '12px', color: '#a0a0a0', fontWeight: 'bold' as const, textTransform: 'uppercase' as const },
  input: {
    backgroundColor: '#2e2e2e',
    border: '1px solid #404040',
    borderRadius: '6px',
    padding: '10px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none'
  },
  select: {
    backgroundColor: '#2e2e2e',
    border: '1px solid #404040',
    borderRadius: '6px',
    padding: '10px',
    color: '#ffffff',
    fontSize: '14px'
  },
  row: { display: 'flex', gap: '12px' },
  btnSubmit: {
    backgroundColor: '#bb86fc',
    color: '#000000',
    border: 'none',
    borderRadius: '6px',
    padding: '12px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    marginTop: '10px'
  }
};

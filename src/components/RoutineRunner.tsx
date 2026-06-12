import React from 'react';
import { useTimer } from '../hooks/useTimer';

interface RoutineRunnerProps {
  programId: string;
  onClose: () => void;
}

export const RoutineRunner: React.FC<RoutineRunnerProps> = ({ onClose }) => {
  // Der Hook steuert die Zeit und triggert den im vorigen Schritt eingebauten Web-Audio-Sound
  const { seconds, isActive, start, pause } = useTimer(45, () => {
    onClose();
  });

  return (
    <div style={styles.runnerContainer}>
      <h2 style={styles.title}>Routine läuft</h2>
      
      {/* Integrierte Timer-Anzeige eliminiert den fehlerhaften Modul-Import */}
      <div style={styles.timerDisplay}>
        {seconds}s
      </div>
      
      <div style={styles.buttonGroup}>
        <button 
          style={{ ...styles.button, ...(isActive ? styles.buttonPause : styles.buttonStart) }} 
          onClick={isActive ? pause : start}
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        
        <button style={{ ...styles.button, ...styles.buttonClose }} onClick={onClose}>
          Schließen
        </button>
      </div>
    </div>
  );
};

const styles = {
  runnerContainer: {
    padding: '40px 20px',
    textAlign: 'center' as const,
    backgroundColor: '#1e1e1e',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    maxWidth: '500px',
    margin: '20px auto'
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#ffffff'
  },
  timerDisplay: {
    fontSize: '64px',
    fontWeight: 'bold' as const,
    color: '#03dac6',
    margin: '30px 0',
    fontVariantNumeric: 'tabular-nums' // Verhindert das Springen der Zahlen beim Herunterzählen
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px'
  },
  button: {
    padding: '12px 28px',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  buttonStart: {
    backgroundColor: '#03dac6',
    color: '#000000'
  },
  buttonPause: {
    backgroundColor: '#ffb74d',
    color: '#000000'
  },
  buttonClose: {
    backgroundColor: '#333333',
    color: '#ffffff'
  }
};

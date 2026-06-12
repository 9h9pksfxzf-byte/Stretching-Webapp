import React from 'react';
import { useTimer } from '../hooks/useTimer';

interface RoutineRunnerProps {
  programId: string;
  onClose: () => void;
}

export const RoutineRunner: React.FC<RoutineRunnerProps> = ({ onClose }) => {
  const { seconds, isActive, start, pause, reset } = useTimer(45, () => {
    onClose();
  });

  return (
    <div style={styles.fullscreenOverlay}>
      <div style={styles.runnerCard}>
        <span style={styles.badge}>Aktivität läuft</span>
        <h2 style={styles.title}>Couch Stretch</h2>
        
        <div style={styles.timerContainer}>
          <div style={styles.timerDisplay}>{seconds}</div>
          <span style={styles.unit}>Sekunden verbleibend</span>
        </div>
        
        <div style={styles.buttonGroup}>
          <button 
            style={{ ...styles.btn, ...(isActive ? styles.btnPause : styles.btnStart) }} 
            onClick={isActive ? pause : start}
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
          
          <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={reset}>
            Reset
          </button>
          
          <button style={{ ...styles.btn, ...styles.btnDanger }} onClick={onClose}>
            Beenden
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  fullscreenOverlay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 1000,
    backdropFilter: 'blur(8px)'
  },
  runnerCard: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #2e2e2e',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center' as const,
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    width: '100%',
    maxWidth: '450px'
  },
  badge: {
    backgroundColor: 'rgba(3, 218, 198, 0.1)',
    color: '#03dac6',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px'
  },
  title: {
    fontSize: '32px',
    margin: '20px 0 10px 0',
    color: '#ffffff',
    fontWeight: 700
  },
  timerContainer: {
    margin: '40px 0'
  },
  timerDisplay: {
    fontSize: '120px',
    fontWeight: 800,
    color: '#03dac6',
    lineHeight: '1',
    fontVariantNumeric: 'tabular-nums'
  },
  unit: {
    color: '#a0a0a0',
    fontSize: '14px',
    display: 'block',
    marginTop: '10px'
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },
  btn: {
    padding: '14px',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  btnStart: { backgroundColor: '#03dac6', color: '#000000' },
  btnPause: { backgroundColor: '#ffb74d', color: '#000000' },
  btnSecondary: { backgroundColor: '#2e2e2e', color: '#ffffff' },
  btnDanger: { backgroundColor: '#cf6679', color: '#ffffff' }
};

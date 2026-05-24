import { useState, useEffect, useCallback } from 'react';
import { useStore, PerformedExercise } from '../store/useStore';

interface RoutineRunnerProps {
  programId: string;
  onClose: () => void;
}

// Wir definieren die Phasen exakt als State-Maschine
type RunnerPhase = 'EXERCISE' | 'RATING' | 'BREAK' | 'FINISHED';

export const RoutineRunner = ({ programId, onClose }: RoutineRunnerProps) => {
  const { library, programs, addHistoryEntry } = useStore();
  
  // Indizes und Phasensteuerung
  const [index, setIndex] = useState<number>(0);
  const [phase, setPhase] = useState<RunnerPhase>('EXERCISE');
  
  // Timer-Zustände
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  
  // Historie der aktuellen Session
  const [completedExercises, setCompletedExercises] = useState<PerformedExercise[]>([]);

  // Datenauflösung aus dem Store
  const program = programs.find(p => p.id === programId);
  const programExercises = program ? program.exercises : [];
  const currentProgramData = programExercises[index];
  const currentExerciseData = library.find(e => e.id === currentProgramData?.exerciseId);

  // 1. Initialisierung der Zeit bei Phasen- oder Indexwechsel
  useEffect(() => {
    if (!currentProgramData) {
      setPhase('FINISHED');
      return;
    }

    if (phase === 'EXERCISE') {
      setTimeLeft(currentProgramData.duration || 30);
      setIsActive(false); // Startet pausiert, wartet auf "Start"
    } else if (phase === 'BREAK') {
      // Nutzt die eingestellte Pause, falls vorhanden, sonst Fallback auf 10 Sekunden Default
      setTimeLeft(currentProgramData.breakDuration ?? 10);
      setIsActive(true); // Pause startet automatisch für besseren Flow
    }
  }, [index, phase, currentProgramData]);

  // 2. Der unzerstörbare Core-Timer (Direkt in der Komponente via setInterval)
  useEffect(() => {
    let interval: any = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      handlePhaseTimeout();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  // 3. Automatische Phasenübergänge nach Ablauf der Zeit
  const handlePhaseTimeout = () => {
    if (phase === 'EXERCISE') {
      // Übung vorbei -> Direkt in das Rating-Schnittstelle zwingen
      setPhase('RATING');
    } else if (phase === 'BREAK') {
      // Pause vorbei -> Nächste Übung laden
      setPhase('EXERCISE');
      setIndex((i) => i + 1);
    }
  };

  // Manuelle Skip-Aktion steuert exakt dieselbe Logik an
  const handleSkip = () => {
    setIsActive(false);
    if (phase === 'EXERCISE') {
      setPhase('RATING');
    } else if (phase === 'BREAK') {
      setPhase('EXERCISE');
      setIndex((i) => i + 1);
    }
  };

  const toggleTimer = useCallback(() => {
    setIsActive((prev) => !prev);
  }, []);

  // 4. Verarbeitung der 1-10 Bewertung
  const handleRatingSelection = (ratingValue: number) => {
    if (!currentProgramData || !currentExerciseData) return;

    const currentPerformed: PerformedExercise = {
      exerciseId: currentProgramData.exerciseId,
      name: currentExerciseData.name,
      side: currentProgramData.side,
      duration: currentProgramData.duration,
      executionRating: ratingValue,
      description: currentExerciseData.description
    };

    const updatedExercises = [...completedExercises, currentPerformed];
    setCompletedExercises(updatedExercises);

    // Prüfen, ob das die letzte Übung im Programm war
    if (index >= programExercises.length - 1) {
      if (program) {
        addHistoryEntry({
          id: Date.now().toString(),
          programId: program.id,
          programName: program.name,
          date: new Date().toLocaleDateString('de-DE', { 
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }),
          completedExercises: updatedExercises
        });
      }
      setPhase('FINISHED');
    } else {
      // Es folgen weitere Übungen -> Jetzt in die Pause wechseln
      setPhase('BREAK');
    }
  };

  // INTERFACE: ABSCHLUSS-SCREEN
  if (phase === 'FINISHED' || !currentProgramData || !currentExerciseData || !program) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-screen bg-[#0a0a0a] text-white gap-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Geschafft! 🏁</h2>
          <p className="text-slate-400">
            Du hast das Programm <strong className="text-white">{program?.name || 'Unbekannt'}</strong> erfolgreich beendet und im Verlauf gespeichert.
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="bg-emerald-600 w-full py-4 rounded-xl font-bold text-lg active:bg-emerald-700"
        >
          Fertig
        </button>
      </div>
    );
  }

  // INTERFACE: BEWERTUNGS-SCREEN (1-10)
  if (phase === 'RATING') {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] text-white p-6 flex flex-col items-center justify-center gap-6 z-50">
        <div className="text-center mb-2">
          <p className="text-emerald-500 uppercase tracking-widest text-xs mb-2 font-bold">Reflexion</p>
          <h2 className="text-2xl font-bold mb-1">Wie war deine Performance?</h2>
          <p className="text-slate-400 text-sm">
            {currentExerciseData.name} {currentProgramData.side ? `(${currentProgramData.side})` : ''}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              onClick={() => handleRatingSelection(num)}
              className="py-4 bg-[#1a1a1a] border border-[#333] rounded-xl font-bold text-lg active:bg-emerald-600 text-white transition-colors"
            >
              {num}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 text-center max-w-xs mt-2 leading-relaxed">
          1 = Sehr unsauber / Abbruch <br /> 10 = Perfekte Form / Volle Dehnung gehalten
        </div>
      </div>
    );
  }

  // INTERFACE: REGULÄRER WORKOUT- & PAUSEN-TIMER
  return (
    <div className="flex flex-col items-center p-6 gap-6 text-white pt-16 min-h-screen bg-[#0a0a0a]">
      <div className="text-center w-full px-2">
        <p className="text-slate-400 uppercase tracking-widest text-xs mb-1">
          {phase === 'BREAK' ? "Pause" : `Übung ${index + 1} von ${programExercises.length}`}
        </p>
        <h1 className="text-3xl font-bold truncate">
          {phase === 'BREAK' ? `Nächste: ${getNextExerciseName(programExercises, library, index)}` : currentExerciseData.name}
        </h1>
        {phase === 'EXERCISE' && currentProgramData.side && (
          <h2 className="text-xl font-bold text-emerald-500 mt-1">
            Seite: {currentProgramData.side}
          </h2>
        )}
      </div>

      <div className="text-[120px] font-mono font-bold leading-none my-6 select-none">
        {timeLeft}
      </div>

      {/* Übungsbeschreibung: Nur während der aktiven Belastung sichtbar */}
      {phase === 'EXERCISE' && currentExerciseData.description && (
        <div className="bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-sm text-slate-300 max-w-md w-full text-center overflow-y-auto max-h-32 shadow-inner">
          {currentExerciseData.description}
        </div>
      )}

      {phase === 'BREAK' && (
        <div className="text-sm text-slate-500 italic h-16 flex items-center text-center px-4">
          Lockern, tief durchatmen und vorbereiten...
        </div>
      )}

      {/* Kontrolltasten */}
      <div className="grid grid-cols-3 gap-4 w-full mt-auto mb-6">
        <button 
          onClick={toggleTimer} 
          className={`${isActive ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-600 text-white'} py-6 rounded-2xl font-bold text-base active:opacity-80 transition-all`}
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button 
          onClick={handleSkip} 
          className="bg-slate-800 border border-slate-700 py-6 rounded-2xl font-bold text-base text-slate-200 active:bg-slate-700"
        >
          Skip
        </button>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-red-950/30 border border-red-900/50 py-6 rounded-2xl font-bold text-base text-red-400 active:bg-red-900/40"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

// Hilfsfunktion zur Ermittlung des Namens der nachfolgenden Übung außerhalb der Render-Zyklen
const getNextExerciseName = (programExercises: any[], library: any[], currentIndex: number) => {
  const nextProgramData = programExercises[currentIndex + 1];
  if (!nextProgramData) return "Fertig";
  const nextEx = library.find(e => e.id === nextProgramData.exerciseId);
  if (!nextEx) return "Fertig";
  return `${nextEx.name} ${nextProgramData.side ? `(${nextProgramData.side})` : ''}`;
};

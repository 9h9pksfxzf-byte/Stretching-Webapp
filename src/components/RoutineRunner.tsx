import { useState, useEffect } from 'react';
import { useStore, PerformedExercise } from '../store/useStore';
import { useTimer } from '../hooks/useTimer';

interface RoutineRunnerProps {
  programId: string;
  onClose: () => void;
}

export const RoutineRunner = ({ programId, onClose }: RoutineRunnerProps) => {
  const { library, programs, addHistoryEntry } = useStore();
  const [index, setIndex] = useState<number>(0);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  
  // Zustände für die Ausführungsbewertung und den Session-Speicher
  const [showRatingScreen, setShowRatingScreen] = useState<boolean>(false);
  const [completedExercises, setCompletedExercises] = useState<PerformedExercise[]>([]);

  const program = programs.find(p => p.id === programId);
  const programExercises = program ? program.exercises : [];
  const currentProgramData = programExercises[index];
  const currentExerciseData = library.find(e => e.id === currentProgramData?.exerciseId);

  // Bestimmung der aktuellen Dauer für die Hook
  const currentDuration = isBreak 
    ? (currentProgramData?.breakDuration || 0) 
    : (currentProgramData?.duration || 0);

  // Wir übergeben eine leere Dummy-Funktion () => {} als zweiten Parameter,
  // damit TypeScript auf Vercel nicht wegen fehlender Argumente meckert.
  const { timeLeft, isActive, toggle, skip } = useTimer(currentDuration, () => {});

  // ZENTRALE STEUERUNG: Sobald timeLeft auf 0 sinkt (egal ob durch Ablauf oder Skip),
  // fangen wir das hier im React-Lebenszyklus sauber ab.
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      // Eine winzige Verzögerung verhindert Race-Conditions beim State-Update
      const timer = setTimeout(() => {
        handlePhaseEnd();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isActive]);

  const handlePhaseEnd = () => {
    if (isBreak) {
      // Pause vorbei -> Weiter zur nächsten Übung
      setIsBreak(false);
      setIndex((i) => i + 1);
    } else {
      // Aktive Übung vorbei -> Rating erzwingen
      setShowRatingScreen(true);
    }
  };

  // Skip-Button triggert nun die offizielle Hook-Skip-Funktion.
  // Falls deine Hook bei Skip den timeLeft-State nicht auf 0 setzt,
  // rufen wir handlePhaseEnd() hier zur Sicherheit zusätzlich direkt auf.
  const handleManualSkip = () => {
    handlePhaseEnd();
    skip(); 
  };

  // Verarbeitet die Vergabe des 1-10 Ratings nach einer aktiven Übung
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
    setShowRatingScreen(false);

    // Prüfen, ob die Routine komplett beendet ist
    if (index >= programExercises.length - 1) {
      if (program) {
        addHistoryEntry({
          id: Date.now().toString(),
          programId: program.id,
          programName: program.name,
          date: new Date().toLocaleDateString('de-DE', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          completedExercises: updatedExercises
        });
      }
      setIndex((i) => i + 1);
    } else {
      // Wenn noch Übungen anstehen -> Wechsel in die Pause
      setIsBreak(true);
    }
  };

  // Abschluss-Bildschirm nach dem vollständigen Programm-Durchlauf
  if (!currentProgramData || !currentExerciseData || !program) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-screen text-white gap-8 -mt-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Geschafft! 🏁</h2>
          <p className="text-slate-400">
            Du hast das Programm <strong className="text-white">{program?.name || 'Unbekannt'}</strong> erfolgreich abgeschlossen und bewertet.
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="bg-emerald-600 w-full py-4 rounded-xl font-bold text-lg"
        >
          Fertig
        </button>
      </div>
    );
  }

  const getNextExerciseName = () => {
    const nextProgramData = programExercises[index + 1];
    if (!nextProgramData) return "Fertig";
    const nextEx = library.find(e => e.id === nextProgramData.exerciseId);
    if (!nextEx) return "Fertig";
    return `${nextEx.name} ${nextProgramData.side ? `(${nextProgramData.side})` : ''}`;
  };

  // INTERFACE 1: BEWERTUNGS-MODAL (1-10)
  if (showRatingScreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white p-6 gap-6">
        <div className="text-center mb-4">
          <p className="text-emerald-500 uppercase tracking-widest text-xs mb-2">Reflexion</p>
          <h2 className="text-2xl font-bold mb-1">Wie gut war deine Ausführung?</h2>
          <p className="text-slate-400 text-sm">
            {currentExerciseData.name} {currentProgramData.side ? `(${currentProgramData.side})` : ''}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              onClick={() => handleRatingSelection(num)}
              className="py-4 bg-[#1a1a1a] border border-[#333] rounded-xl font-bold text-lg active:bg-emerald-600 shadow-sm"
            >
              {num}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 text-center max-w-xs mt-2">
          1 = Sehr unsauber / Schmerzen <br /> 10 = Perfekte Form / Volle Dehnung
        </div>
      </div>
    );
  }

  // INTERFACE 2: REGULÄRER TIMER & ANLEITUNG
  return (
    <div className="flex flex-col items-center p-6 gap-6 text-white pt-16 min-h-screen">
      <div className="text-center w-full px-2">
        <p className="text-slate-400 uppercase tracking-widest text-xs mb-1">
          {isBreak ? "Pause" : `Übung ${index + 1} von ${programExercises.length}`}
        </p>
        <h1 className="text-3xl font-bold truncate">
          {isBreak ? `Nächste: ${getNextExerciseName()}` : currentExerciseData.name}
        </h1>
        {!isBreak && currentProgramData.side && (
          <h2 className="text-xl font-bold text-emerald-500 mt-1">
            Seite: {currentProgramData.side}
          </h2>
        )}
      </div>

      <div className="text-[120px] font-mono font-bold leading-none my-6">{timeLeft}</div>

      {/* Übungsbeschreibung: Sichtbar während der Dehnung */}
      {!isBreak && currentExerciseData.description && (
        <div className="bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-sm text-slate-300 max-w-md w-full text-center overflow-y-auto max-h-32 shadow-inner">
          {currentExerciseData.description}
        </div>
      )}

      {isBreak && (
        <div className="text-sm text-slate-500 italic h-16 flex items-center">
          Bereite dich auf die nächste Dehnung vor...
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 w-full mt-auto mb-6">
        <button onClick={toggle} className="bg-slate-800 py-6 rounded-2xl font-bold text-base">
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button onClick={handleManualSkip} className="bg-slate-800 py-6 rounded-2xl font-bold text-base">
          Skip
        </button>
        <button onClick={() => window.location.reload()} className="bg-red-900/30 py-6 rounded-2xl font-bold text-base text-red-400">
          Reset
        </button>
      </div>
    </div>
  );
};

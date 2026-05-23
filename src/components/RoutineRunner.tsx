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
  
  const [showRatingScreen, setShowRatingScreen] = useState<boolean>(false);
  const [completedExercises, setCompletedExercises] = useState<PerformedExercise[]>([]);

  const program = programs.find(p => p.id === programId);
  const programExercises = program ? program.exercises : [];
  const currentProgramData = programExercises[index];
  const currentExerciseData = library.find(e => e.id === currentProgramData?.exerciseId);

  // Wir bestimmen die Zielzeit dynamisch basierend auf dem Zustand
  const targetDuration = isBreak 
    ? (currentProgramData?.breakDuration || 0) 
    : (currentProgramData?.duration || 0);

  // useTimer wird ohne automatischen, internen Phasenwechsel-Callback aufgerufen
  const { timeLeft, isActive, toggle, handleManualComplete } = useTimer(targetDuration);

  // EXPLIZITE PHASEN-STEUERUNG: Sobald der Timer 0 erreicht, greift diese Logik fehlerfrei
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      handlePhaseEnd();
    }
  }, [timeLeft, isActive]);

  const handlePhaseEnd = () => {
    if (isBreak) {
      // Pause vorbei -> Direkt weiter zur nächsten Übung
      setIsBreak(false);
      setIndex((i) => i + 1);
    } else {
      // Aktive Übung vorbei -> Rating erzwingen
      setShowRatingScreen(true);
    }
  };

  // Ersetzt das unsichere "Skip" durch eine kontrollierte Beendigung der aktuellen Phase
  const handleSkipAction = () => {
    handlePhaseEnd();
  };

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
      setIndex((i) => i + 1);
    } else {
      setIsBreak(true);
    }
  };

  if (!currentProgramData || !currentExerciseData || !program) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-screen text-white gap-8 -mt-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Geschafft! 🏁</h2>
          <p className="text-slate-400">
            Du hast das Programm <strong className="text-white">{program?.name || 'Unbekannt'}</strong> erfolgreich abgeschlossen und bewertet.
          </p>
        </div>
        <button onClick={onClose} className="bg-emerald-600 w-full py-4 rounded-xl font-bold text-lg">
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

  // INTERFACE 1: BEWERTUNGS-MODAL
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
              className="py-4 bg-[#1a1a1a] border border-[#333] rounded-xl font-bold text-lg active:bg-emerald-600"
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // INTERFACE 2: TIMER
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
          <h2 className="text-xl font-bold text-emerald-500 mt-1">Seite: {currentProgramData.side}</h2>
        )}
      </div>

      <div className="text-[100px] font-mono font-bold leading-none my-4">{timeLeft}</div>

      {!isBreak && currentExerciseData.description && (
        <div className="bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-sm text-slate-300 max-w-md w-full text-center overflow-y-auto max-h-32">
          {currentExerciseData.description}
        </div>
      )}

      {isBreak && (
        <div className="text-sm text-slate-500 italic h-16 flex items-center">
          Bereite dich auf die nächste Dehnung vor...
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 w-full mt-auto mb-6">
        <button onClick={toggle} className="bg-slate-800 py-5 rounded-2xl font-bold text-base">
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button onClick={handleSkipAction} className="bg-slate-800 py-5 rounded-2xl font-bold text-base">
          Skip
        </button>
        <button onClick={() => window.location.reload()} className="bg-red-900/30 py-5 rounded-2xl font-bold text-base text-red-400">
          Reset
        </button>
      </div>
    </div>
  );
};

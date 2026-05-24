import { useState, useEffect } from 'react';
import { useStore, PerformedExercise } from '../store/useStore';

interface RoutineRunnerProps {
  programId: string;
  onClose: () => void;
}

type RunnerPhase = 'EXERCISE' | 'RATING' | 'BREAK' | 'FINISHED';

export const RoutineRunner = ({ programId, onClose }: RoutineRunnerProps) => {
  const { library, programs, addHistoryEntry } = useStore();
  
  const [index, setIndex] = useState<number>(0);
  const [phase, setPhase] = useState<RunnerPhase>('EXERCISE');
  
  const [timeLeft, setTimeLeft] = useState<number>(0);
  // Wir steuern die Aktivität getrennt, um Seiteneffekte zu vermeiden
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  
  const [completedExercises, setCompletedExercises] = useState<PerformedExercise[]>([]);

  const program = programs.find(p => p.id === programId);
  const programExercises = program ? program.exercises : [];
  const currentProgramData = programExercises[index];
  const currentExerciseData = library.find(e => e.id === currentProgramData?.exerciseId);

  // 1. Synchronisierung von Phase, Zeit und Autostart-Verhalten
  useEffect(() => {
    if (!currentProgramData) {
      setPhase('FINISHED');
      setIsTimerRunning(false);
      return;
    }

    if (phase === 'EXERCISE') {
      setTimeLeft(currentProgramData.duration || 30);
      setIsTimerRunning(false); // Übung startet pausiert
    } else if (phase === 'BREAK') {
      setTimeLeft(currentProgramData.breakDuration ?? 10);
      setIsTimerRunning(true); // Pause startet GARANTIERT sofort automatisch
    }
  }, [index, phase, currentProgramData]);

  // 2. Der Core-Timer-Loop
  useEffect(() => {
    let interval: any = null;

    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      if (phase === 'EXERCISE') {
        setPhase('RATING');
      } else if (phase === 'BREAK') {
        setPhase('EXERCISE');
        setIndex((i) => i + 1);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft, phase]);

  const handleSkip = () => {
    setIsTimerRunning(false);
    if (phase === 'EXERCISE') {
      setPhase('RATING');
    } else if (phase === 'BREAK') {
      setPhase('EXERCISE');
      setIndex((i) => i + 1);
    }
  };

  const toggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  // 3. Bewertung verarbeiten und direkt in den Autostart der Pause überleiten
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
      // Setzt die Phase auf Break. Der obere useEffect fängt dies ab
      // und setzt timeLeft auf die Pausenzeit sowie isTimerRunning auf true.
      setPhase('BREAK');
    }
  };

  // SCREEN: FINISHED
  if (phase === 'FINISHED' || !currentProgramData || !currentExerciseData || !program) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-screen bg-[#0a0a0a] text-white gap-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Geschafft! 🏁</h2>
          <p className="text-slate-400 text-sm">
            Du hast <strong className="text-white">{program?.name || 'Unbekannt'}</strong> erfolgreich beendet.
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="bg-emerald-600 w-full max-w-xs py-4 rounded-xl font-bold text-lg active:bg-emerald-700"
        >
          Fertig
        </button>
      </div>
    );
  }

  // SCREEN: RATING
  if (phase === 'RATING') {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] text-white p-4 flex flex-col items-center justify-between z-50 h-screen box-border">
        <div className="text-center mt-4">
          <p className="text-emerald-500 uppercase tracking-widest text-xs font-bold mb-1">Reflexion</p>
          <h2 className="text-xl font-bold">Wie war deine Performance?</h2>
          <p className="text-slate-400 text-xs mt-1 truncate max-w-xs">
            {currentExerciseData.name} {currentProgramData.side ? `(${currentProgramData.side})` : ''}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 w-full max-w-xs my-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              onClick={() => handleRatingSelection(num)}
              className="py-3 bg-[#1a1a1a] border border-[#333] rounded-xl font-bold text-base active:bg-emerald-600 text-white transition-colors"
            >
              {num}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-500 text-center mb-4 leading-tight">
          1 = Sehr unsauber / Abbruch | 10 = Perfekt gehalten
        </div>
      </div>
    );
  }

  // SCREEN: MAIN RUNNER (EXERCISE & BREAK auf einen Blick optimiert)
  return (
    <div className="flex flex-col items-center justify-between p-4 text-white bg-[#0a0a0a] h-screen fixed inset-0 box-border overflow-hidden select-none">
      
      {/* Header Bereich */}
      <div className="text-center w-full pt-4 px-2 flex-shrink-0">
        <p className="text-slate-400 uppercase tracking-widest text-[11px] font-semibold">
          {phase === 'BREAK' ? "Pause" : `Übung ${index + 1} von ${programExercises.length}`}
        </p>
        <h1 className="text-2xl font-bold truncate mt-0.5">
          {phase === 'BREAK' ? `Nächste: ${getNextExerciseName(programExercises, library, index)}` : currentExerciseData.name}
        </h1>
        {phase === 'EXERCISE' && currentProgramData.side && (
          <span className="inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full mt-1.5">
            Seite: {currentProgramData.side}
          </span>
        )}
      </div>

      {/* Riesen-Timer Bereich */}
      <div className="flex items-center justify-center my-auto flex-grow">
        <span className="text-[110px] font-mono font-bold leading-none tracking-tighter">
          {timeLeft}
        </span>
      </div>

      {/* Content Box (Beschreibung oder Pausen-Anzeige) */}
      <div className="w-full max-w-sm px-2 flex-shrink-0 h-24 mb-4 flex items-center justify-center">
        {phase === 'EXERCISE' ? (
          currentExerciseData.description ? (
            <div className="bg-[#1a1a1a] border border-[#333] p-3 rounded-xl text-xs text-slate-400 text-center overflow-y-auto h-full w-full max-h-24">
              {currentExerciseData.description}
            </div>
          ) : (
            <div className="text-slate-600 text-xs italic">Keine Beschreibung verfügbar.</div>
          )
        ) : (
          <div className="bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-xl text-xs text-emerald-400 font-medium italic text-center w-full h-full flex items-center justify-center animate-pulse">
            Pause läuft automatisch... Atme tief durch.
          </div>
        )}
      </div>

      {/* Feste, kompakte Steuerungselemente unten */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-sm pb-4 flex-shrink-0">
        <button 
          onClick={toggleTimer} 
          className={`${isTimerRunning ? 'bg-amber-600/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-600 text-white'} py-4 rounded-xl font-bold text-sm active:opacity-80 transition-all`}
        >
          {isTimerRunning ? 'Pause' : 'Start'}
        </button>
        <button 
          onClick={handleSkip} 
          className="bg-[#1a1a1a] border border-[#333] py-4 rounded-xl font-bold text-sm text-slate-200 active:bg-slate-800"
        >
          Skip
        </button>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-red-950/20 border border-red-900/30 py-4 rounded-xl font-bold text-sm text-red-400 active:bg-red-900/40"
        >
          Reset
        </button>
      </div>

    </div>
  );
};

const getNextExerciseName = (programExercises: any[], library: any[], currentIndex: number) => {
  const nextProgramData = programExercises[currentIndex + 1];
  if (!nextProgramData) return "Fertig";
  const nextEx = library.find(e => e.id === nextProgramData.exerciseId);
  if (!nextEx) return "Fertig";
  return `${nextEx.name} ${nextProgramData.side ? `(${nextProgramData.side})` : ''}`;
};

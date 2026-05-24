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
  
  // Initialisierung direkt aus den Daten, um Verzögerungen zu vermeiden
  const program = programs.find(p => p.id === programId);
  const programExercises = program ? program.exercises : [];
  const currentProgramData = programExercises[index];
  const currentExerciseData = library.find(e => e.id === currentProgramData?.exerciseId);

  const [timeLeft, setTimeLeft] = useState<number>(currentProgramData?.duration || 30);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  
  const [completedExercises, setCompletedExercises] = useState<PerformedExercise[]>([]);

  // Der zentrale, deterministische Timer-Loop
  useEffect(() => {
    let intervalId: any = null;

    if (isTimerRunning && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      
      if (phase === 'EXERCISE') {
        // Wechsel ins Rating
        setPhase('RATING');
      } else if (phase === 'BREAK') {
        // Lade die nächste Übung und warte auf manuellen Start
        const nextIndex = index + 1;
        setIndex(nextIndex);
        setPhase('EXERCISE');
        setTimeLeft(programExercises[nextIndex]?.duration || 30);
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTimerRunning, timeLeft, phase, index, programExercises]);

  const handleSkip = () => {
    setIsTimerRunning(false);
    if (phase === 'EXERCISE') {
      setPhase('RATING');
    } else if (phase === 'BREAK') {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      setPhase('EXERCISE');
      setTimeLeft(programExercises[nextIndex]?.duration || 30);
    }
  };

  const toggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  // State-Updates werden strikt gebündelt, um Race-Conditions zu verhindern
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
      // Programmende
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
      // Synchrones Zuweisen von Zeit, Phase und Startbefehl
      // Dadurch läuft die Pause zu 100 % sofort und fehlerfrei an
      setTimeLeft(currentProgramData.breakDuration ?? 10);
      setPhase('BREAK');
      setIsTimerRunning(true); 
    }
  };

  // SCREEN: FINISHED
  if (phase === 'FINISHED' || !currentProgramData || !currentExerciseData || !program) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-[100dvh] bg-[#0a0a0a] text-white gap-6">
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

  // SCREEN: MAIN RUNNER (Alles auf einer Seite, kein Scrollen)
  return (
    <div className="flex flex-col items-center justify-between p-4 text-white bg-[#0a0a0a] h-[100dvh] fixed inset-0 box-border overflow-hidden select-none">
      
      {/* Header Bereich (Immer sichtbar) */}
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

      {/* Dynamischer Mittelteil: Entweder riesiger Timer ODER 1-10 Rating */}
      <div className="flex flex-col items-center justify-center flex-grow w-full">
        {phase === 'RATING' ? (
          <div className="w-full max-w-sm px-2 animate-in fade-in duration-300">
            <p className="text-emerald-500 text-sm font-bold text-center mb-4 uppercase tracking-wider">
              Ausführung bewerten
            </p>
            <div className="grid grid-cols-5 gap-2 w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => handleRatingSelection(num)}
                  className="aspect-square bg-[#1a1a1a] border border-[#333] rounded-xl font-bold text-xl flex items-center justify-center active:bg-emerald-600 active:border-emerald-500 text-white transition-colors"
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-slate-500 text-center mt-4 uppercase tracking-widest">
              1 = Schlecht • 10 = Perfekt
            </div>
          </div>
        ) : (
          <span className="text-[120px] font-mono font-bold leading-none tracking-tighter tabular-nums">
            {timeLeft}
          </span>
        )}
      </div>

      {/* Info Box: Zeigt Übungsdetails oder Pausen-Pulsieren, wird beim Rating ausgeblendet um Platz zu sparen */}
      {phase !== 'RATING' && (
        <div className="w-full max-w-sm px-2 flex-shrink-0 h-24 mb-4 flex items-center justify-center">
          {phase === 'EXERCISE' ? (
            currentExerciseData.description ? (
              <div className="bg-[#1a1a1a] border border-[#333] p-3 rounded-xl text-xs text-slate-400 text-center overflow-y-auto h-full w-full max-h-24">
                {currentExerciseData.description}
              </div>
            ) : (
              <div className="text-slate-600 text-xs italic">Keine Beschreibung.</div>
            )
          ) : (
            <div className="bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-xl text-xs text-emerald-400 font-medium italic text-center w-full h-full flex items-center justify-center animate-pulse">
              Pause läuft...
            </div>
          )}
        </div>
      )}

      {/* Kontrolltasten: Verschwinden während des Ratings, damit du sofort die Zahl drücken kannst */}
      {phase !== 'RATING' && (
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm pb-6 flex-shrink-0 px-2">
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
      )}
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

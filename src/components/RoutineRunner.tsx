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
  const [currentSide, setCurrentSide] = useState<'Links' | 'Rechts' | 'Beide'>('Beide');
  
  const program = programs.find(p => p.id === programId);
  const programExercises = program ? program.exercises : [];
  const currentProgramData = programExercises[index];
  const currentExerciseData = library.find(e => e.id === currentProgramData?.exerciseId);

  const [timeLeft, setTimeLeft] = useState<number>(currentProgramData?.duration || 30);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [completedExercises, setCompletedExercises] = useState<PerformedExercise[]>([]);

  // Steuert die Unilateralitäts-Wechsel vorab beim Laden eines neuen Slots
  useEffect(() => {
    if (currentExerciseData) {
      if (currentExerciseData.isUnilateral && currentSide === 'Beide') {
        setCurrentSide('Links');
      } else if (!currentExerciseData.isUnilateral) {
        setCurrentSide('Beide');
      }
    }
  }, [index, currentExerciseData]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (isTimerRunning && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      
      if (phase === 'EXERCISE') {
        setPhase('RATING');
      } else if (phase === 'BREAK') {
        // Wenn Rechts fertig war oder Übung bilateral ist, gehe zum nächsten Programmslot
        if (!currentExerciseData?.isUnilateral || currentSide === 'Rechts') {
          const nextIndex = index + 1;
          setIndex(nextIndex);
          setCurrentSide('Beide'); // Reset für den nächsten Slot
          setPhase('EXERCISE');
          setTimeLeft(programExercises[nextIndex]?.duration || 30);
        } else if (currentSide === 'Links') {
          // Wenn Links fertig war, wechsle auf Rechts im selben Slot
          setCurrentSide('Rechts');
          setPhase('EXERCISE');
          setTimeLeft(currentProgramData?.duration || 30);
        }
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTimerRunning, timeLeft, phase, index, programExercises, currentSide, currentExerciseData, currentProgramData]);

  const handleSkip = () => {
    setIsTimerRunning(false);
    if (phase === 'EXERCISE') {
      setPhase('RATING');
    } else if (phase === 'BREAK') {
      if (!currentExerciseData?.isUnilateral || currentSide === 'Rechts') {
        const nextIndex = index + 1;
        setIndex(nextIndex);
        setCurrentSide('Beide');
        setPhase('EXERCISE');
        setTimeLeft(programExercises[nextIndex]?.duration || 30);
      } else if (currentSide === 'Links') {
        setCurrentSide('Rechts');
        setPhase('EXERCISE');
        setTimeLeft(currentProgramData?.duration || 30);
      }
    }
  };

  const toggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const handleRatingSelection = (ratingValue: number) => {
    if (!currentProgramData || !currentExerciseData) return;

    const currentPerformed: PerformedExercise = {
      name: currentExerciseData.name,
      duration: currentProgramData.duration,
      executionRating: ratingValue,
      side: currentSide,
      bodyRegion: currentExerciseData.bodyRegion || 'Allgemein'
    };

    const updatedExercises = [...completedExercises, currentPerformed];
    setCompletedExercises(updatedExercises);

    // Prüfe, ob das gesamte Programm final durchlaufen ist
    const isLastExercise = index >= programExercises.length - 1;
    const isUnilateralFinished = !currentExerciseData.isUnilateral || currentSide === 'Rechts';

    if (isLastExercise && isUnilateralFinished) {
      if (program) {
        addHistoryEntry({
          id: Date.now().toString(),
          programName: program.name,
          completedExercises: updatedExercises
        });
      }
      setPhase('FINISHED');
    } else {
      setTimeLeft(currentProgramData.breakDuration ?? 10);
      setPhase('BREAK');
      setIsTimerRunning(true); 
    }
  };

  if (phase === 'FINISHED' || !currentProgramData || !currentExerciseData || !program) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-[100dvh] bg-gradient-to-b from-[#0d0f12] via-[#08090a] to-[#030405] text-slate-100 gap-6 select-none fixed inset-0">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-bounce">🏁</div>
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Großartige Arbeit!
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed mt-2">
            Du hast das Programm <strong className="text-emerald-400">{program?.name || 'Unbekannt'}</strong> erfolgreich beendet.
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="w-full max-w-xs py-4 rounded-2xl font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_4px_15px_rgba(16,185,129,0.25)] transition-all active:scale-[0.98]"
        >
          Zurück zum Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between p-6 text-slate-100 bg-gradient-to-b from-[#0d0f12] via-[#08090a] to-[#030405] h-[100dvh] fixed inset-0 box-border overflow-hidden select-none max-w-lg mx-auto">
      
      {/* Header Bereich */}
      <div className="text-center w-full pt-4 px-2 flex-shrink-0">
        <p className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">
          {phase === 'BREAK' ? "Regeneration" : `Übung ${index + 1} von ${programExercises.length}`}
        </p>
        <h1 className="text-xl font-black tracking-tight text-slate-200 truncate mt-1">
          {phase === 'BREAK' ? `Nächste: ${getNextExerciseName(programExercises, library, index, currentSide)}` : currentExerciseData.name}
        </h1>
        {phase === 'EXERCISE' && currentSide !== 'Beide' && (
          <span className={`inline-block border text-[10px] font-extrabold px-3 py-0.5 rounded-lg mt-2.5 tracking-wider uppercase ${
            currentSide === 'Links'
              ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
          }`}>
            Seite: {currentSide}
          </span>
        )}
      </div>

      {/* Dynamischer Mittelteil */}
      <div className="flex flex-col items-center justify-center flex-grow w-full">
        {phase === 'RATING' ? (
          <div className="w-full max-w-sm px-2 animate-fadeIn">
            <p className="text-amber-400 text-xs font-bold text-center mb-5 uppercase tracking-widest">
              Intensität / Schmerz bewerten
            </p>
            <div className="grid grid-cols-5 gap-2.5 w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => handleRatingSelection(num)}
                  className="shadow-sm aspect-square bg-white/[0.02] border border-white/[0.05] rounded-xl font-mono font-black text-lg flex items-center justify-center transition-all active:scale-90 text-slate-300 active:bg-gradient-to-br active:from-emerald-600 active:to-emerald-500 active:text-white"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <span className="text-[110px] font-mono font-black leading-none tracking-tighter tabular-nums text-white">
            {timeLeft}
          </span>
        )}
      </div>

      {/* Info Box */}
      {phase !== 'RATING' && (
        <div className="w-full max-w-sm px-2 flex-shrink-0 h-24 mb-4 flex items-center justify-center">
          {phase === 'EXERCISE' ? (
            currentExerciseData.description ? (
              <div className="bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-2xl text-xs text-slate-400 text-center overflow-y-auto h-full w-full max-h-24 mechanical-scrollbar leading-relaxed">
                {currentExerciseData.description}
              </div>
            ) : (
              <div className="text-slate-600 text-xs italic">Keine Anleitung hinterlegt.</div>
            )
          ) : (
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-2xl text-xs text-emerald-400 font-semibold italic text-center w-full h-full flex items-center justify-center animate-pulse">
              Pause läuft... Atme tief durch.
            </div>
          )}
        </div>
      )}

      {/* Kontrolltasten */}
      {phase !== 'RATING' && (
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm pb-6 flex-shrink-0 px-2">
          <button 
            onClick={toggleTimer} 
            className={`py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.96] ${
              isTimerRunning 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white'
            }`}
          >
            {isTimerRunning ? 'Pause' : 'Start'}
          </button>
          <button 
            onClick={handleSkip} 
            className="bg-white/[0.03] border border-white/[0.05] py-4 rounded-2xl font-bold text-xs uppercase tracking-wider text-slate-300 transition-all active:scale-[0.96]"
          >
            Skip
          </button>
          <button 
            onClick={() => { if(confirm('Workout abbrechen?')) window.location.reload(); }} 
            className="bg-red-500/10 border border-red-500/10 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider text-red-400 transition-all active:scale-[0.96]"
          >
            Abbruch
          </button>
        </div>
      )}
    </div>
  );
};

const getNextExerciseName = (programExercises: any[], library: any[], currentIndex: number, currentSide: string) => {
  const currentSlot = programExercises[currentIndex];
  const currentEx = library.find(e => e.id === currentSlot?.exerciseId);
  
  if (currentEx?.isUnilateral && currentSide === 'Links') {
    return `${currentEx.name} (Rechts)`;
  }

  const nextProgramData = programExercises[currentIndex + 1];
  if (!nextProgramData) return "Fertig";
  const nextEx = library.find(e => e.id === nextProgramData.exerciseId);
  if (!nextEx) return "Fertig";
  return `${nextEx.name} ${nextEx.isUnilateral ? '(Links)' : ''}`;
};

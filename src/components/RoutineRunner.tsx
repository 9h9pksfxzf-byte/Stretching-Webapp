import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useTimer } from '../hooks/useTimer';

interface RoutineRunnerProps {
  programId: string;
  onClose: () => void;
}

export const RoutineRunner = ({ programId, onClose }: RoutineRunnerProps) => {
  const { library, programs } = useStore();
  const [index, setIndex] = useState<number>(0);
  const [isBreak, setIsBreak] = useState<boolean>(false);

  const program = programs.find(p => p.id === programId);
  const programExercises = program ? program.exercises : [];
  const currentProgramData = programExercises[index];
  const currentExerciseData = library.find(e => e.id === currentProgramData?.exerciseId);

  // Abschluss-Screen, wenn alle Übungen durchlaufen sind
  if (!currentProgramData || !currentExerciseData || !program) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-screen text-white gap-8 -mt-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Geschafft! 🏁</h2>
          <p className="text-slate-400">
            Du hast das Programm <strong className="text-white">{program?.name || 'Unbekannt'}</strong> erfolgreich abgeschlossen.
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

  const { timeLeft, isActive, toggle, skip } = useTimer(
    isBreak ? currentProgramData.breakDuration : currentProgramData.duration, 
    () => { 
      if (isBreak) {
        setIsBreak(false);
        setIndex((i: number) => i + 1);
      } else {
        setIsBreak(true);
      }
    }
  );

  const getNextExerciseName = () => {
    const nextProgramData = programExercises[index + 1];
    if (!nextProgramData) return "Fertig";
    const nextEx = library.find(e => e.id === nextProgramData.exerciseId);
    if (!nextEx) return "Fertig";
    return `${nextEx.name} ${nextProgramData.side ? `(${nextProgramData.side})` : ''}`;
  };

  return (
    <div className="flex flex-col items-center p-6 gap-6 text-white pt-24">
      <div className="text-center h-24">
        <p className="text-slate-400 uppercase tracking-widest text-xs mb-2">
          {isBreak ? "Pause" : `Übung ${index + 1} von ${programExercises.length}`}
        </p>
        <h1 className="text-3xl font-bold">
          {isBreak ? `Nächste: ${getNextExerciseName()}` : currentExerciseData.name}
        </h1>
        {!isBreak && currentProgramData.side && (
          <h2 className="text-2xl font-bold text-emerald-500 mt-2">
            Seite: {currentProgramData.side}
          </h2>
        )}
      </div>

      <div className="text-[120px] font-mono font-bold leading-none my-10">{timeLeft}</div>

      <div className="grid grid-cols-3 gap-4 w-full mt-auto">
        <button onClick={toggle} className="bg-slate-800 py-6 rounded-2xl font-bold">
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button onClick={skip} className="bg-slate-800 py-6 rounded-2xl font-bold">Skip</button>
        <button onClick={() => window.location.reload()} className="bg-red-900/30 py-6 rounded-2xl font-bold text-red-400">Reset</button>
      </div>
    </div>
  );
};

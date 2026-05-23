import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useTimer } from '../hooks/useTimer';

export const RoutineRunner = ({ programId }: { programId: string }) => {
  const { library, programs } = useStore();
  const [index, setIndex] = useState<number>(0);
  const [isBreak, setIsBreak] = useState<boolean>(false);

  const program = programs.find(p => p.id === programId);
  const programExercises = program ? program.exercises : [];
  const currentProgramData = programExercises[index];
  const currentExerciseData = library.find(e => e.id === currentProgramData?.exerciseId);

  if (!currentProgramData || !currentExerciseData || !program) {
    return <div className="p-10 text-center text-2xl text-white">Session Complete!</div>;
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
    if (!nextProgramData) return "Done";
    const nextEx = library.find(e => e.id === nextProgramData.exerciseId);
    if (!nextEx) return "Done";
    return `${nextEx.name} ${nextProgramData.side ? `(${nextProgramData.side})` : ''}`;
  };

  return (
    <div className="flex flex-col items-center p-6 gap-6 text-white">
      <div className="text-center">
        <p className="text-slate-400 uppercase tracking-widest text-xs mb-2">
          {isBreak ? "Break" : `Exercise ${index + 1} of ${programExercises.length}`}
        </p>
        <h1 className="text-3xl font-bold">
          {isBreak ? `Next: ${getNextExerciseName()}` : currentExerciseData.name}
        </h1>
        {!isBreak && currentProgramData.side && (
          <h2 className="text-2xl font-bold text-emerald-500 mt-2">
            Seite: {currentProgramData.side}
          </h2>
        )}
      </div>

      <div className="text-[120px] font-mono font-bold leading-none">{timeLeft}</div>

      <div className="grid grid-cols-3 gap-4 w-full">
        <button onClick={toggle} className="bg-slate-800 py-6 rounded-2xl font-bold">
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button onClick={skip} className="bg-slate-800 py-6 rounded-2xl font-bold">Skip</button>
        <button onClick={() => window.location.reload()} className="bg-red-900/30 py-6 rounded-2xl font-bold text-red-400">Reset</button>
      </div>
    </div>
  );
};

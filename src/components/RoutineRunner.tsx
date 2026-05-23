import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useTimer } from '../hooks/useTimer';

export const RoutineRunner = ({ programId }: { programId: string }) => {
  const { library, programs } = useStore();
  const [index, setIndex] = useState<number>(0);
  const [isBreak, setIsBreak] = useState<boolean>(false);

  // Finde das Programm und dessen Übungen
  const program = programs.find(p => p.id === programId);
  const programIds = program ? program.exerciseIds : [];
  const current = library.find(e => e.id === programIds[index]);

  if (!current || !program) return <div className="p-10 text-center text-2xl text-white">Session Complete!</div>;

  const { timeLeft, isActive, toggle, skip } = useTimer(
    isBreak ? current.breakDuration : current.duration, 
    () => { 
      if (isBreak) {
        setIsBreak(false);
        setIndex((i: number) => i + 1);
      } else {
        setIsBreak(true);
      }
    }
  );

  return (
    <div className="flex flex-col items-center p-6 gap-6 text-white">
      <div className="text-center">
        <p className="text-slate-400 uppercase tracking-widest text-xs mb-2">
          {isBreak ? "Break" : `Exercise ${index + 1} of ${programIds.length}`}
        </p>
        <h1 className="text-3xl font-bold">
          {isBreak ? "Next: " + (library.find(e => e.id === programIds[index+1])?.name || "Done") : current.name}
        </h1>
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
};

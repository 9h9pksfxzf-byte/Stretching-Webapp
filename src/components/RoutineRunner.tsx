import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useTimer } from '../hooks/useTimer';

export const RoutineRunner = ({ programType }: { programType: 'kurz' | 'mittel' | 'lang' }) => {
  const { library, programs } = useStore();
  const [index, setIndex] = useState(0);
  const [isBreak, setIsBreak] = useState(false);

  const programIds = programs[programType];
  const currentExercise = library.find(e => e.id === programIds[index]);

  // Wenn Programm beendet
  if (!currentExercise) return <div className="p-10 text-center">Fertig!</div>;

  const duration = isBreak ? currentExercise.breakDuration : currentExercise.duration;

  const { timeLeft, isActive, toggle, skip } = useTimer(duration, () => {
    if (isBreak) {
      setIsBreak(false);
      setIndex(prev => prev + 1);
    } else {
      setIsBreak(true);
    }
  });

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-6">
      <h2 className="text-xl mb-2 text-slate-400">{isBreak ? "Pause" : "Übung"}</h2>
      <h1 className="text-4xl font-bold mb-8">{isBreak ? "Bereit machen..." : currentExercise.name}</h1>
      
      <div className="text-8xl font-mono mb-12">{timeLeft}s</div>

      <div className="flex gap-4">
        <button onClick={toggle} className="px-8 py-4 bg-blue-600 rounded-xl font-bold">
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button onClick={skip} className="px-8 py-4 bg-red-600 rounded-xl font-bold">
          Skip
        </button>
      </div>
    </div>
  );
};

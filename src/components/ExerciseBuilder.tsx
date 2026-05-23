import { useState } from 'react';
import { useStore } from '../store/useStore';

interface ExerciseBuilderProps {
  onClose: () => void;
}

export const ExerciseBuilder = ({ onClose }: ExerciseBuilderProps) => {
  const addExercise = useStore(state => state.addExercise);
  const [name, setName] = useState<string>('');
  const [duration, setDuration] = useState<number>(60);
  const [breakDuration, setBreakDuration] = useState<number>(10);

  const handleSave = () => {
    if (!name.trim()) return;
    
    addExercise({
      id: Date.now().toString(),
      name: name.trim(),
      duration,
      breakDuration
    });
    
    onClose();
  };

  return (
    <div className="p-6 text-white pb-24">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Neue Übung</h2>
        <button onClick={onClose} className="text-slate-400">Abbrechen</button>
      </header>

      <div className="flex flex-col gap-4">
        <input 
          type="text" 
          placeholder="Übungsname (z.B. Couch Stretch)" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-white outline-none focus:border-emerald-500 transition-colors"
        />

        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 flex justify-between items-center">
          <span className="text-slate-300">Dauer (Sekunden)</span>
          <input 
            type="number" 
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="bg-transparent text-right w-20 outline-none font-mono text-xl"
            min="5"
          />
        </div>

        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 flex justify-between items-center">
          <span className="text-slate-300">Pause danach (Sekunden)</span>
          <input 
            type="number" 
            value={breakDuration}
            onChange={(e) => setBreakDuration(Number(e.target.value))}
            className="bg-transparent text-right w-20 outline-none font-mono text-xl"
            min="0"
          />
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-emerald-600 py-4 rounded-xl font-bold mt-4 disabled:opacity-50"
          disabled={!name.trim() || duration <= 0}
        >
          Übung speichern
        </button>
      </div>
    </div>
  );
};

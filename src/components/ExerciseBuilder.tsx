import { useState } from 'react';
import { useStore } from '../store/useStore';

interface ExerciseBuilderProps {
  onClose: () => void;
}

export const ExerciseBuilder = ({ onClose }: ExerciseBuilderProps) => {
  const addExercise = useStore(state => state.addExercise);
  const [name, setName] = useState<string>('');
  const [bodyRegion, setBodyRegion] = useState<string>('');
  const [rating, setRating] = useState<number>(3);

  const handleSave = () => {
    if (!name.trim() || !bodyRegion.trim()) return;
    
    addExercise({
      id: Date.now().toString(),
      name: name.trim(),
      bodyRegion: bodyRegion.trim(),
      rating
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

        <input 
          type="text" 
          placeholder="Körperregion (z.B. Hüfte, Schulter)" 
          value={bodyRegion}
          onChange={(e) => setBodyRegion(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-white outline-none focus:border-emerald-500 transition-colors"
        />

        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
          <span className="text-slate-300 block mb-3">Wie sehr magst du die Übung? (1-5)</span>
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                onClick={() => setRating(num)}
                className={`flex-1 py-3 rounded-lg font-bold border transition-all ${
                  rating === num ? 'bg-emerald-600 border-emerald-500' : 'bg-[#0a0a0a] border-[#333]'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-emerald-600 py-4 rounded-xl font-bold mt-4 disabled:opacity-50"
          disabled={!name.trim() || !bodyRegion.trim()}
        >
          Übung in Bibliothek speichern
        </button>
      </div>
    </div>
  );
};

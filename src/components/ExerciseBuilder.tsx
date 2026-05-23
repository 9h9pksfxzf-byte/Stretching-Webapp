import { useState } from 'react';
import { useStore } from '../store/useStore';

interface ExerciseBuilderProps {
  onClose: () => void;
  exerciseId?: string | null;
}

const BODY_REGIONS = ['Nacken', 'Schultern', 'Brust', 'Rücken', 'Rumpf', 'Hüfte', 'Gesäß', 'Beine', 'Waden', 'Ganzkörper'];

export const ExerciseBuilder = ({ onClose, exerciseId }: ExerciseBuilderProps) => {
  const { library, addExercise, updateExercise } = useStore();
  const existing = exerciseId ? library.find(e => e.id === exerciseId) : null;

  const [name, setName] = useState(existing?.name || '');
  const [bodyRegion, setBodyRegion] = useState(existing?.bodyRegion || BODY_REGIONS[0]);
  const [rating, setRating] = useState(existing?.rating || 3);
  const [isUnilateral, setIsUnilateral] = useState(existing?.isUnilateral || false);
  const [description, setDescription] = useState(existing?.description || ''); // Neu

  const handleSave = () => {
    if (!name.trim()) return;
    
    const data = {
      id: existing?.id || Date.now().toString(),
      name: name.trim(),
      bodyRegion,
      rating,
      isUnilateral,
      description: description.trim() // Neu
    };

    existing ? updateExercise(data.id, data) : addExercise(data);
    onClose();
  };

  return (
    <div className="p-6 text-white bg-[#0a0a0a] min-h-screen pb-24">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">{existing ? 'Übung bearbeiten' : 'Neue Übung'}</h2>
        <button onClick={onClose} className="text-slate-400">Abbrechen</button>
      </header>

      <div className="flex flex-col gap-6">
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Name der Übung</label>
          <input 
            value={name} onChange={(e) => setName(e.target.value)} 
            className="w-full bg-[#1a1a1a] p-4 rounded-xl border border-[#333] text-white focus:outline-none focus:border-emerald-500" 
            placeholder="z.B. Hüftbeuger Dehnung" 
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Beschreibung / Anleitung</label>
          <textarea 
            value={description} onChange={(e) => setDescription(e.target.value)} 
            className="w-full bg-[#1a1a1a] p-4 rounded-xl border border-[#333] text-white h-28 resize-none focus:outline-none focus:border-emerald-500 text-sm" 
            placeholder="Schritt-für-Schritt Anleitung zur richtigen Ausführung..." 
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Körperregion</label>
          <select 
            value={bodyRegion} onChange={(e) => setBodyRegion(e.target.value)}
            className="w-full bg-[#1a1a1a] p-4 rounded-xl border border-[#333] text-white focus:outline-none"
          >
            {BODY_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
          <p className="mb-3 text-sm text-slate-400">Ausführung</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsUnilateral(false)} className={`flex-1 py-3 rounded-lg font-medium transition-colors ${!isUnilateral ? 'bg-emerald-600 text-white' : 'bg-[#0a0a0a] text-slate-400'}`}>Beidseitig</button>
            <button type="button" onClick={() => setIsUnilateral(true)} className={`flex-1 py-3 rounded-lg font-medium transition-colors ${isUnilateral ? 'bg-emerald-600 text-white' : 'bg-[#0a0a0a] text-slate-400'}`}>Pro Seite</button>
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm text-slate-400">Wichtigkeit / Rating (1-5)</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(num => (
              <button type="button" key={num} onClick={() => setRating(num)} className={`flex-1 py-3 rounded-lg font-medium transition-colors ${rating === num ? 'bg-emerald-600 text-white' : 'bg-[#1a1a1a] text-slate-400'}`}>{num}</button>
            ))}
          </div>
        </div>

        <button onClick={handleSave} className="w-full bg-emerald-600 py-4 rounded-xl font-bold mt-4 shadow-lg active:bg-emerald-700">Übung speichern</button>
      </div>
    </div>
  );
};

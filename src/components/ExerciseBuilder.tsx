import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

interface ExerciseBuilderProps {
  exerciseId: string | null;
  onClose: () => void;
}

export const ExerciseBuilder = ({ exerciseId, onClose }: ExerciseBuilderProps) => {
  const { library, addExercise, updateExercise } = useStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bodyRegion, setBodyRegion] = useState('Hüfte');
  const [isUnilateral, setIsUnilateral] = useState(false);
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (exerciseId) {
      const ex = library.find((e) => e.id === exerciseId);
      if (ex) {
        setName(ex.name);
        setDescription(ex.description || '');
        setBodyRegion(ex.bodyRegion);
        setIsUnilateral(ex.isUnilateral);
        setRating(ex.rating || 5);
      }
    }
  }, [exerciseId, library]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const exerciseData = {
      name,
      description,
      bodyRegion,
      isUnilateral,
      rating,
      duration: 30, // Standard-Fallback für das Basis-Interface
    };

    if (exerciseId) {
      updateExercise(exerciseId, exerciseData);
    } else {
      addExercise(exerciseData);
    }
    onClose();
  };

  return (
    <div className="flex flex-col text-slate-100 bg-gradient-to-b from-[#0d0f12] via-[#08090a] to-[#030405] h-[100dvh] fixed inset-0 box-border overflow-hidden p-5 select-none max-w-lg mx-auto">
      <header className="flex justify-between items-center pt-4 pb-2 flex-shrink-0">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">
            {exerciseId ? 'Übung bearbeiten' : 'Neue Übung'}
          </h1>
          <p className="text-sky-400/80 font-medium text-[10px] tracking-wider uppercase mt-0.5">
            Bibliotheks-Konfiguration
          </p>
        </div>
        <button
          onClick={onClose}
          className="bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-white/[0.04] active:scale-95 transition-all"
        >
          Abbrechen
        </button>
      </header>

      <form onSubmit={handleSave} className="flex-grow overflow-y-auto space-y-4 pt-4 pb-24 scrollbar-none">
        <div>
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5 pl-1">Name der Übung</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Quadrizeps Stretch"
            className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 text-slate-200 placeholder-slate-600 transition-colors"
          />
        </div>

        <div>
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5 pl-1">Körperregion</label>
          <select
            value={bodyRegion}
            onChange={(e) => setBodyRegion(e.target.value)}
            className="w-full bg-[#0d1013] border border-white/[0.06] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 text-slate-200 transition-colors"
          >
            <option value="Hüfte">📍 Hüfte</option>
            <option value="Beine">📍 Beine</option>
            <option value="Oberkörper">📍 Oberkörper</option>
            <option value="Rücken">📍 Rücken</option>
            <option value="Sonstige">📍 Sonstige</option>
          </select>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl flex items-center justify-between">
          <div>
            <label className="text-xs font-bold text-slate-200 block">Einseitige Ausführung</label>
            <span className="text-[10px] text-slate-500 block mt-0.5">Erfordert separaten Links/Rechts-Durchlauf</span>
          </div>
          <input
            type="checkbox"
            checked={isUnilateral}
            onChange={(e) => setIsUnilateral(e.target.checked)}
            className="w-5 h-5 accent-sky-500 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5 pl-1">Anleitung / Beschreibung</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Präzise Bewegungsausführung beschreiben..."
            rows={4}
            className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 text-slate-200 placeholder-slate-600 transition-colors resize-none leading-relaxed"
          />
        </div>

        <div>
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5 pl-1">Priorität / Relevanz ({rating}/5)</label>
          <input
            type="range"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1 px-1">
            <span>1 = Optional</span>
            <span>5 = Essentiell</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 mt-6 rounded-xl font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-[0_4px_15px_rgba(56,189,248,0.2)] transition-all active:scale-[0.98]"
        >
          Übung in Bibliothek sichern
        </button>
      </form>
    </div>
  );
};

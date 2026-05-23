import { useState } from 'react';
import { useStore, Exercise } from '../store/useStore';

interface ProgramBuilderProps {
  onClose: () => void;
}

export const ProgramBuilder = ({ onClose }: ProgramBuilderProps) => {
  const { library, addProgram } = useStore();
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleExercise = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!name || selectedIds.length === 0) return;
    
    addProgram({
      id: Date.now().toString(),
      name,
      timeLabel: `${selectedIds.length * 2} min`, // Dummy-Berechnung für die Optik
      icon: '🔥',
      exerciseIds: selectedIds
    });
    
    onClose();
  };

  return (
    <div className="p-6 text-white pb-24">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Neues Programm</h2>
        <button onClick={onClose} className="text-slate-400">Abbrechen</button>
      </header>

      <input 
        type="text" 
        placeholder="Name (z.B. Morning Routine)" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mb-6 text-white outline-none focus:border-emerald-500 transition-colors"
      />

      <h3 className="text-slate-400 mb-4">Übungen auswählen:</h3>
      <div className="flex flex-col gap-3 mb-8">
        {library.map((ex: Exercise) => (
          <button 
            key={ex.id}
            onClick={() => toggleExercise(ex.id)}
            className={`p-4 rounded-xl text-left border transition-all ${
              selectedIds.includes(ex.id) 
                ? 'border-emerald-500 bg-emerald-900/20' 
                : 'border-[#333] bg-[#1a1a1a]'
            }`}
          >
            {ex.name} <span className="text-slate-500 text-sm">({ex.duration}s)</span>
          </button>
        ))}
      </div>

      <button 
        onClick={handleSave}
        className="w-full bg-emerald-600 py-4 rounded-xl font-bold disabled:opacity-50"
        disabled={!name || selectedIds.length === 0}
      >
        Speichern
      </button>
    </div>
  );
};

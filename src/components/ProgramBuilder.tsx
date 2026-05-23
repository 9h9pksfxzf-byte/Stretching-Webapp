import { useState } from 'react';
import { useStore, ProgramExercise } from '../store/useStore';

interface ProgramBuilderProps {
  onClose: () => void;
  programId?: string | null;
}

export const ProgramBuilder = ({ onClose, programId }: ProgramBuilderProps) => {
  const { library, addProgram, updateProgram, programs } = useStore();
  const existing = programs.find((p) => p.id === programId);

  // State-Initialisierung
  const [name, setName] = useState(existing?.name || '');
  const [exercises, setExercises] = useState<ProgramExercise[]>(existing?.exercises || []);

  // Explizite Logik-Funktionen (Wartbarkeit!)
  const addExercise = (exerciseId: string) => {
    const ex = library.find((e) => e.id === exerciseId);
    if (!ex) return;
    setExercises((prev) => [
      ...prev,
      { exerciseId, duration: 30, breakDuration: 10, side: ex.isUnilateral ? 'Links' : undefined },
    ]);
  };

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTime = (index: number, key: keyof ProgramExercise, value: number) => {
    setExercises((prev) => prev.map((ex, i) => (i === index ? { ...ex, [key]: value } : ex)));
  };

  const handleSave = () => {
    if (!name.trim() || exercises.length === 0) return;
    
    const prog = {
      id: existing?.id || Date.now().toString(),
      name,
      timeLabel: `${Math.round(exercises.reduce((a, b) => a + b.duration + b.breakDuration, 0) / 60)} min`,
      icon: '🔥',
      exercises,
    };

    existing ? updateProgram(prog.id, prog) : addProgram(prog);
    onClose();
  };

  return (
    <div className="p-6 text-white pb-32">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">{existing ? 'Programm bearbeiten' : 'Neues Programm'}</h2>
        <button onClick={onClose} className="text-slate-400">Abbrechen</button>
      </header>

      <input 
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mb-6"
        placeholder="Programmname"
      />

      <div className="flex flex-col gap-3 mb-8">
        {exercises.map((pEx, i) => (
          <div key={i} className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
            <div className="flex justify-between mb-3">
              <span className="font-bold">{library.find(e => e.id === pEx.exerciseId)?.name}</span>
              <button onClick={() => removeExercise(i)} className="text-red-500 text-sm">Löschen</button>
            </div>
            <div className="flex gap-4">
              <input type="number" value={pEx.duration} onChange={(e) => updateTime(i, 'duration', Number(e.target.value))} className="w-1/2 bg-[#0a0a0a] p-2 rounded border border-[#333] text-center" />
              <input type="number" value={pEx.breakDuration} onChange={(e) => updateTime(i, 'breakDuration', Number(e.target.value))} className="w-1/2 bg-[#0a0a0a] p-2 rounded border border-[#333] text-center" />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#333] pt-6">
        <h3 className="text-slate-400 mb-4">Bibliothek:</h3>
        <div className="flex flex-wrap gap-2">
          {library.map((ex) => (
            <button key={ex.id} onClick={() => addExercise(ex.id)} className="bg-[#1a1a1a] border border-[#333] px-4 py-2 rounded-full text-sm">
              + {ex.name}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleSave} className="fixed bottom-6 left-6 right-6 bg-emerald-600 py-4 rounded-xl font-bold">
        Speichern
      </button>
    </div>
  );
};

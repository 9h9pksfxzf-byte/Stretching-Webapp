import { useState } from 'react';
import { useStore, ProgramExercise } from '../store/useStore';

interface ProgramBuilderProps {
  onClose: () => void;
}

export const ProgramBuilder = ({ onClose }: ProgramBuilderProps) => {
  const { library, addProgram } = useStore();
  const [name, setName] = useState('');
  const [programExercises, setProgramExercises] = useState<ProgramExercise[]>([]);

  const addExerciseToProgram = (exerciseId: string) => {
    const exercise = library.find(e => e.id === exerciseId);
    if (!exercise) return;

    if (exercise.isUnilateral) {
      setProgramExercises(prev => [
        ...prev, 
        { exerciseId, duration: 30, breakDuration: 10, side: 'Links' },
        { exerciseId, duration: 30, breakDuration: 10, side: 'Rechts' }
      ]);
    } else {
      setProgramExercises(prev => [
        ...prev, 
        { exerciseId, duration: 30, breakDuration: 10 }
      ]);
    }
  };

  const removeExerciseFromProgram = (index: number) => {
    setProgramExercises(prev => prev.filter((_, i) => i !== index));
  };

  const updateTime = (index: number, field: 'duration' | 'breakDuration', value: number) => {
    setProgramExercises(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSave = () => {
    if (!name || programExercises.length === 0) return;
    
    const totalSeconds = programExercises.reduce((acc, curr) => acc + curr.duration + curr.breakDuration, 0);
    const minutes = Math.round(totalSeconds / 60);

    addProgram({
      id: Date.now().toString(),
      name,
      timeLabel: `${minutes} min`,
      icon: '🔥',
      exercises: programExercises
    });
    
    onClose();
  };

  return (
    <div className="p-6 text-white pb-32">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Neues Programm</h2>
        <button onClick={onClose} className="text-slate-400">Abbrechen</button>
      </header>

      <input 
        type="text" 
        placeholder="Name (z.B. Morning Routine)" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mb-6 text-white outline-none focus:border-emerald-500"
      />

      <div className="mb-8">
        <h3 className="text-slate-400 mb-4">Übungen im Programm:</h3>
        {programExercises.length === 0 && <p className="text-sm text-slate-500">Noch keine Übungen hinzugefügt.</p>}
        
        <div className="flex flex-col gap-3">
          {programExercises.map((pEx, index) => {
            const exInfo = library.find(e => e.id === pEx.exerciseId);
            if (!exInfo) return null;
            return (
              <div key={`${pEx.exerciseId}-${index}`} className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold">
                    {exInfo.name} {pEx.side && <span className="text-emerald-500">({pEx.side})</span>}
                  </span>
                  <button onClick={() => removeExerciseFromProgram(index)} className="text-red-500 text-sm">Entfernen</button>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col w-1/2">
                    <label className="text-xs text-slate-400 mb-1">Dauer (s)</label>
                    <input type="number" value={pEx.duration} onChange={(e) => updateTime(index, 'duration', Number(e.target.value))} className="bg-[#0a0a0a] rounded p-2 text-center border border-[#333]"/>
                  </div>
                  <div className="flex flex-col w-1/2">
                    <label className="text-xs text-slate-400 mb-1">Pause (s)</label>
                    <input type="number" value={pEx.breakDuration} onChange={(e) => updateTime(index, 'breakDuration', Number(e.target.value))} className="bg-[#0a0a0a] rounded p-2 text-center border border-[#333]"/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-8 border-t border-[#333] pt-6">
        <h3 className="text-slate-400 mb-4">Aus Bibliothek hinzufügen:</h3>
        <div className="flex gap-2 overflow-x-auto pb-4">
          {library.map((ex) => (
            <button 
              key={ex.id}
              onClick={() => addExerciseToProgram(ex.id)}
              className="whitespace-nowrap px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-full text-sm hover:border-emerald-500 shrink-0"
            >
              + {ex.name} {ex.isUnilateral && '(2x)'}
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="w-full bg-emerald-600 py-4 rounded-xl font-bold disabled:opacity-50 fixed bottom-6 left-6 right-6"
        style={{ width: 'calc(100% - 48px)' }}
        disabled={!name || programExercises.length === 0}
      >
        Programm speichern
      </button>
    </div>
  );
};

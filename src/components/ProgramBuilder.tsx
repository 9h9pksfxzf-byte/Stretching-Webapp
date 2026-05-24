import { useState, useEffect } from 'react';
import { useStore, ProgramExercise } from '../store/useStore';

interface ProgramBuilderProps {
  programId: string | null;
  onClose: () => void;
}

interface LocalSelectedExercise {
  exerciseId: string;
  duration: number;
  breakDuration: number;
}

export const ProgramBuilder = ({ programId, onClose }: ProgramBuilderProps) => {
  const { library, programs, addProgram, updateProgram } = useStore();

  const [name, setName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<LocalSelectedExercise[]>([]);

  useEffect(() => {
    if (programId) {
      const prog = programs.find((p) => p.id === programId);
      if (prog) {
        setName(prog.name);
        
        // Mapping stellt sicher, dass breakDuration niemals undefined an den lokalen Zustand geht
        const mappedExercises = (prog.exercises || []).map((ex) => ({
          exerciseId: ex.exerciseId,
          duration: ex.duration,
          breakDuration: ex.breakDuration ?? 15, // Fallback auf 15 Sekunden
        }));
        setSelectedExercises(mappedExercises);
      }
    }
  }, [programId, programs]);

  const handleAddExerciseSlot = (exerciseId: string) => {
    setSelectedExercises((prev) => [
      ...prev,
      { exerciseId, duration: 45, breakDuration: 15 },
    ]);
  };

  const handleRemoveSlot = (indexToRemove: number) => {
    setSelectedExercises((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUpdateSlot = (index: number, key: 'duration' | 'breakDuration', value: number) => {
    setSelectedExercises((prev) =>
      prev.map((slot, idx) => (idx === index ? { ...slot, [key]: value } : slot))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedExercises.length === 0) return;

    // Entspricht exakt der Definition im Store-Interface (ohne timeLabel)
    const programData = {
      name,
      exercises: selectedExercises as ProgramExercise[],
    };

    if (programId) {
      updateProgram(programId, programData);
    } else {
      addProgram(programData);
    }
    onClose();
  };

  return (
    <div className="flex flex-col text-slate-100 bg-gradient-to-b from-[#0d0f12] via-[#08090a] to-[#030405] h-[100dvh] fixed inset-0 box-border overflow-hidden p-5 select-none max-w-lg mx-auto z-50">
      <header className="flex justify-between items-center pt-4 pb-2 flex-shrink-0">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">
            {programId ? 'Programm editieren' : 'Neues Programm'}
          </h1>
          <p className="text-emerald-400/80 font-medium text-[10px] tracking-wider uppercase mt-0.5">
            Routine-Strukturierung
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
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5 pl-1">Programm-Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Full Body Flow"
            className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-slate-200 placeholder-slate-600 transition-colors"
          />
        </div>

        {/* Ausgewählte Übungen im Programm */}
        <div className="space-y-2.5">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block pl-1">Ablauf-Reihenfolge</label>
          {selectedExercises.length === 0 ? (
            <div className="bg-white/[0.01] border border-white/[0.04] rounded-xl p-4 text-center text-xs text-slate-500 italic">
              Füge unten Übungen aus der Bibliothek hinzu.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedExercises.map((slot, idx) => {
                const exData = library.find((e) => e.id === slot.exerciseId);
                return (
                  <div key={idx} className="bg-white/[0.02] border border-white/[0.04] p-3.5 rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-mono font-bold bg-white/[0.05] px-1.5 py-0.5 rounded text-slate-400 mr-2">#{idx+1}</span>
                        <span className="text-xs font-bold text-slate-200">{exData?.name || 'Gelöschte Übung'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(idx)}
                        className="text-[10px] text-red-400 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/10 active:scale-90"
                      >
                        Entfernen
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] text-slate-500 uppercase tracking-wider block mb-1">Dauer (Sekunden)</label>
                        <input
                          type="number"
                          value={slot.duration}
                          min="5"
                          onChange={(e) => handleUpdateSlot(idx, 'duration', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-white/[0.04] rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 uppercase tracking-wider block mb-1">Pause (Sekunden)</label>
                        <input
                          type="number"
                          value={slot.breakDuration}
                          min="0"
                          onChange={(e) => handleUpdateSlot(idx, 'breakDuration', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-white/[0.04] rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hinzufügbare Übungen aus Library */}
        <div className="space-y-2 pt-2">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block pl-1">Aus Bibliothek hinzufügen</label>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-0.5 unique-scrollbar">
            {library.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => handleAddExerciseSlot(ex.id)}
                className="w-full text-left bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.03] p-2.5 rounded-xl flex justify-between items-center text-xs active:scale-[0.99] transition-all"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="font-bold text-slate-300 truncate">{ex.name}</div>
                  <div className="text-[9px] text-slate-500 truncate mt-0.5">{ex.bodyRegion}</div>
                </div>
                <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">+</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 mt-4 rounded-xl font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_4px_15px_rgba(16,185,129,0.2)] transition-all active:scale-[0.98]"
        >
          Programm-Ablauf speichern
        </button>
      </form>
    </div>
  );
};

import { useState } from 'react';
import { useStore, Program } from '../store/useStore';

interface ProgramGridProps {
  onStartProgram: (programId: string) => void;
  onEditProgram: (programId: string) => void;
  onCreateProgram: () => void;
}

export const ProgramGrid = ({ onStartProgram, onEditProgram, onCreateProgram }: ProgramGridProps) => {
  const { programs, deleteProgram } = useStore();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Berechnet das zeitliche Gesamtvolumen dynamisch aus den Übungen und Pausen
  const calculateTotalTime = (program: Program) => {
    const totalSeconds = (program.exercises || []).reduce((sum, ex) => {
      return sum + ex.duration + (ex.breakDuration ?? 15);
    }, 0);
    return `${Math.ceil(totalSeconds / 60)} Min`;
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      deleteProgram(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-black tracking-tight text-slate-200">Deine Programme</h2>
          <p className="text-[10px] text-slate-500 font-medium">Wähle eine vordefinierte Routine</p>
        </div>
        <button
          onClick={onCreateProgram}
          className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase tracking-wider px-3 py-2 rounded-xl active:scale-95 transition-all"
        >
          + Neu
        </button>
      </div>

      {(!programs || programs.length === 0) ? (
        <div className="text-center text-xs text-slate-600 italic py-8 border border-dashed border-white/[0.03] rounded-2xl">
          Keine Programme vorhanden. Erstelle dein erstes Programm.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {programs.map((program) => (
            <div
              key={program.id}
              onClick={() => onStartProgram(program.id)}
              className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] p-4 rounded-2xl flex justify-between items-center transition-all active:scale-[0.99] cursor-pointer group"
            >
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                  {program.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono text-slate-400 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.02]">
                    ⏳ {calculateTotalTime(program)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.02]">
                    🧘 {(program.exercises || []).length} Übungen
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditProgram(program.id);
                  }}
                  className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] text-slate-400 text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all active:scale-90"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => handleDeleteClick(e, program.id)}
                  onMouseLeave={() => setConfirmDeleteId(null)}
                  className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all active:scale-90 border ${
                    confirmDeleteId === program.id
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-red-500/5 hover:bg-red-500/10 border-red-500/10 text-red-400/80'
                  }`}
                >
                  {confirmDeleteId === program.id ? 'Sicher?' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

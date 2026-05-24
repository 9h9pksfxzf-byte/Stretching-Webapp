import { useStore } from '../store/useStore';

interface ProgramGridProps {
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
}

export const ProgramGrid = ({ onSelect, onEdit }: ProgramGridProps) => {
  const { programs, deleteProgram } = useStore();

  if (!programs || programs.length === 0) {
    return (
      <div className="bg-white/[0.01] border border-white/[0.04] rounded-2xl p-8 text-center text-xs text-slate-500 italic mt-4">
        Keine Programme vorhanden. Erstelle dein erstes oben rechts!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3.5 mt-2">
      {programs.map((program) => {
        // Berechnung der Gesamtdauer des Programms
        const totalSeconds = (program.exercises || []).reduce((sum, ex) => sum + (ex.duration || 0) + (ex.breakDuration || 0), 0);
        const totalMinutes = Math.ceil(totalSeconds / 60);

        return (
          <div 
            key={program.id}
            className="group bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/[0.05] rounded-2xl p-4 flex justify-between items-center shadow-lg hover:border-white/[0.1] transition-all relative overflow-hidden"
          >
            {/* Minimalistischer Schein im Hintergrund */}
            <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-all" />

            <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onSelect(program.id)}>
              <h3 className="font-bold text-base text-slate-200 tracking-tight truncate group-hover:text-emerald-400 transition-colors">
                {program.name}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide mt-1 flex items-center gap-2">
                <span>⏱️ {totalMinutes} Min</span>
                <span className="text-slate-600">•</span>
                <span>🏋️ {(program.exercises || []).length} Übungen</span>
                {program.timeLabel && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-emerald-400/80 font-semibold">{program.timeLabel}</span>
                  </>
                )}
              </p>
            </div>

            {/* Funktionale Buttons diskret an der rechten Seite */}
            <div className="flex gap-2 ml-4 shrink-0 z-10">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(program.id); }}
                className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.04] flex items-center justify-center text-xs text-slate-300 transition-all active:scale-90"
                title="Bearbeiten"
              >
                ✏️
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); if (confirm('Programm löschen?')) deleteProgram(program.id); }}
                className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 flex items-center justify-center text-xs text-red-400 transition-all active:scale-90"
                title="Löschen"
              >
                🗑️
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

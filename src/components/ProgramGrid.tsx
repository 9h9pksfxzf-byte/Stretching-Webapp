import { useStore } from '../store/useStore';

interface ProgramGridProps {
  onSelect: (programId: string) => void;
}

export const ProgramGrid = ({ onSelect }: ProgramGridProps) => {
  const programs = useStore((state) => state.programs);

  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      {programs.map((p) => (
        <button 
          key={p.id} 
          onClick={() => onSelect(p.id)} 
          className="flex flex-col items-center justify-center p-4 bg-[#1a1a1a] rounded-2xl border border-[#333] hover:border-emerald-500 transition-all active:scale-95"
        >
          <span className="text-2xl mb-2">{p.icon}</span>
          <span className="font-bold text-sm text-center">{p.name}</span>
          <span className="text-[10px] text-slate-500">{p.timeLabel}</span>
        </button>
      ))}
    </div>
  );
};

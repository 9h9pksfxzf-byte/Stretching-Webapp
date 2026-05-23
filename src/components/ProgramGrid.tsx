import { useStore } from '../store/useStore';

interface ProgramGridProps {
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
}

export const ProgramGrid = ({ onSelect, onEdit }: ProgramGridProps) => {
  const { programs, deleteProgram } = useStore();

  return (
    <div className="grid grid-cols-1 gap-4">
      {programs.map(prog => (
        <div key={prog.id} className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333] flex justify-between items-center">
          <div onClick={() => onSelect(prog.id)} className="flex-1 cursor-pointer">
            <h3 className="font-bold">{prog.name}</h3>
            <p className="text-sm text-slate-400">{prog.timeLabel}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEdit(prog.id)} className="text-xs bg-[#2a2a2a] px-3 py-1 rounded">Bearbeiten</button>
            <button onClick={() => deleteProgram(prog.id)} className="text-xs text-red-500">Löschen</button>
          </div>
        </div>
      ))}
    </div>
  );
};

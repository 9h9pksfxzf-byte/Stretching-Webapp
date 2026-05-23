interface ProgramGridProps {
  onSelect: (type: 'kurz' | 'mittel' | 'lang') => void;
}

export const ProgramGrid = ({ onSelect }: ProgramGridProps) => {
  const programs = [
    { type: 'kurz' as const, label: 'Kurz', time: '15 min' },
    { type: 'mittel' as const, label: 'Mittel', time: '30 min' },
    { type: 'lang' as const, label: 'Lang', time: '45 min' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {programs.map((p) => (
        <button key={p.type} onClick={() => onSelect(p.type)} className="btn-card">
          <span className="text-2xl mb-1">⏱</span>
          <span className="font-bold">{p.label}</span>
          <span className="text-[10px] text-slate-500">{p.time}</span>
        </button>
      ))}
    </div>
  );
};

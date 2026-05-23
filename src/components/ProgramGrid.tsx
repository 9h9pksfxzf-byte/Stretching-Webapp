interface ProgramGridProps {
  onSelect: (type: 'kurz' | 'mittel' | 'lang') => void;
}

export const ProgramGrid = ({ onSelect }: ProgramGridProps) => {
  const programs = [
    { type: 'kurz' as const, label: 'Kurz', time: '15 min', icon: '⏱' },
    { type: 'mittel' as const, label: 'Mittel', time: '30 min', icon: '⏳' },
    { type: 'lang' as const, label: 'Lang', time: '45 min', icon: '⌛' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      {programs.map((p) => (
        <button 
          key={p.type} 
          onClick={() => onSelect(p.type)} 
          className="flex flex-col items-center justify-center p-4 bg-[#1a1a1a] rounded-2xl border border-[#333] hover:border-emerald-500 transition-all active:scale-95"
        >
          <span className="text-2xl mb-2">{p.icon}</span>
          <span className="font-bold text-sm">{p.label}</span>
          <span className="text-[10px] text-slate-500">{p.time}</span>
        </button>
      ))}
    </div>
  );
};

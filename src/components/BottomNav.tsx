type TabState = 'home' | 'library' | 'history' | 'settings';

interface BottomNavProps {
  activeTab: TabState;
  onChange: (tab: TabState) => void;
}

export const BottomNav = ({ activeTab, onChange }: BottomNavProps) => {
  const tabs = [
    { id: 'home', label: 'Start', icon: '🏠' },
    { id: 'library', label: 'Bibliothek', icon: '📚' },
    { id: 'history', label: 'Verlauf', icon: '⏱️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0d1013]/80 backdrop-blur-lg border-t border-white/[0.06] h-16 flex items-center justify-around px-4 z-40 max-w-lg mx-auto sm:rounded-t-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-col items-center gap-1 flex-1 py-1 text-[10px] font-bold tracking-wide transition-all active:scale-95 ${
              isActive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : 'opacity-70'}`}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};

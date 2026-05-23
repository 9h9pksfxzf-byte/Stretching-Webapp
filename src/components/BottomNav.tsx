interface BottomNavProps {
  activeTab: string;
  onChange: (tab: 'home' | 'library' | 'history' | 'settings') => void;
}

export const BottomNav = ({ activeTab, onChange }: BottomNavProps) => {
  const tabs = [
    { id: 'home', name: 'Start', icon: '🏠' },
    { id: 'library', name: 'Bibliothek', icon: '📚' },
    { id: 'history', name: 'Verlauf', icon: '🕒' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
  ] as const;

  return (
    <nav className="fixed bottom-0 w-full bg-[#0a0a0a] border-t border-[#333] flex justify-around p-4 pb-6 z-40">
      {tabs.map((tab) => (
        <button 
          key={tab.id} 
          onClick={() => onChange(tab.id)}
          className={`flex flex-col items-center gap-1 text-[10px] transition-colors ${
            activeTab === tab.id ? 'text-emerald-500' : 'text-slate-500'
          }`}
        >
          <span className="text-xl">{tab.icon}</span>
          {tab.name}
        </button>
      ))}
    </nav>
  );
};

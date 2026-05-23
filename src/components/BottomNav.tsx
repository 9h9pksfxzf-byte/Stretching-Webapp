export const BottomNav = () => {
  const tabs = [
    { name: 'Library', icon: '📚' },
    { name: 'Programs', icon: '📋' },
    { name: 'History', icon: '🕒' },
    { name: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-[#0a0a0a] border-t border-[#333] flex justify-around p-4 pb-6">
      {tabs.map((tab) => (
        <button key={tab.name} className="flex flex-col items-center gap-1 text-[10px] text-slate-400">
          <span className="text-xl">{tab.icon}</span>
          {tab.name}
        </button>
      ))}
    </nav>
  );
};

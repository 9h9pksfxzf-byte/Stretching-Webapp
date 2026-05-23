import { useState } from 'react';
import { RoutineRunner } from './components/RoutineRunner';

type ViewState = 'menu' | 'active';

export default function App() {
  const [view, setView] = useState<ViewState>('menu');
  const [program, setProgram] = useState<'kurz' | 'mittel' | 'lang'>('kurz');

  const startProgram = (type: 'kurz' | 'mittel' | 'lang') => {
    setProgram(type);
    setView('active');
  };

  if (view === 'active') {
    return (
      <div className="bg-slate-950 min-h-screen text-white">
        <button onClick={() => setView('menu')} className="p-4 text-slate-500">← Zurück</button>
        <RoutineRunner programType={program} />
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen p-6 text-white">
      <h1 className="text-2xl font-bold mb-8">My Stretch Library</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {(['kurz', 'mittel', 'lang'] as const).map((type) => (
          <button 
            key={type}
            onClick={() => startProgram(type)}
            className="aspect-square bg-emerald-600 rounded-2xl flex flex-col items-center justify-center font-bold capitalize"
          >
            {type}
          </button>
        ))}
      </div>
      <div className="bg-slate-900 p-6 rounded-2xl">
        <h2 className="text-sm text-slate-400 mb-2">Ready to start?</h2>
        <p className="text-lg">Select a program to begin your session.</p>
      </div>
    </div>
  );
}

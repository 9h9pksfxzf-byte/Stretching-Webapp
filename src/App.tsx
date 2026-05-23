import { useState } from 'react';
import { RoutineRunner } from './components/RoutineRunner';
import { ProgramGrid } from './components/ProgramGrid';
import { BottomNav } from './components/BottomNav';

export default function App() {
  const [view, setView] = useState<'menu' | 'active'>('menu');
  const [program, setProgram] = useState<'kurz' | 'mittel' | 'lang'>('kurz');

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pb-24">
      {view === 'active' ? (
        // Active Training View
        <div className="relative">
          <button 
            onClick={() => setView('menu')} 
            className="absolute top-4 left-4 p-2 text-slate-500 z-10"
          >
            ← Back
          </button>
          <RoutineRunner programType={program} />
        </div>
      ) : (
        // Menu View
        <main className="p-6">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">My Stretch Library</h1>
            <button className="text-2xl">+</button>
          </header>
          
          <ProgramGrid onSelect={(type) => { 
            setProgram(type); 
            setView('active'); 
          }} />

          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#333]">
            <h2 className="text-sm text-slate-400 mb-2">Ready to start?</h2>
            <p className="text-lg">Select a program to begin your session.</p>
          </div>
        </main>
      )}

      {/* Die BottomNav soll im Menü-Modus immer sichtbar sein */}
      {view === 'menu' && <BottomNav />}
    </div>
  );
}

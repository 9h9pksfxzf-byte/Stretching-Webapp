import { useState } from 'react';
import { RoutineRunner } from './components/RoutineRunner';
import { ProgramGrid } from './components/ProgramGrid';
import { BottomNav } from './components/BottomNav';
import { ProgramBuilder } from './components/ProgramBuilder';
import { ExerciseBuilder } from './components/ExerciseBuilder';

type ViewState = 'menu' | 'active' | 'build-program' | 'build-exercise';

export default function App() {
  const [view, setView] = useState<ViewState>('menu');
  const [activeProgramId, setActiveProgramId] = useState<string>('');

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pb-24">
      {view === 'active' && (
        <div className="relative">
          <button 
            onClick={() => setView('menu')} 
            className="absolute top-4 left-4 p-2 text-slate-500 z-10"
          >
            ← Back
          </button>
          <RoutineRunner programId={activeProgramId} />
        </div>
      )}

      {view === 'build-program' && (
        <ProgramBuilder onClose={() => setView('menu')} />
      )}

      {view === 'build-exercise' && (
        <ExerciseBuilder onClose={() => setView('menu')} />
      )}

      {view === 'menu' && (
        <main className="p-6">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Library</h1>
            <div className="flex gap-2">
              <button 
                onClick={() => setView('build-exercise')} 
                className="text-xs font-bold bg-[#1a1a1a] border border-[#333] px-3 py-2 rounded-lg text-slate-300 hover:border-emerald-500"
              >
                + Übung
              </button>
              <button 
                onClick={() => setView('build-program')} 
                className="text-xs font-bold bg-emerald-900/30 text-emerald-500 border border-emerald-500/30 px-3 py-2 rounded-lg hover:bg-emerald-900/50"
              >
                + Programm
              </button>
            </div>
          </header>
          
          <ProgramGrid onSelect={(id) => { 
            setActiveProgramId(id); 
            setView('active'); 
          }} />

          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#333]">
            <h2 className="text-sm text-slate-400 mb-2">Ready to start?</h2>
            <p className="text-lg">Select a program to begin your session.</p>
          </div>
        </main>
      )}

      {view === 'menu' && <BottomNav />}
    </div>
  );
}

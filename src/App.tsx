import { useState } from 'react';
import { RoutineRunner } from './components/RoutineRunner';
import { ProgramGrid } from './components/ProgramGrid';
import { BottomNav } from './components/BottomNav';
import { ProgramBuilder } from './components/ProgramBuilder';
import { ExerciseBuilder } from './components/ExerciseBuilder';
import { useStore, Exercise } from './store/useStore';

type TabState = 'home' | 'library' | 'history' | 'settings';
type OverlayState = 'none' | 'active' | 'build-program' | 'build-exercise';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabState>('home');
  const [overlay, setOverlay] = useState<OverlayState>('none');
  
  // IDs für die Bearbeitung von Programmen und Übungen
  const [activeProgramId, setActiveProgramId] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const { library, deleteExercise } = useStore();

  const groupedLibrary = library.reduce((acc, ex) => {
    const region = ex.bodyRegion || 'Sonstige';
    if (!acc[region]) acc[region] = [];
    acc[region].push(ex);
    return acc;
  }, {} as Record<string, Exercise[]>);

  // --- OVERLAY-LOGIK ---
  
  if (overlay === 'active') {
    return (
      <div className="bg-[#0a0a0a] min-h-screen text-white relative">
        <button onClick={() => setOverlay('none')} className="absolute top-4 left-4 p-2 text-slate-500 z-10">← Zurück</button>
        <RoutineRunner programId={activeProgramId} onClose={() => setOverlay('none')} />
      </div>
    );
  }

  if (overlay === 'build-program') {
    return (
      <div className="bg-[#0a0a0a] min-h-screen">
        <ProgramBuilder 
          programId={editingId} 
          onClose={() => { setOverlay('none'); setEditingId(null); }} 
        />
      </div>
    );
  }

  if (overlay === 'build-exercise') {
    return (
      <div className="bg-[#0a0a0a] min-h-screen">
        <ExerciseBuilder 
          exerciseId={editingId} 
          onClose={() => { setOverlay('none'); setEditingId(null); }} 
        />
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pb-24">
      <main className="p-6">
        
        {/* START-BILDSCHIRM */}
        {currentTab === 'home' && (
          <section>
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Start</h1>
              <button 
                onClick={() => { setEditingId(null); setOverlay('build-program'); }} 
                className="text-xs font-bold bg-emerald-900/30 text-emerald-500 border border-emerald-500/30 px-3 py-2 rounded-lg"
              >
                + Programm
              </button>
            </header>
            <ProgramGrid onSelect={(id) => { setActiveProgramId(id); setOverlay('active'); }} onEdit={(id) => { setEditingId(id); setOverlay('build-program'); }} />
          </section>
        )}

        {/* BIBLIOTHEK */}
        {currentTab === 'library' && (
          <section>
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Bibliothek</h1>
              <button 
                onClick={() => { setEditingId(null); setOverlay('build-exercise'); }} 
                className="text-xs font-bold bg-[#1a1a1a] border border-[#333] px-3 py-2 rounded-lg text-slate-300"
              >
                + Übung
              </button>
            </header>
            
            <div className="flex flex-col gap-6">
              {Object.entries(groupedLibrary).map(([region, exercises]) => (
                <div key={region}>
                  <h2 className="text-sm font-bold text-slate-400 uppercase mb-3 border-b border-[#333] pb-2">{region}</h2>
                  <div className="flex flex-col gap-3">
                    {exercises.map(ex => (
                      <div key={ex.id} className="bg-[#1a1a1a] border border-[#333] p-4 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="font-bold">{ex.name}</p>
                          <p className="text-xs text-slate-500">{ex.isUnilateral ? 'Pro Seite' : 'Beidseitig'}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingId(ex.id); setOverlay('build-exercise'); }} className="text-xs bg-[#2a2a2a] px-3 py-1 rounded">Bearbeiten</button>
                          <button onClick={() => deleteExercise(ex.id)} className="text-xs text-red-500">Löschen</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {currentTab === 'history' && <section><header><h1 className="text-2xl font-bold">Verlauf</h1></header></section>}
        {currentTab === 'settings' && <section><header><h1 className="text-2xl font-bold">Einstellungen</h1></header></section>}

      </main>
      <BottomNav activeTab={currentTab} onChange={setCurrentTab} />
    </div>
  );
}

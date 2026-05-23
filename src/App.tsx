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
  const [activeProgramId, setActiveProgramId] = useState<string>('');
  
  const library = useStore(state => state.library);

  const groupedLibrary = library.reduce((acc, ex) => {
    const region = ex.bodyRegion || 'Sonstige';
    if (!acc[region]) acc[region] = [];
    acc[region].push(ex);
    return acc;
  }, {} as Record<string, Exercise[]>);

  if (overlay === 'active') {
    return (
      <div className="bg-[#0a0a0a] min-h-screen text-white relative">
        <button 
          onClick={() => setOverlay('none')} 
          className="absolute top-4 left-4 p-2 text-slate-500 z-10"
        >
          ← Back
        </button>
        <RoutineRunner programId={activeProgramId} />
      </div>
    );
  }

  if (overlay === 'build-program') {
    return <div className="bg-[#0a0a0a] min-h-screen"><ProgramBuilder onClose={() => setOverlay('none')} /></div>;
  }

  if (overlay === 'build-exercise') {
    return <div className="bg-[#0a0a0a] min-h-screen"><ExerciseBuilder onClose={() => setOverlay('none')} /></div>;
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pb-24">
      <main className="p-6">
        
        {currentTab === 'home' && (
          <section>
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Start</h1>
              <button 
                onClick={() => setOverlay('build-program')} 
                className="text-xs font-bold bg-emerald-900/30 text-emerald-500 border border-emerald-500/30 px-3 py-2 rounded-lg"
              >
                + Programm
              </button>
            </header>
            <ProgramGrid onSelect={(id) => { 
              setActiveProgramId(id); 
              setOverlay('active'); 
            }} />
          </section>
        )}

        {currentTab === 'library' && (
          <section>
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Bibliothek</h1>
              <button 
                onClick={() => setOverlay('build-exercise')} 
                className="text-xs font-bold bg-[#1a1a1a] border border-[#333] px-3 py-2 rounded-lg text-slate-300"
              >
                + Übung
              </button>
            </header>
            
            <div className="flex flex-col gap-6">
              {Object.entries(groupedLibrary).map(([region, exercises]) => (
                <div key={region}>
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-[#333] pb-2">
                    {region}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {exercises.map(ex => (
                      <div key={ex.id} className="bg-[#1a1a1a] border border-[#333] p-4 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="font-bold">{ex.name}</p>
                          <p className="text-xs text-slate-500">
                            Ausführung: {ex.isUnilateral ? 'Pro Seite' : 'Beidseitig'} | Rating: {ex.rating}/5
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {currentTab === 'history' && (
          <section>
            <header className="mb-8"><h1 className="text-2xl font-bold">Verlauf</h1></header>
            <div className="text-center text-slate-500 mt-20 border border-dashed border-[#333] p-8 rounded-2xl">
              Noch keine Sessions protokolliert.
            </div>
          </section>
        )}

        {currentTab === 'settings' && (
          <section>
            <header className="mb-8"><h1 className="text-2xl font-bold">Einstellungen</h1></header>
            <div className="bg-[#1a1a1a] border border-[#333] p-4 rounded-xl">
              <p className="text-sm text-slate-400">App-Einstellungen (bald verfügbar)</p>
            </div>
          </section>
        )}

      </main>

      <BottomNav activeTab={currentTab} onChange={setCurrentTab} />
    </div>
  );
}

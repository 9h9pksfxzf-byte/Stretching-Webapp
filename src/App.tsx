import { useState } from 'react';
import { RoutineRunner } from './components/RoutineRunner';
import { ProgramGrid } from './components/ProgramGrid';
import { BottomNav } from './components/BottomNav';
import { ProgramBuilder } from './components/ProgramBuilder';
import { ExerciseBuilder } from './components/ExerciseBuilder';
import { HistoryView } from './components/HistoryView';
import { useStore, Exercise } from './store/useStore';

type TabState = 'home' | 'library' | 'history' | 'settings';
type OverlayState = 'none' | 'active' | 'build-program' | 'build-exercise';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabState>('home');
  const [overlay, setOverlay] = useState<OverlayState>('none');
  const [activeProgramId, setActiveProgramId] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const { library, deleteExercise, programs } = useStore();

  const exportData = () => {
    const data = JSON.stringify({ library, programs });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stretching-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        if (content.library && content.programs) {
          useStore.setState({ library: content.library, programs: content.programs });
          alert('Daten erfolgreich importiert!');
        }
      } catch (err) {
        alert('Fehler beim Importieren der Datei.');
      }
    };
    reader.readAsText(file);
  };

  const groupedLibrary = library.reduce((acc, ex) => {
    const region = ex.bodyRegion || 'Sonstige';
    if (!acc[region]) acc[region] = [];
    acc[region].push(ex);
    return acc;
  }, {} as Record<string, Exercise[]>);

  if (overlay === 'active') return (
    <div className="bg-gradient-to-b from-[#0d0f12] to-[#030405] min-h-screen text-slate-100 relative">
      <button 
        onClick={() => setOverlay('none')} 
        className="absolute top-5 left-5 px-4 py-2 text-xs font-bold bg-white/[0.04] border border-white/[0.08] backdrop-blur-md rounded-xl text-slate-300 z-10 active:scale-95 transition-all"
      >
        ← Zurück
      </button>
      <RoutineRunner programId={activeProgramId} onClose={() => setOverlay('none')} />
    </div>
  );

  if (overlay === 'build-program') return (
    <div className="bg-gradient-to-b from-[#0d0f12] to-[#030405] min-h-screen">
      <ProgramBuilder programId={editingId} onClose={() => { setOverlay('none'); setEditingId(null); }} />
    </div>
  );

  if (overlay === 'build-exercise') return (
    <div className="bg-gradient-to-b from-[#0d0f12] to-[#030405] min-h-screen">
      <ExerciseBuilder exerciseId={editingId} onClose={() => { setOverlay('none'); setEditingId(null); }} />
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-[#0d0f12] via-[#08090a] to-[#030405] min-h-screen text-slate-100 pb-28">
      <main className="p-5 max-w-lg mx-auto">
        
        {/* START-BILDSCHIRM */}
        {currentTab === 'home' && (
          <section className="animate-fadeIn">
            <header className="flex justify-between items-center mb-6 pt-4">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Start</h1>
                <p className="text-emerald-400/80 font-medium text-[11px] tracking-wider uppercase mt-0.5">Wähle eine Routine</p>
              </div>
              <button 
                onClick={() => { setEditingId(null); setOverlay('build-program'); }} 
                className="text-xs font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.2)] px-4 py-2.5 rounded-xl active:scale-95 transition-all"
              >
                + Programm
              </button>
            </header>
            <ProgramGrid onSelect={(id) => { setActiveProgramId(id); setOverlay('active'); }} onEdit={(id) => { setEditingId(id); setOverlay('build-program'); }} />
          </section>
        )}

        {/* BIBLIOTHEK */}
        {currentTab === 'library' && (
          <section className="animate-fadeIn">
            <header className="flex justify-between items-center mb-6 pt-4">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Bibliothek</h1>
                <p className="text-sky-400/80 font-medium text-[11px] tracking-wider uppercase mt-0.5">Übungsverzeichnis</p>
              </div>
              <button 
                onClick={() => { setEditingId(null); setOverlay('build-exercise'); }} 
                className="text-xs font-bold bg-white/[0.04] border border-white/[0.08] backdrop-blur-md px-4 py-2.5 rounded-xl text-slate-200 active:scale-95 transition-all"
              >
                + Übung
              </button>
            </header>
            
            <div className="flex flex-col gap-6">
              {Object.keys(groupedLibrary).length === 0 ? (
                <div className="text-center text-xs text-slate-600 italic pt-12">Noch keine Übungen angelegt.</div>
              ) : (
                Object.entries(groupedLibrary).map(([region, exercises]) => (
                  <div key={region} className="space-y-3">
                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 border-l-2 border-sky-500/50">{region}</h2>
                    <div className="flex flex-col gap-3">
                      {exercises.map(ex => (
                        <div key={ex.id} className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl flex justify-between items-center gap-4 shadow-sm">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-200 truncate text-sm">{ex.name}</p>
                            <p className="text-[10px] text-sky-400 font-semibold tracking-wide mt-1">
                              {ex.isUnilateral ? '🔄 Einseitig' : '🤝 Beidseitig'} {ex.rating ? `| ★ ${ex.rating}/5` : ''}
                            </p>
                            {ex.description && (
                              <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed bg-white/[0.01] p-2 rounded-xl border border-white/[0.02]">{ex.description}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <button onClick={() => { setEditingId(ex.id); setOverlay('build-exercise'); }} className="text-[11px] font-bold bg-white/[0.04] text-slate-300 px-3 py-1.5 rounded-xl border border-white/[0.04] active:scale-95 transition-all">Edit</button>
                            <button onClick={() => deleteExercise(ex.id)} className="text-[11px] font-bold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/10 active:scale-95 transition-all">Del</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* VERLAUF */}
        {currentTab === 'history' && (
          <HistoryView />
        )}

        {/* EINSTELLUNGEN */}
        {currentTab === 'settings' && (
          <section className="animate-fadeIn">
            <header className="mb-6 pt-4">
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Einstellungen</h1>
              <p className="text-amber-400/80 font-medium text-[11px] tracking-wider uppercase mt-0.5">System & Backup</p>
            </header>
            <div className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl flex flex-col gap-4 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/[0.04] pb-2">Datensicherung</h3>
              <button onClick={exportData} className="w-full bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.05] p-3.5 rounded-xl text-xs font-bold text-slate-200 transition-all active:scale-[0.98]">
                📦 Daten exportieren (JSON)
              </button>
              <label className="w-full bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-400 p-3.5 rounded-xl border border-emerald-500/20 text-center text-xs font-bold cursor-pointer transition-all active:scale-[0.98] block">
                📥 Daten importieren
                <input type="file" accept=".json" className="hidden" onChange={importData} />
              </label>
            </div>
          </section>
        )}

      </main>
      <BottomNav activeTab={currentTab} onChange={setCurrentTab} />
    </div>
  );
}

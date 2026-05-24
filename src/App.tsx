import { useState } from 'react';
import { RoutineRunner } from './components/RoutineRunner';
import { ProgramGrid } from './components/ProgramGrid';
import { BottomNav } from './components/BottomNav';
import { ProgramBuilder } from './components/ProgramBuilder';
import { ExerciseBuilder } from './components/ExerciseBuilder';
import { HistoryView } from './components/HistoryView'; // Fehlender Import hinzugefügt!
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
    <div className="bg-[#0a0a0a] min-h-screen text-white relative">
      <button onClick={() => setOverlay('none')} className="absolute top-4 left-4 p-2 text-slate-500 z-10">← Zurück</button>
      <RoutineRunner programId={activeProgramId} onClose={() => setOverlay('none')} />
    </div>
  );

  if (overlay === 'build-program') return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <ProgramBuilder programId={editingId} onClose={() => { setOverlay('none'); setEditingId(null); }} />
    </div>
  );

  if (overlay === 'build-exercise') return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <ExerciseBuilder exerciseId={editingId} onClose={() => { setOverlay('none'); setEditingId(null); }} />
    </div>
  );

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pb-24">
      <main className="p-6">
        
        {/* START-BILDSCHIRM */}
        {currentTab === 'home' && (
          <section>
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Start</h1>
              <button onClick={() => { setEditingId(null); setOverlay('build-program'); }} className="text-xs font-bold bg-emerald-900/30 text-emerald-500 border border-emerald-500/30 px-3 py-2 rounded-lg">+ Programm</button>
            </header>
            <ProgramGrid onSelect={(id) => { setActiveProgramId(id); setOverlay('active'); }} onEdit={(id) => { setEditingId(id); setOverlay('build-program'); }} />
          </section>
        )}

        {/* BIBLIOTHEK */}
        {currentTab === 'library' && (
          <section>
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Bibliothek</h1>
              <button onClick={() => { setEditingId(null); setOverlay('build-exercise'); }} className="text-xs font-bold bg-[#1a1a1a] border border-[#333] px-3 py-2 rounded-lg text-slate-300">+ Übung</button>
            </header>
            <div className="flex flex-col gap-6">
              {Object.entries(groupedLibrary).map(([region, exercises]) => (
                <div key={region}>
                  <h2 className="text-sm font-bold text-slate-400 uppercase mb-3 border-b border-[#333] pb-2">{region}</h2>
                  <div className="flex flex-col gap-3">
                    {exercises.map(ex => (
                      <div key={ex.id} className="bg-[#1a1a1a] border border-[#333] p-4 rounded-xl flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white truncate">{ex.name}</p>
                          <p className="text-[11px] text-emerald-500 font-medium mt-0.5">{ex.isUnilateral ? 'Pro Seite' : 'Beidseitig'} | ★ {ex.rating}/5</p>
                          {ex.description && (
                            <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{ex.description}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <button onClick={() => { setEditingId(ex.id); setOverlay('build-exercise'); }} className="text-xs bg-[#2a2a2a] px-3 py-1.5 rounded-lg border border-[#444]">Edit</button>
                          <button onClick={() => deleteExercise(ex.id)} className="text-xs text-red-400 bg-red-950/20 px-3 py-1.5 rounded-lg border border-red-900/30">Del</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* VERLAUF (Hier wurde die Lücke geschlossen!) */}
        {currentTab === 'history' && (
          <HistoryView />
        )}

        {/* EINSTELLUNGEN */}
        {currentTab === 'settings' && (
          <section>
            <header className="mb-8"><h1 className="text-2xl font-bold">Einstellungen</h1></header>
            <div className="bg-[#1a1a1a] border border-[#333] p-6 rounded-xl flex flex-col gap-4">
              <h3 className="font-bold">Datensicherung</h3>
              <button onClick={exportData} className="w-full bg-[#2a2a2a] p-3 rounded-lg border border-[#444] text-sm">Daten exportieren (JSON)</button>
              <label className="w-full bg-emerald-900/30 text-emerald-500 p-3 rounded-lg border border-emerald-500/30 text-center text-sm cursor-pointer">
                Daten importieren
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

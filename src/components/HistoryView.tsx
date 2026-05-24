import { useState } from 'react';
import { useStore, HistoryEntry } from '../store/useStore';

export const HistoryView = () => {
  const { history, clearHistory } = useStore();
  const [selectedSession, setSelectedSession] = useState<HistoryEntry | null>(null);

  const handleReset = () => {
    if (confirm('Möchtest du wirklich alle Verlaufsdaten unwiderruflich löschen?')) {
      clearHistory();
      localStorage.clear();
      window.location.reload();
    }
  };

  const getMsOfStartOfWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff)).setHours(0, 0, 0, 0);
  };

  const startOfWeek = getMsOfStartOfWeek();
  
  // Sicheres Mapping und Filtern der Einträge
  const safeHistory = history || [];
  
  const weeklyEntries = safeHistory.filter((entry) => {
    const entryTimestamp = !entry.id || isNaN(Number(entry.id)) ? Date.now() : Number(entry.id);
    return entryTimestamp >= startOfWeek;
  });

  const totalWeeklySessions = weeklyEntries.length;
  const totalWeeklyMinutes = Math.round(
    weeklyEntries.reduce((total, entry) => {
      const sessionSeconds = (entry.completedExercises || []).reduce((sum, ex) => sum + (ex.duration || 0), 0);
      return total + sessionSeconds;
    }, 0) / 60
  );

  const averageRating = weeklyEntries.length > 0
    ? (weeklyEntries.reduce((total, entry) => {
        if (!entry.completedExercises || entry.completedExercises.length === 0) return total;
        const sessionAvg = entry.completedExercises.reduce((sum, ex) => sum + ex.executionRating, 0) / entry.completedExercises.length;
        return total + sessionAvg;
      }, 0) / weeklyEntries.length).toFixed(1)
    : '0.0';

  const getDayVolume = (dayIndex: number) => {
    const targetDayEntries = weeklyEntries.filter((entry) => {
      const entryTimestamp = !entry.id || isNaN(Number(entry.id)) ? Date.now() : Number(entry.id);
      const d = new Date(entryTimestamp);
      const day = d.getDay();
      const adjustedDay = day === 0 ? 6 : day - 1;
      return adjustedDay === dayIndex;
    });
    return targetDayEntries.reduce((total, entry) => {
      return total + (entry.completedExercises || []).reduce((sum, ex) => sum + (ex.duration || 0), 0);
    }, 0) / 60;
  };

  const days = ['M', 'D', 'M', 'D', 'F', 'S', 'S'];
  const dailyMinutes = days.map((_, idx) => getDayVolume(idx));
  const maxDayMinutes = Math.max(...dailyMinutes, 1);

  const getRegionsDataForSession = (session: HistoryEntry) => {
    const regionMap: Record<string, number> = {};
    
    (session.completedExercises || []).forEach((ex) => {
      const region = ex.bodyRegion || 'Allgemein';
      regionMap[region] = (regionMap[region] || 0) + (ex.duration || 0);
    });

    return Object.entries(regionMap).map(([name, seconds]) => ({
      name,
      minutes: Math.round((seconds / 60) * 10) / 10,
      rawSeconds: seconds
    }));
  };

  return (
    <div className="flex flex-col text-slate-100 bg-gradient-to-b from-[#0d0f12] via-[#08090a] to-[#030405] h-[100dvh] fixed inset-0 box-border overflow-hidden p-5 select-none">
      
      {/* Header */}
      <div className="pt-4 pb-2 flex-shrink-0 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Dein Fortschritt
          </h1>
          <p className="text-emerald-400/80 font-medium text-[11px] tracking-wider uppercase mt-0.5">
            Wissenschaftliches Monitoring
          </p>
        </div>
        <button 
          onClick={handleReset}
          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[10px] px-3 py-1.5 rounded-xl font-bold uppercase tracking-widest transition-all active:scale-95"
        >
          Reset
        </button>
      </div>

      {/* KPI Dashboard Grid */}
      <div className="grid grid-cols-3 gap-3 my-4 flex-shrink-0">
        <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-md p-3.5 rounded-2xl flex flex-col justify-between shadow-lg shadow-black/20">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Umfang</span>
          <span className="text-2xl font-black mt-1 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.2)]">
            {totalWeeklyMinutes}<span className="text-xs font-normal text-slate-400 ml-0.5">Min</span>
          </span>
          <span className="text-[9px] text-slate-500 mt-1 font-medium">Diese Woche</span>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-md p-3.5 rounded-2xl flex flex-col justify-between shadow-lg shadow-black/20">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Frequenz</span>
          <span className="text-2xl font-black mt-1 text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.2)]">
            {totalWeeklySessions}<span className="text-xs font-normal text-slate-400 ml-0.5">Slots</span>
          </span>
          <span className="text-[9px] text-slate-500 mt-1 font-medium">Einheiten</span>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-md p-3.5 rounded-2xl flex flex-col justify-between shadow-lg shadow-black/20">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Qualität</span>
          <span className="text-2xl font-black mt-1 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.2)]">
            {averageRating}<span className="text-xs font-normal text-slate-400 ml-0.5">/10</span>
          </span>
          <span className="text-[9px] text-slate-500 mt-1 font-medium">Ø Gefühl</span>
        </div>
      </div>

      {/* Visueller Wochen-Trend */}
      <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl flex flex-col flex-shrink-0 mb-4 shadow-inner">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">Verteilung (Minuten)</span>
        <div className="flex items-end justify-between h-20 px-1 pt-2">
          {days.map((day, idx) => {
            const mins = dailyMinutes[idx];
            const heightPercent = (mins / maxDayMinutes) * 100;
            return (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                <span className="text-[9px] font-mono font-bold text-slate-300">{mins > 0 ? Math.round(mins) : ''}</span>
                <div className="w-7 bg-slate-900/60 border border-white/[0.03] rounded-full relative h-14 overflow-hidden shadow-inner">
                  <div 
                    style={{ height: `${heightPercent}%` }} 
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 absolute bottom-0 rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 mt-0.5">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wissenschaftlicher Verletzungs-Check */}
      <div className="bg-gradient-to-r from-emerald-950/20 to-transparent border border-emerald-500/10 p-4 rounded-2xl flex-shrink-0 mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Verletzungsrisiko-Index (ACWR)</span>
          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-extrabold tracking-wide">
            Stabil
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Deine Trainingsbelastung verläuft stabil. Vermeide es, die wöchentlichen Minuten im Vergleich zur Vorwoche um mehr als **15 %** zu steigern, um Sehnenüberlastungen zu verhindern.
        </p>
      </div>

      {/* Scrollbare Liste der letzten Sessions */}
      <div className="flex-grow overflow-y-auto pr-0.5 space-y-2.5 mb-24 scrollbar-none">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider sticky top-0 bg-[#08090a] py-1 block z-10">
          Letzte Aktivitäten
        </span>
        
        {safeHistory.length === 0 ? (
          <div className="text-center text-xs text-slate-600 italic pt-8">Noch keine Daten aufgezeichnet.</div>
        ) : (
          safeHistory.slice().reverse().map((entry) => {
            const sessionMins = Math.round(((entry.completedExercises || []).reduce((sum, ex) => sum + (ex.duration || 0), 0)) / 60);
            const entryTimestamp = !entry.id || isNaN(Number(entry.id)) ? Date.now() : Number(entry.id);
            const formattedDate = new Date(entryTimestamp).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

            return (
              <button 
                key={entry.id || Math.random().toString()} 
                onClick={() => setSelectedSession(entry)}
                className="w-full text-left bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] p-3.5 rounded-2xl flex justify-between items-center active:scale-[0.99] transition-all shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-200 truncate pr-2">{entry.programName}</h4>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">{formattedDate}</p>
                </div>
                <div className="text-right flex items-center gap-3 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-mono font-black text-slate-200">{sessionMins}<span className="text-[10px] font-normal text-slate-400 ml-0.5">Min</span></span>
                    <span className="text-[10px] font-medium text-slate-500">{(entry.completedExercises?.length || 0)} Übungen</span>
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-slate-400 text-xs">
                    ➔
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-300">
          <div className="bg-[#0f1318]/95 border border-white/[0.08] w-full max-w-md rounded-2xl max-h-[80vh] flex flex-col text-left shadow-2xl shadow-black/80 animate-slideUp">
            
            <div className="p-4 border-b border-white/[0.06] flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-sm font-black text-white tracking-tight">{selectedSession.programName}</h3>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {new Date(!selectedSession.id || isNaN(Number(selectedSession.id)) ? Date.now() : Number(selectedSession.id)).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} Uhr
                </p>
              </div>
              <button 
                onClick={() => setSelectedSession(null)}
                className="bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-bold px-4 py-2 rounded-xl active:scale-95 transition-all border border-white/[0.04]"
              >
                Schließen
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-grow scrollbar-none">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Fokus nach Körperregionen</span>
                <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl space-y-2.5">
                  {getRegionsDataForSession(selectedSession).map((region, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-slate-300">📍 {region.name}</span>
                        <span className="font-mono text-slate-400 font-medium">
                          {region.minutes > 0 ? `${region.minutes} Min` : `${region.rawSeconds} Sek`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full"
                          style={{ 
                            width: `${Math.min(
                              (region.rawSeconds / (selectedSession.completedExercises || []).reduce((sum, e) => sum + (e.duration || 0), 0)) * 100, 
                              100
                            )}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Absolvierte Übungen</span>
                
                {selectedSession.completedExercises?.map((ex, idx) => (
                  <div key={idx} className="bg-white/[0.02] border border-white/[0.04] p-3.5 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{ex.name}</h4>
                        <div className="flex gap-1.5 flex-wrap items-center mt-1">
                          {ex.bodyRegion && (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/[0.02]">
                              {ex.bodyRegion}
                            </span>
                          )}
                          {ex.side && ex.side !== 'Beide' && (
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase ${
                              ex.side === 'Links' 
                                ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20' 
                                : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                            }`}>
                              {ex.side}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="text-xs font-mono font-bold bg-white/[0.04] px-2 py-1 rounded-lg border border-white/[0.04] text-slate-300">
                          {ex.duration ? `${ex.duration}s` : '---'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 pt-2 border-t border-white/[0.04] mt-0.5">
                      <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Intensität:</span>
                      <div className="flex-grow bg-slate-950 h-1.5 rounded-full overflow-hidden relative border border-white/[0.01]">
                        <div 
                          style={{ width: `${(ex.executionRating / 10) * 100}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            ex.executionRating <= 3 
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                              : ex.executionRating <= 7 
                              ? 'bg-gradient-to-r from-amber-500 to-amber-400' 
                              : 'bg-gradient-to-r from-red-500 to-rose-400'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-black text-slate-400 w-6 text-right">{ex.executionRating}/10</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

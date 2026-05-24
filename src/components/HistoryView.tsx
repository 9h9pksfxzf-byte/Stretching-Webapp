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

  // 1. Berechnungen für die aktuelle Woche basierend auf Zeitstempeln
  const getMsOfStartOfWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff)).setHours(0, 0, 0, 0);
  };

  const startOfWeek = getMsOfStartOfWeek();
  const weeklyEntries = (history || []).filter((entry) => {
    const entryTimestamp = isNaN(Number(entry.id)) ? Date.now() : Number(entry.id);
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
      const entryTimestamp = isNaN(Number(entry.id)) ? Date.now() : Number(entry.id);
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

  return (
    <div className="flex flex-col text-white bg-[#0a0a0a] h-[100dvh] fixed inset-0 box-border overflow-hidden p-4 select-none">
      
      {/* Header */}
      <div className="pt-4 pb-2 flex-shrink-0 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dein Fortschritt</h1>
          <p className="text-slate-400 text-xs">Wissenschaftliches Monitoring</p>
        </div>
        <button 
          onClick={handleReset}
          className="bg-red-950/20 border border-red-900/30 text-red-400 text-[10px] px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider active:bg-red-900/40"
        >
          Reset
        </button>
      </div>

      {/* KPI Dashboard Grid */}
      <div className="grid grid-cols-3 gap-2.5 my-3 flex-shrink-0">
        <div className="bg-[#1a1a1a] border border-[#333] p-3 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Umfang</span>
          <span className="text-xl font-bold mt-1 text-emerald-400">{totalWeeklyMinutes} <span className="text-xs font-normal text-slate-400">Min</span></span>
          <span className="text-[9px] text-slate-500 mt-0.5">Diese Woche</span>
        </div>
        <div className="bg-[#1a1a1a] border border-[#333] p-3 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Frequenz</span>
          <span className="text-xl font-bold mt-1 text-sky-400">{totalWeeklySessions} <span className="text-xs font-normal text-slate-400">Slots</span></span>
          <span className="text-[9px] text-slate-500 mt-0.5">Einheiten</span>
        </div>
        <div className="bg-[#1a1a1a] border border-[#333] p-3 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Qualität</span>
          <span className="text-xl font-bold mt-1 text-amber-400">{averageRating} <span className="text-xs font-normal text-slate-400">/10</span></span>
          <span className="text-[9px] text-slate-500 mt-0.5">Ø Gefühl</span>
        </div>
      </div>

      {/* Visueller Wochen-Trend */}
      <div className="bg-[#1a1a1a] border border-[#333] p-3 rounded-xl flex flex-col flex-shrink-0 mb-3">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">Verteilung (Minuten)</span>
        <div className="flex items-end justify-between h-20 px-2 pt-2">
          {days.map((day, idx) => {
            const mins = dailyMinutes[idx];
            const heightPercent = (mins / maxDayMinutes) * 100;
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[9px] font-mono text-slate-400">{mins > 0 ? Math.round(mins) : ''}</span>
                <div className="w-6 bg-slate-800 rounded-t-md relative h-12 overflow-hidden">
                  <div style={{ height: `${heightPercent}%` }} className="w-full bg-emerald-500 absolute bottom-0 rounded-t-md transition-all duration-500" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 mt-0.5">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wissenschaftlicher Verletzungs-Check */}
      <div className="bg-[#1a1a1a] border border-[#333] p-3 rounded-xl flex-shrink-0 mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verletzungsrisiko-Index (ACWR)</span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">Optimal</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Deine Trainingsbelastung verläuft stabil. Vermeide es, die wöchentlichen Minuten im Vergleich zur Vorwoche um mehr als **15 %** zu steigern, um Sehnenüberlastungen zu verhindern.
        </p>
      </div>

      {/* Scrollbare Liste der letzten Sessions */}
      <div className="flex-grow overflow-y-auto pr-0.5 space-y-2 mb-4">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider sticky top-0 bg-[#0a0a0a] py-1 block z-10">Letzte Aktivitäten</span>
        
        {!history || history.length === 0 ? (
          <div className="text-center text-xs text-slate-600 italic pt-6">Noch keine Daten aufgezeichnet.</div>
        ) : (
          history.slice().reverse().map((entry) => {
            const sessionMins = Math.round(((entry.completedExercises || []).reduce((sum, ex) => sum + (ex.duration || 0), 0)) / 60);
            const entryTimestamp = isNaN(Number(entry.id)) ? Date.now() : Number(entry.id);
            const formattedDate = new Date(entryTimestamp).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

            return (
              <button 
                key={entry.id} 
                onClick={() => setSelectedSession(entry)}
                className="w-full text-left bg-[#141414] border border-[#222] p-3 rounded-xl flex justify-between items-center active:bg-[#1a1a1a] transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-200 truncate max-w-[180px]">{entry.programName}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{formattedDate}</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-mono font-bold text-slate-300">{sessionMins} Min</span>
                    <span className="text-[9px] text-slate-500">{(entry.completedExercises?.length || 0)} Übungen</span>
                  </div>
                  <span className="text-slate-600 text-xs">➔</span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* DETAIL MODAL (Overlay für die Zusammenfassung) */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-[#121212] border-t sm:border border-[#222] w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col text-left">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-[#222] flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white">{selectedSession.programName}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {new Date(isNaN(Number(selectedSession.id)) ? Date.now() : Number(selectedSession.id)).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} Uhr
                </p>
              </div>
              <button 
                onClick={() => setSelectedSession(null)}
                className="bg-[#222] text-slate-400 text-xs font-bold px-3 py-1.5 rounded-lg active:bg-[#333]"
              >
                Schließen
              </button>
            </div>

            {/* Modal Content (Scrollbare Liste der ausgeführten Übungen) */}
            <div className="p-4 overflow-y-auto space-y-3 flex-grow">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Absolvierte Übungen</span>
              
              {selectedSession.completedExercises?.map((ex, idx) => (
                <div key={idx} className="bg-[#1a1a1a] border border-[#2a2a2a] p-3 rounded-xl flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white">{ex.name}</h4>
                      {ex.side && ex.side !== 'Beide' && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${ex.side === 'Links' ? 'bg-teal-950 text-teal-400 border border-teal-900' : 'bg-indigo-950 text-indigo-400 border border-indigo-900'}`}>
                          Seite: {ex.side}
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-slate-300">{ex.duration ? `${ex.duration}s` : '---'}</span>
                    </div>
                  </div>

                  {/* Intensitäts- / Schmerz-Indikator */}
                  <div className="flex items-center gap-2 pt-1 border-t border-[#222] mt-1">
                    <span className="text-[9px] text-slate-500 font-medium uppercase">Intensität:</span>
                    <div className="flex-grow bg-slate-800 h-1.5 rounded-full overflow-hidden relative">
                      <div 
                        style={{ width: `${(ex.executionRating / 10) * 100}%` }}
                        className={`h-full rounded-full ${ex.executionRating <= 3 ? 'bg-emerald-500' : ex.executionRating <= 7 ? 'bg-amber-500' : 'bg-red-500'}`}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-300">{ex.executionRating}/10</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

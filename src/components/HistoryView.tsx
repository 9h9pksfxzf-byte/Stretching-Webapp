import { useStore } from '../store/useStore';

export const HistoryView = () => {
  const { history, clearHistory } = useStore();

  const handleReset = () => {
    clearHistory();
    localStorage.clear();
    window.location.reload();
  };

  // Falls der Speicher korrupt ist, fangen wir den Absturz hier ab und zeigen den Reset-Button
  try {
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
        <div className="pt-4 pb-2 flex-shrink-0 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dein Fortschritt</h1>
            <p className="text-slate-400 text-xs">Wissenschaftliches Monitoring</p>
          </div>
          <button 
            onClick={handleReset}
            className="bg-red-950/40 border border-red-900/50 text-red-400 text-[10px] px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider active:bg-red-900/60"
          >
            Reset Data
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-3 gap-2.5 my-3 flex-shrink-0">
          <div className="bg-[#1a1a1a] border border-[#333] p-3 rounded-xl flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Umfang</span>
            <span className="text-xl font-bold mt-1 text-emerald-400">{totalWeeklyMinutes} <span className="text-xs font-normal text-slate-400">Min</span></span>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333] p-3 rounded-xl flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Frequenz</span>
            <span className="text-xl font-bold mt-1 text-sky-400">{totalWeeklySessions} <span className="text-xs font-normal text-slate-400">Slots</span></span>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333] p-3 rounded-xl flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Qualität</span>
            <span className="text-xl font-bold mt-1 text-amber-400">{averageRating} <span className="text-xs font-normal text-slate-400">/10</span></span>
          </div>
        </div>

        {/* Bar Chart */}
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
                    <div style={{ height: `${heightPercent}%` }} className="w-full bg-emerald-500 absolute bottom-0 rounded-t-md" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-0.5">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Letzte Aktivitäten */}
        <div className="flex-grow overflow-y-auto pr-0.5 space-y-2 mb-4">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider sticky top-0 bg-[#0a0a0a] py-1 block z-10">Letzte Aktivitäten</span>
          {(!history || history.length === 0) ? (
            <div className="text-center text-xs text-slate-600 italic pt-6">Noch keine Daten aufgezeichnet.</div>
          ) : (
            history.slice().reverse().map((entry) => {
              const sessionMins = Math.round(((entry.completedExercises || []).reduce((sum, ex) => sum + (ex.duration || 0), 0)) / 60);
              const entryTimestamp = isNaN(Number(entry.id)) ? Date.now() : Number(entry.id);
              const formattedDate = new Date(entryTimestamp).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
              return (
                <div key={entry.id} className="bg-[#141414] border border-[#222] p-3 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 truncate max-w-[180px]">{entry.programName}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{formattedDate}</p>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-xs font-mono font-bold text-slate-300">{sessionMins} Min</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  } catch (e) {
    // Falls die alten Daten den Code crashen, erzwingen wir diese Ansicht, damit du clearen kannst!
    return (
      <div className="flex flex-col items-center justify-center text-white bg-[#0a0a0a] h-[100dvh] fixed inset-0 p-6 gap-4">
        <p className="text-sm text-center text-slate-400">Alte, inkompatible Verlaufsdaten blockieren die Anzeige.</p>
        <button onClick={handleReset} className="bg-red-600 px-6 py-3 rounded-xl font-bold text-sm w-full max-w-xs">
          Datenbank bereinigen & starten
        </button>
      </div>
    );
  }
};
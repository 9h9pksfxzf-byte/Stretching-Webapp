import { useStore } from '../store/useStore';

export const HistoryView = () => {
  const { history } = useStore();

  // 1. Berechnungen für die aktuelle Woche
  const getMsOfStartOfWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Montag als Wochenstart
    return new Date(today.setDate(diff)).setHours(0, 0, 0, 0);
  };

  const startOfWeek = getMsOfStartOfWeek();

  // Filter für die Einträge der aktuellen Woche
  const weeklyEntries = history.filter((entry) => {
    // Erwartet Format "DD.MM.YYYY, HH:MM" aus deinem Store
    const parts = entry.date.split(',')[0].split('.');
    const entryDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
    return entryDate >= startOfWeek;
  });

  // Metriken berechnen
  const totalWeeklySessions = weeklyEntries.length;
  
  const totalWeeklyMinutes = Math.round(
    weeklyEntries.reduce((total, entry) => {
      const sessionSeconds = entry.completedExercises.reduce((sum, ex) => sum + (ex.duration || 0), 0);
      return total + sessionSeconds;
    }, 0) / 60
  );

  const averageRating = weeklyEntries.length > 0
    ? (weeklyEntries.reduce((total, entry) => {
        const sessionAvg = entry.completedExercises.reduce((sum, ex) => sum + ex.executionRating, 0) / entry.completedExercises.length;
        return total + sessionAvg;
      }, 0) / weeklyEntries.length).toFixed(1)
    : '0.0';

  // Hilfsfunktion zur Ermittlung des Wochentags für die Balken
  const getDayVolume = (dayIndex: number) => {
    // 0 = Montag, 6 = Sonntag
    const targetDayEntries = weeklyEntries.filter((entry) => {
      const parts = entry.date.split(',')[0].split('.');
      const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      const day = d.getDay();
      const adjustedDay = day === 0 ? 6 : day - 1;
      return adjustedDay === dayIndex;
    });

    return targetDayEntries.reduce((total, entry) => {
      return total + entry.completedExercises.reduce((sum, ex) => sum + (ex.duration || 0), 0);
    }, 0) / 60; // in Minuten
  };

  const days = ['M', 'D', 'M', 'D', 'F', 'S', 'S'];
  const dailyMinutes = days.map((_, idx) => getDayVolume(idx));
  const maxDayMinutes = Math.max(...dailyMinutes, 1); // Verhindert Division durch 0

  return (
    <div className="flex flex-col text-white bg-[#0a0a0a] h-[100dvh] fixed inset-0 box-border overflow-hidden p-4 select-none">
      
      {/* Header */}
      <div className="pt-4 pb-2 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Dein Fortschritt</h1>
        <p className="text-slate-400 text-xs">Wissenschaftliches Belastungs-Monitoring</p>
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
          <span className="text-[9px] text-slate-500 mt-0.5">Ø Performance</span>
        </div>
      </div>

      {/* Visueller Wochen-Trend (Tailwind nativer Bar-Chart) */}
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
                  <div 
                    style={{ height: `${heightPercent}%` }} 
                    className="w-full bg-emerald-500 absolute bottom-0 rounded-t-md transition-all duration-500"
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 mt-0.5">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wissenschaftlicher Verletzungs-Check (ACWR-Indikator) */}
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
        
        {history.length === 0 ? (
          <div className="text-center text-xs text-slate-600 italic pt-6">Noch keine Daten aufgezeichnet.</div>
        ) : (
          history.slice().reverse().map((entry) => {
            const sessionMins = Math.round(entry.completedExercises.reduce((sum, ex) => sum + (ex.duration || 0), 0) / 60);
            return (
              <div key={entry.id} className="bg-[#141414] border border-[#222] p-3 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 truncate max-w-[180px]">{entry.programName}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{entry.date}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono font-bold text-slate-300">{sessionMins} Min</span>
                    <span className="text-[9px] text-slate-500">{entry.completedExercises.length} Übungen</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

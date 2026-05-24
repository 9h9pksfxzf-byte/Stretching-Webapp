import { useState, useMemo } from 'react';
import { useStore, HistoryEntry } from '../store/useStore';

export const HistoryView = () => {
  const { history, clearHistory } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleReset = () => {
    if (confirm('Möchtest du wirklich alle Verlaufsdaten unwiderruflich löschen?')) {
      clearHistory();
      localStorage.clear();
      window.location.reload();
    }
  };

  const startOfWeek = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff)).setHours(0, 0, 0, 0);
  }, []);

  const stats = useMemo(() => {
    const safeHistory = history || [];
    const reversed = [...safeHistory].reverse();

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

    const dailyMinutes = Array(7).fill(0);
    weeklyEntries.forEach((entry) => {
      const entryTimestamp = !entry.id || isNaN(Number(entry.id)) ? Date.now() : Number(entry.id);
      const d = new Date(entryTimestamp);
      const day = d.getDay();
      const adjustedDay = day === 0 ? 6 : day - 1;
      const durationMin = (entry.completedExercises || []).reduce((sum, ex) => sum + (ex.duration || 0), 0) / 60;
      dailyMinutes[adjustedDay] += durationMin;
    });

    const maxDayMinutes = Math.max(...dailyMinutes, 1);

    return {
      reversedList: reversed,
      totalWeeklyMinutes,
      totalWeeklySessions,
      averageRating,
      dailyMinutes,
      maxDayMinutes
    };
  }, [history, startOfWeek]);

  const getRegionsDataForSession = (session: HistoryEntry) => {
    const regionMap: Record<string, number> = {};
    let totalSeconds = 0;
    
    (session.completedExercises || []).forEach((ex) => {
      const region = ex.bodyRegion || 'Allgemein';
      regionMap[region] = (regionMap[region] || 0) + (ex.duration || 0);
      totalSeconds += ex.duration || 0;
    });

    return Object.entries(regionMap).map(([name, seconds]) => ({
      name,
      minutes: Math.round((seconds / 60) * 10) / 10,
      percentage: totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0
    }));
  };

  const toggleAccordion = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const days = ['M', 'D', 'M', 'D', 'F', 'S', 'S'];

  return (
    <div className="flex flex-col text-slate-100 bg-gradient-to-b from-[#0d0f12] via-[#08090a] to-[#030405] h-[100dvh] fixed inset-0 box-border overflow-hidden p-5 select-none max-w-lg mx-auto">
      
      <div className="pt-4 pb-2 flex-shrink-0 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Dein Fortschritt
          </h1>
          <p className="text-emerald-400/80 font-medium text-[11px] tracking-wider uppercase mt-0.5">
            Präzises Muskel-Monitoring
          </p>
        </div>
        <button 
          onClick={handleReset}
          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[10px] px-3 py-1.5 rounded-xl font-bold uppercase tracking-widest transition-all active:scale-95"
        >
          Reset
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-3 gap-3 my-4 flex-shrink-0">
        <div className="bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Umfang</span>
          <span className="text-2xl font-black mt-1 text-emerald-400">
            {stats.totalWeeklyMinutes}<span className="text-xs font-normal text-slate-400 ml-0.5">Min</span>
          </span>
          <span className="text-[9px] text-slate-500 mt-1 font-medium">Diese Woche</span>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Frequenz</span>
          <span className="text-2xl font-black mt-1 text-sky-400">
            {stats.totalWeeklySessions}<span className="text-xs font-normal text-slate-400 ml-0.5">Slots</span>
          </span>
          <span className="text-[9px] text-slate-500 mt-1 font-medium">Einheiten</span>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Qualität</span>
          <span className="text-2xl font-black mt-1 text-amber-400">
            {stats.averageRating}<span className="text-xs font-normal text-slate-400 ml-0.5">/10</span>
          </span>
          <span className="text-[9px] text-slate-500 mt-1 font-medium">Ø Gefühl</span>
        </div>
      </div>

      {/* Verteilung */}
      <div className="bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl flex flex-col flex-shrink-0 mb-4">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Verteilung (Minuten)</span>
        <div className="flex items-end justify-between h-16 px-1">
          {days.map((day, idx) => {
            const mins = stats.dailyMinutes[idx];
            const heightPercent = (mins / stats.maxDayMinutes) * 100;
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[9px] font-mono font-bold text-slate-400 h-3">{mins > 0 ? Math.round(mins) : ''}</span>
                <div className="w-6 bg-slate-900/60 border border-white/[0.02] rounded-full relative h-10 overflow-hidden">
                  <div 
                    style={{ height: `${heightPercent}%` }} 
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 absolute bottom-0 rounded-full transition-all duration-500 ease-out"
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verlaufsliste */}
      <div className="flex-grow overflow-y-auto pr-0.5 space-y-2 mb-24 scrollbar-none will-change-scroll">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider sticky top-0 bg-[#08090a] py-1 block z-10">
          Verlaufs-Historie
        </span>
        
        {stats.reversedList.length === 0 ? (
          <div className="text-center text-xs text-slate-600 italic pt-8">Noch keine Daten aufgezeichnet.</div>
        ) : (
          stats.reversedList.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const sessionMins = Math.round(((entry.completedExercises || []).reduce((sum, ex) => sum + (ex.duration || 0), 0)) / 60);
            const entryTimestamp = !entry.id || isNaN(Number(entry.id)) ? Date.now() : Number(entry.id);
            const formattedDate = new Date(entryTimestamp).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

            return (
              <div 
                key={entry.id} 
                className={`bg-white/[0.02] border rounded-2xl transition-all duration-300 overflow-hidden ${
                  isExpanded ? 'border-white/[0.12] bg-white/[0.04]' : 'border-white/[0.04]'
                }`}
              >
                <button 
                  onClick={() => toggleAccordion(entry.id)}
                  className="w-full text-left p-3.5 flex justify-between items-center transition-colors active:bg-white/[0.02]"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-slate-200 truncate pr-2">{entry.programName}</h4>
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5">{formattedDate}</p>
                  </div>
                  <div className="text-right flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-mono font-black text-slate-200">{sessionMins || 1}<span className="text-[9px] font-normal text-slate-400 ml-0.5">Min</span></span>
                      <span className="text-[9px] text-slate-500 font-medium">{(entry.completedExercises?.length || 0)} Üb.</span>
                    </div>
                    <div className={`text-slate-500 text-[10px] transition-transform duration-300 ${isExpanded ? 'rotate-90 text-emerald-400' : ''}`}>
                      ➔
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3.5 pb-4 pt-1 border-t border-white/[0.04] space-y-3 bg-black/[0.15] animate-fadeIn">
                    
                    {/* Aggregierte Zielstrukturen */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Spezifischer Muskel-Fokus</span>
                      <div className="flex flex-col gap-1">
                        {getRegionsDataForSession(entry).map((region, idx) => (
                          <div key={idx} className="bg-slate-900/80 border border-white/[0.02] rounded-xl px-3 py-2 flex flex-col gap-1">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-300 font-medium truncate max-w-[80%]">{region.name}</span>
                              <span className="font-mono font-bold text-sky-400">{region.minutes || '0.5'}m</span>
                            </div>
                            <div className="w-full bg-slate-950 h-0.5 rounded-full overflow-hidden">
                              <div style={{ width: `${region.percentage}%` }} className="h-full bg-sky-500 rounded-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Übungs-Auflistung */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Durchgeführte Reize</span>
                      {entry.completedExercises?.map((ex, idx) => (
                        <div key={idx} className="bg-white/[0.01] border border-white/[0.03] p-2.5 rounded-xl flex flex-col gap-1.5">
                          <div className="flex justify-between items-center">
                            <div className="min-w-0 flex-1">
                              <h5 className="text-[11px] font-bold text-slate-300 truncate">{ex.name}</h5>
                              <p className="text-[9px] text-slate-500 truncate mt-0.5">{ex.bodyRegion}</p>
                            </div>
                            <span className="text-[10px] font-mono font-medium text-slate-400 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.02] shrink-0 ml-2">
                              {ex.duration}s
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex-grow bg-slate-950 h-1 rounded-full overflow-hidden relative">
                              <div 
                                style={{ width: `${(ex.executionRating / 10) * 100}%` }}
                                className={`h-full rounded-full ${
                                  ex.executionRating <= 3 ? 'bg-emerald-500' : ex.executionRating <= 7 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                              />
                            </div>
                            <span className="text-[9px] font-mono font-bold text-slate-400 shrink-0 w-6 text-right">
                              {ex.executionRating}/10
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

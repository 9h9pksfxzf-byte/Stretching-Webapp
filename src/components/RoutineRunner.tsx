import { useState } from 'react';
import { useStore, PerformedExercise } from '../store/useStore';
import { useTimer } from '../hooks/useTimer';

interface RoutineRunnerProps {
  programId: string;
  onClose: () => void;
}

export const RoutineRunner = ({ programId, onClose }: RoutineRunnerProps) => {
  const { library, programs, addHistoryEntry } = useStore();
  const [index, setIndex] = useState<number>(0);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  
  // Zustand für den Bewertungs-Screen (1-10)
  const [showRatingScreen, setShowRatingScreen] = useState<boolean>(false);
  // Interner Speicher für die absolvierten und bewerteten Übungen dieser Session
  const [completedExercises, setCompletedExercises] = useState<PerformedExercise[]>([]);

  const program = programs.find(p => p.id === programId);
  const programExercises = program ? program.exercises : [];
  const currentProgramData = programExercises[index];
  const currentExerciseData = library.find(e => e.id === currentProgramData?.exerciseId);

  // Der Timer steuert den Ablauf
  const { timeLeft, isActive, toggle, skip } = useTimer(
    isBreak ? (currentProgramData?.breakDuration || 0) : (currentProgramData?.duration || 0), 
    () => { 
      if (isBreak) {
        // Pause ist vorbei -> Weiter zur nächsten Übung
        setIsBreak(false);
        setIndex((i: number) => i + 1);
      } else {
        // Aktive Übung ist vorbei -> Bewertung anzeigen
        setShowRatingScreen(true);
      }
    }
  );

  // Verarbeitet die Bewertung (1-10) für die aktuelle Übung
  const handleRatingSelection = (ratingValue: number) => {
    if (!currentProgramData || !currentExerciseData) return;

    // Aktuelle Übung mit Bewertung zum lokalen Session-Speicher hinzufügen
    const currentPerformed: PerformedExercise = {
      exerciseId: currentProgramData.exerciseId,
      name: currentExerciseData.name,
      side: currentProgramData.side,
      duration: currentProgramData.duration,
      executionRating: ratingValue
    };

    const updatedExercises = [...completedExercises, currentPerformed];
    setCompletedExercises(updatedExercises);
    setShowRatingScreen(false);

    // Prüfen, ob das die letzte Übung im Programm war
    if (index >= programExercises.length - 1) {
      // Session ist komplett beendet -> Im globalen Verlauf (Store) speichern
      if (program) {
        addHistoryEntry({
          id: Date.now().toString(),
          programId: program.id,
          programName: program.name,
          date: new Date().toLocaleDateString('de-DE', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          completedExercises: updatedExercises
        });
      }
      // Index erhöhen, um den globalen Abschluss-Screen zu triggern
      setIndex((i: number) => i + 1);
    } else {
      // Es folgen noch Übungen -> In die Pause wechseln
      setIsBreak(true);
    }
  };

  // Abschluss-Screen, wenn alle Übungen durchlaufen und bewertet wurden
  if (!currentProgramData || !currentExerciseData || !program) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-screen text-white gap-8 -mt-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Geschafft! 🏁</h2>
          <p className="text-slate-400">
            Du hast das Programm <strong className="text-white">{program?.name || 'Unbekannt'}</strong> erfolgreich abgeschlossen und bewertet.
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="bg-emerald-600 w-full py-4 rounded-xl font-bold text-lg"
        >
          Fertig
        </button>
      </div>
    );
  }

  // Hilfsfunktion für die Vorschau der nächsten Übung in der Pause
  const getNextExerciseName = () => {
    const nextProgramData = programExercises[index + 1];
    if (!nextProgramData) return "Fertig";
    const nextEx = library.find(e => e.id === nextProgramData.exerciseId);
    if (!nextEx) return "Fertig";
    return `${nextEx.name} ${nextProgramData.side ? `(${nextProgramData.side})` : ''}`;
  };

  // 1. BEWERTUNGS-SCREEN (Wird direkt nach Ablauf einer Übung eingeblendet)
  if (showRatingScreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white p-6 gap-6">
        <div className="text-center mb-4">
          <p className="text-emerald-500 uppercase tracking-widest text-xs mb-2">Reflexion</p>
          <h2 className="text-2xl font-bold mb-1">Wie gut war deine Ausführung?</h2>
          <p className="text-slate-400 text-sm">
            {currentExerciseData.name} {currentProgramData.side ? `(${currentProgramData.side})` : ''}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              onClick={() => handleRatingSelection(num)}
              className="py-4 bg-[#1a1a1a] border border-[#333] rounded-xl font-bold text-lg hover:border-emerald-500 active:bg-emerald-600 transition-colors"
            >
              {num}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 text-center max-w-xs mt-2">
          1 = Sehr unsauber / Schmerzen <br /> 10 = Perfekte Form / Volle Dehnung
        </div>
      </div>
    );
  }

  // 2. REGULÄRER TIMER-SCREEN (Aktiv während Dehnung und Pause)
  return (
    <div className="flex flex-col items-center p-6 gap-6 text-white pt-24 min-h-screen">
      <div className="text-center h-24">
        <p className="text-slate-400 uppercase tracking-widest text-xs mb-2">
          {isBreak ? "Pause" : `Übung ${index + 1} von ${programExercises.length}`}
        </p>
        <h1 className="text-3xl font-bold">
          {isBreak ? `Nächste: ${getNextExerciseName()}` : currentExerciseData.name}
        </h1>
        {!isBreak && currentProgramData.side && (
          <h2 className="text-2xl font-bold text-emerald-500 mt-2">
            Seite: {currentProgramData.side}
          </h2>
        )}
      </div>

      <div className="text-[120px] font-mono font-bold leading-none my-10">{timeLeft}</div>

      <div className="grid grid-cols-3 gap-4 w-full mt-auto mb-6">
        <button onClick={toggle} className="bg-slate-800 py-6 rounded-2xl font-bold">
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button onClick={skip} className="bg-slate-800 py-6 rounded-2xl font-bold">Skip</button>
        <button onClick={() => window.location.reload()} className="bg-red-900/30 py-6 rounded-2xl font-bold text-red-400">Reset</button>
      </div>
    </div>
  );
};

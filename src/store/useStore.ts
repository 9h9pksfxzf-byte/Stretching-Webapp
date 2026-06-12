import { create } from 'zustand';
import { AppStateInterface, Program } from './types';
import { dataHandler } from '../utils/dataHandler';

// Lokale Mock-Daten zur Simulation einer API / lokalen Datei
const MOCK_RAW_DATA = [
  {
    id: 'p1',
    title: 'Unterkörper Flexibilität',
    exercises: [
      { id: 'e1', name: 'Hamstring Stretch', durationInSeconds: 45, description: 'Sitzend nach vorne beugen.' },
      { id: 'e2', name: 'Couch Stretch', durationInSeconds: 60, description: 'Hüftbeuger intensiv dehnen.' }
    ]
  }
];

export const useStore = create<AppStateInterface>((set, get) => ({
  programs: [],
  currentProgram: null,
  currentExerciseIndex: 0,
  timeRemaining: 0,
  isTimerRunning: false,
  uiState: 'IDLE',
  errorMessage: null,

  fetchPrograms: async () => {
    set({ uiState: 'LOADING', errorMessage: null });
    try {
      // Simulation Netzwerkverzögerung
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Validierung über Utility-Schicht
      const validatedData = await dataHandler.parseAndValidatePrograms(MOCK_RAW_DATA);
      
      if (validatedData.length === 0) {
        throw new Error('Keine Trainingsprogramme verfügbar.');
      }

      set({
        programs: validatedData,
        currentProgram: validatedData[0],
        timeRemaining: validatedData[0].exercises[0]?.durationInSeconds || 0,
        uiState: 'SUCCESS'
      });
    } catch (error) {
      set({
        uiState: 'ERROR',
        errorMessage: error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten.'
      });
    }
  },

  startTimer: () => set({ isTimerRunning: true }),
  
  pauseTimer: () => set({ isTimerRunning: false }),

  tick: () => {
    const { timeRemaining, currentProgram, currentExerciseIndex } = get();
    if (!currentProgram) return;

    if (timeRemaining > 1) {
      set({ timeRemaining: timeRemaining - 1 });
    } else {
      const nextIndex = currentExerciseIndex + 1;
      if (nextIndex < currentProgram.exercises.length) {
        set({
          currentExerciseIndex: nextIndex,
          timeRemaining: currentProgram.exercises[nextIndex].durationInSeconds,
        });
      } else {
        // Gesamtes Programm erfolgreich durchlaufen
        set({ isTimerRunning: false, currentExerciseIndex: 0, timeRemaining: 0 });
      }
    }
  },

  resetRoutine: () => {
    const { currentProgram } = get();
    if (!currentProgram) return;
    set({
      currentExerciseIndex: 0,
      timeRemaining: currentProgram.exercises[0]?.durationInSeconds || 0,
      isTimerRunning: false
    });
  }
}));

export interface Exercise {
  id: string;
  name: string;
  durationInSeconds: number;
  description: string;
}

export interface Program {
  id: string;
  title: string;
  exercises: Exercise[];
}

export type UIState = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';

export interface AppStateInterface {
  programs: Program[];
  currentProgram: Program | null;
  currentExerciseIndex: number;
  timeRemaining: number;
  isTimerRunning: boolean;
  uiState: UIState;
  errorMessage: string | null;
  
  // Actions
  fetchPrograms: () => Promise<void>;
  startTimer: () => void;
  pauseTimer: () => void;
  tick: () => void;
  resetRoutine: () => void;
}

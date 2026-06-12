import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useStore } from '../store/useStore';
import { useTimer } from '../hooks/useTimer';
import { CountdownTimer } from './CountdownTimer';

export const RoutineRunner: React.FC = () => {
  // Timer Hook initialisieren, damit er auf Intervalle/AppState lauscht
  useTimer();

  const {
    uiState,
    errorMessage,
    currentProgram,
    currentExerciseIndex,
    isTimerRunning,
    fetchPrograms,
    startTimer,
    pauseTimer,
    resetRoutine,
  } = useStore();

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  if (uiState === 'LOADING') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.text}>Lade Trainingsprogramm...</Text>
      </View>
    );
  }

  if (uiState === 'ERROR') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Fehler aufgetreten</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity style={styles.button} onPress={fetchPrograms}>
          <Text style={styles.buttonText}>Erneut versuchen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentExercise = currentProgram?.exercises[currentExerciseIndex];

  return (
    <View style={styles.container}>
      {currentProgram && currentExercise ? (
        <View style={styles.content}>
          <Text style={styles.programTitle}>{currentProgram.title}</Text>
          
          <View style={styles.card}>
            <Text style={styles.exerciseName}>{currentExercise.name}</Text>
            <Text style={styles.exerciseDesc}>{currentExercise.description}</Text>
          </View>

          <CountdownTimer />

          <View style={styles.controls}>
            {isTimerRunning ? (
              <TouchableOpacity style={[styles.button, styles.pauseButton]} onPress={pauseTimer}>
                <Text style={styles.buttonText}>Pause</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.button} onPress={startTimer}>
                <Text style={styles.buttonText}>Start</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={resetRoutine}>
              <Text style={styles.secondaryButtonText}>Zurücksetzen</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.center}>
          <Text style={styles.text}>Kein Programm aktiv.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20 },
  programTitle: { fontSize: 22, fontWeight: '700', color: '#1A1C1E' },
  card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 14, width: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  exerciseName: { fontSize: 20, fontWeight: '600', color: '#1A1C1E', marginBottom: 6 },
  exerciseDesc: { fontSize: 15, color: '#6C727A', lineHeight: 20 },
  controls: { flexDirection: 'row', width: '90%', justifyContent: 'space-between' },
  button: { backgroundColor: '#007AFF', paddingVertical: 14, borderRadius: 10, flex: 1, marginRight: 6, alignItems: 'center' },
  pauseButton: { backgroundColor: '#FF3B30' },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#007AFF', marginLeft: 6, marginRight: 0 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  secondaryButtonText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  errorTitle: { fontSize: 18, fontWeight: '700', color: '#FF3B30', marginBottom: 6 },
  errorText: { fontSize: 14, color: '#6C727A', textAlign: 'center', marginBottom: 16 },
  text: { marginTop: 10, fontSize: 15, color: '#6C727A' }
});

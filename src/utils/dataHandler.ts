import { Program } from '../store/types';

export const dataHandler = {
  /**
   * Lädt die Programme und validiert die Struktur.
   * Typisierung stellt sicher, dass das zurückgegebene Objekt exakt dem Program-Interface entspricht.
   */
  parseAndValidatePrograms: async (rawResponse: unknown): Promise<Program[]> => {
    if (!Array.isArray(rawResponse)) {
      throw new Error('Ungültiges Datenformat: Erwartete ein Array von Programmen.');
    }

    return rawResponse.map((item: any, index: number) => {
      if (!item.id || !item.title || !Array.isArray(item.exercises)) {
        throw new Error(`Kritischer Datenfehler in Programm-Index ${index}: Pflichtfelder fehlen.`);
      }

      const validatedExercises = item.exercises.map((ex: any, exIndex: number) => {
        if (!ex.id || !ex.name || typeof ex.durationInSeconds !== 'number') {
          throw new Error(`Fehler in Programm "${item.title}" bei Übung ${exIndex + 1}: Ungültige Dauer oder ID.`);
        }
        return {
          id: String(ex.id),
          name: String(ex.name),
          durationInSeconds: Number(ex.durationInSeconds),
          description: ex.description ? String(ex.description) : '',
        };
      });

      return {
        id: String(item.id),
        title: String(item.title),
        exercises: validatedExercises,
      };
    });
  }
};

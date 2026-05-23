import { useState } from 'react';
import { useStore } from '../store/useStore';

interface ExerciseBuilderProps {
  onClose: () => void;
  exerciseId?: string | null; // Neu: Optionale ID für den Bearbeitungsmodus
}

const BODY_REGIONS = [
  'Nacken', 'Schultern', 'Brust', 'Rücken', 'Rumpf', 
  'Hüfte', 'Gesäß', 'Beine', 'Waden', 'Ganzkörper'
];

export const ExerciseBuilder = ({ onClose, exerciseId }: ExerciseBuilderProps) => {
  const { library, addExercise, updateExercise } = useStore();
  
  // Suche die Übung, falls eine ID übergeben wurde
  const existingExercise = exerciseId ? library.find(e => e.id === exerciseId) : null;

  // Initialisiere State mit bestehenden Daten oder Standardwerten
  const [name, setName] = useState<string>(existingExercise?.name || '');
  const [bodyRegion, setBodyRegion] = useState<string>(existingExercise?.bodyRegion || BODY_REGIONS[0]);
  const [rating, setRating] = useState<number>(existingExercise?.rating || 3);
  const [isUnilateral, setIsUnilateral] = useState<boolean>(existingExercise?.isUnilateral || false);

  const handleSave = () => {
    if (!name.trim() || !bodyRegion) return;
    
    const exerciseData = {
      id: existingExercise ? existingExercise.id : Date.now().toString(),
      name: name.trim(),
      bodyRegion,
      rating,
      isUnilateral
    };

    if (existingExercise) {
      updateExercise(existingExercise.id, exerciseData);
    } else {
      addExercise(exerciseData);
    }
    
    onClose();
  };

  return (
    <div className="p-6 text-white pb-24">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">
          {existingExercise ? 'Übung bearbeiten' : 'Neue Übung'}
        </h2>
        <button onClick={onClose} className="text-slate-400">Abbrechen</button>
      </header>

      <div className="flex flex-col gap-4">
        <input 
          type="text" 
          placeholder="Übungsname (z.B. Couch Stretch)" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-white outline-none focus:border-emerald-500 transition-colors"
        />

        <div className="relative">
          <select 
            value={bodyRegion}
            onChange={(e) => setBodyRegion(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-white outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
          >
            {BODY_REGIONS.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        {/* ... (Restliche UI-Elemente wie Buttons für Unilateral/Rating bleiben gleich) ... */}
        
        <button 
          onClick={handleSave}
          className="w-full bg-emerald-600 py-4 rounded-xl font-bold mt-4"
        >
          {existingExercise ? 'Änderungen speichern' : 'Übung speichern'}
        </button>
      </div>
    </div>
  );
};

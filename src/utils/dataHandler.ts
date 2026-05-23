import { useStore } from '../store/useStore';

export const exportData = () => {
  const state = useStore.getState();
  const data = JSON.stringify({ library: state.library, programs: state.programs });
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stretching-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = JSON.parse(e.target?.result as string);
      if (content.library && content.programs) {
        useStore.setState({ library: content.library, programs: content.programs });
        alert('Daten erfolgreich importiert!');
      }
    } catch (err) {
      alert('Fehler beim Importieren der Datei.');
    }
  };
  reader.readAsText(file);
};

/**
 * Generiert einen synthetischen Piepston über die Web Audio API.
 * Dadurch sind keine externen MP3-Dateien notwendig.
 * * @param frequencyInHz Die Tonhöhe in Hertz (z.B. 880Hz für einen hohen Piepston)
 * @param durationInSeconds Die Dauer des Tons in Sekunden
 */
export const playNotificationSound = (frequencyInHz = 880, durationInSeconds = 0.3): void => {
  try {
    // Kompatibilität für ältere Browser gewährleisten
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    
    // Oszillator (Klangerzeuger) und GainNode (Lautstärkeregler) erstellen
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine'; // Reiner Sinuston
    oscillator.frequency.value = frequencyInHz;

    // Sanftes Ausblenden (Gain-Envelope) um ein knackendes Geräusch am Ende zu verhindern
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime); // Start-Lautstärke auf 30%
    gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + durationInSeconds);

    // Verbindungen aufbauen: Oszillator -> Lautstärke -> Lautsprecher
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Ton starten und exakt nach der Duration stoppen
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + durationInSeconds);
  } catch (error) {
    // Fehler stumm abfangen, damit die App bei restriktiven Browser-Sicherheitseinstellungen nicht abstürzt
    console.error('Audio-Wiedergabe fehlgeschlagen:', error);
  }
};

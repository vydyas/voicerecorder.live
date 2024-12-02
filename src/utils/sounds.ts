// Create audio context lazily to avoid autoplay restrictions
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

// Function to generate a beep sound
const generateBeep = async (frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.1) => {
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.value = volume;

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start();
  
  // Smooth fade out
  gainNode.gain.setValueAtTime(volume, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);
  
  setTimeout(() => {
    oscillator.stop();
    oscillator.disconnect();
    gainNode.disconnect();
  }, duration * 1000);
};

export const playStartSound = async () => {
  // High-pitched ascending beep
  await generateBeep(880, 0.15, 'sine', 0.1); // A5 note
  setTimeout(() => generateBeep(1760, 0.15, 'sine', 0.1), 150); // A6 note
};

export const playStopSound = async () => {
  // Low-pitched descending beep
  await generateBeep(440, 0.15, 'sine', 0.1); // A4 note
  setTimeout(() => generateBeep(220, 0.15, 'sine', 0.1), 150); // A3 note
};

export const playPauseSound = async () => {
  // Single medium-pitched beep
  await generateBeep(587.33, 0.1, 'sine', 0.1); // D5 note
};

export const playResumeSound = async () => {
  // Double medium-pitched beep
  await generateBeep(587.33, 0.1, 'sine', 0.1); // D5 note
  setTimeout(() => generateBeep(587.33, 0.1, 'sine', 0.1), 150); // D5 note again
};

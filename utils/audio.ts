let audioContext: AudioContext | null = null;
let isUnlocked = false;

const getAudioContext = () => {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser");
            return null;
        }
    }
    return audioContext;
};

// Audio must be unlocked by a user gesture.
export const unlockAudio = () => {
    if (isUnlocked) return;
    const context = getAudioContext();
    if (context && context.state === 'suspended') {
        context.resume();
        isUnlocked = true;
    }
};

export const playHapticFeedback = (pattern: number | number[] = 50) => {
    if ('vibrate' in navigator) {
        try {
            navigator.vibrate(pattern);
        } catch (e) {
            console.error("Haptic feedback failed.", e);
        }
    }
};

const playSound = (type: OscillatorType, frequency: number, duration: number, volume = 0.5, onEnded: (() => void) | null = null) => {
    const context = getAudioContext();
    if (!context || context.state === 'suspended') return;

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gainNode.gain.setValueAtTime(volume, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);
    if (onEnded) {
        oscillator.onended = onEnded;
    }
};

export const playPlaceSound = () => playSound('sine', 440, 0.1, 0.3);
export const playEraseSound = () => playSound('triangle', 220, 0.1, 0.2);
export const playClickSound = () => playSound('triangle', 880, 0.05, 0.1);
export const playWinSound = () => {
    playSound('sine', 523.25, 0.15, 0.4); // C5
    setTimeout(() => playSound('sine', 659.25, 0.15, 0.4), 120); // E5
    setTimeout(() => playSound('sine', 783.99, 0.15, 0.4), 240); // G5
    setTimeout(() => playSound('sine', 1046.50, 0.2, 0.5), 360); // C6
};
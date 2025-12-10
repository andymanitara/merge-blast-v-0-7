let audioCtx: AudioContext | null = null;
const getContext = () => {
    if (typeof window === 'undefined') return null;
    if (!audioCtx) {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (Ctx) {
            audioCtx = new Ctx();
        }
    }
    return audioCtx;
};
export type SoundType = 'place' | 'merge' | 'gameover' | 'click' | 'bestScore' | 'lockSpawn' | 'pulse' | 'junkSpawn' | 'heavyMerge' | 'achievement' | 'crack' | 'lock' | 'powerBurst';
export const playGameSound = (type: SoundType, intensity: number = 1) => {
    try {
        const ctx = getContext();
        if (!ctx) return;
        if (ctx.state === 'suspended') {
            ctx.resume().catch(e => console.warn("Audio resume failed", e));
        }
        const now = ctx.currentTime;
        // Helper to create an oscillator with envelope
        const createOsc = (type: OscillatorType, freq: number, startTime: number, duration: number, vol: number = 0.1) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, startTime);
            osc.connect(gain);
            gain.connect(ctx.destination);
            // Envelope
            gain.gain.setValueAtTime(vol, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            osc.start(startTime);
            osc.stop(startTime + duration);
            return { osc, gain };
        };
        switch (type) {
            case 'place': {
                // Short, high-pitched "pop"
                const { osc } = createOsc('sine', 600, now, 0.1, 0.3);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
                break;
            }
            case 'merge': {
                // Satisfying "ding" / "pop" that scales with combo intensity
                // Base pitch C5 (523.25), scales up by semitones or small steps based on combo
                // intensity 1 = C5, intensity 5 = E5 approx, etc.
                const baseFreq = 523.25 * (1 + (intensity * 0.1));
                const { osc, gain } = createOsc('triangle', baseFreq, now, 0.3, 0.3);
                osc.frequency.linearRampToValueAtTime(baseFreq * 2, now + 0.1); // Slide up an octave
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                break;
            }
            case 'powerBurst': {
                // Explosive magical sound
                const root = 220; // A3
                createOsc('triangle', root, now, 0.6, 0.2);
                createOsc('triangle', root * 1.2599, now, 0.6, 0.2); // C#4 approx
                createOsc('triangle', root * 1.4983, now, 0.6, 0.2); // E4 approx
                createOsc('sawtooth', 100, now, 0.5, 0.3); // Low rumble
                break;
            }
            case 'gameover': {
                // Descending slide
                const { osc } = createOsc('sawtooth', 300, now, 0.5, 0.3);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
                break;
            }
            case 'click': {
                // Very short tick
                createOsc('square', 800, now, 0.03, 0.1);
                break;
            }
            case 'bestScore': {
                // Celebration sequence - Major Arpeggio (C5, E5, G5, C6)
                createOsc('triangle', 523.25, now, 0.6, 0.3);
                createOsc('triangle', 659.25, now + 0.1, 0.5, 0.3);
                createOsc('triangle', 783.99, now + 0.2, 0.4, 0.3);
                createOsc('triangle', 1046.50, now + 0.3, 0.3, 0.3);
                break;
            }
            case 'lockSpawn': {
                // Metallic clank - Sawtooth with quick decay and dissonance
                createOsc('sawtooth', 150, now, 0.2, 0.2);
                createOsc('square', 155, now, 0.15, 0.15);
                break;
            }
            case 'pulse': {
                // Zap / Explosion effect - Rapid frequency slide
                const { osc } = createOsc('sawtooth', 800, now, 0.3, 0.3);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
                // Add a second layer for texture
                const { osc: osc2 } = createOsc('square', 700, now, 0.25, 0.2);
                osc2.frequency.exponentialRampToValueAtTime(40, now + 0.25);
                break;
            }
            case 'achievement': {
                // Victory fanfare - short and bright
                createOsc('triangle', 523.25, now, 0.15, 0.2); // C5
                createOsc('triangle', 659.25, now + 0.1, 0.15, 0.2); // E5
                createOsc('triangle', 783.99, now + 0.2, 0.4, 0.2); // G5
                break;
            }
            case 'crack': {
                // Sharp, high-pitched breaking sound
                const { osc } = createOsc('sawtooth', 800, now, 0.1, 0.2);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                createOsc('square', 850, now, 0.08, 0.15);
                break;
            }
            case 'lock': {
                // Heavy metallic thud
                const { osc } = createOsc('square', 100, now, 0.3, 0.4);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
                createOsc('sine', 60, now, 0.4, 0.5);
                break;
            }
        }
    } catch (e) {
        console.error("Audio playback failed", e);
    }
};
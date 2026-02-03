import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

// ================================================
// Types
// ================================================

type SoundId = 'canvass' | 'buy' | 'unlock' | 'stageWin' | 'recruit' | 'policy' | 'levelUp' | 'skillUnlock';

interface AudioContextValue {
    muted: boolean;
    toggle: () => void;
    play: (soundId: SoundId) => void;
}

// ================================================
// Audio Context
// ================================================

const AudioCtx = createContext<AudioContextValue | null>(null);

const STORAGE_KEY = 'political-revolution-audio-muted';

// Simple sound generation using Web Audio API
function createTone(
    audioContext: globalThis.AudioContext,
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3
): void {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

function playCanvassSound(audioContext: globalThis.AudioContext): void {
    // Door knock: Two quick low tones
    createTone(audioContext, 200, 0.08, 'square', 0.2);
    setTimeout(() => createTone(audioContext, 180, 0.08, 'square', 0.15), 100);
}

function playBuySound(audioContext: globalThis.AudioContext): void {
    // Ka-ching: Rising tones
    createTone(audioContext, 800, 0.1, 'sine', 0.2);
    setTimeout(() => createTone(audioContext, 1200, 0.15, 'sine', 0.25), 80);
}

function playUnlockSound(audioContext: globalThis.AudioContext): void {
    // Small cheer: Ascending arpeggio
    [400, 500, 600, 800].forEach((freq, i) => {
        setTimeout(() => createTone(audioContext, freq, 0.15, 'sine', 0.15), i * 60);
    });
}

function playStageWinSound(audioContext: globalThis.AudioContext): void {
    // Victory fanfare: Major chord burst
    [523, 659, 784, 1047].forEach((freq) => {
        createTone(audioContext, freq, 0.5, 'sine', 0.12);
    });
    // Add a triumphant second hit
    setTimeout(() => {
        [523, 659, 784, 1047].forEach((freq) => {
            createTone(audioContext, freq * 1.05, 0.6, 'sine', 0.15);
        });
    }, 300);
}

function playRecruitSound(audioContext: globalThis.AudioContext): void {
    // Quick whistle: High pitch short burst
    createTone(audioContext, 1000 + Math.random() * 200, 0.06, 'sine', 0.15);
}

function playPolicySound(audioContext: globalThis.AudioContext): void {
    // Gavel slam: Sharp wooden impact with resonance
    // Initial sharp attack (the strike)
    createTone(audioContext, 120, 0.08, 'square', 0.4);
    createTone(audioContext, 80, 0.1, 'triangle', 0.3);

    // Wooden resonance (the block)
    setTimeout(() => {
        createTone(audioContext, 200, 0.15, 'sine', 0.2);
        createTone(audioContext, 350, 0.12, 'sine', 0.1);
    }, 50);

    // Second authoritative strike
    setTimeout(() => {
        createTone(audioContext, 100, 0.1, 'square', 0.35);
        createTone(audioContext, 180, 0.15, 'sine', 0.15);
    }, 200);
}

function playLevelUpSound(audioContext: globalThis.AudioContext): void {
    // Epic level up: Triumphant ascending fanfare
    // First wave - rising arpeggio
    [262, 330, 392, 523].forEach((freq, i) => {
        setTimeout(() => createTone(audioContext, freq, 0.2, 'sine', 0.2), i * 80);
    });

    // Second wave - power chord burst
    setTimeout(() => {
        [523, 659, 784].forEach((freq) => {
            createTone(audioContext, freq, 0.4, 'sine', 0.15);
        });
    }, 400);

    // Final flourish - high sparkle
    setTimeout(() => {
        [1047, 1175, 1319].forEach((freq, i) => {
            setTimeout(() => createTone(audioContext, freq, 0.15, 'sine', 0.1), i * 40);
        });
    }, 600);
}

function playSkillUnlockSound(audioContext: globalThis.AudioContext): void {
    // Skill unlock: Magical power-up sound
    // Whoosh up
    createTone(audioContext, 300, 0.15, 'sine', 0.2);
    setTimeout(() => createTone(audioContext, 500, 0.15, 'sine', 0.2), 50);
    setTimeout(() => createTone(audioContext, 700, 0.2, 'sine', 0.25), 100);

    // Sparkle confirmation
    setTimeout(() => {
        [800, 1000, 1200].forEach((freq, i) => {
            setTimeout(() => createTone(audioContext, freq, 0.1, 'sine', 0.12), i * 30);
        });
    }, 200);
}

// ================================================
// Provider Component
// ================================================

interface AudioProviderProps {
    children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
    const [muted, setMuted] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === 'true';
    });

    const [audioContext, setAudioContext] = useState<globalThis.AudioContext | null>(null);

    // Initialize audio context on first user interaction
    const initAudioContext = useCallback(() => {
        if (!audioContext) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            setAudioContext(ctx);
            return ctx;
        }
        return audioContext;
    }, [audioContext]);

    // Persist muted state
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, String(muted));
    }, [muted]);

    const toggle = useCallback(() => {
        setMuted(prev => !prev);
    }, []);

    const play = useCallback((soundId: SoundId) => {
        if (muted) return;

        try {
            const ctx = initAudioContext();

            // Resume context if suspended (browser autoplay policy)
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            switch (soundId) {
                case 'canvass':
                    playCanvassSound(ctx);
                    break;
                case 'buy':
                    playBuySound(ctx);
                    break;
                case 'unlock':
                    playUnlockSound(ctx);
                    break;
                case 'stageWin':
                    playStageWinSound(ctx);
                    break;
                case 'recruit':
                    playRecruitSound(ctx);
                    break;
                case 'policy':
                    playPolicySound(ctx);
                    break;
                case 'levelUp':
                    playLevelUpSound(ctx);
                    break;
                case 'skillUnlock':
                    playSkillUnlockSound(ctx);
                    break;
            }
        } catch (error) {
            // Silently fail - audio is non-critical
            console.warn('Audio playback failed:', error);
        }
    }, [muted, initAudioContext]);

    return (
        <AudioCtx.Provider value={{ muted, toggle, play }
        }>
            {children}
        </AudioCtx.Provider>
    );
}

// ================================================
// Hook
// ================================================

export function useAudio(): AudioContextValue {
    const context = useContext(AudioCtx);
    if (!context) {
        // Return a no-op version if used outside provider
        return {
            muted: false,
            toggle: () => { },
            play: () => { },
        };
    }
    return context;
}

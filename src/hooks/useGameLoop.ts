import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';

export function useGameLoop() {
    const tick = useStore(state => state.tick);
    const calculateOfflineProgress = useStore(state => state.calculateOfflineProgress);
    const lastFrameTime = useRef<number>(performance.now());
    const animationFrameId = useRef<number>(0);

    const gameLoop = useCallback((currentTime: number) => {
        const deltaMs = currentTime - lastFrameTime.current;
        lastFrameTime.current = currentTime;

        // Cap delta to prevent huge jumps if tab was inactive
        const cappedDelta = Math.min(deltaMs, 100);
        tick(cappedDelta);

        animationFrameId.current = requestAnimationFrame(gameLoop);
    }, [tick]);

    useEffect(() => {
        // Calculate offline progress on mount
        const { earnings, seconds } = calculateOfflineProgress();
        if (earnings > 0 && seconds > 5) {
            console.log(`Offline progress: $${earnings.toFixed(2)} earned over ${seconds.toFixed(0)}s`);
        }

        // Start the game loop
        lastFrameTime.current = performance.now();
        animationFrameId.current = requestAnimationFrame(gameLoop);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [gameLoop, calculateOfflineProgress]);
}

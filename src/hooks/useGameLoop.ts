import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { MEMORIES } from '../config/memories';

export function useGameLoop() {
    const tick = useStore(state => state.tick);
    const calculateOfflineProgress = useStore(state => state.calculateOfflineProgress);
    const lastFrameTime = useRef<number>(performance.now());
    const animationFrameId = useRef<number>(0);

    const gameLoop = useCallback((currentTime: number) => {
        // CRITICAL: Stop the loop immediately if a reset is in progress.
        // This prevents further state updates or saves during the teardown.
        if (window.__PR_RESET_LOCK) {
            console.log('[Loop] Terminated due to reset lock');
            return;
        }

        const deltaMs = currentTime - lastFrameTime.current;
        lastFrameTime.current = currentTime;

        // Cap delta to prevent huge jumps if tab was inactive
        const cappedDelta = Math.min(deltaMs, 100);
        tick(cappedDelta);

        // Check for memory unlocks
        const state = useStore.getState(); // Get fresh state
        MEMORIES.forEach(memory => {
            if (!state.unlockedMemories.includes(memory.id)) {
                if (memory.trigger(state)) {
                    state.unlockMemory(memory.id);
                }
            }
        });

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

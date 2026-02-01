import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { STAGES } from '../config/stages';
import { getDilemmasForStage, type Dilemma } from '../config/dilemmas';

// Configuration
const DILEMMA_MIN_INTERVAL = 20000;  // Minimum 20 seconds between dilemmas
const DILEMMA_MAX_INTERVAL = 40000;  // Maximum 40 seconds
const DILEMMA_START_THRESHOLD = 500; // Start after earning $500 lifetime

export function useDilemmas() {
    const lastDilemmaTime = useRef<number>(0);
    const nextInterval = useRef<number>(DILEMMA_MIN_INTERVAL);

    // Use getState() to avoid re-renders from state changes
    const checkAndTriggerDilemma = useCallback(() => {
        const state = useStore.getState();

        // Don't start dilemmas until some progress is made
        if (state.lifetimeEarnings < DILEMMA_START_THRESHOLD) {
            return;
        }

        // Don't trigger if blocked
        if (state.activeDilemma) return;
        if (state.activeEvent) return;
        if (state.activeMiniGame !== 'none') return;

        // Check timing
        const now = Date.now();
        const timeSince = now - lastDilemmaTime.current;
        if (timeSince < nextInterval.current) {
            return;
        }

        // Get current stage's theme category
        const currentStage = STAGES[state.currentStageIndex];
        if (!currentStage) return;

        // Get available dilemmas for this stage category
        const availableDilemmas = getDilemmasForStage(currentStage.themeCategory)
            .filter(d => !state.seenDilemmas.includes(d.id));

        // If we've seen all dilemmas, pick a random one anyway (repeat)
        let dilemmaPool = availableDilemmas;
        if (dilemmaPool.length === 0) {
            dilemmaPool = getDilemmasForStage(currentStage.themeCategory);
        }

        if (dilemmaPool.length === 0) return;

        // Pick a random dilemma
        const dilemma: Dilemma = dilemmaPool[Math.floor(Math.random() * dilemmaPool.length)];
        console.log('🔮 Triggering Dilemma:', dilemma.title);
        state.triggerDilemma(dilemma);

        // Reset timing
        lastDilemmaTime.current = now;
        nextInterval.current = DILEMMA_MIN_INTERVAL + Math.random() * (DILEMMA_MAX_INTERVAL - DILEMMA_MIN_INTERVAL);
    }, []);

    useEffect(() => {
        // Set initial timer to trigger first dilemma after 10 seconds
        lastDilemmaTime.current = Date.now() - (DILEMMA_MIN_INTERVAL - 10000);
        nextInterval.current = DILEMMA_MIN_INTERVAL;

        const interval = setInterval(checkAndTriggerDilemma, 2000);
        return () => clearInterval(interval);
    }, [checkAndTriggerDilemma]);
}

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

// ================================================
// Tutorial Step Configuration
// Steps 1-4: Sequential intro tutorial
// Steps 5-6: Milestone-triggered tutorials
// Step 7+: Complete
// ================================================

interface TutorialStep {
    id: number;
    targetId: string;
    text: string;
    advanceCondition: 'clicks' | 'purchase' | 'auto';
    clicksRequired?: number;
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 1,
        targetId: 'canvass-button',
        text: "Welcome, community organizer! Click the blue button to knock on doors and build momentum.",
        advanceCondition: 'clicks',
        clicksRequired: 10,
    },
    {
        id: 2,
        targetId: 'first-activity',
        text: "Great work! Now click 'Buy' on Leafleting to hire volunteers who work automatically.",
        advanceCondition: 'purchase',
    },
    {
        id: 3,
        targetId: 'momentum-bar',
        text: "You're building momentum! Keep it high for faster fundraising. It decays over time, so stay active!",
        advanceCondition: 'auto',
    },
    {
        id: 4,
        targetId: 'career-progress',
        text: "As you raise funds, you'll climb the political ladder. Keep going to unlock policies and win elections!",
        advanceCondition: 'auto',
    },
    {
        id: 5,
        targetId: 'policies-tab',
        text: "You have enough funds for your first policy! Click Policies to pass laws that boost your campaign.",
        advanceCondition: 'auto',
    },
    {
        id: 6,
        targetId: 'win-election-button',
        text: "You're ready to win your first election! Click the green button to advance to the next political stage!",
        advanceCondition: 'auto',
    },
];

// ================================================
// Campaign Manager Component
// ================================================

function CampaignManager({ message, onContinue, onSkip, showContinue }: {
    message: string;
    onContinue: () => void;
    onSkip: () => void;
    showContinue: boolean;
}) {
    return (
        <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] max-w-md w-full mx-4"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
        >
            <div className="bg-slate-800/95 backdrop-blur-lg border border-slate-700 rounded-2xl p-4 shadow-2xl">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
                            📋
                        </div>
                        <div className="text-center mt-1">
                            <span className="text-xs text-blue-400 font-medium">Campaign</span>
                            <br />
                            <span className="text-xs text-blue-400 font-medium">Manager</span>
                        </div>
                    </div>

                    <div className="flex-1">
                        <motion.div
                            className="bg-slate-700/50 rounded-xl p-3 relative"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                        >
                            <div className="absolute left-0 top-4 -translate-x-full">
                                <div className="border-8 border-transparent border-r-slate-700/50" />
                            </div>
                            <p className="text-white text-sm leading-relaxed">
                                {message}
                            </p>
                        </motion.div>

                        <div className="mt-3 flex gap-2">
                            {showContinue && (
                                <motion.button
                                    onClick={onContinue}
                                    className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-sm hover:from-blue-500 hover:to-purple-500 transition-all"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Got it! →
                                </motion.button>
                            )}
                            <motion.button
                                onClick={onSkip}
                                className="py-2 px-4 bg-slate-700/80 text-slate-400 rounded-lg font-medium text-sm hover:bg-slate-600 hover:text-white transition-all"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Skip
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ================================================
// Spotlight Overlay
// ================================================

function Spotlight({ targetId }: { targetId: string }) {
    const [rect, setRect] = useState<DOMRect | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const updateRect = () => {
            const element = document.getElementById(targetId);
            if (element) {
                const newRect = element.getBoundingClientRect();
                setRect(prev => {
                    if (!prev ||
                        Math.abs(prev.top - newRect.top) > 1 ||
                        Math.abs(prev.left - newRect.left) > 1) {
                        return newRect;
                    }
                    return prev;
                });
            } else {
                setRect(null);
            }
            animationFrameRef.current = requestAnimationFrame(updateRect);
        };

        animationFrameRef.current = requestAnimationFrame(updateRect);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [targetId]);

    if (!rect) {
        return (
            <motion.div
                className="fixed inset-0 bg-black/70 z-50 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            />
        );
    }

    const padding = 12;
    const borderRadius = 16;

    return (
        <motion.div
            className="fixed inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                    <mask id="spotlight-mask">
                        <rect width="100%" height="100%" fill="white" />
                        <rect
                            x={rect.left - padding}
                            y={rect.top - padding}
                            width={rect.width + padding * 2}
                            height={rect.height + padding * 2}
                            rx={borderRadius}
                            fill="black"
                        />
                    </mask>
                </defs>
                <rect
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.75)"
                    mask="url(#spotlight-mask)"
                />
            </svg>

            <motion.div
                className="absolute border-2 border-blue-400 rounded-2xl pointer-events-none"
                style={{
                    left: rect.left - padding,
                    top: rect.top - padding,
                    width: rect.width + padding * 2,
                    height: rect.height + padding * 2,
                }}
                animate={{
                    boxShadow: [
                        '0 0 20px rgba(59, 130, 246, 0.5)',
                        '0 0 40px rgba(59, 130, 246, 0.8)',
                        '0 0 20px rgba(59, 130, 246, 0.5)',
                    ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
            />
        </motion.div>
    );
}

// ================================================
// Main Tutorial Overlay
// ================================================

export function TutorialOverlay() {
    const tutorialStep = useStore(state => state.tutorialStep);
    const advanceTutorial = useStore(state => state.advanceTutorial);
    const completeTutorial = useStore(state => state.completeTutorial);
    const totalClicks = useStore(state => state.totalClicks);
    const activities = useStore(state => state.activities);
    const funds = useStore(state => state.funds);
    const currentStageIndex = useStore(state => state.currentStageIndex);
    const lifetimeEarnings = useStore(state => state.lifetimeEarnings);
    const happiness = useStore(state => state.happiness);
    const unlockedPolicies = useStore(state => state.unlockedPolicies);

    const [initialClicks, setInitialClicks] = useState<number | null>(null);
    const [initialActivities, setInitialActivities] = useState<number | null>(null);

    // Get current step config
    const currentStep = TUTORIAL_STEPS.find(s => s.id === tutorialStep);

    // Track initial values - only set ONCE
    useEffect(() => {
        if (tutorialStep === 1 && initialClicks === null) {
            setInitialClicks(totalClicks);
        }
        if (tutorialStep === 2 && initialActivities === null) {
            const totalOwned = Object.values(activities).reduce((sum, a) => sum + a.owned, 0);
            setInitialActivities(totalOwned);
        }
    }, [tutorialStep, totalClicks, activities, initialClicks, initialActivities]);

    // Check if click condition is met for step 1
    useEffect(() => {
        if (tutorialStep === 1 && initialClicks !== null) {
            if (totalClicks - initialClicks >= 10) {
                advanceTutorial();
            }
        }
    }, [tutorialStep, totalClicks, initialClicks, advanceTutorial]);

    // Check if purchase condition is met for step 2
    useEffect(() => {
        if (tutorialStep === 2 && initialActivities !== null) {
            const totalOwned = Object.values(activities).reduce((sum, a) => sum + a.owned, 0);
            if (totalOwned > initialActivities) {
                advanceTutorial();
            }
        }
    }, [tutorialStep, activities, initialActivities, advanceTutorial]);

    // === MILESTONE TRIGGERS ===
    // These check if player is "waiting" (tutorialStep > 4) and triggers are met

    // Policy milestone: when step is exactly 5 (waiting for policy trigger)
    // Actually, we use a "waiting" state after step 4 completes
    useEffect(() => {
        // After initial tutorial (step 4), step becomes 5 but we wait for trigger
        // If at step 5 but conditions not met, just wait silently
        // If conditions met, show the tutorial
        if (tutorialStep === 5) {
            // Check if policies-tab exists and funds >= 250
            const policyTab = document.getElementById('policies-tab');
            if (!policyTab || funds < 250) {
                // Conditions not met, skip to waiting for election
                // But we need to wait, so do nothing - the component will render null
            }
        }
    }, [tutorialStep, funds]);

    // Election milestone
    useEffect(() => {
        if (tutorialStep === 6) {
            const FIRST_STAGE_WIN_THRESHOLD = 10000;
            const FIRST_STAGE_HAPPINESS = 40;

            const electionBtn = document.getElementById('win-election-button');
            if (!electionBtn || currentStageIndex !== 0 ||
                lifetimeEarnings < FIRST_STAGE_WIN_THRESHOLD ||
                happiness < FIRST_STAGE_HAPPINESS) {
                // Conditions not met - do nothing, component will render null
            }
        }
    }, [tutorialStep, lifetimeEarnings, happiness, currentStageIndex]);

    // Handle continue button
    const handleContinue = useCallback(() => {
        advanceTutorial();
    }, [advanceTutorial]);

    // Handle skip button - mark tutorial as fully complete
    const handleSkip = useCallback(() => {
        completeTutorial();
    }, [completeTutorial]);

    // Auto-start tutorial when step is 0
    useEffect(() => {
        if (tutorialStep === 0) {
            advanceTutorial();
        }
    }, [tutorialStep, advanceTutorial]);

    // === RENDERING LOGIC ===

    // Tutorial complete at step 7+
    if (tutorialStep >= 7) {
        return null;
    }

    // No step config found
    if (!currentStep) {
        return null;
    }

    // For milestone steps (5-6), check if target element exists
    if (tutorialStep >= 5) {
        const targetElement = document.getElementById(currentStep.targetId);
        if (!targetElement) {
            return null; // Wait silently until target appears
        }

        // Additional checks for milestone conditions
        if (tutorialStep === 5 && (funds < 250 || unlockedPolicies.length > 0)) {
            return null; // Don't show if not enough funds or already has policies
        }

        if (tutorialStep === 6) {
            // Only show if election button is visible (requirements met)
            const FIRST_STAGE_WIN_THRESHOLD = 10000;
            const FIRST_STAGE_HAPPINESS = 40;
            if (currentStageIndex !== 0 ||
                lifetimeEarnings < FIRST_STAGE_WIN_THRESHOLD ||
                happiness < FIRST_STAGE_HAPPINESS) {
                return null;
            }
        }
    }

    // Determine if we should show the continue button
    const showContinue = currentStep.advanceCondition === 'auto';

    // Build message with hints
    let message = currentStep.text;
    if (currentStep.advanceCondition === 'clicks' && initialClicks !== null) {
        const remaining = Math.max(0, 10 - (totalClicks - initialClicks));
        if (remaining > 0) {
            message += ` (${remaining} more clicks!)`;
        }
    }

    return (
        <AnimatePresence>
            <Spotlight targetId={currentStep.targetId} />
            <CampaignManager
                message={message}
                onContinue={handleContinue}
                onSkip={handleSkip}
                showContinue={showContinue}
            />
        </AnimatePresence>
    );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ACTIVITIES } from '../config/activities';
import { MINIGAME_DURATION, VOLUNTEER_BONUS_PER } from '../config/gameConfig';
import { RANKS } from '../config/ranks';

interface FloatingText {
    id: number;
    x: number;
    y: number;
}

export function RecruitmentModal() {
    const activeMiniGame = useStore(state => state.activeMiniGame);
    const miniGameScore = useStore(state => state.miniGameScore);
    const miniGameActivityId = useStore(state => state.miniGameActivityId);
    const currentRankId = useStore(state => state.currentRankId);
    const clickMiniGame = useStore(state => state.clickMiniGame);
    const endMiniGame = useStore(state => state.endMiniGame);

    const [timeLeft, setTimeLeft] = useState(MINIGAME_DURATION);
    const [gamePhase, setGamePhase] = useState<'playing' | 'results'>('playing');
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
    const [finalScore, setFinalScore] = useState(0);
    const [volunteersEarned, setVolunteersEarned] = useState(0);

    // Get activity info
    const activity = ACTIVITIES.find(a => a.id === miniGameActivityId);

    // Get rank multiplier
    const rankIndex = RANKS.findIndex(r => r.id === currentRankId);
    const rankMultiplier = Math.max(1, rankIndex + 1);
    const currentRank = RANKS[rankIndex] || RANKS[0];

    // Use refs to access current values without re-triggering the timer effect
    const scoreRef = useRef(miniGameScore);
    const rankMultiplierRef = useRef(rankMultiplier);

    // Keep refs in sync
    useEffect(() => {
        scoreRef.current = miniGameScore;
    }, [miniGameScore]);

    useEffect(() => {
        rankMultiplierRef.current = rankMultiplier;
    }, [rankMultiplier]);

    // Timer countdown - only depends on activeMiniGame and gamePhase
    useEffect(() => {
        if (activeMiniGame === 'none' || gamePhase === 'results') return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Transition to results - use refs for current values
                    const currentScore = scoreRef.current;
                    const currentMultiplier = rankMultiplierRef.current;
                    setFinalScore(currentScore);
                    setVolunteersEarned(currentScore * currentMultiplier);
                    setGamePhase('results');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [activeMiniGame, gamePhase]);

    // Handle click
    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        clickMiniGame();

        // Spawn floating text at random position near the click
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left + (Math.random() - 0.5) * 60;
        const y = e.clientY - rect.top + (Math.random() - 0.5) * 40;

        const newText: FloatingText = {
            id: Date.now() + Math.random(),
            x,
            y,
        };

        setFloatingTexts(prev => [...prev, newText]);

        // Remove after animation
        setTimeout(() => {
            setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
        }, 800);
    }, [clickMiniGame]);

    // Handle continue (dismiss results)
    const handleContinue = () => {
        endMiniGame();
        // Reset for next time
        setTimeLeft(MINIGAME_DURATION);
        setGamePhase('playing');
        setFloatingTexts([]);
        setFinalScore(0);
        setVolunteersEarned(0);
    };

    if (activeMiniGame === 'none') return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative w-full max-w-md mx-4"
                >
                    {gamePhase === 'playing' ? (
                        <div className="glass-card p-6 text-center">
                            {/* Header */}
                            <motion.div
                                initial={{ y: -20 }}
                                animate={{ y: 0 }}
                                className="mb-4"
                            >
                                <motion.div
                                    className="text-4xl mb-2"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 0.5 }}
                                >
                                    🚨
                                </motion.div>
                                <h2 className="text-2xl font-bold text-red-400 mb-1 uppercase tracking-wider">
                                    EMERGENCY RALLY!
                                </h2>
                                <p className="text-sm text-amber-400 font-medium">
                                    {activity?.emoji} {activity?.name} hit Milestone! MOBILIZE!
                                </p>
                            </motion.div>

                            {/* Timer */}
                            <div className="mb-6">
                                <div className="text-5xl font-bold text-amber-400 mb-2">
                                    {timeLeft}
                                </div>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-amber-400 to-red-500"
                                        initial={{ width: '100%' }}
                                        animate={{ width: `${(timeLeft / MINIGAME_DURATION) * 100}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>

                            {/* Score Display */}
                            <div className="mb-6">
                                <span className="text-slate-400 text-sm">Signatures: </span>
                                <span className="text-3xl font-bold text-emerald-400">
                                    {miniGameScore}
                                </span>
                                <span className="text-slate-500 text-sm ml-2">
                                    (×{rankMultiplier} from {currentRank.title})
                                </span>
                            </div>

                            {/* Click Button */}
                            <div className="relative">
                                <motion.button
                                    onClick={handleClick}
                                    className="w-full py-6 px-8 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-700 text-white text-xl font-bold shadow-lg shadow-emerald-900/50 border-2 border-emerald-400/30 select-none"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ touchAction: 'manipulation' }}
                                >
                                    <motion.span
                                        key={miniGameScore}
                                        initial={{ scale: 1.2 }}
                                        animate={{ scale: 1 }}
                                        className="inline-block"
                                    >
                                        ✍️ SIGN THEM UP!
                                    </motion.span>
                                </motion.button>

                                {/* Floating +1 texts */}
                                <AnimatePresence>
                                    {floatingTexts.map(text => (
                                        <motion.div
                                            key={text.id}
                                            initial={{ opacity: 1, y: 0, scale: 0.5 }}
                                            animate={{ opacity: 0, y: -60, scale: 1.2 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.8 }}
                                            className="absolute pointer-events-none text-emerald-300 font-bold text-lg"
                                            style={{ left: text.x, top: text.y }}
                                        >
                                            +1!
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Instructions */}
                            <p className="mt-4 text-xs text-slate-500">
                                Click as fast as you can! Each signature = 1 Volunteer × Rank Bonus
                            </p>
                        </div>
                    ) : (
                        /* Results Screen */
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="glass-card p-6 text-center"
                        >
                            <div className="text-5xl mb-4">🎉</div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Great Work!
                            </h2>
                            <p className="text-slate-400 mb-6">
                                You collected <span className="text-emerald-400 font-bold">{finalScore}</span> signatures!
                            </p>

                            {/* Reward Breakdown */}
                            <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <span className="text-slate-400">Signatures</span>
                                    <span className="text-white font-bold">{finalScore}</span>
                                    <span className="text-slate-400">×</span>
                                    <span className="text-blue-400 font-bold">{rankMultiplier}</span>
                                    <span className="text-slate-400">(Rank)</span>
                                </div>
                                <div className="text-3xl font-bold text-emerald-400">
                                    +{volunteersEarned} Volunteers!
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    That's +{(volunteersEarned * VOLUNTEER_BONUS_PER * 100).toFixed(2)}% bonus to all earnings!
                                </p>
                            </div>

                            <motion.button
                                onClick={handleContinue}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:from-blue-500 hover:to-purple-500 transition-all"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Continue Campaigning →
                            </motion.button>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

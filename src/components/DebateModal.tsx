import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useDebate } from '../hooks/useDebate';
import { useAudio } from '../hooks/useAudio';
import { STAGES } from '../config/stages';

export function DebateModal() {
    const activeDebate = useStore(state => state.activeDebate);
    const currentOpponent = useStore(state => state.currentOpponent);
    const currentStageIndex = useStore(state => state.currentStageIndex);
    const winDebate = useStore(state => state.winDebate);
    const loseDebate = useStore(state => state.loseDebate);
    const { play } = useAudio();

    const currentStage = STAGES[currentStageIndex];

    const {
        state: battleState,
        moves,
        useMove,
        getMovePreview,
        resetBattle,
    } = useDebate(currentOpponent);

    const logEndRef = useRef<HTMLDivElement>(null);

    // Reset battle when debate opens
    useEffect(() => {
        if (activeDebate && currentOpponent) {
            resetBattle();
        }
    }, [activeDebate, currentOpponent, resetBattle]);

    // Handle battle completion
    useEffect(() => {
        if (!battleState.isComplete) return;

        const timer = setTimeout(() => {
            if (battleState.didPlayerWin) {
                play('stageWin');
                winDebate();
            } else {
                loseDebate();
            }
        }, 2500);

        return () => clearTimeout(timer);
    }, [battleState.isComplete, battleState.didPlayerWin, winDebate, loseDebate, play]);

    // Auto-scroll battle log
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [battleState.battleLog]);

    if (!activeDebate || !currentOpponent) return null;

    // Get accent colors based on stage
    const getAccentClasses = () => {
        switch (currentStage?.accentColor) {
            case 'blue': return {
                gradient: 'from-blue-600 to-cyan-500',
                border: 'border-blue-500/30',
                glow: 'shadow-blue-500/20',
            };
            case 'purple': return {
                gradient: 'from-purple-600 to-violet-500',
                border: 'border-purple-500/30',
                glow: 'shadow-purple-500/20',
            };
            case 'rose': return {
                gradient: 'from-rose-600 to-amber-500',
                border: 'border-rose-500/30',
                glow: 'shadow-rose-500/20',
            };
            default: return {
                gradient: 'from-blue-600 to-cyan-500',
                border: 'border-blue-500/30',
                glow: 'shadow-blue-500/20',
            };
        }
    };

    const accent = getAccentClasses();
    const playerHealthPercent = (battleState.playerHp / battleState.maxPlayerHp) * 100;
    const enemyHealthPercent = (battleState.enemyHp / battleState.maxEnemyHp) * 100;

    // Screen shake animation
    const shakeAnimation = battleState.isShaking ? {
        x: [-8, 8, -6, 6, -4, 4, -2, 2, 0],
        transition: { duration: 0.4 }
    } : {};

    return (
        <AnimatePresence>
            {activeDebate && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Modal Container with Shake */}
                    <motion.div
                        className={`relative w-full max-w-3xl max-h-[90vh] bg-slate-900/95 rounded-xl border ${accent.border} shadow-2xl ${accent.glow} overflow-hidden flex flex-col`}
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0, ...shakeAnimation }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* TV Broadcast Header */}
                        <div className={`bg-gradient-to-r ${accent.gradient} px-3 py-1.5 flex items-center justify-between flex-shrink-0`}>
                            <div className="flex items-center gap-2">
                                <motion.div
                                    className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded"
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                >
                                    🔴 LIVE
                                </motion.div>
                                <span className="text-white font-semibold text-sm">
                                    {currentStage?.name} Debate
                                </span>
                            </div>
                            <div className="text-white/80 text-xs">
                                📺 PRN
                            </div>
                        </div>

                        {/* Scrollable Battle Arena */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {/* Combatants Row - Compact */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {/* Player Side (LEFT) */}
                                <div className="relative">
                                    <div className="bg-slate-800/50 rounded-lg p-3 border border-emerald-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="text-2xl">✊</div>
                                            <div>
                                                <div className="text-sm font-bold text-emerald-400">You</div>
                                                <div className="text-[10px] text-slate-400">The Challenger</div>
                                            </div>
                                        </div>

                                        {/* Player Health Bar */}
                                        <div className="relative h-6 bg-slate-700 rounded-full overflow-hidden border border-emerald-500/30">
                                            <motion.div
                                                className={`absolute inset-y-0 left-0 ${playerHealthPercent > 50
                                                    ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                                                    : playerHealthPercent > 25
                                                        ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                                                        : 'bg-gradient-to-r from-red-500 to-rose-400'
                                                    }`}
                                                initial={{ width: '100%' }}
                                                animate={{ width: `${playerHealthPercent}%` }}
                                                transition={{ type: 'spring', damping: 15 }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs font-bold text-white drop-shadow-lg">
                                                    {battleState.playerHp}/{battleState.maxPlayerHp}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Enemy Side (RIGHT) */}
                                <div className="relative">
                                    <div className="bg-slate-800/50 rounded-lg p-3 border border-rose-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="text-2xl">🎭</div>
                                            <div>
                                                <div className="text-sm font-bold text-rose-400">{currentOpponent.name}</div>
                                                <div className="text-[10px] text-slate-400">{currentOpponent.title}</div>
                                            </div>
                                        </div>

                                        {/* Enemy Health Bar */}
                                        <div className="relative h-6 bg-slate-700 rounded-full overflow-hidden border border-rose-500/30">
                                            <motion.div
                                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-500 to-red-400"
                                                initial={{ width: '100%' }}
                                                animate={{ width: `${enemyHealthPercent}%` }}
                                                transition={{ type: 'spring', damping: 15 }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs font-bold text-white drop-shadow-lg">
                                                    {battleState.enemyHp}/{battleState.maxEnemyHp}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Battle Log - Compact */}
                            <div className="bg-slate-950 rounded-lg p-3 mb-4 h-24 overflow-y-auto border-2 border-slate-700">
                                <div className="space-y-2 font-mono">
                                    {battleState.battleLog.map(entry => (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`text-sm ${entry.type === 'player'
                                                ? 'text-emerald-300'
                                                : entry.type === 'enemy'
                                                    ? 'text-rose-300'
                                                    : 'text-amber-300 font-bold'
                                                }`}
                                        >
                                            ▸ {entry.text}
                                        </motion.div>
                                    ))}
                                    <div ref={logEndRef} />
                                </div>
                            </div>

                            {/* Turn Indicator */}
                            <div className="text-center mb-3">
                                {battleState.isComplete ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className={`text-xl font-bold ${battleState.didPlayerWin ? 'text-emerald-400' : 'text-rose-400'}`}
                                    >
                                        {battleState.didPlayerWin ? '🎉 VICTORY!' : '💔 DEFEATED'}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${battleState.turn === 'player'
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                            }`}
                                        animate={{ scale: [1, 1.02, 1] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    >
                                        {battleState.turn === 'player'
                                            ? '⚔️ Choose a Policy!'
                                            : '⏳ Enemy turn...'}
                                    </motion.div>
                                )}
                            </div>

                            {/* Move Buttons - Compact Policy Grid */}
                            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700">
                                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                                    📜 Your Moves (Policies)
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {moves.map(move => {
                                        const preview = getMovePreview(move.id);
                                        const isDisabled = battleState.turn !== 'player' || battleState.isComplete || preview.onCooldown;

                                        return (
                                            <motion.button
                                                key={move.id}
                                                onClick={() => {
                                                    if (!isDisabled) {
                                                        play('buy');
                                                        useMove(move.id);
                                                    }
                                                }}
                                                disabled={isDisabled}
                                                className={`relative p-2 rounded-lg text-left transition-all overflow-hidden ${preview.onCooldown
                                                    ? 'bg-slate-800/80 opacity-60 cursor-not-allowed'
                                                    : isDisabled
                                                        ? 'bg-slate-800/50 opacity-50 cursor-not-allowed'
                                                        : 'bg-gradient-to-br from-emerald-600/20 to-cyan-600/20 hover:from-emerald-600/40 hover:to-cyan-600/40 border border-emerald-500/30 cursor-pointer'
                                                    }`}
                                                whileHover={isDisabled ? {} : { scale: 1.02 }}
                                                whileTap={isDisabled ? {} : { scale: 0.98 }}
                                            >
                                                {/* Cooldown Overlay */}
                                                {preview.onCooldown && (
                                                    <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                                                        <div className="text-center">
                                                            <div className="text-lg">⏳</div>
                                                            <div className="text-[10px] text-slate-400">
                                                                {preview.turnsRemaining}T
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="text-xs font-semibold text-white truncate mb-1">{move.name}</div>
                                                <div className="flex items-center justify-between">
                                                    <div className="text-[10px] font-medium text-emerald-400">
                                                        ⚔️ {move.damage}
                                                    </div>
                                                    {move.maxCooldown > 0 && !preview.onCooldown && (
                                                        <div className="text-[10px] text-slate-500">
                                                            CD:{move.maxCooldown}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Chyron */}
                        <div className="bg-slate-950 px-3 py-1.5 border-t border-slate-800 flex-shrink-0">
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <span>📍 {currentStage?.name}</span>
                                <span className="flex items-center gap-2">
                                    <span className="text-emerald-400">Win → Stage Up</span>
                                    <span className="text-slate-600">|</span>
                                    <span className="text-rose-400">Lose → -10 Happiness</span>
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

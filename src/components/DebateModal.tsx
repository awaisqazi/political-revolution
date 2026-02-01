import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useDebate, ATTACKS } from '../hooks/useDebate';
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
        executePlayerAttack,
        executeEnemyAttack,
        getAttackPreview,
        resetBattle,
    } = useDebate(currentOpponent);

    const logEndRef = useRef<HTMLDivElement>(null);

    // Reset battle when debate opens
    useEffect(() => {
        if (activeDebate && currentOpponent) {
            resetBattle();
        }
    }, [activeDebate, currentOpponent, resetBattle]);

    // Enemy turn logic
    useEffect(() => {
        if (!activeDebate || battleState.isComplete || battleState.isPlayerTurn) return;

        const timer = setTimeout(() => {
            executeEnemyAttack();
        }, 1200);

        return () => clearTimeout(timer);
    }, [activeDebate, battleState.isPlayerTurn, battleState.isComplete, executeEnemyAttack]);

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
        }, 2000);

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
    const playerHealthPercent = (battleState.playerHealth / battleState.maxPlayerHealth) * 100;
    const enemyHealthPercent = (battleState.enemyHealth / battleState.maxEnemyHealth) * 100;

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

                    {/* Modal Container */}
                    <motion.div
                        className={`relative w-full max-w-4xl bg-slate-900/95 rounded-xl border ${accent.border} shadow-2xl ${accent.glow} overflow-hidden`}
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* TV Broadcast Header */}
                        <div className={`bg-gradient-to-r ${accent.gradient} px-4 py-2 flex items-center justify-between`}>
                            <div className="flex items-center gap-3">
                                <motion.div
                                    className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded"
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                >
                                    🔴 LIVE
                                </motion.div>
                                <span className="text-white font-semibold">
                                    {currentStage?.name} Debate
                                </span>
                            </div>
                            <div className="text-white/80 text-sm">
                                📺 POLITICAL REVOLUTION NETWORK
                            </div>
                        </div>

                        {/* Battle Arena */}
                        <div className="p-6">
                            {/* Combatants Row */}
                            <div className="grid grid-cols-2 gap-8 mb-6">
                                {/* Player Side */}
                                <div className="text-center">
                                    <div className="text-4xl mb-2">✊</div>
                                    <div className="text-lg font-bold text-white">You</div>
                                    <div className="text-sm text-slate-400 mb-3">The Challenger</div>

                                    {/* Player Health Bar */}
                                    <div className="relative h-6 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`absolute inset-y-0 left-0 ${playerHealthPercent > 30 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-red-500 to-orange-400'}`}
                                            initial={{ width: '100%' }}
                                            animate={{ width: `${playerHealthPercent}%` }}
                                            transition={{ type: 'spring', damping: 15 }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs font-bold text-white drop-shadow-lg">
                                                {battleState.playerHealth} / {battleState.maxPlayerHealth}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">Your Credibility</div>
                                </div>

                                {/* Enemy Side */}
                                <div className="text-center">
                                    <div className="text-4xl mb-2">🎭</div>
                                    <div className="text-lg font-bold text-rose-400">{currentOpponent.name}</div>
                                    <div className="text-sm text-slate-400 mb-3">{currentOpponent.title}</div>

                                    {/* Enemy Health Bar */}
                                    <div className="relative h-6 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-500 to-red-400"
                                            initial={{ width: '100%' }}
                                            animate={{ width: `${enemyHealthPercent}%` }}
                                            transition={{ type: 'spring', damping: 15 }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs font-bold text-white drop-shadow-lg">
                                                {battleState.enemyHealth} / {battleState.maxEnemyHealth}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">Their Credibility</div>
                                </div>
                            </div>

                            {/* Opponent Description */}
                            <div className="text-center mb-4">
                                <p className="text-sm text-slate-400 italic">
                                    "{currentOpponent.description}"
                                </p>
                            </div>

                            {/* Battle Log - News Chyron Style */}
                            <div className="bg-slate-800/50 rounded-lg p-3 mb-6 h-32 overflow-y-auto border border-slate-700">
                                <div className="space-y-2">
                                    {battleState.battleLog.map(entry => (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`text-sm px-2 py-1 rounded ${entry.type === 'player'
                                                    ? 'bg-emerald-900/30 text-emerald-300 border-l-2 border-emerald-500'
                                                    : entry.type === 'enemy'
                                                        ? 'bg-rose-900/30 text-rose-300 border-l-2 border-rose-500'
                                                        : 'bg-amber-900/30 text-amber-300 border-l-2 border-amber-500'
                                                }`}
                                        >
                                            {entry.text}
                                        </motion.div>
                                    ))}
                                    <div ref={logEndRef} />
                                </div>
                            </div>

                            {/* Turn Indicator */}
                            <div className="text-center mb-4">
                                {battleState.isComplete ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className={`text-2xl font-bold ${battleState.didPlayerWin ? 'text-emerald-400' : 'text-rose-400'}`}
                                    >
                                        {battleState.didPlayerWin ? '🎉 VICTORY!' : '💔 DEFEATED'}
                                    </motion.div>
                                ) : (
                                    <div className={`text-sm font-medium ${battleState.isPlayerTurn ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {battleState.isPlayerTurn ? '✨ Your Turn - Choose Your Attack!' : '⏳ Opponent is responding...'}
                                    </div>
                                )}
                            </div>

                            {/* Attack Buttons */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {ATTACKS.map(attack => {
                                    const preview = getAttackPreview(attack.id);
                                    const isDisabled = !battleState.isPlayerTurn || battleState.isComplete;

                                    return (
                                        <motion.button
                                            key={attack.id}
                                            onClick={() => {
                                                if (!isDisabled) {
                                                    play('buy');
                                                    executePlayerAttack(attack.id);
                                                }
                                            }}
                                            disabled={isDisabled}
                                            className={`p-3 rounded-xl text-left transition-all ${isDisabled
                                                    ? 'bg-slate-800/50 opacity-50 cursor-not-allowed'
                                                    : attack.isHeal
                                                        ? 'bg-gradient-to-br from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/40 hover:to-blue-600/40 border border-cyan-500/30'
                                                        : 'bg-gradient-to-br from-emerald-600/20 to-green-600/20 hover:from-emerald-600/40 hover:to-green-600/40 border border-emerald-500/30'
                                                }`}
                                            whileHover={isDisabled ? {} : { scale: 1.02 }}
                                            whileTap={isDisabled ? {} : { scale: 0.98 }}
                                        >
                                            <div className="text-2xl mb-1">{attack.emoji}</div>
                                            <div className="text-sm font-semibold text-white">{attack.name}</div>
                                            <div className="text-xs text-slate-400 mb-2">{attack.description}</div>
                                            <div className={`text-xs font-medium ${attack.isHeal ? 'text-cyan-400' : 'text-emerald-400'}`}>
                                                {attack.isHeal ? `+${preview.value} Heal` : `${preview.value} Damage`}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Scales: {attack.scaleStat}
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Bottom Chyron */}
                        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>📍 {currentStage?.name} Electoral Race</span>
                                <span>Win to advance your political career</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

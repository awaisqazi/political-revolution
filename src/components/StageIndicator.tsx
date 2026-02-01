import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useAudio } from '../hooks/useAudio';
import { STAGES, canPromoteStage } from '../config/stages';
import { formatMoney } from '../utils/formatting';

export function StageIndicator() {
    const currentStageIndex = useStore(state => state.currentStageIndex);
    const lifetimeEarnings = useStore(state => state.lifetimeEarnings);
    const happiness = useStore(state => state.happiness);
    const startDebate = useStore(state => state.startDebate);

    const currentStage = STAGES[currentStageIndex];
    const nextStage = STAGES[currentStageIndex + 1];
    const canPromote = canPromoteStage(currentStageIndex, lifetimeEarnings, happiness);
    const { play } = useAudio();

    const getStageColor = () => {
        switch (currentStage.colorTheme) {
            case 'slate': return 'from-slate-600 to-slate-500';
            case 'blue': return 'from-blue-600 to-blue-500';
            case 'cyan': return 'from-cyan-600 to-cyan-500';
            case 'indigo': return 'from-indigo-600 to-indigo-500';
            case 'violet': return 'from-violet-600 to-violet-500';
            case 'purple': return 'from-purple-600 to-purple-500';
            case 'rose': return 'from-rose-600 to-rose-500';
            default: return 'from-blue-600 to-blue-500';
        }
    };

    const getBorderColor = () => {
        switch (currentStage.colorTheme) {
            case 'slate': return 'border-slate-500/30';
            case 'blue': return 'border-blue-500/30';
            case 'cyan': return 'border-cyan-500/30';
            case 'indigo': return 'border-indigo-500/30';
            case 'violet': return 'border-violet-500/30';
            case 'purple': return 'border-purple-500/30';
            case 'rose': return 'border-rose-500/30';
            default: return 'border-blue-500/30';
        }
    };

    const fundingProgress = nextStage
        ? Math.min(100, (lifetimeEarnings / currentStage.winThreshold) * 100)
        : 100;

    const happinessProgress = nextStage
        ? Math.min(100, (happiness / currentStage.happinessRequired) * 100)
        : 100;

    return (
        <div className={`glass-card p-4 border ${getBorderColor()}`}>
            {/* Current Stage Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentStage.emoji}</span>
                    <div>
                        <h3 className="font-semibold text-white">{currentStage.name}</h3>
                        <p className="text-xs text-slate-400 italic">"{currentStage.flavorText}"</p>
                    </div>
                </div>

                {/* Stage Progress Dots */}
                <div className="flex gap-1">
                    {STAGES.map((stage, i) => (
                        <motion.div
                            key={stage.id}
                            className={`w-3 h-3 rounded-full ${i < currentStageIndex
                                ? 'bg-emerald-500'
                                : i === currentStageIndex
                                    ? `bg-gradient-to-r ${getStageColor()}`
                                    : 'bg-slate-700'
                                }`}
                            animate={i === currentStageIndex ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                        />
                    ))}
                </div>
            </div>

            {/* Requirements for Promotion */}
            {nextStage && (
                <div className="space-y-3">
                    <div className="text-xs text-slate-400 mb-1">
                        Win Requirements for {nextStage.name}:
                    </div>

                    {/* Funding Requirement */}
                    <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-400">💰 Funding</span>
                            <span className={lifetimeEarnings >= currentStage.winThreshold ? 'text-emerald-400' : 'text-slate-300'}>
                                {formatMoney(lifetimeEarnings)} / {formatMoney(currentStage.winThreshold)}
                            </span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full ${lifetimeEarnings >= currentStage.winThreshold
                                    ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                                    : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                    } rounded-full`}
                                initial={{ width: 0 }}
                                animate={{ width: `${fundingProgress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>

                    {/* Happiness Requirement */}
                    <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-400">😊 Happiness</span>
                            <span className={happiness >= currentStage.happinessRequired ? 'text-emerald-400' : 'text-slate-300'}>
                                {happiness}% / {currentStage.happinessRequired}%
                            </span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full ${happiness >= currentStage.happinessRequired
                                    ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                                    : 'bg-gradient-to-r from-pink-500 to-rose-400'
                                    } rounded-full`}
                                initial={{ width: 0 }}
                                animate={{ width: `${happinessProgress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>

                    {/* Debate Button */}
                    {canPromote && (
                        <motion.button
                            id="win-election-button"
                            onClick={() => { startDebate(); play('buy'); }}
                            className="w-full py-2 mt-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold text-sm hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-amber-900/30"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            🎤 Enter Debate → {nextStage.name}
                        </motion.button>
                    )}
                </div>
            )}

            {/* Final Stage Message */}
            {!nextStage && (
                <div className="text-center py-2">
                    <span className="text-sm text-rose-300">
                        {happiness >= 100 ? '✨ Utopia Achieved!' : 'Reach 100% Happiness for Utopia'}
                    </span>
                </div>
            )}
        </div>
    );
}

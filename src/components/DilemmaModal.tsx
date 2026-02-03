import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { STAGES } from '../config/stages';
import { getPollingImpactText } from '../config/dilemmas';

export function DilemmaModal() {
    const activeDilemma = useStore(state => state.activeDilemma);
    const resolveDilemma = useStore(state => state.resolveDilemma);
    const currentStageIndex = useStore(state => state.currentStageIndex);

    const currentStage = STAGES[currentStageIndex];

    if (!activeDilemma) return null;

    // Get accent colors based on current stage
    const getAccentClasses = () => {
        switch (currentStage?.accentColor) {
            case 'blue': return {
                gradient: 'from-blue-600 to-cyan-500',
                border: 'border-blue-500/30',
                glow: 'shadow-blue-500/20',
                choiceA: 'from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400',
                choiceB: 'from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400',
            };
            case 'purple': return {
                gradient: 'from-purple-600 to-violet-500',
                border: 'border-purple-500/30',
                glow: 'shadow-purple-500/20',
                choiceA: 'from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400',
                choiceB: 'from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400',
            };
            case 'rose': return {
                gradient: 'from-rose-600 to-amber-500',
                border: 'border-rose-500/30',
                glow: 'shadow-rose-500/20',
                choiceA: 'from-sky-600 to-blue-500 hover:from-sky-500 hover:to-blue-400',
                choiceB: 'from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400',
            };
            default: return {
                gradient: 'from-blue-600 to-cyan-500',
                border: 'border-blue-500/30',
                glow: 'shadow-blue-500/20',
                choiceA: 'from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400',
                choiceB: 'from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400',
            };
        }
    };

    const accent = getAccentClasses();

    // Format effect preview
    const formatEffects = (effects: { funds?: number; popularity?: number; happiness?: number; volunteers?: number }) => {
        const parts: string[] = [];
        if (effects.funds) {
            parts.push(effects.funds > 0 ? `💰 +$${Math.abs(effects.funds).toLocaleString()}` : `💸 -$${Math.abs(effects.funds).toLocaleString()}`);
        }
        if (effects.popularity) {
            parts.push(effects.popularity > 0 ? `📈 Pop ↑` : `📉 Pop ↓`);
        }
        if (effects.happiness) {
            parts.push(effects.happiness > 0 ? `😊 +${effects.happiness}%` : `😔 ${effects.happiness}%`);
        }
        if (effects.volunteers) {
            parts.push(effects.volunteers > 0 ? `✊ +${effects.volunteers}` : `👤 ${effects.volunteers}`);
        }
        return parts.join(' • ');
    };

    return (
        <AnimatePresence>
            {activeDilemma && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Modal */}
                    <motion.div
                        className={`relative max-w-lg w-full bg-slate-900/95 rounded-2xl border ${accent.border} shadow-2xl ${accent.glow} overflow-hidden`}
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Header with gradient */}
                        <div className={`bg-gradient-to-r ${accent.gradient} p-4`}>
                            <div className="flex items-center gap-3">
                                <span className="text-4xl">{activeDilemma.emoji}</span>
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-white/70 font-medium">
                                        Political Dilemma
                                    </div>
                                    <h2 className="text-xl font-bold text-white">
                                        {activeDilemma.title}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="p-5">
                            <p className="text-slate-300 text-base leading-relaxed mb-6">
                                {activeDilemma.description}
                            </p>

                            {/* Choices */}
                            <div className="space-y-3">
                                {/* Choice A */}
                                <motion.button
                                    onClick={() => resolveDilemma('choiceA')}
                                    className={`w-full text-left p-4 rounded-xl bg-gradient-to-r ${accent.choiceA} text-white transition-all shadow-lg`}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="font-semibold text-base mb-1">
                                        {activeDilemma.choiceA.text}
                                    </div>
                                    <div className="text-xs text-white/80 mb-1">
                                        {formatEffects(activeDilemma.choiceA.effects)}
                                    </div>
                                    {/* Polling Impact Indicator */}
                                    {activeDilemma.choiceA.pollingImpact && (
                                        <div className={`text-xs font-medium ${
                                            activeDilemma.choiceA.pollingImpact.includes('positive')
                                                ? 'text-emerald-200'
                                                : activeDilemma.choiceA.pollingImpact.includes('negative')
                                                    ? 'text-red-200'
                                                    : 'text-white/60'
                                        }`}>
                                            {getPollingImpactText(activeDilemma.choiceA.pollingImpact).text}
                                        </div>
                                    )}
                                </motion.button>

                                {/* Choice B */}
                                <motion.button
                                    onClick={() => resolveDilemma('choiceB')}
                                    className={`w-full text-left p-4 rounded-xl bg-gradient-to-r ${accent.choiceB} text-white transition-all shadow-lg`}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="font-semibold text-base mb-1">
                                        {activeDilemma.choiceB.text}
                                    </div>
                                    <div className="text-xs text-white/80 mb-1">
                                        {formatEffects(activeDilemma.choiceB.effects)}
                                    </div>
                                    {/* Polling Impact Indicator */}
                                    {activeDilemma.choiceB.pollingImpact && (
                                        <div className={`text-xs font-medium ${
                                            activeDilemma.choiceB.pollingImpact.includes('positive')
                                                ? 'text-emerald-200'
                                                : activeDilemma.choiceB.pollingImpact.includes('negative')
                                                    ? 'text-red-200'
                                                    : 'text-white/60'
                                        }`}>
                                            {getPollingImpactText(activeDilemma.choiceB.pollingImpact).text}
                                        </div>
                                    )}
                                </motion.button>
                            </div>

                            {/* Footer hint */}
                            <p className="text-xs text-slate-500 text-center mt-4">
                                Your choice will shape your campaign's future
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

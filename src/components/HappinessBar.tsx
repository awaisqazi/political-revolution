import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getMoraleMultiplier } from '../config/stages';

export function HappinessBar() {
    const happiness = useStore(state => state.happiness);
    const moraleMultiplier = getMoraleMultiplier(happiness);

    const getHappinessColor = () => {
        if (happiness >= 80) return 'from-emerald-500 to-green-400';
        if (happiness >= 60) return 'from-green-500 to-lime-400';
        if (happiness >= 50) return 'from-yellow-500 to-amber-400';
        if (happiness >= 30) return 'from-orange-500 to-amber-500';
        return 'from-red-500 to-orange-400';
    };

    const getStatusText = () => {
        if (happiness >= 100) return '✨ UTOPIA';
        if (happiness >= 80) return 'Thriving';
        if (happiness >= 60) return 'Hopeful';
        if (happiness >= 50) return 'Status Quo';
        if (happiness >= 30) return 'Discontent';
        return 'Crisis';
    };

    const getStatusEmoji = () => {
        if (happiness >= 100) return '🌟';
        if (happiness >= 80) return '😊';
        if (happiness >= 60) return '🙂';
        if (happiness >= 50) return '😐';
        if (happiness >= 30) return '😟';
        return '😢';
    };

    return (
        <div className="glass-card p-3">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{getStatusEmoji()}</span>
                    <span className="text-sm font-medium text-slate-300">
                        Public Happiness
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{getStatusText()}</span>
                    <span className="text-sm font-bold text-white">{happiness}%</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full bg-gradient-to-r ${getHappinessColor()} rounded-full relative`}
                    initial={{ width: 0 }}
                    animate={{ width: `${happiness}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </motion.div>

                {/* Goal marker at 100% */}
                <div
                    className="absolute top-0 right-0 h-full w-0.5 bg-emerald-400/50"
                    title="Utopia - 100%"
                />
            </div>

            {/* Morale Bonus Indicator */}
            <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-slate-500">Morale Bonus</span>
                <span className={`font-medium ${moraleMultiplier >= 1 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {moraleMultiplier >= 1 ? '+' : ''}{((moraleMultiplier - 1) * 100).toFixed(0)}% Revenue
                </span>
            </div>
        </div>
    );
}

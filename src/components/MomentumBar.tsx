import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { MOMENTUM_BONUS_THRESHOLD_1, MOMENTUM_BONUS_THRESHOLD_2, getMomentumMultiplier } from '../config/gameConfig';

export function MomentumBar() {
    const momentum = useStore(state => state.momentum);
    const multiplier = getMomentumMultiplier(momentum);

    const isLevel1 = momentum >= MOMENTUM_BONUS_THRESHOLD_1;
    const isLevel2 = momentum >= MOMENTUM_BONUS_THRESHOLD_2;

    return (
        <div className="w-full">
            {/* Labels */}
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400 font-medium">
                    MOMENTUM
                </span>
                <div className="flex items-center gap-2">
                    {multiplier > 1 && (
                        <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${isLevel2
                                    ? 'bg-pink-500/20 text-pink-400'
                                    : 'bg-blue-500/20 text-blue-400'
                                }`}
                        >
                            {multiplier}x SPEED
                        </motion.span>
                    )}
                    <span className="text-sm font-mono text-slate-300 tabular-nums">
                        {momentum.toFixed(0)}%
                    </span>
                </div>
            </div>

            {/* Bar Container */}
            <div className={`relative h-4 rounded-full overflow-hidden bg-slate-800/50 ${isLevel2 ? 'momentum-glow-intense' : isLevel1 ? 'momentum-glow' : ''
                }`}>
                {/* Threshold Markers */}
                <div
                    className="absolute top-0 bottom-0 w-px bg-blue-400/50 z-10"
                    style={{ left: `${MOMENTUM_BONUS_THRESHOLD_1}%` }}
                />
                <div
                    className="absolute top-0 bottom-0 w-px bg-pink-400/50 z-10"
                    style={{ left: `${MOMENTUM_BONUS_THRESHOLD_2}%` }}
                />

                {/* Fill Bar */}
                <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                        background: isLevel2
                            ? 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)'
                            : isLevel1
                                ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                                : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                    }}
                    initial={false}
                    animate={{ width: `${momentum}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />

                {/* Shimmer Effect */}
                {momentum > 0 && (
                    <motion.div
                        className="absolute inset-y-0 w-20 opacity-30"
                        style={{
                            background: 'linear-gradient(90deg, transparent, white, transparent)',
                        }}
                        animate={{
                            left: ['-20%', '120%'],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                )}
            </div>

            {/* Status Message */}
            <div className="mt-2 text-center">
                <span className={`text-xs ${isLevel2
                        ? 'text-pink-400'
                        : isLevel1
                            ? 'text-blue-400'
                            : 'text-slate-500'
                    }`}>
                    {isLevel2
                        ? '🔥 THE MOVEMENT IS UNSTOPPABLE!'
                        : isLevel1
                            ? '✨ Building momentum!'
                            : momentum > 0
                                ? 'Keep canvassing to build momentum...'
                                : 'Click CANVASS to energize the movement!'}
                </span>
            </div>
        </div>
    );
}

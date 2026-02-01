import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useState } from 'react';
import { hasAllPresidentPolicies } from '../config/policies';

export function UtopiaModal() {
    const utopiaAchieved = useStore(state => state.utopiaAchieved);
    const currentStageIndex = useStore(state => state.currentStageIndex);
    const happiness = useStore(state => state.happiness);
    const unlockedPolicies = useStore(state => state.unlockedPolicies);
    const [dismissed, setDismissed] = useState(false);

    // Only show if utopia is achieved (happiness 100% + all President policies) and not dismissed
    const isVisible = utopiaAchieved &&
        currentStageIndex === 2 &&
        happiness >= 100 &&
        hasAllPresidentPolicies(unlockedPolicies) &&
        !dismissed;

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
                {/* Celebration particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(50)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-3 h-3 rounded-full"
                            style={{
                                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'][i % 6],
                                left: `${Math.random() * 100}%`,
                                top: '-20px',
                            }}
                            initial={{ y: 0, opacity: 1, rotate: 0, scale: Math.random() * 0.5 + 0.5 }}
                            animate={{
                                y: '120vh',
                                opacity: [1, 1, 0],
                                rotate: 720,
                                x: (Math.random() - 0.5) * 200
                            }}
                            transition={{
                                duration: 4 + Math.random() * 3,
                                delay: Math.random() * 2,
                                ease: 'easeOut',
                                repeat: Infinity,
                                repeatDelay: Math.random() * 2
                            }}
                        />
                    ))}
                </div>

                {/* Radial glow */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%)'
                    }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />

                <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.5, opacity: 0, y: 50 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                    className="relative w-full max-w-lg bg-gradient-to-br from-emerald-900/90 via-slate-900 to-emerald-900/90 rounded-3xl border border-emerald-500/50 shadow-2xl shadow-emerald-500/30 overflow-hidden"
                >
                    {/* Golden shimmer border */}
                    <div className="absolute inset-0 rounded-3xl">
                        <motion.div
                            className="absolute inset-0 border-2 border-emerald-400/50 rounded-3xl"
                            animate={{
                                boxShadow: [
                                    '0 0 20px rgba(16, 185, 129, 0.3)',
                                    '0 0 40px rgba(16, 185, 129, 0.5)',
                                    '0 0 20px rgba(16, 185, 129, 0.3)'
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>

                    {/* Content */}
                    <div className="relative p-8 text-center">
                        {/* Trophy */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', delay: 0.3, damping: 15 }}
                            className="mb-6"
                        >
                            <span className="text-8xl">🏆</span>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-4xl font-bold mb-4"
                        >
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 animate-pulse">
                                UTOPIA ACHIEVED
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-xl text-emerald-200 mb-6"
                        >
                            The Revolution is Complete
                        </motion.p>

                        {/* Description */}
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="space-y-4 mb-8"
                        >
                            <p className="text-slate-300 leading-relaxed">
                                You have eradicated hunger, poverty, and scarcity.
                                Healthcare is a human right. Housing is guaranteed.
                                Education is free. The planet is healing.
                            </p>
                            <p className="text-emerald-400 font-medium">
                                Every citizen lives with dignity.
                                The dream of a just society is now reality.
                            </p>
                        </motion.div>

                        {/* Stats Summary */}
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.1 }}
                            className="grid grid-cols-3 gap-4 mb-8 p-4 bg-slate-800/50 rounded-xl"
                        >
                            <div>
                                <div className="text-2xl">🏥</div>
                                <div className="text-xs text-slate-400">Uninsured</div>
                                <div className="text-emerald-400 font-bold">0</div>
                            </div>
                            <div>
                                <div className="text-2xl">🏠</div>
                                <div className="text-xs text-slate-400">Homeless</div>
                                <div className="text-emerald-400 font-bold">0</div>
                            </div>
                            <div>
                                <div className="text-2xl">💚</div>
                                <div className="text-xs text-slate-400">Happiness</div>
                                <div className="text-emerald-400 font-bold">100%</div>
                            </div>
                        </motion.div>

                        {/* Buttons */}
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.3 }}
                            className="space-y-3"
                        >
                            <motion.button
                                onClick={() => setDismissed(true)}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                🌟 Continue in Sandbox Mode
                            </motion.button>
                            <p className="text-xs text-slate-500">
                                Keep playing! Help other countries achieve utopia.
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

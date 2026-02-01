import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useEffect, useState } from 'react';

export function PolicyImpactModal() {
    const lastPurchasedPolicy = useStore(state => state.lastPurchasedPolicy);
    const clearPolicyModal = useStore(state => state.clearPolicyModal);
    const happiness = useStore(state => state.happiness);

    const [previousHappiness, setPreviousHappiness] = useState(happiness);
    const [animatedHappiness, setAnimatedHappiness] = useState(happiness);

    // Capture the happiness before the change
    useEffect(() => {
        if (lastPurchasedPolicy && lastPurchasedPolicy.happinessChange > 0) {
            const oldHappiness = happiness - lastPurchasedPolicy.happinessChange;
            setPreviousHappiness(Math.max(0, oldHappiness));
            setAnimatedHappiness(Math.max(0, oldHappiness));

            // Animate to new value after a short delay
            const timer = setTimeout(() => {
                setAnimatedHappiness(happiness);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [lastPurchasedPolicy, happiness]);

    if (!lastPurchasedPolicy || !lastPurchasedPolicy.impactDescription) return null;

    const getHappinessColor = (value: number) => {
        if (value >= 80) return 'from-emerald-500 to-green-400';
        if (value >= 60) return 'from-green-500 to-lime-400';
        if (value >= 50) return 'from-yellow-500 to-amber-400';
        if (value >= 30) return 'from-orange-500 to-amber-500';
        return 'from-red-500 to-orange-400';
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                onClick={clearPolicyModal}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-emerald-500/30 shadow-2xl shadow-emerald-500/20 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Confetti background effect */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full"
                                style={{
                                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'][i % 5],
                                    left: `${Math.random() * 100}%`,
                                    top: '-10px',
                                }}
                                initial={{ y: 0, opacity: 1, rotate: 0 }}
                                animate={{
                                    y: 400,
                                    opacity: 0,
                                    rotate: 360,
                                    x: (Math.random() - 0.5) * 100
                                }}
                                transition={{
                                    duration: 2 + Math.random() * 2,
                                    delay: Math.random() * 0.5,
                                    ease: 'easeOut'
                                }}
                            />
                        ))}
                    </div>

                    {/* Header */}
                    <div className="relative p-6 pb-0 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="inline-block mb-4"
                        >
                            <span className="text-6xl">🎉</span>
                        </motion.div>

                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300 mb-2"
                        >
                            POLICY PASSED!
                        </motion.h2>

                        <motion.h3
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl font-semibold text-white mb-2"
                        >
                            {lastPurchasedPolicy.impactTitle || lastPurchasedPolicy.name}
                        </motion.h3>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-slate-300 text-center leading-relaxed"
                        >
                            {lastPurchasedPolicy.impactDescription}
                        </motion.p>

                        {/* Happiness Bar Animation */}
                        {lastPurchasedPolicy.happinessChange > 0 && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="space-y-2"
                            >
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Public Happiness</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500">{previousHappiness}%</span>
                                        <motion.span
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 1 }}
                                            className="text-emerald-400"
                                        >
                                            → {happiness}%
                                        </motion.span>
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 1.2, type: 'spring' }}
                                            className="text-emerald-300 text-xs font-medium px-1.5 py-0.5 bg-emerald-500/20 rounded"
                                        >
                                            +{lastPurchasedPolicy.happinessChange}%
                                        </motion.span>
                                    </div>
                                </div>

                                <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full bg-gradient-to-r ${getHappinessColor(animatedHappiness)} rounded-full relative`}
                                        initial={{ width: `${previousHappiness}%` }}
                                        animate={{ width: `${animatedHappiness}%` }}
                                        transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
                                    >
                                        {/* Shimmer effect */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                            initial={{ x: '-100%' }}
                                            animate={{ x: '100%' }}
                                            transition={{ duration: 1.5, delay: 1.3, ease: 'easeInOut' }}
                                        />
                                    </motion.div>
                                </div>

                                {happiness >= 100 && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 2 }}
                                        className="text-center text-emerald-400 font-medium"
                                    >
                                        ✨ UTOPIA ACHIEVED ✨
                                    </motion.p>
                                )}
                            </motion.div>
                        )}

                        {/* Continue Button */}
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            onClick={clearPolicyModal}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg shadow-emerald-900/30"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Continue the Work ✊
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { formatNumber, VOLUNTEER_DIVISOR } from '../config/gameConfig';

interface PrestigeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PrestigeModal({ isOpen, onClose }: PrestigeModalProps) {
    const lifetimeEarnings = useStore(state => state.lifetimeEarnings);
    const currentVolunteers = useStore(state => state.volunteers);
    const prestige = useStore(state => state.prestige);

    // Calculate potential volunteers from prestige formula
    const potentialFromPrestige = Math.floor(Math.sqrt(lifetimeEarnings / VOLUNTEER_DIVISOR));

    // Always allow prestige - it's a strategic choice to reset progress
    const canPrestige = true;

    const handlePrestige = () => {
        prestige();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal - Fixed positioning for better centering */}
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-full max-w-md"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div className="glass-card p-6 text-center">
                                {/* Header */}
                                <div className="text-4xl mb-4">🗳️</div>
                                <h2 className="text-xl font-bold text-white mb-2">
                                    Concede Election & Run Again
                                </h2>
                                <p className="text-sm text-slate-400 mb-6">
                                    Sometimes you need to lose to learn. Reset your progress
                                    but keep your dedicated volunteers who will fight even harder next time.
                                </p>

                                {/* Stats */}
                                <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase">
                                                Lifetime Raised
                                            </div>
                                            <div className="text-lg font-bold text-white tabular-nums">
                                                ${formatNumber(lifetimeEarnings)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase">
                                                Current Volunteers
                                            </div>
                                            <div className="text-lg font-bold text-emerald-400 tabular-nums">
                                                {currentVolunteers}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-700 my-4" />

                                    <div>
                                        <div className="text-xs text-slate-500 uppercase mb-1">
                                            Bonus Volunteers from Prestige
                                        </div>
                                        <div className="text-3xl font-bold text-emerald-400 tabular-nums">
                                            +{potentialFromPrestige}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            (Total after: {currentVolunteers + potentialFromPrestige})
                                        </div>
                                    </div>
                                </div>

                                {/* Volunteer Benefits */}
                                <div className="text-left text-xs text-slate-400 mb-6">
                                    <div className="font-medium text-slate-300 mb-2">
                                        Volunteer Benefits:
                                    </div>
                                    <ul className="space-y-1">
                                        <li>• +2% revenue per 1,000 volunteers</li>
                                        <li>• Slower momentum decay (per 1,000)</li>
                                        <li>• Persists through all future runs</li>
                                    </ul>
                                </div>

                                {/* Warning about reset */}
                                <div className="text-xs text-amber-500/80 mb-4 p-2 bg-amber-900/20 rounded-lg">
                                    ⚠️ This will reset: funds, activities, policies, and angel upgrades
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-3 px-4 rounded-xl bg-slate-700 text-slate-300 font-medium hover:bg-slate-600 transition-colors"
                                    >
                                        Keep Fighting
                                    </button>
                                    <motion.button
                                        onClick={handlePrestige}
                                        disabled={!canPrestige}
                                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${canPrestige
                                            ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white'
                                            : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                            }`}
                                        whileHover={canPrestige ? { scale: 1.02 } : {}}
                                        whileTap={canPrestige ? { scale: 0.98 } : {}}
                                    >
                                        Run Again! ✊
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}


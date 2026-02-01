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

    const potentialVolunteers = Math.floor(Math.sqrt(lifetimeEarnings / VOLUNTEER_DIVISOR));
    const newVolunteers = potentialVolunteers - currentVolunteers;
    const canPrestige = potentialVolunteers > currentVolunteers;

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

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-50"
                        initial={{ opacity: 0, scale: 0.9, y: '-40%' }}
                        animate={{ opacity: 1, scale: 1, y: '-50%' }}
                        exit={{ opacity: 0, scale: 0.9, y: '-40%' }}
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

                                {canPrestige ? (
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase mb-1">
                                            New Volunteers Joining
                                        </div>
                                        <div className="text-3xl font-bold text-emerald-400 tabular-nums">
                                            +{newVolunteers}
                                        </div>
                                        <div className="text-xs text-emerald-500 mt-1">
                                            ({potentialVolunteers} total after prestige)
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-amber-400 text-sm">
                                            Need ${formatNumber(VOLUNTEER_DIVISOR)} lifetime earnings
                                            to recruit your first volunteer
                                        </div>
                                        <div className="text-xs text-slate-500 mt-2">
                                            Formula: √(Lifetime / $1T)
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Volunteer Benefits */}
                            <div className="text-left text-xs text-slate-400 mb-6">
                                <div className="font-medium text-slate-300 mb-2">
                                    Volunteer Benefits:
                                </div>
                                <ul className="space-y-1">
                                    <li>• +2% revenue per volunteer</li>
                                    <li>• Slower momentum decay</li>
                                    <li>• Persists through all future runs</li>
                                </ul>
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
                                    {canPrestige ? 'Run Again! ✊' : 'Not Yet...'}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

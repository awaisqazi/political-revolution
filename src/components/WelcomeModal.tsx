import { motion, AnimatePresence } from 'framer-motion';
import { formatMoney } from '../utils/formatting';

interface WelcomeModalProps {
    isOpen: boolean;
    earnings: number;
    seconds: number;
    onClose: () => void;
}

export function WelcomeModal({ isOpen, earnings, seconds, onClose }: WelcomeModalProps) {
    // Format time away
    const formatTimeAway = (secs: number): string => {
        if (secs < 60) return `${Math.floor(secs)} seconds`;
        if (secs < 3600) return `${Math.floor(secs / 60)} minutes`;
        if (secs < 86400) return `${Math.floor(secs / 3600)} hours`;
        return `${Math.floor(secs / 86400)} days`;
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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-700 shadow-2xl"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Icon */}
                            <div className="text-center mb-4">
                                <span className="text-5xl">🌙</span>
                            </div>

                            {/* Title */}
                            <h2 className="text-xl font-bold text-center text-white mb-2">
                                Welcome Back, Organizer!
                            </h2>

                            {/* Subtitle */}
                            <p className="text-slate-400 text-center text-sm mb-4">
                                While you were away for {formatTimeAway(seconds)}...
                            </p>

                            {/* Earnings Display */}
                            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-4 mb-4 border border-green-700/30">
                                <p className="text-slate-300 text-center text-sm mb-1">
                                    Your volunteers raised
                                </p>
                                <p className="text-3xl font-bold text-center text-green-400">
                                    {formatMoney(earnings)}
                                </p>
                            </div>

                            {/* Motivational message */}
                            <p className="text-slate-500 text-center text-xs mb-4">
                                The movement never sleeps! ✊
                            </p>

                            {/* Close Button */}
                            <motion.button
                                onClick={onClose}
                                className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition-colors shadow-lg shadow-blue-900/30"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Let's Keep Going!
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

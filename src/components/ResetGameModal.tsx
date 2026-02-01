import { motion, AnimatePresence } from 'framer-motion';

interface ResetGameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function ResetGameModal({ isOpen, onClose, onConfirm }: ResetGameModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="text-center space-y-4">
                        <div className="text-4xl">⚠️</div>
                        <h2 className="text-2xl font-bold text-white">Start New Game?</h2>

                        <div className="bg-rose-900/30 border border-rose-800/50 rounded-lg p-4 text-left">
                            <p className="text-rose-200 font-semibold mb-2">Warning: This will delete everything.</p>
                            <ul className="text-sm text-rose-300 space-y-1 list-disc pl-4">
                                <li>All Funds & Earnings</li>
                                <li>All Volunteers & Structures</li>
                                <li>All Unlocked Policies</li>
                                <li>Current Stage & Rank</li>
                                <li>Utopia Progress</li>
                            </ul>
                        </div>

                        <p className="text-slate-400 text-sm">
                            This cannot be undone. Are you sure you want to completely restart?
                        </p>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors shadow-lg shadow-red-900/30"
                            >
                                🔥 Reset Everything
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

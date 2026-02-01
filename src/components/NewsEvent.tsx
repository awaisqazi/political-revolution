import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

export function NewsEvent() {
    const activeEvent = useStore(state => state.activeEvent);
    const dismissEvent = useStore(state => state.dismissEvent);

    const isPositive = activeEvent && activeEvent.popularityChange > 0;

    return (
        <AnimatePresence>
            {activeEvent && (
                <motion.div
                    className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-30"
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                    <div
                        className={`glass-card p-4 border-l-4 ${isPositive ? 'border-l-emerald-500' : 'border-l-red-500'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex-1">
                                <h3 className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                    {activeEvent.title}
                                </h3>
                                <p className="text-sm text-slate-300 mt-1">
                                    {activeEvent.description}
                                </p>
                                <div className={`text-xs mt-2 font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'
                                    }`}>
                                    Popularity {isPositive ? '+' : ''}
                                    {(activeEvent.popularityChange * 100).toFixed(0)}%
                                </div>
                            </div>

                            <button
                                onClick={dismissEvent}
                                className="text-slate-400 hover:text-white p-1 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

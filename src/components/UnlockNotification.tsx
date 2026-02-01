import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useAudio } from '../hooks/useAudio';
import { useEffect } from 'react';

export function UnlockNotification() {
    const pendingNotifications = useStore(state => state.pendingNotifications);
    const dismissNotification = useStore(state => state.dismissNotification);
    const { play } = useAudio();

    const currentNotification = pendingNotifications[0];

    // Play unlock sound when notification appears
    useEffect(() => {
        if (currentNotification) {
            play('unlock');
        }
    }, [currentNotification, play]);

    // Auto-dismiss after 3 seconds
    useEffect(() => {
        if (currentNotification) {
            const timer = setTimeout(() => {
                dismissNotification();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [currentNotification, dismissNotification]);

    return (
        <AnimatePresence>
            {currentNotification && (
                <motion.div
                    key={currentNotification.id}
                    initial={{ opacity: 0, y: -50, x: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="fixed top-20 right-4 z-50 max-w-sm"
                >
                    <div
                        className="relative overflow-hidden rounded-2xl p-4 shadow-2xl cursor-pointer"
                        onClick={() => dismissNotification()}
                        style={{
                            background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.95) 0%, rgba(234, 88, 12, 0.95) 100%)',
                            backdropFilter: 'blur(12px)',
                        }}
                    >
                        {/* Shimmer effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                        />

                        {/* Content */}
                        <div className="relative flex items-center gap-3">
                            {/* Emoji with pulse */}
                            <motion.div
                                className="text-4xl"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5, repeat: 2 }}
                            >
                                {currentNotification.activityEmoji}
                            </motion.div>

                            <div className="flex-1">
                                <div className="font-bold text-white text-sm">
                                    {currentNotification.activityName} Level {currentNotification.threshold}!
                                </div>
                                <div className="text-orange-100 text-xs flex items-center gap-1">
                                    <span className="font-semibold">
                                        {currentNotification.bonusType === 'speed' ? '⚡ Speed' : '💰 Revenue'}
                                    </span>
                                    <span>x{currentNotification.multiplier}</span>
                                </div>
                            </div>

                            {/* Celebratory sparkles */}
                            <motion.div
                                className="text-2xl"
                                animate={{ rotate: [0, 15, -15, 0] }}
                                transition={{ duration: 0.5, repeat: 3 }}
                            >
                                🎉
                            </motion.div>
                        </div>

                        {/* Progress indicator for auto-dismiss */}
                        <motion.div
                            className="absolute bottom-0 left-0 h-1 bg-white/40"
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: 3, ease: 'linear' }}
                        />
                    </div>

                    {/* Queue indicator */}
                    {pendingNotifications.length > 1 && (
                        <div className="absolute -bottom-2 right-4 text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                            +{pendingNotifications.length - 1} more
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

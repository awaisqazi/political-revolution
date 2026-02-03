import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useAudio } from '../hooks/useAudio';

export function LevelUpNotification() {
    const { play } = useAudio();
    const pendingLevelUp = useStore(state => state.pendingLevelUp);
    const level = useStore(state => state.level);
    const dismissLevelUp = useStore(state => state.dismissLevelUp);

    // Play sound when level up is triggered
    useEffect(() => {
        if (pendingLevelUp) {
            play('levelUp');
        }
    }, [pendingLevelUp, play]);

    // Auto-dismiss after a few seconds
    useEffect(() => {
        if (pendingLevelUp) {
            const timer = setTimeout(() => {
                dismissLevelUp();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [pendingLevelUp, dismissLevelUp]);

    return (
        <AnimatePresence>
            {pendingLevelUp && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: -50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: -50 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
                >
                    {/* Glow effect */}
                    <motion.div
                        className="absolute inset-0 bg-amber-500/30 blur-3xl rounded-full"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />

                    {/* Main notification */}
                    <motion.div
                        className="relative bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 px-8 py-4 rounded-2xl shadow-2xl shadow-amber-500/50 border-2 border-yellow-300/50"
                        animate={{
                            boxShadow: [
                                '0 0 20px rgba(245, 158, 11, 0.5)',
                                '0 0 40px rgba(245, 158, 11, 0.7)',
                                '0 0 20px rgba(245, 158, 11, 0.5)',
                            ],
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        {/* Sparkles */}
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                                style={{
                                    top: '50%',
                                    left: '50%',
                                }}
                                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                                animate={{
                                    x: Math.cos((i / 8) * Math.PI * 2) * 80,
                                    y: Math.sin((i / 8) * Math.PI * 2) * 40,
                                    opacity: [1, 0],
                                    scale: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 1.5,
                                    delay: i * 0.1,
                                    repeat: Infinity,
                                }}
                            />
                        ))}

                        <div className="text-center relative z-10">
                            <motion.div
                                className="text-4xl mb-1"
                                animate={{ rotate: [0, -10, 10, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                            >
                                ⭐
                            </motion.div>
                            <div className="text-2xl font-black text-white drop-shadow-lg">
                                LEVEL UP!
                            </div>
                            <motion.div
                                className="text-lg font-bold text-amber-100"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                            >
                                Level {level}
                            </motion.div>
                            <motion.div
                                className="text-sm text-amber-200/80 mt-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                +1 Skill Point
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

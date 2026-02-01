import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { MEMORIES } from '../config/memories';
import { useEffect } from 'react';
import { useAudio } from '../hooks/useAudio'; // Assuming reusing audio hook is fine

export function MemoryNotification() {
    const pendingMemoryUnlocks = useStore(state => state.pendingMemoryUnlocks);
    const dismissMemoryNotification = useStore(state => state.dismissMemoryNotification);
    const { play } = useAudio();

    const currentMemoryId = pendingMemoryUnlocks[0];
    const currentMemory = MEMORIES.find(m => m.id === currentMemoryId);

    // Play sound when notification appears
    useEffect(() => {
        if (currentMemory) {
            play('unlock'); // Using generic unlock sound
        }
    }, [currentMemory, play]);

    // Auto-dismiss after 4 seconds
    useEffect(() => {
        if (currentMemory) {
            const timer = setTimeout(() => {
                dismissMemoryNotification();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [currentMemory, dismissMemoryNotification]);

    return (
        <AnimatePresence>
            {currentMemory && (
                <motion.div
                    key={currentMemory.id}
                    initial={{ opacity: 0, y: -50, scale: 0.9, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="fixed top-24 right-4 z-[60] max-w-sm"
                >
                    <div
                        className="relative overflow-hidden rounded-lg p-1 shadow-2xl cursor-pointer bg-white transform rotate-2 hover:rotate-0 transition-transform duration-300"
                        onClick={() => dismissMemoryNotification()}
                    >
                        {/* Polaroid Style */}
                        <div className="bg-white p-3 pb-8 shadow-inner">
                            <div className="aspect-video w-full bg-slate-200 mb-2 overflow-hidden relative">
                                <img src={currentMemory.img} alt={currentMemory.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-center font-handwriting text-xl text-slate-800">
                                {currentMemory.title}
                            </div>
                            <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow transform rotate-6">
                                NEW MEMORY!
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

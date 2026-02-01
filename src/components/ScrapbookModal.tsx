import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { MEMORIES } from '../config/memories';

interface ScrapbookModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ScrapbookModal = ({ isOpen, onClose }: ScrapbookModalProps) => {
    const unlockedMemories = useStore((state) => state.unlockedMemories);
    const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);

    const selectedMemory = MEMORIES.find(m => m.id === selectedMemoryId);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col pointer-events-auto">
                            {/* Header */}
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                                <div>
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                        📷 Campaign Scrapbook
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Memories from your journey to visual immersion.
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Grid Content */}
                            <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {MEMORIES.map((memory) => {
                                        const isUnlocked = unlockedMemories.includes(memory.id);

                                        return (
                                            <motion.div
                                                key={memory.id}
                                                className={`relative group cursor-pointer aspect-square rounded-lg overflow-hidden border-2 transition-all ${isUnlocked
                                                        ? 'border-slate-700 hover:border-white hover:shadow-lg hover:scale-[1.02]'
                                                        : 'border-slate-800 opacity-60'
                                                    }`}
                                                onClick={() => isUnlocked && setSelectedMemoryId(memory.id)}
                                                whileHover={isUnlocked ? { rotate: [-1, 1, 0], transition: { duration: 0.3 } } : {}}
                                            >
                                                {isUnlocked ? (
                                                    <>
                                                        <img
                                                            src={memory.img}
                                                            alt={memory.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {/* Polaroid-style label effect on hover */}
                                                        <div className="absolute inset-x-0 bottom-0 bg-white/90 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                            <p className="text-slate-900 font-handwriting text-center font-bold">
                                                                {memory.title}
                                                            </p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-600">
                                                        <span className="text-4xl mb-2">🔒</span>
                                                        <span className="text-sm font-medium">Locked</span>
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Lightbox for Selected Memory */}
                    <AnimatePresence>
                        {selectedMemory && (
                            <motion.div
                                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedMemoryId(null)}
                            >
                                <div className="max-w-3xl w-full flex flex-col items-center gap-4 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                                    <motion.div
                                        initial={{ scale: 0.9, rotate: -2 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        className="p-4 bg-white rounded shadow-2xl skew"
                                    >
                                        <img
                                            src={selectedMemory.img}
                                            alt={selectedMemory.title}
                                            className="max-h-[70vh] w-auto border border-slate-200"
                                        />
                                        <div className="mt-4 text-center">
                                            <h3 className="text-3xl font-handwriting text-slate-800 rotate-1">
                                                {selectedMemory.title}
                                            </h3>
                                            <p className="text-slate-600 mt-2 font-serif italic text-lg">
                                                "{selectedMemory.description}"
                                            </p>
                                        </div>
                                    </motion.div>

                                    <button
                                        className="mt-4 text-white/50 hover:text-white"
                                        onClick={() => setSelectedMemoryId(null)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </AnimatePresence>
    );
};

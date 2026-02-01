import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { POWER_STRUCTURES, getVolunteerBonusPercent } from '../config/powerStructures';
import { formatNumber } from '../config/gameConfig';

export function PowerStructureList() {
    const volunteers = useStore(state => state.volunteers);
    const unlockedStructures = useStore(state => state.unlockedStructures);
    const assignVolunteers = useStore(state => state.assignVolunteers);

    // Confirmation modal state
    const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);

    const selectedStructure = selectedStructureId
        ? POWER_STRUCTURES.find(s => s.id === selectedStructureId)
        : null;

    const handleBuildClick = (id: string) => {
        setSelectedStructureId(id);
    };

    const confirmBuild = () => {
        if (selectedStructureId) {
            assignVolunteers(selectedStructureId);
            setSelectedStructureId(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header Card - Community Board Aesthetic */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-blue-500/20 mb-6">
                <h3 className="text-blue-400 font-bold text-lg mb-2 flex items-center gap-2">
                    ✊ Build Community Power
                </h3>
                <p className="text-slate-300 text-sm">
                    Assign your <span className="text-emerald-400 font-bold">Volunteers</span> to build
                    <span className="text-blue-400 font-bold"> lasting power structures</span>.
                    This permanently invests volunteers into organizations that multiply all revenue.
                </p>
            </div>

            {/* Power Structure Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
                {POWER_STRUCTURES.map((structure) => {
                    const isBuilt = unlockedStructures.includes(structure.id);
                    const canAfford = volunteers >= structure.cost;

                    return (
                        <motion.div
                            key={structure.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`relative overflow-hidden rounded-xl p-4 border transition-all ${isBuilt
                                ? 'bg-blue-900/20 border-blue-500/50'
                                : 'bg-slate-900/80 border-slate-700 hover:border-blue-500/30'
                                }`}
                        >
                            {/* Blueprint Grid Pattern Overlay for unbuilt */}
                            {!isBuilt && (
                                <div
                                    className="absolute inset-0 opacity-5 pointer-events-none"
                                    style={{
                                        backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)',
                                        backgroundSize: '20px 20px'
                                    }}
                                />
                            )}

                            <div className="flex justify-between items-start mb-2 relative">
                                <div className="text-3xl">{structure.emoji}</div>
                                {isBuilt && (
                                    <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full font-bold">
                                        ✓ BUILT
                                    </span>
                                )}
                            </div>

                            <h4 className={`font-bold text-lg mb-1 ${isBuilt ? 'text-blue-400' : 'text-slate-200'}`}>
                                {structure.name}
                            </h4>
                            <p className="text-sm text-slate-400 mb-3 min-h-[40px]">
                                {structure.description}
                            </p>

                            <div className="flex items-center justify-between mt-auto relative">
                                <div className="text-blue-300 font-bold text-sm">
                                    All Revenue ×{structure.multiplier}
                                </div>

                                {!isBuilt && (
                                    <button
                                        onClick={() => handleBuildClick(structure.id)}
                                        disabled={!canAfford}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${canAfford
                                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {formatNumber(structure.cost)} Vols
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {selectedStructure && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedStructureId(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-blue-500/30 p-6 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Blue accent bar */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400" />

                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="text-2xl">{selectedStructure.emoji}</span>
                                Build This Structure?
                            </h3>

                            <div className="space-y-4 mb-6">
                                <p className="text-slate-300">
                                    Assign volunteers to build <span className="text-blue-400 font-bold">{selectedStructure.name}</span>?
                                </p>

                                <div className="bg-slate-950/50 rounded-lg p-3 space-y-2 text-sm border border-slate-800">
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span>Volunteers Assigned:</span>
                                        <span className="text-red-400 font-mono">-{formatNumber(selectedStructure.cost)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span>Grassroots Bonus:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="line-through text-slate-600">
                                                +{formatNumber(getVolunteerBonusPercent(volunteers))}%
                                            </span>
                                            <span className="text-red-400">
                                                → +{formatNumber(getVolunteerBonusPercent(volunteers - selectedStructure.cost))}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-px bg-slate-800 my-2" />
                                    <div className="flex justify-between items-center text-blue-300 font-bold text-base">
                                        <span>Power Multiplier:</span>
                                        <span>×{selectedStructure.multiplier} ✊</span>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-500 italic">
                                    "Real power is built from the ground up."
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelectedStructureId(null)}
                                    className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmBuild}
                                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold shadow-lg transition-all transform hover:scale-105"
                                >
                                    Build It! ✊
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

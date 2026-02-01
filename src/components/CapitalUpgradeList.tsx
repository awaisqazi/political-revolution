import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ANGEL_UPGRADES, getVolunteerBonusPercent } from '../config/angelUpgrades';
import { formatNumber } from '../config/gameConfig';

export function CapitalUpgradeList() {
    const volunteers = useStore(state => state.volunteers);
    const unlockedAngelUpgrades = useStore(state => state.unlockedAngelUpgrades);
    const buyAngelUpgrade = useStore(state => state.buyAngelUpgrade);

    // Confirmation modal state
    const [selectedUpgradeId, setSelectedUpgradeId] = useState<string | null>(null);

    const selectedUpgrade = selectedUpgradeId
        ? ANGEL_UPGRADES.find(u => u.id === selectedUpgradeId)
        : null;

    const handleBuyClick = (id: string) => {
        setSelectedUpgradeId(id);
    };

    const confirmPurchase = () => {
        if (selectedUpgradeId) {
            buyAngelUpgrade(selectedUpgradeId);
            setSelectedUpgradeId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-amber-500/20 mb-6">
                <h3 className="text-amber-400 font-bold text-lg mb-2">Political Capital Strategy</h3>
                <p className="text-slate-300 text-sm">
                    Spend your hard-earned <span className="text-emerald-400 font-bold">Volunteers</span> to make
                    <span className="text-amber-400 font-bold"> Establishment Moves</span>.
                    This sacrifices short-term grassroots power for massive long-term global revenue multipliers.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {ANGEL_UPGRADES.map((upgrade) => {
                    const isUnlocked = unlockedAngelUpgrades.includes(upgrade.id);
                    const canAfford = volunteers >= upgrade.cost;

                    return (
                        <motion.div
                            key={upgrade.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`relative overflow-hidden rounded-xl p-4 border transition-all ${isUnlocked
                                    ? 'bg-amber-900/20 border-amber-500/50'
                                    : 'bg-slate-900/80 border-slate-700 hover:border-amber-500/30'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-3xl">{upgrade.emoji}</div>
                                {isUnlocked && (
                                    <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-1 rounded-full font-bold">
                                        PURCHASED
                                    </span>
                                )}
                            </div>

                            <h4 className={`font-bold text-lg mb-1 ${isUnlocked ? 'text-amber-400' : 'text-slate-200'}`}>
                                {upgrade.name}
                            </h4>
                            <p className="text-sm text-slate-400 mb-3 min-h-[40px]">
                                {upgrade.description}
                            </p>

                            <div className="flex items-center justify-between mt-auto">
                                <div className="text-amber-300 font-bold text-sm">
                                    Global Revenue x{upgrade.multiplier}
                                </div>

                                {!isUnlocked && (
                                    <button
                                        onClick={() => handleBuyClick(upgrade.id)}
                                        disabled={!canAfford}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${canAfford
                                                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20'
                                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                            }`}
                                    >
                                        Use {formatNumber(upgrade.cost)} Vols
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {selectedUpgrade && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedUpgradeId(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-amber-500/30 p-6 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-amber-400" />

                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="text-2xl">⚠️</span> Strategic Decision
                            </h3>

                            <div className="space-y-4 mb-6">
                                <p className="text-slate-300">
                                    Are you sure you want to purchase <span className="text-amber-400 font-bold">{selectedUpgrade.name}</span>?
                                </p>

                                <div className="bg-slate-950/50 rounded-lg p-3 space-y-2 text-sm border border-slate-800">
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span>Volunteer Cost:</span>
                                        <span className="text-red-400 font-mono">-{formatNumber(selectedUpgrade.cost)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span>Grassroots Bonus:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="line-through text-slate-600">
                                                +{formatNumber(getVolunteerBonusPercent(volunteers))}%
                                            </span>
                                            <span className="text-red-400">
                                                → +{formatNumber(getVolunteerBonusPercent(volunteers - selectedUpgrade.cost))}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-px bg-slate-800 my-2" />
                                    <div className="flex justify-between items-center text-amber-300 font-bold text-base">
                                        <span>Global Multiplier:</span>
                                        <span>x{selectedUpgrade.multiplier} 🚀</span>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-500 italic">
                                    "Sometimes you have to work within the system to change it."
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelectedUpgradeId(null)}
                                    className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmPurchase}
                                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold shadow-lg transition-all transform hover:scale-105"
                                >
                                    Confirm Upgrade
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

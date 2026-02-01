import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { POLICIES } from '../config/policies';
import { formatMoney } from '../utils/formatting';

export function PolicyList() {
    const funds = useStore(state => state.funds);
    const activities = useStore(state => state.activities);
    const unlockedPolicies = useStore(state => state.unlockedPolicies);
    const buyPolicy = useStore(state => state.buyPolicy);

    // Filter policies based on visibility:
    // - Activity policies: only show if player owns >= requiredOwned of that activity
    // - Global policies: show if player's total activities >= requiredOwned
    const totalActivities = Object.values(activities).reduce((sum, a) => sum + a.owned, 0);

    const visiblePolicies = POLICIES.filter(policy => {
        if (policy.type === 'global') {
            // Global policies: require total activities >= requiredOwned
            const required = policy.requiredOwned ?? 1;
            return totalActivities >= required;
        }
        // Activity-specific policy: check if player owns enough of that activity
        if (policy.triggerId) {
            const activityState = activities[policy.triggerId];
            const required = policy.requiredOwned ?? 1;
            return activityState && activityState.owned >= required;
        }
        return false;
    });

    if (visiblePolicies.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
                <span className="text-sm text-amber-500 uppercase tracking-wider flex items-center gap-2">
                    <span>📜</span>
                    Campaign Policies
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
            </div>

            {/* Policy Cards */}
            <div className="grid gap-3 sm:grid-cols-2">
                <AnimatePresence>
                    {visiblePolicies.map((policy, index) => {
                        const isUnlocked = unlockedPolicies.includes(policy.id);
                        const canAfford = funds >= policy.cost;

                        return (
                            <motion.div
                                key={policy.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`
                                    relative overflow-hidden rounded-xl p-4
                                    ${isUnlocked
                                        ? 'bg-gradient-to-br from-green-900/30 to-green-950/30 border border-green-700/30'
                                        : 'bg-gradient-to-br from-amber-900/20 to-slate-900/40 border border-amber-700/20'
                                    }
                                `}
                            >
                                {/* Document styling - top "fold" */}
                                <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-slate-700/30 to-transparent" />

                                {/* Header */}
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className={`font-semibold ${isUnlocked ? 'text-green-400' : 'text-amber-300'}`}>
                                            {policy.name}
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {policy.description}
                                        </p>
                                    </div>
                                    {isUnlocked && (
                                        <span className="text-green-400 text-lg">✓</span>
                                    )}
                                </div>

                                {/* Type Badge */}
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`
                                        text-xs px-2 py-0.5 rounded-full
                                        ${policy.type === 'global'
                                            ? 'bg-purple-900/50 text-purple-300 border border-purple-700/30'
                                            : 'bg-blue-900/50 text-blue-300 border border-blue-700/30'
                                        }
                                    `}>
                                        {policy.type === 'global' ? '🌍 Global' : `⚡ ${policy.triggerId}`}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {policy.multiplier}x boost
                                    </span>
                                </div>

                                {/* Buy Button */}
                                {!isUnlocked && (
                                    <motion.button
                                        onClick={() => buyPolicy(policy.id)}
                                        disabled={!canAfford}
                                        className={`
                                            w-full py-2 px-4 rounded-lg font-medium text-sm
                                            transition-all duration-200
                                            ${canAfford
                                                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-500 hover:to-amber-600 shadow-lg shadow-amber-900/30'
                                                : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                                            }
                                        `}
                                        whileHover={canAfford ? { scale: 1.02 } : {}}
                                        whileTap={canAfford ? { scale: 0.98 } : {}}
                                    >
                                        {formatMoney(policy.cost)}
                                    </motion.button>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}

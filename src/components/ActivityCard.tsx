import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import type { ActivityConfig } from '../config/activities';
import { getActivityCost, getManagerCost } from '../config/activities';
import { formatNumber } from '../config/gameConfig';
import { getPolicyById } from '../config/policies';
import { formatMoney } from '../utils/formatting';

interface ActivityCardProps {
    activity: ActivityConfig;
}

export function ActivityCard({ activity }: ActivityCardProps) {
    const funds = useStore(state => state.funds);
    const activityState = useStore(state => state.activities[activity.id]);
    const unlockedPolicies = useStore(state => state.unlockedPolicies);
    const buyActivity = useStore(state => state.buyActivity);
    const hireManager = useStore(state => state.hireManager);
    const runActivity = useStore(state => state.runActivity);

    const cost = getActivityCost(activity.baseCost, activityState.owned);
    const managerCost = getManagerCost(activity.baseCost);
    const canAfford = funds >= cost;
    const canAffordManager = funds >= managerCost && activityState.owned > 0 && !activityState.managerHired;

    const progressPercent = (activityState.progress / activity.baseTime) * 100;

    // Can manually run if: owned, not managed, and not currently running
    const canManuallyRun = activityState.owned > 0 && !activityState.managerHired && activityState.progress === 0;

    // Calculate policy multiplier for this activity
    const policyMultiplier = unlockedPolicies.reduce((mult, policyId) => {
        const policy = getPolicyById(policyId);
        if (policy && policy.type === 'activity' && policy.triggerId === activity.id) {
            return mult * policy.multiplier;
        }
        return mult;
    }, 1);

    // Revenue per cycle with policy multipliers
    const revenuePerCycle = activity.baseRevenue * activityState.owned * policyMultiplier;

    return (
        <motion.div
            className={`glass-card p-4 relative overflow-hidden ${canManuallyRun ? 'cursor-pointer hover:ring-2 hover:ring-blue-400/50' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => canManuallyRun && runActivity(activity.id)}
        >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <div className="text-3xl">{activity.emoji}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white truncate">
                            {activity.name}
                        </h3>
                        {activityState.managerHired && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                                ✓ Auto
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                        {activity.description}
                    </p>
                </div>
                <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-blue-400 tabular-nums">
                        {activityState.owned}
                    </div>
                    <div className="text-xs text-slate-500">owned</div>
                </div>
            </div>

            {/* Progress Bar */}
            {activityState.owned > 0 && (
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.1 }}
                    />
                </div>
            )}

            {/* Info Row */}
            <div className="flex justify-between text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1">
                    Rev: {formatMoney(revenuePerCycle)}/cycle
                    {policyMultiplier > 1 && (
                        <span className="text-emerald-400 font-medium">
                            ({policyMultiplier}x)
                        </span>
                    )}
                </span>
                <span>
                    Time: {(activity.baseTime / 1000).toFixed(1)}s
                </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                {/* Buy Button */}
                <motion.button
                    onClick={(e) => { e.stopPropagation(); buyActivity(activity.id); }}
                    disabled={!canAfford}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${canAfford
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                        }`}
                    whileHover={canAfford ? { scale: 1.02 } : {}}
                    whileTap={canAfford ? { scale: 0.98 } : {}}
                >
                    Buy ${formatNumber(cost)}
                </motion.button>

                {/* Manager Button */}
                {!activityState.managerHired && activityState.owned > 0 && (
                    <motion.button
                        onClick={(e) => { e.stopPropagation(); hireManager(activity.id); }}
                        disabled={!canAffordManager}
                        className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${canAffordManager
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                            }`}
                        whileHover={canAffordManager ? { scale: 1.02 } : {}}
                        whileTap={canAffordManager ? { scale: 0.98 } : {}}
                        title={`Hire Manager: $${formatNumber(managerCost)}`}
                    >
                        🧑‍💼 ${formatNumber(managerCost)}
                    </motion.button>
                )}
            </div>

            {/* Locked overlay for unowned activities */}
            {activityState.owned === 0 && !canAfford && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center rounded-2xl">
                    <span className="text-slate-400 text-sm">
                        🔒 ${formatNumber(cost)} to unlock
                    </span>
                </div>
            )}
        </motion.div>
    );
}


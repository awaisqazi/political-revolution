import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useAudio } from '../hooks/useAudio';
import type { ActivityConfig } from '../config/activities';
import { getActivityCost, getManagerCost, getBulkPurchaseCost, getMaxAffordable } from '../config/activities';
import { formatNumber } from '../config/gameConfig';
import { getPolicyById } from '../config/policies';
import { formatMoney } from '../utils/formatting';
import { getNextUnlock, getMilestoneSpeedMultiplier } from '../config/unlocks';

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
    const buyMode = useStore(state => state.buyMode);
    const { play } = useAudio();

    // Calculate buy quantity based on mode
    const nextUnlock = getNextUnlock(activity.id, activityState.owned);
    const nextThreshold = nextUnlock?.threshold ?? activityState.owned + 1;
    const toNextMilestone = Math.max(1, nextThreshold - activityState.owned);

    const getBuyQuantity = (): number => {
        switch (buyMode) {
            case 'x1': return 1;
            case 'x10': return 10;
            case 'x100': return 100;
            case 'next': return toNextMilestone;
            case 'max': return getMaxAffordable(activity.baseCost, activityState.owned, funds) || 1;
        }
    };

    const buyQuantity = getBuyQuantity();
    const bulkCost = getBulkPurchaseCost(activity.baseCost, activityState.owned, buyQuantity);
    const canAffordBulk = funds >= bulkCost && bulkCost > 0;

    const managerCost = getManagerCost(activity.baseCost);
    const canAffordManager = funds >= managerCost && activityState.owned > 0 && !activityState.managerHired;

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

    // Milestone system
    const speedMultiplier = getMilestoneSpeedMultiplier(activity.id, activityState.owned);
    const effectiveTime = activity.baseTime / speedMultiplier;
    const effectiveProgressPercent = (activityState.progress / effectiveTime) * 100;

    // Calculate milestone progress (progress toward next unlock threshold)
    const prevThreshold = nextUnlock ?
        (nextUnlock.threshold === 25 ? 0 :
            nextUnlock.threshold === 50 ? 25 :
                nextUnlock.threshold === 100 ? 50 :
                    nextUnlock.threshold - 100) : 0;
    const milestoneProgress = nextUnlock
        ? ((activityState.owned - prevThreshold) / (nextUnlock.threshold - prevThreshold)) * 100
        : 100;

    // Buy button label based on mode
    const getBuyLabel = (): string => {
        switch (buyMode) {
            case 'x1': return `Buy $${formatNumber(bulkCost)}`;
            case 'x10': return `Buy x10 $${formatNumber(bulkCost)}`;
            case 'x100': return `Buy x100 $${formatNumber(bulkCost)}`;
            case 'next': return `Next (${buyQuantity}) $${formatNumber(bulkCost)}`;
            case 'max': return `Max (${buyQuantity}) $${formatNumber(bulkCost)}`;
        }
    };

    return (
        <motion.div
            className={`glass-card p-3 lg:p-4 relative overflow-hidden ${canManuallyRun ? 'cursor-pointer hover:ring-2 hover:ring-blue-400/50' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
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
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                        style={{ width: `${effectiveProgressPercent}%` }}
                        transition={{ duration: 0.1 }}
                    />
                </div>
            )}

            {/* Milestone Progress Bar */}
            {activityState.owned > 0 && nextUnlock && (
                <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-orange-400 font-medium">
                            {activityState.owned} / {nextUnlock.threshold}
                        </span>
                        <span className="text-orange-300">
                            → x{nextUnlock.multiplier} {nextUnlock.type === 'speed' ? '⚡ Speed' : '💰 Revenue'}
                        </span>
                    </div>
                    <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full rounded-full ${milestoneProgress >= 90
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-400 shadow-lg shadow-orange-500/50'
                                : 'bg-gradient-to-r from-orange-600 to-orange-500'
                                }`}
                            style={{ width: `${Math.min(100, milestoneProgress)}%` }}
                            animate={milestoneProgress >= 90 ? { opacity: [1, 0.7, 1] } : {}}
                            transition={milestoneProgress >= 90 ? { duration: 0.5, repeat: Infinity } : {}}
                        />
                    </div>
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
                <span className="flex items-center gap-1">
                    Time: {(effectiveTime / 1000).toFixed(1)}s
                    {speedMultiplier > 1 && (
                        <span className="text-orange-400 font-medium">
                            ({speedMultiplier}x ⚡)
                        </span>
                    )}
                </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                {/* Buy Button */}
                <motion.button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Buy the calculated quantity
                        let purchased = 0;
                        for (let i = 0; i < buyQuantity && funds >= getActivityCost(activity.baseCost, activityState.owned + i); i++) {
                            buyActivity(activity.id);
                            purchased++;
                        }
                        if (purchased > 0) play('buy');
                    }}
                    disabled={!canAffordBulk}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all active:scale-[0.98] ${canAffordBulk
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                        }`}
                >
                    {getBuyLabel()}
                </motion.button>

                {/* Manager Button */}
                {!activityState.managerHired && activityState.owned > 0 && (
                    <motion.button
                        onClick={(e) => { e.stopPropagation(); hireManager(activity.id); play('buy'); }}
                        disabled={!canAffordManager}
                        className={`py-2 px-3 rounded-lg font-medium text-sm transition-all active:scale-[0.98] ${canAffordManager
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                            }`}
                        title={`Hire Manager: $${formatNumber(managerCost)}`}
                    >
                        🧑‍💼 ${formatNumber(managerCost)}
                    </motion.button>
                )}
            </div>

            {/* Locked overlay for unowned activities */}
            {activityState.owned === 0 && !canAffordBulk && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center rounded-2xl">
                    <span className="text-slate-400 text-sm">
                        🔒 ${formatNumber(getBulkPurchaseCost(activity.baseCost, 0, 1))} to unlock
                    </span>
                </div>
            )}
        </motion.div>
    );
}


import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import type { ActivityConfig } from '../config/activities';
import { getActivityCost, getManagerCost } from '../config/activities';
import { formatNumber } from '../config/gameConfig';

interface ActivityCardProps {
    activity: ActivityConfig;
}

export function ActivityCard({ activity }: ActivityCardProps) {
    const funds = useStore(state => state.funds);
    const activityState = useStore(state => state.activities[activity.id]);
    const buyActivity = useStore(state => state.buyActivity);
    const hireManager = useStore(state => state.hireManager);

    const cost = getActivityCost(activity.baseCost, activityState.owned);
    const managerCost = getManagerCost(activity.baseCost);
    const canAfford = funds >= cost;
    const canAffordManager = funds >= managerCost && activityState.owned > 0 && !activityState.managerHired;

    const progressPercent = (activityState.progress / activity.baseTime) * 100;

    return (
        <motion.div
            className="glass-card p-4 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Manager Badge */}
            {activityState.managerHired && (
                <div className="absolute top-2 right-2">
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                        ✓ Automated
                    </span>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <div className="text-3xl">{activity.emoji}</div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">
                        {activity.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">
                        {activity.description}
                    </p>
                </div>
                <div className="text-right">
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
                <span>
                    Rev: ${formatNumber(activity.baseRevenue * activityState.owned)}/cycle
                </span>
                <span>
                    Time: {(activity.baseTime / 1000).toFixed(1)}s
                </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                {/* Buy Button */}
                <motion.button
                    onClick={() => buyActivity(activity.id)}
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
                        onClick={() => hireManager(activity.id)}
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

import { motion, AnimatePresence } from 'framer-motion';
import { useStore, getPolling } from '../store/useStore';
import { useMemo } from 'react';
import { formatNumber, getMomentumMultiplier, VOLUNTEER_BONUS_PER } from '../config/gameConfig';
import { ACTIVITIES } from '../config/activities';
import { getPolicyById } from '../config/policies';
import { formatMoney } from '../utils/formatting';
import { getMilestoneSpeedMultiplier, getGlobalMilestoneMultiplier } from '../config/unlocks';
import { getPowerStructureMultiplier } from '../config/powerStructures';

interface FloatingStatsProps {
    isVisible: boolean;
}

export function FloatingStats({ isVisible }: FloatingStatsProps) {
    const funds = useStore(state => state.funds);
    const volunteers = useStore(state => state.volunteers);
    const popularity = useStore(state => state.popularity);
    const momentum = useStore(state => state.momentum);
    const activities = useStore(state => state.activities);
    const unlockedPolicies = useStore(state => state.unlockedPolicies);
    const unlockedStructures = useStore(state => state.unlockedStructures);
    const lifetimeEarnings = useStore(state => state.lifetimeEarnings);
    const happiness = useStore(state => state.happiness);

    // Calculate polling percentage - Memoized for efficiency
    const polling = useMemo(() =>
        getPolling({ lifetimeEarnings, popularity, momentum, happiness }),
        [lifetimeEarnings, popularity, momentum, happiness]);

    const momentumMultiplier = getMomentumMultiplier(momentum);
    const volunteerMultiplier = 1 + (volunteers * VOLUNTEER_BONUS_PER);

    // Calculate global policy multiplier
    const globalPolicyMultiplier = unlockedPolicies.reduce((mult, policyId) => {
        const policy = getPolicyById(policyId);
        if (policy && policy.type === 'global') {
            return mult * policy.multiplier;
        }
        return mult;
    }, 1);

    // Calculate total levels for global milestone multiplier
    const totalLevels = Object.values(activities).reduce((sum, a) => sum + a.owned, 0);
    const globalMilestoneMultiplier = getGlobalMilestoneMultiplier(totalLevels);

    // Calculate power structure multiplier
    const powerStructureMultiplier = getPowerStructureMultiplier(unlockedStructures || []);

    // Calculate $/sec from automated activities
    const totalMultiplier = popularity * volunteerMultiplier * momentumMultiplier * globalPolicyMultiplier * globalMilestoneMultiplier * powerStructureMultiplier;

    const earningsPerSecond = ACTIVITIES.reduce((total, activity) => {
        const activityState = activities[activity.id];
        if (activityState.owned === 0 || !activityState.managerHired) return total;

        const activityPolicyMultiplier = unlockedPolicies.reduce((mult, policyId) => {
            const policy = getPolicyById(policyId);
            if (policy && policy.type === 'activity' && policy.triggerId === activity.id) {
                return mult * policy.multiplier;
            }
            return mult;
        }, 1);

        const speedMultiplier = getMilestoneSpeedMultiplier(activity.id, activityState.owned);
        const effectiveTime = activity.baseTime / speedMultiplier;
        const completionsPerSecond = 1000 / effectiveTime;

        const revenuePerSecond = activity.baseRevenue * activityState.owned * totalMultiplier * activityPolicyMultiplier * completionsPerSecond;
        return total + revenuePerSecond;
    }, 0);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="lg:hidden fixed top-12 left-1/2 -translate-x-1/2 z-30"
                >
                    <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/95 backdrop-blur-lg border border-slate-700 shadow-lg">
                        {/* Funds */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-emerald-400 font-bold text-sm tabular-nums">
                                {formatMoney(funds)}
                            </span>
                            {earningsPerSecond > 0 && (
                                <span className="text-emerald-500/70 text-xs tabular-nums">
                                    +{formatMoney(earningsPerSecond)}/s
                                </span>
                            )}
                        </div>

                        <div className="w-px h-4 bg-slate-700" />

                        {/* Volunteers */}
                        <div className="flex items-center gap-1">
                            <span className="text-sm">✊</span>
                            <span className="text-blue-400 font-medium text-xs tabular-nums">
                                {formatNumber(volunteers)}
                            </span>
                        </div>

                        <div className="w-px h-4 bg-slate-700" />

                        {/* Popularity */}
                        <div className="flex items-center gap-1">
                            <span className="text-sm">{popularity >= 1.2 ? '⭐' : '📉'}</span>
                            <span className={`font-medium text-xs tabular-nums ${popularity >= 1.2 ? 'text-amber-400' : 'text-slate-400'}`}>
                                {popularity.toFixed(2)}x
                            </span>
                        </div>

                        <div className="w-px h-4 bg-slate-700" />

                        {/* Polling */}
                        <div className="flex items-center gap-1">
                            <span className={`text-sm ${polling >= 51 ? 'animate-pulse' : ''}`}>📊</span>
                            <span className={`font-bold text-xs tabular-nums ${polling >= 51 ? 'text-emerald-400' :
                                    polling >= 45 ? 'text-amber-400' :
                                        'text-slate-400'
                                }`}>
                                {polling.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

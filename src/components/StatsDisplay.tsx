import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { formatNumber, getMomentumMultiplier, VOLUNTEER_BONUS_PER } from '../config/gameConfig';
import { ACTIVITIES } from '../config/activities';
import { getPolicyById } from '../config/policies';
import { formatMoney } from '../utils/formatting';
import { getMilestoneSpeedMultiplier, getGlobalMilestoneMultiplier } from '../config/unlocks';
import { getPowerStructureMultiplier } from '../config/powerStructures';

export function StatsDisplay() {
    const funds = useStore(state => state.funds);
    const lifetimeEarnings = useStore(state => state.lifetimeEarnings);
    const volunteers = useStore(state => state.volunteers);
    const popularity = useStore(state => state.popularity);
    const momentum = useStore(state => state.momentum);
    const activities = useStore(state => state.activities);
    const unlockedPolicies = useStore(state => state.unlockedPolicies);
    const unlockedStructures = useStore(state => state.unlockedStructures);

    const momentumMultiplier = getMomentumMultiplier(momentum);
    const volunteerBonus = volunteers * VOLUNTEER_BONUS_PER * 100;
    const popularityPercent = ((popularity - 1) * 100);
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

        // Activity-specific policy multiplier
        const activityPolicyMultiplier = unlockedPolicies.reduce((mult, policyId) => {
            const policy = getPolicyById(policyId);
            if (policy && policy.type === 'activity' && policy.triggerId === activity.id) {
                return mult * policy.multiplier;
            }
            return mult;
        }, 1);

        // Milestone speed multiplier - faster completions = more $/sec!
        const speedMultiplier = getMilestoneSpeedMultiplier(activity.id, activityState.owned);
        const effectiveTime = activity.baseTime / speedMultiplier;
        const completionsPerSecond = 1000 / effectiveTime;

        const revenuePerSecond = activity.baseRevenue * activityState.owned * totalMultiplier * activityPolicyMultiplier * completionsPerSecond;
        return total + revenuePerSecond;
    }, 0);

    return (
        <div className="glass-card p-4">
            {/* Main Funds Display */}
            <div className="text-center mb-4">
                <div className="text-sm text-slate-400 uppercase tracking-wide">
                    Campaign Funds
                </div>
                <motion.div
                    className="text-4xl font-bold text-white tabular-nums"
                    key={Math.floor(funds)}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.1 }}
                >
                    ${formatNumber(funds)}
                </motion.div>
                <div className="flex items-center justify-center gap-3 mt-1">
                    <span className="text-xs text-slate-500">
                        Lifetime: ${formatNumber(lifetimeEarnings)}
                    </span>
                    {earningsPerSecond > 0 && (
                        <>
                            <span className="text-xs text-slate-600">•</span>
                            <span className="text-xs text-emerald-400 font-medium">
                                {formatMoney(earningsPerSecond)}/sec
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                {/* Volunteers */}
                <div className="text-center p-3 rounded-xl bg-slate-800/50">
                    <div className="text-2xl mb-1">✊</div>
                    <div className="text-lg font-bold text-emerald-400 tabular-nums">
                        {volunteers}
                    </div>
                    <div className="text-xs text-slate-500">Volunteers</div>
                    {volunteerBonus > 0 && (
                        <div className="text-xs text-emerald-500 mt-1">
                            +{volunteerBonus.toFixed(0)}% rev
                        </div>
                    )}
                </div>

                {/* Popularity */}
                <div className="text-center p-3 rounded-xl bg-slate-800/50">
                    <div className="text-2xl mb-1">
                        {popularity >= 1.5 ? '🔥' : popularity >= 1 ? '⭐' : '😰'}
                    </div>
                    <div className={`text-lg font-bold tabular-nums ${popularity >= 1.2 ? 'text-amber-400' :
                        popularity >= 0.8 ? 'text-slate-300' : 'text-red-400'
                        }`}>
                        {popularity.toFixed(2)}x
                    </div>
                    <div className="text-xs text-slate-500">Popularity</div>
                    {popularityPercent !== 0 && (
                        <div className={`text-xs mt-1 ${popularityPercent > 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                            {popularityPercent > 0 ? '+' : ''}{popularityPercent.toFixed(0)}%
                        </div>
                    )}
                </div>

                {/* Speed Multiplier */}
                <div className="text-center p-3 rounded-xl bg-slate-800/50">
                    <div className="text-2xl mb-1">⚡</div>
                    <div className={`text-lg font-bold tabular-nums ${momentumMultiplier >= 2 ? 'text-pink-400' :
                        momentumMultiplier >= 1.5 ? 'text-blue-400' : 'text-slate-400'
                        }`}>
                        {momentumMultiplier.toFixed(1)}x
                    </div>
                    <div className="text-xs text-slate-500">Speed</div>
                    {momentumMultiplier > 1 && (
                        <div className="text-xs text-blue-400 mt-1">
                            From momentum
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


import { motion, AnimatePresence } from 'framer-motion';
import { useStore, getPolling } from '../store/useStore';
import { formatNumber, getMomentumMultiplier, VOLUNTEER_BONUS_PER } from '../config/gameConfig';
import { ACTIVITIES } from '../config/activities';
import { getPolicyById } from '../config/policies';
import { formatMoney } from '../utils/formatting';
import { getMilestoneSpeedMultiplier, getGlobalMilestoneMultiplier } from '../config/unlocks';
import { getPowerStructureMultiplier } from '../config/powerStructures';
import { useState, useEffect, useRef } from 'react';

export function StatsDisplay() {
    const funds = useStore(state => state.funds);
    const volunteers = useStore(state => state.volunteers);
    const popularity = useStore(state => state.popularity);
    const momentum = useStore(state => state.momentum);
    const activities = useStore(state => state.activities);
    const unlockedPolicies = useStore(state => state.unlockedPolicies);
    const unlockedStructures = useStore(state => state.unlockedStructures);
    const lifetimeEarnings = useStore(state => state.lifetimeEarnings);
    const happiness = useStore(state => state.happiness);

    // Calculate polling percentage
    const polling = getPolling({ lifetimeEarnings, popularity, momentum, happiness });

    // Track if we just crossed 51% for pulse animation
    const [isPulsing, setIsPulsing] = useState(false);
    const prevPollingRef = useRef(polling);

    useEffect(() => {
        const prevPolling = prevPollingRef.current;
        // Trigger pulse when crossing 51% threshold in either direction
        if ((prevPolling < 51 && polling >= 51) || (prevPolling >= 51 && polling < 51)) {
            setIsPulsing(true);
            const timer = setTimeout(() => setIsPulsing(false), 1500);
            return () => clearTimeout(timer);
        }
        prevPollingRef.current = polling;
    }, [polling]);

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

    // Determine polling status for styling
    const isWinning = polling >= 51;
    const isCritical = polling < 40;
    const isCloseRace = polling >= 45 && polling < 51;

    // Momentum bonus indicator
    const hasMomentumBonus = momentum > 50;

    return (
        <div className="glass-card p-4">
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* HERO POLLING SECTION - THE MAIN EVENT */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="mb-4">
                <div className="text-center mb-2">
                    <div className="text-xs text-slate-400 uppercase tracking-widest font-medium">
                        📊 Projected Vote Share
                    </div>
                </div>

                {/* THE BIG NUMBER */}
                <div className="text-center mb-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`polling-${Math.floor(polling * 10)}`}
                            className={`text-5xl font-black tabular-nums tracking-tight ${
                                isWinning
                                    ? 'text-emerald-400'
                                    : isCritical
                                        ? 'text-red-400'
                                        : isCloseRace
                                            ? 'text-amber-400'
                                            : 'text-slate-300'
                            }`}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{
                                scale: isPulsing ? [1, 1.1, 1] : 1,
                                opacity: 1
                            }}
                            transition={{
                                duration: isPulsing ? 0.5 : 0.2,
                                repeat: isPulsing ? 2 : 0
                            }}
                        >
                            {polling.toFixed(1)}%
                        </motion.div>
                    </AnimatePresence>

                    {/* Status Indicator */}
                    <motion.div
                        className={`text-xs font-semibold mt-1 ${
                            isWinning
                                ? 'text-emerald-500'
                                : isCritical
                                    ? 'text-red-500'
                                    : isCloseRace
                                        ? 'text-amber-500'
                                        : 'text-slate-500'
                        }`}
                        animate={isPulsing ? { scale: [1, 1.1, 1] } : {}}
                    >
                        {isWinning
                            ? '✓ LEADING'
                            : isCritical
                                ? '⚠ CRISIS'
                                : isCloseRace
                                    ? '⚡ CLOSE RACE'
                                    : '— BUILDING SUPPORT'}
                    </motion.div>
                </div>

                {/* THE HERO PROGRESS BAR */}
                <div className="relative">
                    {/* Background Track */}
                    <div className="h-6 bg-slate-800 rounded-full overflow-hidden border-2 border-slate-700">
                        {/* 51% Threshold Line */}
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-white/40 z-10"
                            style={{ left: '51%' }}
                        />

                        {/* Progress Fill */}
                        <motion.div
                            className={`h-full rounded-full relative ${
                                isWinning
                                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-400'
                                    : isCritical
                                        ? 'bg-gradient-to-r from-red-700 via-red-600 to-red-500'
                                        : 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400'
                            }`}
                            initial={{ width: 0 }}
                            animate={{
                                width: `${polling}%`,
                                boxShadow: isPulsing
                                    ? isWinning
                                        ? ['0 0 20px rgba(16, 185, 129, 0.5)', '0 0 40px rgba(16, 185, 129, 0.8)', '0 0 20px rgba(16, 185, 129, 0.5)']
                                        : ['0 0 20px rgba(239, 68, 68, 0.5)', '0 0 40px rgba(239, 68, 68, 0.8)', '0 0 20px rgba(239, 68, 68, 0.5)']
                                    : 'none'
                            }}
                            transition={{
                                width: { type: 'spring', damping: 15, stiffness: 100 },
                                boxShadow: { duration: 0.5, repeat: isPulsing ? 2 : 0 }
                            }}
                        >
                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                        </motion.div>
                    </div>

                    {/* Win Threshold Marker */}
                    <div
                        className="absolute -top-1 text-[10px] text-slate-400 transform -translate-x-1/2"
                        style={{ left: '51%' }}
                    >
                        WIN
                    </div>
                </div>

                {/* Momentum Bonus Indicator */}
                {hasMomentumBonus && (
                    <motion.div
                        className="text-center mt-2"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                            <span className="animate-pulse">⚡</span>
                            Momentum Boost Active (+{2 + Math.floor((momentum - 50) / 25)}%)
                        </span>
                    </motion.div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* CAMPAIGN FUNDS (Secondary) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="text-center mb-3 py-2 border-t border-slate-700/50">
                <div className="text-xs text-slate-500 uppercase tracking-wide">
                    Campaign Funds
                </div>
                <motion.div
                    className="text-2xl font-bold text-white tabular-nums"
                    key={`funds-${Math.floor(funds)}`}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.1 }}
                >
                    {formatMoney(funds)}
                </motion.div>
                {earningsPerSecond > 0 && (
                    <span className="text-xs text-emerald-400 font-medium">
                        {formatMoney(earningsPerSecond)}/sec
                    </span>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SUPPORTING STATS (Compact Grid) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-3 gap-2">
                {/* Volunteers */}
                <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <div className="text-lg mb-0.5">✊</div>
                    <div className="text-sm font-bold text-emerald-400 tabular-nums">
                        {formatNumber(volunteers)}
                    </div>
                    <div className="text-[10px] text-slate-500">Volunteers</div>
                    {volunteerBonus > 0 && (
                        <div className="text-[10px] text-emerald-500">
                            +{volunteerBonus.toFixed(0)}%
                        </div>
                    )}
                </div>

                {/* Popularity */}
                <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <div className="text-lg mb-0.5">
                        {popularity >= 1.5 ? '🔥' : popularity >= 1 ? '⭐' : '😰'}
                    </div>
                    <div className={`text-sm font-bold ${popularity >= 1.2 ? 'text-amber-400' :
                        popularity >= 0.8 ? 'text-slate-300' : 'text-red-400'
                        }`}>
                        {popularity.toFixed(2)}x
                    </div>
                    <div className="text-[10px] text-slate-500">Popularity</div>
                    {popularityPercent !== 0 && (
                        <div className={`text-[10px] ${popularityPercent > 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                            {popularityPercent > 0 ? '+' : ''}{popularityPercent.toFixed(0)}%
                        </div>
                    )}
                </div>

                {/* Speed/Momentum */}
                <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <div className="text-lg mb-0.5">⚡</div>
                    <div className={`text-sm font-bold tabular-nums ${momentumMultiplier >= 2 ? 'text-pink-400' :
                        momentumMultiplier >= 1.5 ? 'text-blue-400' : 'text-slate-400'
                        }`}>
                        {momentumMultiplier.toFixed(1)}x
                    </div>
                    <div className="text-[10px] text-slate-500">Speed</div>
                    {hasMomentumBonus && (
                        <div className="text-[10px] text-blue-400">
                            +Polling
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

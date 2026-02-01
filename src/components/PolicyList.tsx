import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useAudio } from '../hooks/useAudio';
import { POLICIES } from '../config/policies';
import { STAGES, type StageId } from '../config/stages';
import { formatMoney } from '../utils/formatting';

export function PolicyList() {
    const funds = useStore(state => state.funds);
    const activities = useStore(state => state.activities);
    const unlockedPolicies = useStore(state => state.unlockedPolicies);
    const currentStageIndex = useStore(state => state.currentStageIndex);
    const buyPolicy = useStore(state => state.buyPolicy);
    const { play } = useAudio();

    const stageOrder: StageId[] = ['activist', 'organizer', 'city-council', 'state-rep', 'congressman', 'senator', 'president'];

    // Filter policies based on visibility:
    // - Must be in current stage or earlier
    // - Activity policies: only show if player owns >= requiredOwned of that activity
    // - Global policies: show if player's total activities >= requiredOwned
    const totalActivities = Object.values(activities).reduce((sum, a) => sum + a.owned, 0);

    const visiblePolicies = POLICIES.filter(policy => {
        // Stage gating - can only see policies from current or earlier stages
        const policyStageIndex = stageOrder.indexOf(policy.stage);
        if (policyStageIndex > currentStageIndex) return false;

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

    // Group policies by stage for better organization
    const policiesByStage = visiblePolicies.reduce((acc, policy) => {
        if (!acc[policy.stage]) acc[policy.stage] = [];
        acc[policy.stage].push(policy);
        return acc;
    }, {} as Record<StageId, typeof POLICIES>);

    if (visiblePolicies.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500">
                <p>Buy more activities to unlock policies!</p>
            </div>
        );
    }

    const getStageColor = (stageId: StageId) => {
        switch (stageId) {
            case 'activist': return 'slate';
            case 'organizer': return 'blue';
            case 'city-council': return 'cyan';
            case 'state-rep': return 'indigo';
            case 'congressman': return 'violet';
            case 'senator': return 'purple';
            case 'president': return 'rose';
            default: return 'blue';
        }
    };

    const getStageEmoji = (stageId: StageId) => {
        switch (stageId) {
            case 'activist': return '✊';
            case 'organizer': return '📢';
            case 'city-council': return '🏙️';
            case 'state-rep': return '⭐';
            case 'congressman': return '🏛️';
            case 'senator': return '🎖️';
            case 'president': return '🇺🇸';
            default: return '📜';
        }
    };

    const getStageName = (stageId: StageId) => {
        return STAGES.find(s => s.id === stageId)?.name || stageId;
    };

    return (
        <div className="space-y-6">
            {stageOrder.map(stageId => {
                const stagePolicies = policiesByStage[stageId];
                if (!stagePolicies || stagePolicies.length === 0) return null;

                const color = getStageColor(stageId);

                return (
                    <div key={stageId} className="space-y-3">
                        {/* Stage Section Header */}
                        <div className="flex items-center gap-4">
                            <div className={`flex-1 h-px bg-gradient-to-r from-transparent via-${color}-500/50 to-transparent`} />
                            <span className={`text-sm text-${color}-400 uppercase tracking-wider flex items-center gap-2 font-bold`}>
                                <span>
                                    {getStageEmoji(stageId)}
                                </span>
                                {getStageName(stageId)} Policies
                            </span>
                            <div className={`flex-1 h-px bg-gradient-to-r from-transparent via-${color}-500/50 to-transparent`} />
                        </div>

                        {/* Policy Cards */}
                        <div className="grid gap-3 sm:grid-cols-2">
                            <AnimatePresence>
                                {stagePolicies.map((policy, index) => {
                                    const isUnlocked = unlockedPolicies.includes(policy.id);
                                    const canAfford = funds >= policy.cost;
                                    const hasImpact = policy.happinessChange > 0;

                                    return (
                                        <motion.div
                                            key={policy.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.03 }}
                                            className={`
                                                relative overflow-hidden rounded-xl p-3 lg:p-4
                                                ${isUnlocked
                                                    ? 'bg-gradient-to-br from-emerald-900/30 to-green-900/30 border border-emerald-500/30'
                                                    : 'bg-gradient-to-br from-slate-800 to-slate-900/80 border border-slate-700'
                                                }
                                            `}
                                        >
                                            {/* Document styling - top "fold" */}
                                            <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-slate-700/30 to-transparent" />

                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h3 className={`font-semibold ${isUnlocked ? 'text-emerald-300' : 'text-blue-200'}`}>
                                                        {policy.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        {policy.description}
                                                    </p>
                                                </div>
                                                {isUnlocked && (
                                                    <span className="text-emerald-400 text-lg">✓</span>
                                                )}
                                            </div>

                                            {/* Type Badge & Happiness */}
                                            <div className="flex items-center gap-2 mb-3 flex-wrap">
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
                                                {hasImpact && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-300 border border-emerald-700/30">
                                                        😊 +{policy.happinessChange}%
                                                    </span>
                                                )}
                                            </div>

                                            {/* Impact Preview */}
                                            {hasImpact && policy.impactTitle && !isUnlocked && (
                                                <div className="mb-3 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                                    <p className="text-xs text-emerald-400 font-medium">
                                                        {policy.impactTitle}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Buy Button */}
                                            {!isUnlocked && (
                                                <motion.button
                                                    onClick={() => { buyPolicy(policy.id); play('policy'); }}
                                                    disabled={!canAfford}
                                                    className={`
                                                        w-full py-2 px-4 rounded-lg font-medium text-sm
                                                        transition-all duration-200 active:scale-[0.98]
                                                        ${canAfford
                                                            ? hasImpact
                                                                ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg shadow-emerald-900/30'
                                                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
                                                            : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                                        }
                                                    `}
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
            })}
        </div>
    );
}

import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useAudio } from '../hooks/useAudio';
import {
    SKILLS,
    BRANCHES,
    getSkillsByBranch,
    canUnlockSkill,
    calculateSkillEffects,
    type Skill,
    type SkillBranch,
} from '../config/skills';

interface SkillTreeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SkillNodeProps {
    skill: Skill;
    isUnlocked: boolean;
    canUnlock: boolean;
    hasPoints: boolean;
    onUnlock: () => void;
}

function SkillNode({ skill, isUnlocked, canUnlock, hasPoints, onUnlock }: SkillNodeProps) {
    const branchInfo = BRANCHES.find(b => b.id === skill.branch);

    const getNodeStyle = () => {
        if (isUnlocked) {
            return `bg-gradient-to-br ${branchInfo?.gradientClass || 'from-slate-600 to-slate-500'} border-2 border-white/30 shadow-lg`;
        }
        if (canUnlock && hasPoints) {
            return `bg-slate-800/80 border-2 border-dashed ${branchInfo?.colorClass?.replace('text-', 'border-') || 'border-slate-500'} hover:bg-slate-700/80 cursor-pointer`;
        }
        return 'bg-slate-900/60 border-2 border-slate-700/50 opacity-50';
    };

    return (
        <motion.button
            onClick={() => canUnlock && hasPoints && !isUnlocked && onUnlock()}
            disabled={isUnlocked || !canUnlock || !hasPoints}
            className={`relative w-full p-3 rounded-xl transition-all ${getNodeStyle()}`}
            whileHover={canUnlock && hasPoints && !isUnlocked ? { scale: 1.02 } : {}}
            whileTap={canUnlock && hasPoints && !isUnlocked ? { scale: 0.98 } : {}}
        >
            {/* Glow effect for unlockable */}
            {canUnlock && hasPoints && !isUnlocked && (
                <motion.div
                    className={`absolute inset-0 rounded-xl ${branchInfo?.bgClass || 'bg-slate-700/30'}`}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}

            <div className="relative flex items-start gap-3">
                {/* Emoji Icon */}
                <div className={`text-2xl ${isUnlocked ? '' : 'grayscale opacity-70'}`}>
                    {skill.emoji}
                </div>

                {/* Content */}
                <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${isUnlocked ? 'text-white' : 'text-slate-300'}`}>
                            {skill.name}
                        </span>
                        {isUnlocked && (
                            <span className="text-xs px-1.5 py-0.5 bg-white/20 rounded text-white/80">
                                Active
                            </span>
                        )}
                    </div>
                    <p className={`text-xs mt-0.5 ${isUnlocked ? 'text-white/80' : 'text-slate-400'}`}>
                        {skill.description}
                    </p>
                </div>

                {/* Tier Badge */}
                <div className={`text-xs font-bold px-2 py-1 rounded ${isUnlocked ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    T{skill.tier}
                </div>
            </div>

            {/* Flavor text on hover/unlock */}
            {isUnlocked && (
                <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-xs text-white/60 italic mt-2 pt-2 border-t border-white/10"
                >
                    {skill.flavorText}
                </motion.p>
            )}
        </motion.button>
    );
}

interface BranchColumnProps {
    branch: SkillBranch;
    unlockedSkills: string[];
    skillPoints: number;
    onUnlock: (skillId: string) => void;
}

function BranchColumn({ branch, unlockedSkills, skillPoints, onUnlock }: BranchColumnProps) {
    const branchInfo = BRANCHES.find(b => b.id === branch);
    const skills = getSkillsByBranch(branch);

    return (
        <div className="flex flex-col gap-3">
            {/* Branch Header */}
            <div className={`text-center p-3 rounded-xl ${branchInfo?.bgClass || 'bg-slate-800/50'} border border-slate-700/50`}>
                <div className="text-2xl mb-1">{branchInfo?.emoji}</div>
                <h3 className={`font-bold ${branchInfo?.colorClass || 'text-slate-300'}`}>
                    {branchInfo?.name}
                </h3>
                <p className="text-xs text-slate-400">{branchInfo?.description}</p>
            </div>

            {/* Skill Nodes */}
            <div className="flex flex-col gap-2">
                {skills.map((skill, index) => {
                    const isUnlocked = unlockedSkills.includes(skill.id);
                    const canUnlockThis = canUnlockSkill(skill.id, unlockedSkills);

                    return (
                        <div key={skill.id} className="relative">
                            {/* Connection line to previous tier */}
                            {index > 0 && (
                                <div className={`absolute -top-2 left-1/2 w-0.5 h-4 ${unlockedSkills.includes(skills[index - 1].id)
                                        ? `bg-gradient-to-b ${branchInfo?.gradientClass || 'from-slate-500 to-slate-600'}`
                                        : 'bg-slate-700'
                                    }`}
                                />
                            )}
                            <SkillNode
                                skill={skill}
                                isUnlocked={isUnlocked}
                                canUnlock={canUnlockThis}
                                hasPoints={skillPoints > 0}
                                onUnlock={() => onUnlock(skill.id)}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function SkillTreeModal({ isOpen, onClose }: SkillTreeModalProps) {
    const { play } = useAudio();
    const level = useStore(state => state.level);
    const skillPoints = useStore(state => state.skillPoints);
    const unlockedSkills = useStore(state => state.unlockedSkills);
    const unlockSkill = useStore(state => state.unlockSkill);

    const skillEffects = calculateSkillEffects(unlockedSkills);

    const handleUnlock = (skillId: string) => {
        const success = unlockSkill(skillId);
        if (success) {
            play('skillUnlock');
        }
    };

    // Count unlocked skills per branch
    const getUnlockedCount = (branch: SkillBranch) => {
        return unlockedSkills.filter(id => {
            const skill = SKILLS.find(s => s.id === id);
            return skill?.branch === branch;
        }).length;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="glass-card p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                                <span className="text-2xl">🌳</span>
                                The Candidate's Journey
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">
                                Unlock permanent abilities to shape your political path
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors text-xl p-2"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-800/50 rounded-xl mb-6">
                        <div className="flex items-center gap-2">
                            <span className="text-amber-400 text-xl">⭐</span>
                            <div>
                                <div className="text-xs text-slate-400">Level</div>
                                <div className="font-bold text-white">{level}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-purple-400 text-xl">💎</span>
                            <div>
                                <div className="text-xs text-slate-400">Skill Points</div>
                                <div className={`font-bold ${skillPoints > 0 ? 'text-purple-400' : 'text-slate-500'}`}>
                                    {skillPoints}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-emerald-400 text-xl">✓</span>
                            <div>
                                <div className="text-xs text-slate-400">Skills Unlocked</div>
                                <div className="font-bold text-emerald-400">
                                    {unlockedSkills.length} / {SKILLS.length}
                                </div>
                            </div>
                        </div>

                        {/* Branch Progress */}
                        <div className="hidden sm:flex items-center gap-3 ml-auto">
                            {BRANCHES.map(branch => (
                                <div key={branch.id} className="flex items-center gap-1">
                                    <span>{branch.emoji}</span>
                                    <span className={`text-sm ${branch.colorClass}`}>
                                        {getUnlockedCount(branch.id)}/3
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Skill Tree Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        {BRANCHES.map(branch => (
                            <BranchColumn
                                key={branch.id}
                                branch={branch.id}
                                unlockedSkills={unlockedSkills}
                                skillPoints={skillPoints}
                                onUnlock={handleUnlock}
                            />
                        ))}
                    </div>

                    {/* Active Effects Summary */}
                    {unlockedSkills.length > 0 && (
                        <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                            <h3 className="text-sm font-semibold text-slate-300 mb-3">Active Skill Effects</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                                {skillEffects.clickValueMult > 1 && (
                                    <div className="flex items-center gap-1 text-emerald-400">
                                        <span>👟</span>
                                        <span>+{Math.round((skillEffects.clickValueMult - 1) * 100)}% Click Value</span>
                                    </div>
                                )}
                                {skillEffects.clickMomentumBonus > 0 && (
                                    <div className="flex items-center gap-1 text-emerald-400">
                                        <span>📣</span>
                                        <span>+{skillEffects.clickMomentumBonus} Momentum/Click</span>
                                    </div>
                                )}
                                {skillEffects.recruitmentChanceMult > 1 && (
                                    <div className="flex items-center gap-1 text-emerald-400">
                                        <span>✊</span>
                                        <span>+{Math.round((skillEffects.recruitmentChanceMult - 1) * 100)}% Recruitment</span>
                                    </div>
                                )}
                                {skillEffects.activityCostMult < 1 && (
                                    <div className="flex items-center gap-1 text-cyan-400">
                                        <span>📊</span>
                                        <span>-{Math.round((1 - skillEffects.activityCostMult) * 100)}% Activity Cost</span>
                                    </div>
                                )}
                                {skillEffects.globalRevenueMult > 1 && (
                                    <div className="flex items-center gap-1 text-cyan-400">
                                        <span>📈</span>
                                        <span>+{Math.round((skillEffects.globalRevenueMult - 1) * 100)}% Revenue</span>
                                    </div>
                                )}
                                {skillEffects.managerCostMult < 1 && (
                                    <div className="flex items-center gap-1 text-cyan-400">
                                        <span>🤖</span>
                                        <span>-{Math.round((1 - skillEffects.managerCostMult) * 100)}% Manager Cost</span>
                                    </div>
                                )}
                                {skillEffects.debateDamageMult > 1 && (
                                    <div className="flex items-center gap-1 text-rose-400">
                                        <span>🎙️</span>
                                        <span>+{Math.round((skillEffects.debateDamageMult - 1) * 100)}% Debate Damage</span>
                                    </div>
                                )}
                                {skillEffects.happinessGainMult > 1 && (
                                    <div className="flex items-center gap-1 text-rose-400">
                                        <span>😊</span>
                                        <span>+{Math.round((skillEffects.happinessGainMult - 1) * 100)}% Happiness Gain</span>
                                    </div>
                                )}
                                {skillEffects.debateCooldownReduction > 0 && (
                                    <div className="flex items-center gap-1 text-rose-400">
                                        <span>⏰</span>
                                        <span>-{skillEffects.debateCooldownReduction} Turn Cooldowns</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Hint if no skill points */}
                    {skillPoints === 0 && unlockedSkills.length < SKILLS.length && (
                        <div className="mt-4 text-center text-sm text-slate-500">
                            <p>Gain XP by canvassing, buying activities, and winning debates!</p>
                            <p className="text-xs mt-1">Each level grants 1 skill point.</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

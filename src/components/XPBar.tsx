import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { calculateLevelFromXp } from '../config/skills';

import { formatCompactNumber } from '../utils/formatting';

interface XPBarProps {
    onOpenSkillTree: () => void;
}

export function XPBar({ onOpenSkillTree }: XPBarProps) {
    const xp = useStore(state => state.xp);
    const level = useStore(state => state.level);
    const skillPoints = useStore(state => state.skillPoints);

    const levelInfo = calculateLevelFromXp(xp);
    const progressPercent = (levelInfo.currentLevelXp / levelInfo.xpForNextLevel) * 100;

    return (
        <motion.button
            onClick={onOpenSkillTree}
            className="w-full bg-slate-800/50 hover:bg-slate-700/50 rounded-lg p-2 transition-colors group"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
        >
            <div className="flex items-center gap-3">
                {/* Level Badge */}
                <div className="flex items-center gap-1.5 bg-amber-900/50 px-2 py-1 rounded-lg border border-amber-700/50">
                    <span className="text-amber-400 text-sm">⭐</span>
                    <span className="text-amber-300 font-bold text-sm">Lv.{level}</span>
                </div>

                {/* XP Progress Bar */}
                <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400 group-hover:text-slate-300 transition-colors">
                            Candidate XP
                        </span>
                        <span className="text-amber-400/80">
                            {formatCompactNumber(levelInfo.currentLevelXp)} / {formatCompactNumber(levelInfo.xpForNextLevel)}
                        </span>
                    </div>
                    <div className="h-2 bg-slate-900/50 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ type: 'spring', damping: 15 }}
                        />
                    </div>
                </div>

                {/* Skill Points Badge */}
                {skillPoints > 0 && (
                    <motion.div
                        className="flex items-center gap-1 bg-purple-900/50 px-2 py-1 rounded-lg border border-purple-500/50"
                        animate={{
                            boxShadow: [
                                '0 0 0px rgba(168, 85, 247, 0)',
                                '0 0 10px rgba(168, 85, 247, 0.5)',
                                '0 0 0px rgba(168, 85, 247, 0)',
                            ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <span className="text-purple-400 text-sm">💎</span>
                        <span className="text-purple-300 font-bold text-sm">{skillPoints}</span>
                    </motion.div>
                )}

                {/* Open Skill Tree Hint */}
                <div className="text-slate-500 group-hover:text-amber-400 transition-colors">
                    <span className="text-lg">🌳</span>
                </div>
            </div>
        </motion.button>
    );
}

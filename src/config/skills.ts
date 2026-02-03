// ================================================
// SKILL TREE CONFIGURATION
// The Candidate's Journey - RPG Skill System
// ================================================

export type SkillBranch = 'grassroots' | 'technocrat' | 'orator';
export type SkillTier = 1 | 2 | 3;

export interface Skill {
    id: string;
    name: string;
    description: string;
    flavorText: string;
    branch: SkillBranch;
    tier: SkillTier;
    emoji: string;
    // Effect modifiers
    effect: SkillEffect;
}

export type SkillEffect =
    | { type: 'click_value_mult'; value: number }           // Multiply click value
    | { type: 'click_momentum_bonus'; value: number }       // Extra momentum per click
    | { type: 'recruitment_chance_mult'; value: number }    // Recruitment drive frequency
    | { type: 'activity_cost_mult'; value: number }         // Activity cost reduction (0.95 = 5% off)
    | { type: 'global_revenue_mult'; value: number }        // Global revenue multiplier
    | { type: 'manager_cost_mult'; value: number }          // Manager cost reduction
    | { type: 'debate_damage_mult'; value: number }         // Debate damage boost
    | { type: 'happiness_gain_mult'; value: number }        // Happiness gain boost
    | { type: 'debate_cooldown_reduction'; value: number }; // Reduce cooldowns in debate

// ================================================
// SKILL DEFINITIONS
// ================================================

export const SKILLS: Skill[] = [
    // ═══════════════════════════════════════════
    // GRASSROOTS BRANCH (Active Play - Click-focused)
    // Color: Emerald/Green
    // ═══════════════════════════════════════════
    {
        id: 'shoe-leather',
        name: 'Shoe Leather',
        description: '+50% Click Value',
        flavorText: '"The revolution happens one doorstep at a time."',
        branch: 'grassroots',
        tier: 1,
        emoji: '👟',
        effect: { type: 'click_value_mult', value: 1.5 },
    },
    {
        id: 'megaphone',
        name: 'Megaphone',
        description: '+3 Momentum per click',
        flavorText: '"When we stand together, our voice echoes through the streets."',
        branch: 'grassroots',
        tier: 2,
        emoji: '📣',
        effect: { type: 'click_momentum_bonus', value: 3 },
    },
    {
        id: 'mass-mobilization',
        name: 'Mass Mobilization',
        description: 'Recruitment Drives trigger 25% more often',
        flavorText: '"Not me. Us."',
        branch: 'grassroots',
        tier: 3,
        emoji: '✊',
        effect: { type: 'recruitment_chance_mult', value: 1.25 },
    },

    // ═══════════════════════════════════════════
    // TECHNOCRAT BRANCH (Passive Play - Economic)
    // Color: Blue/Cyan
    // ═══════════════════════════════════════════
    {
        id: 'spreadsheets',
        name: 'Spreadsheets',
        description: '-10% Activity Cost',
        flavorText: '"Every dollar counts when you refuse corporate money."',
        branch: 'technocrat',
        tier: 1,
        emoji: '📊',
        effect: { type: 'activity_cost_mult', value: 0.90 },
    },
    {
        id: 'compound-interest',
        name: 'Compound Interest',
        description: '+15% Global Revenue',
        flavorText: '"Small donations, big change - that\'s real grassroots economics."',
        branch: 'technocrat',
        tier: 2,
        emoji: '📈',
        effect: { type: 'global_revenue_mult', value: 1.15 },
    },
    {
        id: 'automation-expert',
        name: 'Automation Expert',
        description: 'Managers are 50% cheaper',
        flavorText: '"Technology should serve the many, not the few."',
        branch: 'technocrat',
        tier: 3,
        emoji: '🤖',
        effect: { type: 'manager_cost_mult', value: 0.50 },
    },

    // ═══════════════════════════════════════════
    // ORATOR BRANCH (Battle/Politics)
    // Color: Rose/Red
    // ═══════════════════════════════════════════
    {
        id: 'soundbite',
        name: 'Soundbite',
        description: '+15% Debate Damage',
        flavorText: '"Healthcare is a human right!" - and they remember it.',
        branch: 'orator',
        tier: 1,
        emoji: '🎙️',
        effect: { type: 'debate_damage_mult', value: 1.15 },
    },
    {
        id: 'charm-offensive',
        name: 'Charm Offensive',
        description: '+15% Happiness Gain',
        flavorText: '"I wrote the damn bill!"',
        branch: 'orator',
        tier: 2,
        emoji: '😊',
        effect: { type: 'happiness_gain_mult', value: 1.15 },
    },
    {
        id: 'filibuster-proof',
        name: 'Filibuster Proof',
        description: 'Debate Cooldowns reduced by 1 turn',
        flavorText: '"I can do this all day."',
        branch: 'orator',
        tier: 3,
        emoji: '⏰',
        effect: { type: 'debate_cooldown_reduction', value: 1 },
    },
];

// ================================================
// HELPER FUNCTIONS
// ================================================

export function getSkillById(id: string): Skill | undefined {
    return SKILLS.find(s => s.id === id);
}

export function getSkillsByBranch(branch: SkillBranch): Skill[] {
    return SKILLS.filter(s => s.branch === branch).sort((a, b) => a.tier - b.tier);
}

export function getSkillsByTier(tier: SkillTier): Skill[] {
    return SKILLS.filter(s => s.tier === tier);
}

export function canUnlockSkill(skillId: string, unlockedSkills: string[]): boolean {
    const skill = getSkillById(skillId);
    if (!skill) return false;

    // Already unlocked
    if (unlockedSkills.includes(skillId)) return false;

    // Tier 1 skills are always available
    if (skill.tier === 1) return true;

    // Higher tier skills require the previous tier in the same branch
    const previousTier = (skill.tier - 1) as SkillTier;
    const branchSkills = getSkillsByBranch(skill.branch);
    const previousTierSkill = branchSkills.find(s => s.tier === previousTier);

    if (!previousTierSkill) return false;
    return unlockedSkills.includes(previousTierSkill.id);
}

// Branch metadata for UI
export interface BranchInfo {
    id: SkillBranch;
    name: string;
    description: string;
    emoji: string;
    colorClass: string;
    gradientClass: string;
    bgClass: string;
}

export const BRANCHES: BranchInfo[] = [
    {
        id: 'grassroots',
        name: 'Grassroots',
        description: 'Power through direct action',
        emoji: '🌱',
        colorClass: 'text-emerald-400',
        gradientClass: 'from-emerald-600 to-green-500',
        bgClass: 'bg-emerald-900/30',
    },
    {
        id: 'technocrat',
        name: 'Technocrat',
        description: 'Efficiency through optimization',
        emoji: '💼',
        colorClass: 'text-cyan-400',
        gradientClass: 'from-cyan-600 to-blue-500',
        bgClass: 'bg-cyan-900/30',
    },
    {
        id: 'orator',
        name: 'Orator',
        description: 'Victory through persuasion',
        emoji: '🎤',
        colorClass: 'text-rose-400',
        gradientClass: 'from-rose-600 to-red-500',
        bgClass: 'bg-rose-900/30',
    },
];

export function getBranchInfo(branch: SkillBranch): BranchInfo | undefined {
    return BRANCHES.find(b => b.id === branch);
}

// ================================================
// XP & LEVELING SYSTEM
// ================================================

// XP required to reach next level: 100 * (1.5 ^ currentLevel)
export function getXpRequiredForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Get total XP required from level 1 to target level
export function getTotalXpForLevel(level: number): number {
    let total = 0;
    for (let i = 1; i < level; i++) {
        total += getXpRequiredForLevel(i);
    }
    return total;
}

// Calculate level from total XP
export function calculateLevelFromXp(totalXp: number): { level: number; currentLevelXp: number; xpForNextLevel: number } {
    let level = 1;
    let remainingXp = totalXp;

    while (remainingXp >= getXpRequiredForLevel(level)) {
        remainingXp -= getXpRequiredForLevel(level);
        level++;
    }

    return {
        level,
        currentLevelXp: remainingXp,
        xpForNextLevel: getXpRequiredForLevel(level),
    };
}

// XP rewards for various actions
export const XP_REWARDS = {
    CANVASS_BASE: 1,            // Base XP per click
    ACTIVITY_PURCHASE_MULT: 0.01, // XP = cost * 0.01 (so $100 activity = 1 XP)
    POLICY_PURCHASE_MULT: 0.005,  // XP = cost * 0.005 for policies
    DEBATE_WIN: 50,              // Flat XP for winning a debate
    MILESTONE_BONUS: 25,         // Bonus XP for hitting milestones
    PRESTIGE_BONUS: 100,         // XP when prestiging
};

// Calculate aggregate skill effects for efficient lookups
export interface SkillEffects {
    clickValueMult: number;
    clickMomentumBonus: number;
    recruitmentChanceMult: number;
    activityCostMult: number;
    globalRevenueMult: number;
    managerCostMult: number;
    debateDamageMult: number;
    happinessGainMult: number;
    debateCooldownReduction: number;
}

export function calculateSkillEffects(unlockedSkills: string[]): SkillEffects {
    const effects: SkillEffects = {
        clickValueMult: 1,
        clickMomentumBonus: 0,
        recruitmentChanceMult: 1,
        activityCostMult: 1,
        globalRevenueMult: 1,
        managerCostMult: 1,
        debateDamageMult: 1,
        happinessGainMult: 1,
        debateCooldownReduction: 0,
    };

    for (const skillId of unlockedSkills) {
        const skill = getSkillById(skillId);
        if (!skill) continue;

        switch (skill.effect.type) {
            case 'click_value_mult':
                effects.clickValueMult *= skill.effect.value;
                break;
            case 'click_momentum_bonus':
                effects.clickMomentumBonus += skill.effect.value;
                break;
            case 'recruitment_chance_mult':
                effects.recruitmentChanceMult *= skill.effect.value;
                break;
            case 'activity_cost_mult':
                effects.activityCostMult *= skill.effect.value;
                break;
            case 'global_revenue_mult':
                effects.globalRevenueMult *= skill.effect.value;
                break;
            case 'manager_cost_mult':
                effects.managerCostMult *= skill.effect.value;
                break;
            case 'debate_damage_mult':
                effects.debateDamageMult *= skill.effect.value;
                break;
            case 'happiness_gain_mult':
                effects.happinessGainMult *= skill.effect.value;
                break;
            case 'debate_cooldown_reduction':
                effects.debateCooldownReduction += skill.effect.value;
                break;
        }
    }

    return effects;
}

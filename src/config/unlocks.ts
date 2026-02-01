import { ACTIVITIES } from './activities';

// ================================================
// Unlock System - Adventure Capitalist Style
// ================================================

export interface Unlock {
    id: string;
    threshold: number;      // e.g., 25, 50, 100
    type: 'speed' | 'revenue';
    multiplier: number;     // e.g., 2 for x2 speed
    targetId: string;       // Activity ID or 'global'
}

export interface MilestoneNotification {
    id: string;
    activityId: string;
    activityName: string;
    activityEmoji: string;
    threshold: number;
    bonusType: 'speed' | 'revenue';
    multiplier: number;
    timestamp: number;
}

// Standard thresholds (Adventure Capitalist style)
const STANDARD_THRESHOLDS = [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

// Global milestone thresholds (total across all activities)
const GLOBAL_THRESHOLDS = [100, 500, 1000, 2500, 5000];

// Generate unlocks for a single activity
function generateActivityUnlocks(activityId: string): Unlock[] {
    return STANDARD_THRESHOLDS.map(threshold => ({
        id: `${activityId}-${threshold}`,
        threshold,
        type: 'speed' as const,
        multiplier: 2,
        targetId: activityId,
    }));
}

// Generate global unlocks (total level milestones)
function generateGlobalUnlocks(): Unlock[] {
    return GLOBAL_THRESHOLDS.map(threshold => ({
        id: `global-${threshold}`,
        threshold,
        type: 'revenue' as const,
        multiplier: 2,
        targetId: 'global',
    }));
}

// All unlocks: activity-specific + global
export const UNLOCKS: Unlock[] = [
    ...ACTIVITIES.flatMap(activity => generateActivityUnlocks(activity.id)),
    ...generateGlobalUnlocks(),
];

// ================================================
// Helper Functions
// ================================================

/**
 * Get all unlocks for a specific activity
 */
export function getUnlocksForActivity(activityId: string): Unlock[] {
    return UNLOCKS.filter(u => u.targetId === activityId);
}

/**
 * Get all global unlocks
 */
export function getGlobalUnlocks(): Unlock[] {
    return UNLOCKS.filter(u => u.targetId === 'global');
}

/**
 * Get the next unlock for an activity based on current owned count
 */
export function getNextUnlock(activityId: string, owned: number): Unlock | null {
    const activityUnlocks = getUnlocksForActivity(activityId);
    return activityUnlocks.find(u => u.threshold > owned) || null;
}

/**
 * Get the next global unlock based on total levels
 */
export function getNextGlobalUnlock(totalLevels: number): Unlock | null {
    const globalUnlocks = getGlobalUnlocks();
    return globalUnlocks.find(u => u.threshold > totalLevels) || null;
}

/**
 * Get all unlocked milestones for an activity
 */
export function getUnlockedMilestonesForActivity(activityId: string, owned: number): Unlock[] {
    return getUnlocksForActivity(activityId).filter(u => u.threshold <= owned);
}

/**
 * Get all unlocked global milestones
 */
export function getUnlockedGlobalMilestones(totalLevels: number): Unlock[] {
    return getGlobalUnlocks().filter(u => u.threshold <= totalLevels);
}

/**
 * Calculate cumulative speed multiplier for an activity from milestones
 */
export function getMilestoneSpeedMultiplier(activityId: string, owned: number): number {
    const unlockedMilestones = getUnlockedMilestonesForActivity(activityId, owned);
    const speedMilestones = unlockedMilestones.filter(u => u.type === 'speed');
    return speedMilestones.reduce((mult, u) => mult * u.multiplier, 1);
}

/**
 * Calculate cumulative revenue multiplier for an activity from milestones
 */
export function getMilestoneRevenueMultiplier(activityId: string, owned: number): number {
    const unlockedMilestones = getUnlockedMilestonesForActivity(activityId, owned);
    const revenueMilestones = unlockedMilestones.filter(u => u.type === 'revenue');
    return revenueMilestones.reduce((mult, u) => mult * u.multiplier, 1);
}

/**
 * Calculate global revenue multiplier from total level milestones
 */
export function getGlobalMilestoneMultiplier(totalLevels: number): number {
    const unlockedGlobals = getUnlockedGlobalMilestones(totalLevels);
    return unlockedGlobals.reduce((mult, u) => mult * u.multiplier, 1);
}

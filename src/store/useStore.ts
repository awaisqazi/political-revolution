import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ACTIVITIES, getActivityCost, getManagerCost } from '../config/activities';
import { POLICIES, getPolicyById, type Policy } from '../config/policies';
import { RANKS, getRankForEarnings } from '../config/ranks';
import {
    getMilestoneSpeedMultiplier,
    getGlobalMilestoneMultiplier,
    getUnlocksForActivity,
    getGlobalUnlocks,
    type MilestoneNotification,
} from '../config/unlocks';
import { getPowerStructureMultiplier, getPowerStructureById } from '../config/powerStructures';
import { STAGES, getMoraleMultiplier, canPromoteStage, type StageId } from '../config/stages';
import {
    STARTING_FUNDS,
    MOMENTUM_CLICK_INCREMENT,
    MOMENTUM_DECAY_RATE,
    VOLUNTEER_DIVISOR,
    VOLUNTEER_BONUS_PER,
    VOLUNTEER_MOMENTUM_DECAY_REDUCTION,
    OFFLINE_MAX_SECONDS,
    getMomentumMultiplier,
    MILESTONE_THRESHOLDS,
} from '../config/gameConfig';

// ================================================
// Type Definitions
// ================================================

export interface ActivityState {
    owned: number;
    managerHired: boolean;
    progress: number; // 0 to baseTime in ms
    lastCompletionTime: number;
}

export interface NewsEvent {
    id: string;
    title: string;
    description: string;
    popularityChange: number;
    timestamp: number;
}

export type BuyMode = 'x1' | 'x10' | 'x100' | 'next' | 'max';

export type MiniGameType = 'none' | 'petition-blitz';

export interface GameState {
    // Core resources
    funds: number;
    lifetimeEarnings: number;
    volunteers: number;
    popularity: number; // 0.0 to 2.0
    momentum: number; // 0 to 100

    // Phase 7: Happiness & Stages
    happiness: number; // 0-100, starts at 50
    currentStageIndex: number; // 0-2 (city/state/national)
    lastPurchasedPolicy: Policy | null; // For triggering modal
    utopiaAchieved: boolean; // Win condition reached

    // Activities
    activities: Record<string, ActivityState>;

    // Policies (upgrades)
    unlockedPolicies: string[];

    // Milestones (Adventure Capitalist style)
    unlockedMilestones: string[];
    pendingNotifications: MilestoneNotification[];

    // Power Structures (Deep Organizing)
    unlockedStructures: string[];

    // Meta
    lastSaveTime: number;
    totalClicks: number;

    // Rank (persists through prestige)
    highestLifetimeEarnings: number;
    currentRankId: string;

    // News events
    activeEvent: NewsEvent | null;

    // Buy mode
    buyMode: BuyMode;

    // Mini-game state
    activeMiniGame: MiniGameType;
    miniGameScore: number;
    miniGameActivityId: string | null;

    // Run tracking (for UI refreshes)
    runId: number;

    // Phase 8: Tutorial
    tutorialStep: number; // 0 = not started, 1-4 = in tutorial, 5 = completed

    // Actions
    canvass: () => void;
    buyActivity: (id: string) => void;
    hireManager: (id: string) => void;
    runActivity: (id: string) => void;
    buyPolicy: (id: string) => void;
    tick: (deltaMs: number) => void;
    prestige: () => void;
    dismissEvent: () => void;
    dismissNotification: () => void;
    triggerEvent: (event: Omit<NewsEvent, 'id' | 'timestamp'>) => void;
    calculateOfflineProgress: () => { earnings: number; seconds: number };
    cycleBuyMode: () => void;
    assignVolunteers: (id: string) => void;

    // Mini-game actions
    startMiniGame: (activityId: string) => void;
    clickMiniGame: () => void;
    endMiniGame: () => void;

    // Phase 7: New Actions
    clearPolicyModal: () => void;
    promoteStage: () => void;
    getCurrentStage: () => typeof STAGES[0];

    // Hard reset for new game
    hardReset: () => void;

    // Phase 8: Tutorial actions
    advanceTutorial: () => void;
    completeTutorial: () => void;
}

// Initialize activities state
function initializeActivities(): Record<string, ActivityState> {
    const activities: Record<string, ActivityState> = {};
    ACTIVITIES.forEach(activity => {
        activities[activity.id] = {
            owned: 0,
            managerHired: false,
            progress: 0,
            lastCompletionTime: 0,
        };
    });
    return activities;
}

// Helper to calculate total global multiplier (including global policies + morale)
const calculateMultipliers = (state: GameState) => {
    const momentumMultiplier = getMomentumMultiplier(state.momentum);
    const volunteerMultiplier = 1 + (state.volunteers * VOLUNTEER_BONUS_PER);
    const moraleMultiplier = getMoraleMultiplier(state.happiness);

    // Calculate global policy multiplier
    const globalPolicyMultiplier = state.unlockedPolicies.reduce((mult, policyId) => {
        const policy = getPolicyById(policyId);
        if (policy && policy.type === 'global') {
            return mult * policy.multiplier;
        }
        return mult;
    }, 1);

    // Calculate power structure multiplier
    const structureMultiplier = getPowerStructureMultiplier(state.unlockedStructures || []);

    return state.popularity * volunteerMultiplier * momentumMultiplier * globalPolicyMultiplier * structureMultiplier * moraleMultiplier;
};

// Helper to get multiplier for a specific activity from unlocked policies
const getPolicyMultiplier = (state: GameState, activityId: string): number => {
    return state.unlockedPolicies.reduce((mult, policyId) => {
        const policy = getPolicyById(policyId);
        if (policy && policy.type === 'activity' && policy.triggerId === activityId) {
            return mult * policy.multiplier;
        }
        return mult;
    }, 1);
};

// ================================================
// Zustand Store
// ================================================

const DEFAULT_STATE: Partial<GameState> = {
    funds: STARTING_FUNDS,
    lifetimeEarnings: 0,
    volunteers: 0,
    popularity: 1.0,
    momentum: 0,
    happiness: 50,
    currentStageIndex: 0,
    lastPurchasedPolicy: null,
    utopiaAchieved: false,
    unlockedPolicies: [],
    unlockedMilestones: [],
    pendingNotifications: [],
    unlockedStructures: [],
    totalClicks: 0,
    highestLifetimeEarnings: 0,
    currentRankId: 'neighbor',
    activeEvent: null,
    buyMode: 'x1',
    activeMiniGame: 'none',
    miniGameScore: 0,
    miniGameActivityId: null,
    runId: 0,
    tutorialStep: 0,
};

export const useStore = create<GameState>()(
    persist(
        (set, get) => ({
            // Initial state
            ...DEFAULT_STATE as GameState, // Cast because we know we're adding the missing parts below
            activities: initializeActivities(),
            lastSaveTime: Date.now(),

            // Actions implementation start here...
            canvass: () => {

                const state = get();
                // Base click value (e.g., $1) scaled by current multipliers
                const multipliers = calculateMultipliers(state);
                const clickValue = 1 * multipliers;

                const newLifetimeEarnings = state.lifetimeEarnings + clickValue;
                const newHighest = Math.max(state.highestLifetimeEarnings, newLifetimeEarnings);
                const newRank = getRankForEarnings(newHighest);

                set(state => ({
                    momentum: Math.min(100, state.momentum + MOMENTUM_CLICK_INCREMENT),
                    totalClicks: state.totalClicks + 1,
                    funds: state.funds + clickValue,
                    lifetimeEarnings: newLifetimeEarnings,
                    highestLifetimeEarnings: newHighest,
                    currentRankId: newRank.id,
                }));
            },

            // Manually run an activity (Clicking the card)
            runActivity: (id: string) => {
                const state = get();
                const activity = state.activities[id];

                // Can only run if owned, NOT already running, and NOT managed (managers handle it automatically)
                if (activity.owned > 0 && activity.progress === 0 && !activity.managerHired) {
                    set(state => ({
                        activities: {
                            ...state.activities,
                            [id]: {
                                ...activity,
                                progress: 0.1, // Start progress slightly above 0 to catch it in the tick
                            },
                        },
                    }));
                }
            },

            // Buy an activity
            buyActivity: (id: string) => {
                const state = get();
                const activity = ACTIVITIES.find(a => a.id === id);
                if (!activity) return;

                const activityState = state.activities[id];
                const cost = getActivityCost(activity.baseCost, activityState.owned);

                if (state.funds >= cost) {
                    const newQuantity = activityState.owned + 1;

                    // Check if this purchase hits a milestone threshold
                    const hitMilestone = MILESTONE_THRESHOLDS.includes(newQuantity);

                    set(state => ({
                        funds: state.funds - cost,
                        activities: {
                            ...state.activities,
                            [id]: {
                                ...state.activities[id],
                                owned: newQuantity,
                            },
                        },
                        // Trigger mini-game if milestone hit
                        ...(hitMilestone ? {
                            activeMiniGame: 'petition-blitz' as const,
                            miniGameScore: 0,
                            miniGameActivityId: id,
                        } : {}),
                    }));
                }
            },

            // Hire a manager for an activity
            hireManager: (id: string) => {
                const state = get();
                const activity = ACTIVITIES.find(a => a.id === id);
                if (!activity) return;

                const activityState = state.activities[id];
                if (activityState.managerHired || activityState.owned === 0) return;

                const cost = getManagerCost(activity.baseCost);

                if (state.funds >= cost) {
                    set(state => ({
                        funds: state.funds - cost,
                        activities: {
                            ...state.activities,
                            [id]: {
                                ...state.activities[id],
                                managerHired: true,
                                progress: 0.1, // Kickstart it immediately
                            },
                        },
                    }));
                }
            },

            // Buy a policy upgrade - now affects happiness and triggers modal
            buyPolicy: (id: string) => {
                const state = get();
                const policy = POLICIES.find(p => p.id === id);
                if (!policy) return;

                // Check if already unlocked
                if (state.unlockedPolicies.includes(id)) return;

                // Check stage requirement
                const stageOrder: StageId[] = ['activist', 'organizer', 'city-council', 'state-rep', 'congressman', 'senator', 'president'];
                const policyStageIndex = stageOrder.indexOf(policy.stage);
                if (policyStageIndex > state.currentStageIndex) return; // Can't buy policies from future stages

                // Check if we have enough funds
                if (state.funds >= policy.cost) {
                    const newHappiness = Math.min(100, Math.max(0, state.happiness + policy.happinessChange));

                    // Check for Utopia condition
                    const isUtopia = state.currentStageIndex === 2 && newHappiness >= 100;

                    set(state => ({
                        funds: state.funds - policy.cost,
                        unlockedPolicies: [...state.unlockedPolicies, id],
                        happiness: newHappiness,
                        // Set policy for modal if it has impact content
                        lastPurchasedPolicy: policy.impactDescription ? policy : null,
                        utopiaAchieved: isUtopia,
                    }));
                }
            },

            // Clear the policy modal after viewing
            clearPolicyModal: () => {
                set({ lastPurchasedPolicy: null });
            },

            // Promote to next stage (advance level)
            promoteStage: () => {
                const state = get();
                const nextIndex = state.currentStageIndex + 1;

                if (nextIndex >= STAGES.length) return; // Already at max

                // Check if eligible to promote
                // Note: STAGES[state.currentStageIndex] might be undefined if index is messed up, handled in canPromoteStage or just check existence
                if (!canPromoteStage(state.currentStageIndex, state.lifetimeEarnings, state.happiness)) {
                    return;
                }

                // Advance to next stage - KEEP current progress (funds, activities, etc.)
                // "Winning" an election just moves you to the next level of influence.
                set({
                    currentStageIndex: nextIndex,
                    lastSaveTime: Date.now(),
                });
            },

            // Get current stage helper
            getCurrentStage: () => {
                const state = get();
                return STAGES[state.currentStageIndex];
            },

            // Hard reset for new game
            hardReset: () => {
                set({
                    funds: STARTING_FUNDS,
                    lifetimeEarnings: 0,
                    volunteers: 0,
                    popularity: 1.0,
                    momentum: 0,
                    happiness: 50,
                    currentStageIndex: 0,
                    lastPurchasedPolicy: null,
                    utopiaAchieved: false,
                    unlockedPolicies: [],
                    unlockedMilestones: [],
                    pendingNotifications: [],
                    unlockedStructures: [],
                    totalClicks: 0,
                    highestLifetimeEarnings: 0,
                    currentRankId: 'neighbor',
                    activeEvent: null,
                    buyMode: 'x1',
                    activeMiniGame: 'none',
                    miniGameScore: 0,
                    miniGameActivityId: null,
                    activities: initializeActivities(),
                    lastSaveTime: Date.now(),
                    runId: Date.now(), // Force UI refresh
                    tutorialStep: 0, // Reset tutorial for new game
                });
            },

            // Game tick - called every frame
            tick: (deltaMs: number) => {
                set(state => {
                    // Decay logic
                    const decayReduction = state.volunteers * VOLUNTEER_MOMENTUM_DECAY_REDUCTION;
                    const effectiveDecayRate = Math.max(0.5, MOMENTUM_DECAY_RATE - decayReduction);
                    const newMomentum = Math.max(0, state.momentum - (effectiveDecayRate * deltaMs / 1000));

                    // Calculate total levels for global milestone checking
                    const totalLevels = Object.values(state.activities).reduce(
                        (sum, a) => sum + a.owned, 0
                    );

                    // Global milestone multiplier
                    const globalMilestoneMultiplier = getGlobalMilestoneMultiplier(totalLevels);

                    // Multipliers (including global milestone boost + morale)
                    const totalMultiplier = calculateMultipliers({ ...state, momentum: newMomentum }) * globalMilestoneMultiplier;

                    // Update activities
                    let earnings = 0;
                    const newActivities = { ...state.activities };
                    const newMilestones = [...state.unlockedMilestones];
                    const newNotifications = [...state.pendingNotifications];

                    ACTIVITIES.forEach(activity => {
                        const activityState = newActivities[activity.id];
                        if (activityState.owned === 0) return;

                        // Check if activity should run (Manager OR Manually started)
                        const isRunning = activityState.managerHired || activityState.progress > 0;
                        if (!isRunning) return;

                        // Apply milestone speed multiplier to progress!
                        const speedMultiplier = getMilestoneSpeedMultiplier(activity.id, activityState.owned);
                        const effectiveTime = activity.baseTime / speedMultiplier;
                        const newProgress = activityState.progress + deltaMs;

                        if (newProgress >= effectiveTime) {
                            // Activity Completed!
                            const policyMultiplier = getPolicyMultiplier(state, activity.id);
                            const revenue = activity.baseRevenue * activityState.owned * totalMultiplier * policyMultiplier;

                            // If it overshot significantly (e.g. lag), calculate multiple completions for Managers only
                            if (activityState.managerHired) {
                                const completions = Math.floor(newProgress / effectiveTime);
                                earnings += revenue * completions;
                                newActivities[activity.id] = {
                                    ...activityState,
                                    progress: newProgress % effectiveTime, // Loop it
                                    lastCompletionTime: Date.now(),
                                };
                            } else {
                                // Manual run: Grant 1x revenue and stop
                                earnings += revenue;
                                newActivities[activity.id] = {
                                    ...activityState,
                                    progress: 0, // Reset to 0 (stop)
                                    lastCompletionTime: Date.now(),
                                };
                            }
                        } else {
                            // Still in progress
                            newActivities[activity.id] = {
                                ...activityState,
                                progress: newProgress,
                            };
                        }

                        // Check for new milestone unlocks for this activity
                        const activityUnlocks = getUnlocksForActivity(activity.id);
                        for (const unlock of activityUnlocks) {
                            if (activityState.owned >= unlock.threshold && !newMilestones.includes(unlock.id)) {
                                newMilestones.push(unlock.id);
                                newNotifications.push({
                                    id: `notif-${unlock.id}-${Date.now()}`,
                                    activityId: activity.id,
                                    activityName: activity.name,
                                    activityEmoji: activity.emoji,
                                    threshold: unlock.threshold,
                                    bonusType: unlock.type,
                                    multiplier: unlock.multiplier,
                                    timestamp: Date.now(),
                                });
                            }
                        }
                    });

                    // Check for global milestone unlocks
                    const globalUnlocks = getGlobalUnlocks();
                    for (const unlock of globalUnlocks) {
                        if (totalLevels >= unlock.threshold && !newMilestones.includes(unlock.id)) {
                            newMilestones.push(unlock.id);
                            newNotifications.push({
                                id: `notif-${unlock.id}-${Date.now()}`,
                                activityId: 'global',
                                activityName: 'Total Activities',
                                activityEmoji: '🌍',
                                threshold: unlock.threshold,
                                bonusType: unlock.type,
                                multiplier: unlock.multiplier,
                                timestamp: Date.now(),
                            });
                        }
                    }

                    // Update rank if we've reached a new high
                    const newLifetimeEarnings = state.lifetimeEarnings + earnings;
                    const newHighest = Math.max(state.highestLifetimeEarnings, newLifetimeEarnings);
                    const newRank = getRankForEarnings(newHighest);

                    return {
                        momentum: newMomentum,
                        funds: state.funds + earnings,
                        lifetimeEarnings: newLifetimeEarnings,
                        activities: newActivities,
                        unlockedMilestones: newMilestones,
                        pendingNotifications: newNotifications,
                        highestLifetimeEarnings: newHighest,
                        currentRankId: newRank.id,
                        lastSaveTime: Date.now(),
                    };
                });
            },

            // Calculate offline progress (unchanged logic, just ensuring it matches types)
            calculateOfflineProgress: () => {
                const state = get();
                const now = Date.now();
                const elapsedMs = Math.min(now - state.lastSaveTime, OFFLINE_MAX_SECONDS * 1000);
                const elapsedSeconds = elapsedMs / 1000;
                const volunteerMultiplier = 1 + (state.volunteers * VOLUNTEER_BONUS_PER);
                const moraleMultiplier = getMoraleMultiplier(state.happiness);

                // Calculate global policy multiplier for offline
                const globalPolicyMultiplier = state.unlockedPolicies.reduce((mult, policyId) => {
                    const policy = getPolicyById(policyId);
                    if (policy && policy.type === 'global') {
                        return mult * policy.multiplier;
                    }
                    return mult;
                }, 1);

                // Calculate power structure multiplier for offline
                const structureMultiplier = getPowerStructureMultiplier(state.unlockedStructures || []);

                const totalMultiplier = state.popularity * volunteerMultiplier * globalPolicyMultiplier * structureMultiplier * moraleMultiplier; // No momentum offline

                let totalEarnings = 0;

                ACTIVITIES.forEach(activity => {
                    const activityState = state.activities[activity.id];
                    if (activityState.owned === 0 || !activityState.managerHired) return;
                    const policyMultiplier = getPolicyMultiplier(state, activity.id);
                    const completionsPerSecond = 1000 / activity.baseTime;
                    const revenue = activity.baseRevenue * activityState.owned * totalMultiplier * policyMultiplier * completionsPerSecond * elapsedSeconds;
                    totalEarnings += revenue;
                });

                if (totalEarnings > 0) {
                    set(state => ({
                        funds: state.funds + totalEarnings,
                        lifetimeEarnings: state.lifetimeEarnings + totalEarnings,
                        lastSaveTime: now,
                    }));
                }

                return { earnings: totalEarnings, seconds: elapsedSeconds };
            },

            prestige: () => {
                const state = get();
                // Calculate bonus volunteers from prestige formula
                const bonusVolunteers = Math.floor(Math.sqrt(state.lifetimeEarnings / VOLUNTEER_DIVISOR));

                // Full reset - start a new campaign from City Council
                set({
                    funds: STARTING_FUNDS,
                    lifetimeEarnings: 0,
                    momentum: 0,
                    totalClicks: 0, // Reset doors knocked
                    highestLifetimeEarnings: 0, // Reset total raised
                    currentRankId: 'neighbor', // Reset rank
                    currentStageIndex: 0, // Reset to City Council - start fresh!
                    utopiaAchieved: false, // Reset win condition
                    happiness: 50, // Reset happiness to status quo
                    activities: initializeActivities(),
                    unlockedPolicies: [], // Reset policies on prestige
                    unlockedMilestones: [], // Reset milestones on prestige
                    unlockedStructures: [], // Reset power structures on prestige
                    pendingNotifications: [],
                    volunteers: state.volunteers + bonusVolunteers, // ADD to existing volunteers
                    activeEvent: null,
                    lastSaveTime: Date.now(),
                    runId: Date.now(), // Force UI refresh
                });
            },

            dismissEvent: () => { set({ activeEvent: null }); },

            dismissNotification: () => {
                set(state => ({
                    pendingNotifications: state.pendingNotifications.slice(1),
                }));
            },

            triggerEvent: (event) => {
                set(state => ({
                    activeEvent: { ...event, id: `event-${Date.now()}`, timestamp: Date.now() },
                    popularity: Math.max(0, Math.min(2.0, state.popularity + event.popularityChange)),
                }));
            },

            cycleBuyMode: () => {
                set(state => {
                    const modes: BuyMode[] = ['x1', 'x10', 'x100', 'next', 'max'];
                    const currentIndex = modes.indexOf(state.buyMode);
                    const nextIndex = (currentIndex + 1) % modes.length;
                    return { buyMode: modes[nextIndex] };
                });
            },

            assignVolunteers: (id: string) => {
                const state = get();
                const structure = getPowerStructureById(id);
                if (!structure) return;

                if (state.volunteers >= structure.cost && !state.unlockedStructures.includes(id)) {
                    set(state => ({
                        volunteers: state.volunteers - structure.cost,
                        unlockedStructures: [...state.unlockedStructures, id],
                    }));
                }
            },

            // Mini-game actions
            startMiniGame: (activityId: string) => {
                set({
                    activeMiniGame: 'petition-blitz',
                    miniGameScore: 0,
                    miniGameActivityId: activityId,
                });
            },

            clickMiniGame: () => {
                set(state => ({
                    miniGameScore: state.miniGameScore + 1,
                }));
            },

            endMiniGame: () => {
                const state = get();
                // Calculate rank multiplier (index + 1)
                const rankIndex = RANKS.findIndex(r => r.id === state.currentRankId);
                const rankMultiplier = Math.max(1, rankIndex + 1);

                // Calculate volunteers earned
                const volunteersEarned = state.miniGameScore * rankMultiplier;

                set(state => ({
                    activeMiniGame: 'none',
                    miniGameScore: 0,
                    miniGameActivityId: null,
                    volunteers: state.volunteers + volunteersEarned,
                }));
            },

            // Phase 8: Tutorial actions
            advanceTutorial: () => {
                set(state => ({
                    tutorialStep: Math.min(7, state.tutorialStep + 1),
                }));
            },

            completeTutorial: () => {
                set({ tutorialStep: 99 }); // Set high to mark fully complete
            },
        }),
        {
            name: 'political-revolution-save',
            partialize: (state) => ({
                funds: state.funds,
                lifetimeEarnings: state.lifetimeEarnings,
                volunteers: state.volunteers,
                popularity: state.popularity,
                momentum: state.momentum,
                happiness: state.happiness,
                currentStageIndex: state.currentStageIndex,
                utopiaAchieved: state.utopiaAchieved,
                activities: state.activities,
                unlockedPolicies: state.unlockedPolicies,
                unlockedMilestones: state.unlockedMilestones,
                unlockedStructures: state.unlockedStructures,
                highestLifetimeEarnings: state.highestLifetimeEarnings,
                currentRankId: state.currentRankId,
                lastSaveTime: state.lastSaveTime,
                totalClicks: state.totalClicks,
                runId: state.runId,
                tutorialStep: state.tutorialStep,
            }),
        }
    )
);

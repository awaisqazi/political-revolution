import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ACTIVITIES, getActivityCost, getManagerCost } from '../config/activities';
import {
    STARTING_FUNDS,
    MOMENTUM_CLICK_INCREMENT,
    MOMENTUM_DECAY_RATE,
    VOLUNTEER_DIVISOR,
    VOLUNTEER_BONUS_PER,
    VOLUNTEER_MOMENTUM_DECAY_REDUCTION,
    OFFLINE_MAX_SECONDS,
    getMomentumMultiplier,
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

export interface GameState {
    // Core resources
    funds: number;
    lifetimeEarnings: number;
    volunteers: number;
    popularity: number; // 0.0 to 2.0
    momentum: number; // 0 to 100

    // Activities
    activities: Record<string, ActivityState>;

    // Meta
    lastSaveTime: number;
    totalClicks: number;

    // News events
    activeEvent: NewsEvent | null;

    // Actions
    canvass: () => void;
    buyActivity: (id: string) => void;
    hireManager: (id: string) => void;
    tick: (deltaMs: number) => void;
    prestige: () => void;
    dismissEvent: () => void;
    triggerEvent: (event: Omit<NewsEvent, 'id' | 'timestamp'>) => void;
    calculateOfflineProgress: () => { earnings: number; seconds: number };
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

// ================================================
// Zustand Store
// ================================================

export const useStore = create<GameState>()(
    persist(
        (set, get) => ({
            // Initial state
            funds: STARTING_FUNDS,
            lifetimeEarnings: 0,
            volunteers: 0,
            popularity: 1.0,
            momentum: 0,
            activities: initializeActivities(),
            lastSaveTime: Date.now(),
            totalClicks: 0,
            activeEvent: null,

            // Canvass action - fills momentum bar
            canvass: () => {
                set(state => ({
                    momentum: Math.min(100, state.momentum + MOMENTUM_CLICK_INCREMENT),
                    totalClicks: state.totalClicks + 1,
                }));
            },

            // Buy an activity
            buyActivity: (id: string) => {
                const state = get();
                const activity = ACTIVITIES.find(a => a.id === id);
                if (!activity) return;

                const activityState = state.activities[id];
                const cost = getActivityCost(activity.baseCost, activityState.owned);

                if (state.funds >= cost) {
                    set(state => ({
                        funds: state.funds - cost,
                        activities: {
                            ...state.activities,
                            [id]: {
                                ...state.activities[id],
                                owned: state.activities[id].owned + 1,
                            },
                        },
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
                            },
                        },
                    }));
                }
            },

            // Game tick - called every frame
            tick: (deltaMs: number) => {
                set(state => {
                    // Calculate decay rate with volunteer reduction
                    const decayReduction = state.volunteers * VOLUNTEER_MOMENTUM_DECAY_REDUCTION;
                    const effectiveDecayRate = Math.max(0.5, MOMENTUM_DECAY_RATE - decayReduction);

                    // Decay momentum
                    const newMomentum = Math.max(0, state.momentum - (effectiveDecayRate * deltaMs / 1000));

                    // Calculate multipliers
                    const momentumMultiplier = getMomentumMultiplier(newMomentum);
                    const volunteerMultiplier = 1 + (state.volunteers * VOLUNTEER_BONUS_PER);
                    const totalMultiplier = state.popularity * volunteerMultiplier * momentumMultiplier;

                    // Update activities and calculate earnings
                    let earnings = 0;
                    const newActivities = { ...state.activities };

                    ACTIVITIES.forEach(activity => {
                        const activityState = newActivities[activity.id];
                        if (activityState.owned === 0) return;
                        if (!activityState.managerHired) return; // Only automated activities run

                        // Progress the activity
                        const newProgress = activityState.progress + deltaMs;

                        if (newProgress >= activity.baseTime) {
                            // Activity completed - calculate how many times
                            const completions = Math.floor(newProgress / activity.baseTime);
                            const revenue = activity.baseRevenue * activityState.owned * totalMultiplier * completions;
                            earnings += revenue;

                            newActivities[activity.id] = {
                                ...activityState,
                                progress: newProgress % activity.baseTime,
                                lastCompletionTime: Date.now(),
                            };
                        } else {
                            newActivities[activity.id] = {
                                ...activityState,
                                progress: newProgress,
                            };
                        }
                    });

                    return {
                        momentum: newMomentum,
                        funds: state.funds + earnings,
                        lifetimeEarnings: state.lifetimeEarnings + earnings,
                        activities: newActivities,
                        lastSaveTime: Date.now(),
                    };
                });
            },

            // Calculate offline progress
            calculateOfflineProgress: () => {
                const state = get();
                const now = Date.now();
                const elapsedMs = Math.min(
                    now - state.lastSaveTime,
                    OFFLINE_MAX_SECONDS * 1000
                );
                const elapsedSeconds = elapsedMs / 1000;

                // Calculate earnings from automated activities
                // Use base multipliers (no momentum when offline)
                const volunteerMultiplier = 1 + (state.volunteers * VOLUNTEER_BONUS_PER);
                const totalMultiplier = state.popularity * volunteerMultiplier;

                let totalEarnings = 0;

                ACTIVITIES.forEach(activity => {
                    const activityState = state.activities[activity.id];
                    if (activityState.owned === 0 || !activityState.managerHired) return;

                    const completionsPerSecond = 1000 / activity.baseTime;
                    const totalCompletions = completionsPerSecond * elapsedSeconds;
                    const revenue = activity.baseRevenue * activityState.owned * totalMultiplier * totalCompletions;
                    totalEarnings += revenue;
                });

                // Apply offline earnings
                if (totalEarnings > 0) {
                    set(state => ({
                        funds: state.funds + totalEarnings,
                        lifetimeEarnings: state.lifetimeEarnings + totalEarnings,
                        lastSaveTime: now,
                    }));
                }

                return { earnings: totalEarnings, seconds: elapsedSeconds };
            },

            // Prestige - reset and gain volunteers
            prestige: () => {
                const state = get();
                const newVolunteers = Math.floor(Math.sqrt(state.lifetimeEarnings / VOLUNTEER_DIVISOR));

                if (newVolunteers <= state.volunteers) return; // No point in prestiging

                set({
                    funds: STARTING_FUNDS,
                    lifetimeEarnings: 0,
                    momentum: 0,
                    activities: initializeActivities(),
                    volunteers: newVolunteers,
                    // Keep popularity and reset event
                    activeEvent: null,
                    lastSaveTime: Date.now(),
                });
            },

            // Dismiss active event
            dismissEvent: () => {
                set({ activeEvent: null });
            },

            // Trigger a news event
            triggerEvent: (event) => {
                set(state => ({
                    activeEvent: {
                        ...event,
                        id: `event-${Date.now()}`,
                        timestamp: Date.now(),
                    },
                    popularity: Math.max(0, Math.min(2.0, state.popularity + event.popularityChange)),
                }));
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
                activities: state.activities,
                lastSaveTime: state.lastSaveTime,
                totalClicks: state.totalClicks,
            }),
        }
    )
);

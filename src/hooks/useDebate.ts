import { useState, useCallback, useEffect } from 'react';
import { useStore, getPolling } from '../store/useStore';
import { POLICIES, type Policy } from '../config/policies';
import type { Opponent } from '../config/stages';
import { calculateSkillEffects } from '../config/skills';

// ═══════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export type MoveType = 'Logic' | 'Appeal' | 'Fact';

export interface BattleMove {
    id: string;
    name: string;
    damage: number;          // Final damage after polling scaling
    baseDamage: number;      // Original damage before polling scaling
    pollingMultiplier: number; // The polling-based damage multiplier
    maxCooldown: number; // Turns to recharge after use
    type: MoveType;
    description: string;
    emoji: string;
}

export interface BattleLogEntry {
    id: string;
    text: string;
    type: 'player' | 'enemy' | 'system';
    damage?: number;
    heal?: number;
}

export interface DebateState {
    playerHp: number;
    maxPlayerHp: number;
    enemyHp: number;
    maxEnemyHp: number;
    turn: 'player' | 'enemy';
    cooldowns: Record<string, number>; // moveId -> turns remaining
    battleLog: BattleLogEntry[];
    isComplete: boolean;
    didPlayerWin: boolean;
    isShaking: boolean; // For damage shake animation
    isReady: boolean; // For battle initialization delay
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

// Calculate player HP based on polling (happiness) - scaled for fun gameplay
const calculatePlayerHp = (happiness: number): number => {
    // Base HP 100, happiness acts as percentage modifier
    return Math.max(50, Math.floor(happiness * 1.5));
};

// Convert a policy to a battle move (with skill effects and polling scaling applied)
const policyToBattleMove = (
    policy: Policy,
    stageIndex: number,
    damageMult: number = 1,
    cooldownReduction: number = 0,
    pollingMultiplier: number = 1
): BattleMove => {
    // Damage scales with cost, but also by stage (earlier stages = lower damage scale)
    const stageDamageMultiplier = 1 + (stageIndex * 0.5);
    const rawBaseDamage = Math.ceil((policy.cost / 1000) * stageDamageMultiplier);
    // Apply skill damage multiplier
    const boostedDamage = Math.ceil(rawBaseDamage * damageMult);
    // Clamp base damage between 5 and 50 for balance
    const baseDamage = Math.max(5, Math.min(50, boostedDamage));

    // Apply polling-based damage scaling: FinalDamage = BaseDamage * (Polling / 50)
    // At 50% polling = 1.0x, at 75% = 1.5x, at 25% = 0.5x
    const finalDamage = Math.max(1, Math.round(baseDamage * pollingMultiplier));

    // Cooldown based on cost: cheap = 0, expensive = 3
    const baseCooldown = policy.cost <= 1000 ? 0
        : policy.cost <= 10000 ? 1
            : policy.cost <= 100000 ? 2
                : 3;
    // Apply skill cooldown reduction (minimum 0)
    const cooldown = Math.max(0, baseCooldown - cooldownReduction);

    // Determine move type based on policy characteristics
    let type: MoveType = 'Logic';
    if (policy.happinessChange >= 3) {
        type = 'Appeal'; // High happiness = emotional appeal
    } else if (policy.type === 'global') {
        type = 'Fact'; // Global policies = systemic facts
    }

    // Emoji based on type
    const emoji = type === 'Logic' ? '📊' : type === 'Appeal' ? '💬' : '📜';

    return {
        id: policy.id,
        name: policy.name,
        damage: finalDamage,
        baseDamage,
        pollingMultiplier,
        maxCooldown: cooldown,
        type,
        description: policy.description,
        emoji,
    };
};

// ═══════════════════════════════════════════════════════════════
// THE HOOK
// ═══════════════════════════════════════════════════════════════

export function useDebate(opponent: Opponent | null) {
    const unlockedPolicies = useStore(state => state.unlockedPolicies);
    const happiness = useStore(state => state.happiness);
    const currentStageIndex = useStore(state => state.currentStageIndex);
    const unlockedSkills = useStore(state => state.unlockedSkills);
    const lifetimeEarnings = useStore(state => state.lifetimeEarnings);
    const popularity = useStore(state => state.popularity);
    const momentum = useStore(state => state.momentum);

    // Get skill effects for debate bonuses
    const skillEffects = calculateSkillEffects(unlockedSkills);

    // Calculate polling and polling-based damage multiplier
    const polling = getPolling({ lifetimeEarnings, popularity, momentum, happiness });
    // Polling damage formula: Polling / 50 = multiplier
    // At 50% polling = 1.0x, at 75% = 1.5x, at 25% = 0.5x
    const pollingMultiplier = polling / 50;

    // Generate battle moves from unlocked policies (with skill effects and polling scaling applied)
    const moves: BattleMove[] = unlockedPolicies
        .map(id => POLICIES.find(p => p.id === id))
        .filter((p): p is Policy => p !== undefined)
        .map(policy => policyToBattleMove(
            policy,
            currentStageIndex,
            skillEffects.debateDamageMult,
            skillEffects.debateCooldownReduction,
            pollingMultiplier
        ));

    // If no policies unlocked, provide a basic attack (with skill damage boost and polling scaling)
    const baseDamageDefault = Math.ceil(5 * skillEffects.debateDamageMult);
    const defaultMove: BattleMove = {
        id: 'basic-argument',
        name: 'Basic Argument',
        damage: Math.max(1, Math.round(baseDamageDefault * pollingMultiplier)),
        baseDamage: baseDamageDefault,
        pollingMultiplier,
        maxCooldown: 0,
        type: 'Logic',
        description: 'A simple but honest point',
        emoji: '💭',
    };

    const allMoves = moves.length > 0 ? moves : [defaultMove];

    // ═══════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════

    const [state, setState] = useState<DebateState>(() => {
        const playerHp = calculatePlayerHp(happiness);
        // Force a minimum health of 100 to prevent instant-win on mount/glitch
        const safeHealth = (opponent?.health && opponent.health > 0) ? opponent.health : 100;

        return {
            playerHp,
            maxPlayerHp: playerHp,
            enemyHp: safeHealth,
            maxEnemyHp: safeHealth,
            turn: 'player',
            cooldowns: {},
            battleLog: [],
            isComplete: false,
            didPlayerWin: false,
            isShaking: false,
            isReady: false, // NEW: Prevent interaction/checks until battle is fully set up
        };
    });

    // Clear battle state when opponent becomes null (prevent background activity/wins)
    useEffect(() => {
        if (!opponent) {
            setState(prev => ({
                ...prev,
                isComplete: false,
                didPlayerWin: false,
                isReady: false
            }));
        }
    }, [opponent]);

    // Handle initialization sequence
    useEffect(() => {
        if (!opponent) return;

        const timer = setTimeout(() => {
            setState(prev => ({ ...prev, isReady: true }));
        }, 500); // 500ms safety window

        return () => clearTimeout(timer);
    }, [opponent]);

    // Reset battle when opponent changes or debate starts
    const resetBattle = useCallback(() => {
        if (!opponent) return;
        const playerHp = calculatePlayerHp(happiness);
        const safeHealth = (opponent?.health && opponent.health > 0) ? opponent.health : 100;

        setState({
            playerHp,
            maxPlayerHp: playerHp,
            enemyHp: safeHealth,
            maxEnemyHp: safeHealth,
            turn: 'player',
            cooldowns: {},
            battleLog: [{
                id: `system-${Date.now()}`,
                text: `A wild ${opponent.name} appeared! "${opponent.description}"`,
                type: 'system',
            }],
            isComplete: false,
            didPlayerWin: false,
            isShaking: false,
            isReady: false, // Reset to false and let the useEffect handle the 500ms delay
        });
    }, [opponent, happiness]);

    // Use a move (player attack)
    const useMove = useCallback((moveId: string) => {
        if (!opponent || state.isComplete || state.turn !== 'player' || !state.isReady) return;

        const move = allMoves.find(m => m.id === moveId);
        if (!move) return;

        // Check if move is on cooldown
        if ((state.cooldowns[moveId] ?? 0) > 0) return;

        setState(prev => {
            // Triple check ready state inside functional update
            if (!prev.isReady || prev.isComplete) return prev;

            const newEnemyHp = Math.max(0, prev.enemyHp - move.damage);

            const logEntry: BattleLogEntry = {
                id: `player-${Date.now()}`,
                text: `${move.emoji} You used ${move.name}! It dealt ${move.damage} damage!`,
                type: 'player',
                damage: move.damage,
            };

            // Set cooldown for this move
            const newCooldowns = { ...prev.cooldowns };
            if (move.maxCooldown > 0) {
                newCooldowns[moveId] = move.maxCooldown;
            }

            // Check for victory
            if (newEnemyHp <= 0) {
                return {
                    ...prev,
                    enemyHp: 0,
                    cooldowns: newCooldowns,
                    battleLog: [...prev.battleLog, logEntry, {
                        id: `system-win-${Date.now()}`,
                        text: `🎉 ${opponent.name} has been defeated! The people have spoken!`,
                        type: 'system',
                    }],
                    isComplete: true,
                    didPlayerWin: true,
                    turn: 'player',
                };
            }

            return {
                ...prev,
                enemyHp: newEnemyHp,
                cooldowns: newCooldowns,
                battleLog: [...prev.battleLog, logEntry],
                turn: 'enemy', // Switch to enemy turn
            };
        });
    }, [opponent, state.isComplete, state.turn, state.cooldowns, allMoves]);

    // Enemy turn - called automatically after player turn
    const executeEnemyTurn = useCallback(() => {
        if (!opponent || state.isComplete || state.turn !== 'enemy') return;

        // Pick a random attack from opponent's repertoire
        const attackName = opponent.attacks[Math.floor(Math.random() * opponent.attacks.length)];
        const damage = opponent.baseDamage;

        setState(prev => {
            const newPlayerHp = Math.max(0, prev.playerHp - damage);

            // Decrement all cooldowns
            const newCooldowns: Record<string, number> = {};
            for (const [moveId, cd] of Object.entries(prev.cooldowns)) {
                if (cd > 1) {
                    newCooldowns[moveId] = cd - 1;
                }
                // If cd === 1, it becomes 0 and is removed
            }

            const logEntry: BattleLogEntry = {
                id: `enemy-${Date.now()}`,
                text: `⚔️ ${opponent.name} used ${attackName}! You took ${damage} damage!`,
                type: 'enemy',
                damage,
            };

            // Check for defeat
            if (newPlayerHp <= 0) {
                return {
                    ...prev,
                    playerHp: 0,
                    cooldowns: newCooldowns,
                    battleLog: [...prev.battleLog, logEntry, {
                        id: `system-lose-${Date.now()}`,
                        text: `💔 Your credibility has been destroyed. The debate is lost...`,
                        type: 'system',
                    }],
                    isComplete: true,
                    didPlayerWin: false,
                    turn: 'enemy',
                    isShaking: true,
                };
            }

            return {
                ...prev,
                playerHp: newPlayerHp,
                cooldowns: newCooldowns,
                battleLog: [...prev.battleLog, logEntry],
                turn: 'player', // Back to player turn
                isShaking: true, // Trigger shake
            };
        });

        // Reset shake after animation
        setTimeout(() => {
            setState(prev => ({ ...prev, isShaking: false }));
        }, 300);
    }, [opponent, state.isComplete, state.turn]);

    // Auto-execute enemy turn after player's turn
    useEffect(() => {
        if (state.turn === 'enemy' && !state.isComplete) {
            const timer = setTimeout(() => {
                executeEnemyTurn();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [state.turn, state.isComplete, executeEnemyTurn]);

    // Get move preview info (including polling scaling details for UI feedback)
    const getMovePreview = useCallback((moveId: string) => {
        const move = allMoves.find(m => m.id === moveId);
        if (!move) return {
            damage: 0,
            baseDamage: 0,
            pollingMultiplier: 1,
            cooldown: 0,
            onCooldown: false,
            turnsRemaining: 0,
        };

        const turnsRemaining = state.cooldowns[moveId] ?? 0;
        return {
            damage: move.damage,
            baseDamage: move.baseDamage,
            pollingMultiplier: move.pollingMultiplier,
            cooldown: move.maxCooldown,
            onCooldown: turnsRemaining > 0,
            turnsRemaining,
        };
    }, [allMoves, state.cooldowns]);

    return {
        state,
        moves: allMoves,
        useMove,
        getMovePreview,
        resetBattle,
        polling,              // Expose current polling for UI display
        pollingMultiplier,    // Expose multiplier for damage tooltips
    };
}

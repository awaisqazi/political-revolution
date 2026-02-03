import { useState, useCallback, useEffect } from 'react';
import { useStore } from '../store/useStore';
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
    damage: number;
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
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

// Calculate player HP based on polling (happiness) - scaled for fun gameplay
const calculatePlayerHp = (happiness: number): number => {
    // Base HP 100, happiness acts as percentage modifier
    return Math.max(50, Math.floor(happiness * 1.5));
};

// Convert a policy to a battle move (with skill effects applied)
const policyToBattleMove = (
    policy: Policy,
    stageIndex: number,
    damageMult: number = 1,
    cooldownReduction: number = 0
): BattleMove => {
    // Damage scales with cost, but also by stage (earlier stages = lower damage scale)
    const stageDamageMultiplier = 1 + (stageIndex * 0.5);
    const baseDamage = Math.ceil((policy.cost / 1000) * stageDamageMultiplier);
    // Apply skill damage multiplier
    const boostedDamage = Math.ceil(baseDamage * damageMult);
    // Clamp damage between 5 and 50 for balance
    const damage = Math.max(5, Math.min(50, boostedDamage));

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
        damage,
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

    // Get skill effects for debate bonuses
    const skillEffects = calculateSkillEffects(unlockedSkills);

    // Generate battle moves from unlocked policies (with skill effects applied)
    const moves: BattleMove[] = unlockedPolicies
        .map(id => POLICIES.find(p => p.id === id))
        .filter((p): p is Policy => p !== undefined)
        .map(policy => policyToBattleMove(
            policy,
            currentStageIndex,
            skillEffects.debateDamageMult,
            skillEffects.debateCooldownReduction
        ));

    // If no policies unlocked, provide a basic attack (with skill damage boost)
    const defaultMove: BattleMove = {
        id: 'basic-argument',
        name: 'Basic Argument',
        damage: Math.ceil(5 * skillEffects.debateDamageMult),
        maxCooldown: 0,
        type: 'Logic',
        description: 'A simple but honest point',
        emoji: '💭',
    };

    const allMoves = moves.length > 0 ? moves : [defaultMove];

    const [state, setState] = useState<DebateState>(() => {
        const playerHp = calculatePlayerHp(happiness);
        return {
            playerHp,
            maxPlayerHp: playerHp,
            enemyHp: opponent?.health ?? 100,
            maxEnemyHp: opponent?.health ?? 100,
            turn: 'player',
            cooldowns: {},
            battleLog: [],
            isComplete: false,
            didPlayerWin: false,
            isShaking: false,
        };
    });

    // Reset battle when opponent changes or debate starts
    const resetBattle = useCallback(() => {
        if (!opponent) return;
        const playerHp = calculatePlayerHp(happiness);
        setState({
            playerHp,
            maxPlayerHp: playerHp,
            enemyHp: opponent.health,
            maxEnemyHp: opponent.health,
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
        });
    }, [opponent, happiness]);

    // Use a move (player attack)
    const useMove = useCallback((moveId: string) => {
        if (!opponent || state.isComplete || state.turn !== 'player') return;

        const move = allMoves.find(m => m.id === moveId);
        if (!move) return;

        // Check if move is on cooldown
        if ((state.cooldowns[moveId] ?? 0) > 0) return;

        setState(prev => {
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

    // Get move preview info
    const getMovePreview = useCallback((moveId: string) => {
        const move = allMoves.find(m => m.id === moveId);
        if (!move) return { damage: 0, cooldown: 0, onCooldown: false, turnsRemaining: 0 };

        const turnsRemaining = state.cooldowns[moveId] ?? 0;
        return {
            damage: move.damage,
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
    };
}

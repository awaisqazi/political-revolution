import { useState, useCallback } from 'react';
import { useStore } from '../store/useStore';
import type { Opponent } from '../config/stages';

export interface BattleLogEntry {
    id: string;
    text: string;
    type: 'player' | 'enemy' | 'system';
    damage?: number;
    heal?: number;
}

export interface DebateState {
    playerHealth: number;
    maxPlayerHealth: number;
    enemyHealth: number;
    maxEnemyHealth: number;
    isPlayerTurn: boolean;
    battleLog: BattleLogEntry[];
    isComplete: boolean;
    didPlayerWin: boolean;
}

export type AttackType = 'cite-statistics' | 'personal-story' | 'mobilize-base' | 'fact-check';

export interface Attack {
    id: AttackType;
    name: string;
    emoji: string;
    description: string;
    scaleStat: string;
    isHeal?: boolean;
}

export const ATTACKS: Attack[] = [
    {
        id: 'cite-statistics',
        name: 'Cite Statistics',
        emoji: '📊',
        description: 'Reference your policy record',
        scaleStat: 'Policies Passed',
    },
    {
        id: 'personal-story',
        name: 'Share Personal Story',
        emoji: '💬',
        description: 'Connect with voters emotionally',
        scaleStat: 'Happiness',
    },
    {
        id: 'mobilize-base',
        name: 'Mobilize Base',
        emoji: '✊',
        description: 'Rally your grassroots supporters',
        scaleStat: 'Volunteers',
    },
    {
        id: 'fact-check',
        name: 'Fact Check',
        emoji: '🔍',
        description: 'Expose lies and recover credibility',
        scaleStat: 'Momentum',
        isHeal: true,
    },
];

const PLAYER_STARTING_HEALTH = 100;

export function useDebate(opponent: Opponent | null) {
    const unlockedPolicies = useStore(state => state.unlockedPolicies);
    const happiness = useStore(state => state.happiness);
    const volunteers = useStore(state => state.volunteers);
    const momentum = useStore(state => state.momentum);

    const [state, setState] = useState<DebateState>(() => ({
        playerHealth: PLAYER_STARTING_HEALTH,
        maxPlayerHealth: PLAYER_STARTING_HEALTH,
        enemyHealth: opponent?.health ?? 100,
        maxEnemyHealth: opponent?.health ?? 100,
        isPlayerTurn: true,
        battleLog: [],
        isComplete: false,
        didPlayerWin: false,
    }));

    // Reset battle state when starting a new debate
    const resetBattle = useCallback(() => {
        if (!opponent) return;
        setState({
            playerHealth: PLAYER_STARTING_HEALTH,
            maxPlayerHealth: PLAYER_STARTING_HEALTH,
            enemyHealth: opponent.health,
            maxEnemyHealth: opponent.health,
            isPlayerTurn: true,
            battleLog: [{
                id: `system-${Date.now()}`,
                text: `The debate begins! ${opponent.name} takes the stage.`,
                type: 'system',
            }],
            isComplete: false,
            didPlayerWin: false,
        });
    }, [opponent]);

    // Calculate attack damage based on player stats
    const calculateAttackDamage = useCallback((attackId: AttackType): number => {
        switch (attackId) {
            case 'cite-statistics':
                return 5 + (unlockedPolicies.length * 2);
            case 'personal-story':
                return 5 + Math.floor(happiness * 0.3);
            case 'mobilize-base':
                return 5 + Math.floor(volunteers / 50);
            case 'fact-check':
                // Heal amount
                return 10 + Math.floor(momentum * 0.5);
            default:
                return 10;
        }
    }, [unlockedPolicies.length, happiness, volunteers, momentum]);

    // Get preview damage/heal for UI
    const getAttackPreview = useCallback((attackId: AttackType): { value: number; isHeal: boolean } => {
        const attack = ATTACKS.find(a => a.id === attackId);
        return {
            value: calculateAttackDamage(attackId),
            isHeal: attack?.isHeal ?? false,
        };
    }, [calculateAttackDamage]);

    // Execute player attack
    const executePlayerAttack = useCallback((attackId: AttackType) => {
        if (!opponent || state.isComplete || !state.isPlayerTurn) return;

        const attack = ATTACKS.find(a => a.id === attackId);
        if (!attack) return;

        const value = calculateAttackDamage(attackId);

        setState(prev => {
            let newEnemyHealth = prev.enemyHealth;
            let newPlayerHealth = prev.playerHealth;
            let logText = '';

            if (attack.isHeal) {
                // Fact Check heals player
                newPlayerHealth = Math.min(prev.maxPlayerHealth, prev.playerHealth + value);
                const actualHeal = newPlayerHealth - prev.playerHealth;
                logText = `You fact-check ${opponent.name}'s claims! +${actualHeal} Credibility`;
            } else {
                // Attack damages enemy
                newEnemyHealth = Math.max(0, prev.enemyHealth - value);
                logText = `${attack.emoji} ${attack.name}! ${opponent.name} takes ${value} damage!`;
            }

            const newLog: BattleLogEntry = {
                id: `player-${Date.now()}`,
                text: logText,
                type: 'player',
                damage: attack.isHeal ? undefined : value,
                heal: attack.isHeal ? value : undefined,
            };

            // Check if player won
            if (newEnemyHealth <= 0) {
                return {
                    ...prev,
                    enemyHealth: 0,
                    playerHealth: newPlayerHealth,
                    battleLog: [...prev.battleLog, newLog, {
                        id: `system-win-${Date.now()}`,
                        text: `${opponent.name} concedes! The people have spoken!`,
                        type: 'system',
                    }],
                    isComplete: true,
                    didPlayerWin: true,
                    isPlayerTurn: false,
                };
            }

            return {
                ...prev,
                enemyHealth: newEnemyHealth,
                playerHealth: newPlayerHealth,
                battleLog: [...prev.battleLog, newLog],
                isPlayerTurn: false, // Enemy turn next
            };
        });
    }, [opponent, state.isComplete, state.isPlayerTurn, calculateAttackDamage]);

    // Execute enemy attack (called after player turn)
    const executeEnemyAttack = useCallback(() => {
        if (!opponent || state.isComplete || state.isPlayerTurn) return;

        const damage = opponent.damagePerTurn;

        setState(prev => {
            const newPlayerHealth = Math.max(0, prev.playerHealth - damage);

            // Random enemy attack flavor text
            const attackTexts = [
                `${opponent.name} attacks your record! -${damage} Credibility`,
                `${opponent.name} runs a negative ad! -${damage} Credibility`,
                `${opponent.name} questions your experience! -${damage} Credibility`,
                `${opponent.name} deflects and attacks! -${damage} Credibility`,
            ];
            const logText = attackTexts[Math.floor(Math.random() * attackTexts.length)];

            const newLog: BattleLogEntry = {
                id: `enemy-${Date.now()}`,
                text: logText,
                type: 'enemy',
                damage,
            };

            // Check if player lost
            if (newPlayerHealth <= 0) {
                return {
                    ...prev,
                    playerHealth: 0,
                    battleLog: [...prev.battleLog, newLog, {
                        id: `system-lose-${Date.now()}`,
                        text: `Your credibility is destroyed. The debate is lost.`,
                        type: 'system',
                    }],
                    isComplete: true,
                    didPlayerWin: false,
                    isPlayerTurn: false,
                };
            }

            return {
                ...prev,
                playerHealth: newPlayerHealth,
                battleLog: [...prev.battleLog, newLog],
                isPlayerTurn: true, // Player turn next
            };
        });
    }, [opponent, state.isComplete, state.isPlayerTurn]);

    return {
        state,
        attacks: ATTACKS,
        executePlayerAttack,
        executeEnemyAttack,
        getAttackPreview,
        resetBattle,
    };
}

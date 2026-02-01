import { VOLUNTEER_BONUS_PER } from './gameConfig';

export interface PowerStructure {
    id: string;
    name: string;
    description: string;
    cost: number; // Volunteers needed (permanent spend)
    multiplier: number; // Global Revenue Multiplier
    emoji: string;
}

// "Deep Organizing" - build lasting community power structures
export const POWER_STRUCTURES: PowerStructure[] = [
    {
        id: 'mutual-aid',
        name: 'Mutual Aid Network',
        description: 'Community support replaces state reliance.',
        cost: 1000,
        multiplier: 3,
        emoji: '🍲',
    },
    {
        id: 'tenant-union',
        name: 'Citywide Tenant Union',
        description: 'Collective bargaining against landlords.',
        cost: 5000,
        multiplier: 5,
        emoji: '🏢',
    },
    {
        id: 'worker-coops',
        name: 'Worker Co-op Federation',
        description: 'Seizing the means of production.',
        cost: 25000,
        multiplier: 8,
        emoji: '🔨',
    },
    {
        id: 'community-land',
        name: 'Community Land Trust',
        description: 'Decommodify housing forever.',
        cost: 100000,
        multiplier: 15,
        emoji: '🏡',
    },
    {
        id: 'general-strike',
        name: 'General Strike Committee',
        description: 'Shut it down to win it all.',
        cost: 1000000,
        multiplier: 50,
        emoji: '🛑',
    },
];

// Calculate total power structure multiplier from unlocked structures
export function getPowerStructureMultiplier(unlockedIds: string[]): number {
    return POWER_STRUCTURES.reduce((mult, structure) => {
        if (unlockedIds.includes(structure.id)) {
            return mult * structure.multiplier;
        }
        return mult;
    }, 1);
}

// Get structure by ID
export function getPowerStructureById(id: string): PowerStructure | undefined {
    return POWER_STRUCTURES.find(s => s.id === id);
}

// Calculate volunteer bonus impact (re-export for convenience)
export function getVolunteerBonusPercent(volunteers: number): number {
    return volunteers * VOLUNTEER_BONUS_PER * 100;
}

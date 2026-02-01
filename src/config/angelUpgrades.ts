import { VOLUNTEER_BONUS_PER } from './gameConfig';

export interface AngelUpgrade {
    id: string;
    name: string;
    description: string;
    cost: number; // Volunteer cost
    multiplier: number; // Global multiplier
    emoji: string;
}

// "Establishment Moves" - sacrifice grassroots purity for electoral power
export const ANGEL_UPGRADES: AngelUpgrade[] = [
    {
        id: 'super-pac',
        name: 'Super PAC Money',
        description: 'Accept corporate donations for massive ad buys',
        cost: 1000,
        multiplier: 3,
        emoji: '💰',
    },
    {
        id: 'moderate-messaging',
        name: 'Moderate Messaging',
        description: 'Appeal to centrist voters with softer rhetoric',
        cost: 5000,
        multiplier: 5,
        emoji: '🕊️',
    },
    {
        id: 'cable-news',
        name: 'Cable News Interviews',
        description: 'Mainstream media exposure reaches millions',
        cost: 25000,
        multiplier: 7,
        emoji: '📺',
    },
    {
        id: 'party-endorsement',
        name: 'Party Endorsement',
        description: 'Official party backing unlocks infrastructure',
        cost: 100000,
        multiplier: 10,
        emoji: '🏛️',
    },
    {
        id: 'wall-street',
        name: 'Wall Street Ties',
        description: 'Financial sector support opens donor networks',
        cost: 500000,
        multiplier: 15,
        emoji: '📈',
    },
    {
        id: 'presidential-nomination',
        name: 'Presidential Nomination',
        description: 'Top of the ticket - the ultimate establishment move',
        cost: 2000000,
        multiplier: 25,
        emoji: '🇺🇸',
    },
];

// Calculate total angel upgrade multiplier from unlocked upgrades
export function getAngelUpgradeMultiplier(unlockedIds: string[]): number {
    return ANGEL_UPGRADES.reduce((mult, upgrade) => {
        if (unlockedIds.includes(upgrade.id)) {
            return mult * upgrade.multiplier;
        }
        return mult;
    }, 1);
}

// Get upgrade by ID
export function getAngelUpgradeById(id: string): AngelUpgrade | undefined {
    return ANGEL_UPGRADES.find(u => u.id === id);
}

// Calculate volunteer bonus impact
export function getVolunteerBonusPercent(volunteers: number): number {
    return volunteers * VOLUNTEER_BONUS_PER * 100;
}

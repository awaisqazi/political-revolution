export interface Rank {
    id: string;
    title: string;
    threshold: number; // Minimum lifetimeEarnings to achieve
    flavorText: string;
    emoji: string;
}

export const RANKS: Rank[] = [
    {
        id: 'neighbor',
        title: 'Concerned Citizen',
        threshold: 0,
        flavorText: 'Every movement starts with one...',
        emoji: '🏠',
    },
    {
        id: 'local-voice',
        title: 'Local Voice',
        threshold: 1000,
        flavorText: 'People are starting to listen',
        emoji: '🗣️',
    },
    {
        id: 'community-leader',
        title: 'Community Leader',
        threshold: 50000,
        flavorText: 'A trusted pillar of the community',
        emoji: '🤝',
    },
    {
        id: 'rising-star',
        title: 'Rising Star',
        threshold: 1000000,
        flavorText: 'Making headlines and waves',
        emoji: '✨',
    },
    {
        id: 'prominent-figure',
        title: 'Prominent Figure',
        threshold: 10000000,
        flavorText: 'A major force in politics',
        emoji: '🌟',
    },
    {
        id: 'national-leader',
        title: 'National Leader',
        threshold: 100000000,
        flavorText: 'Shaping the national conversation',
        emoji: '🇺🇸',
    },
    {
        id: 'movement-icon',
        title: 'Movement Icon',
        threshold: 1000000000,
        flavorText: 'A symbol of the revolution',
        emoji: '🔥',
    },
];

// Get rank by ID
export function getRankById(id: string): Rank | undefined {
    return RANKS.find(r => r.id === id);
}

// Get current rank based on lifetime earnings
export function getRankForEarnings(lifetimeEarnings: number): Rank {
    // Find the highest rank the player qualifies for
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (lifetimeEarnings >= RANKS[i].threshold) {
            return RANKS[i];
        }
    }
    return RANKS[0];
}

// Get next rank (for progression display)
export function getNextRank(currentRankId: string): Rank | null {
    const currentIndex = RANKS.findIndex(r => r.id === currentRankId);
    if (currentIndex === -1 || currentIndex >= RANKS.length - 1) {
        return null;
    }
    return RANKS[currentIndex + 1];
}

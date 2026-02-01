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
        title: 'Concerned Neighbor',
        threshold: 0,
        flavorText: 'Every movement starts with one...',
        emoji: '🏠',
    },
    {
        id: 'block-captain',
        title: 'Block Captain',
        threshold: 1000,
        flavorText: 'The neighborhood knows your name',
        emoji: '📋',
    },
    {
        id: 'organizer',
        title: 'Community Organizer',
        threshold: 50000,
        flavorText: "You're building real power",
        emoji: '📢',
    },
    {
        id: 'council',
        title: 'City Council Candidate',
        threshold: 1000000,
        flavorText: 'Time to make it official',
        emoji: '🏛️',
    },
    {
        id: 'state-rep',
        title: 'State Representative',
        threshold: 10000000,
        flavorText: 'The capitol awaits',
        emoji: '⭐',
    },
    {
        id: 'senator',
        title: 'Senator',
        threshold: 100000000,
        flavorText: 'A national voice',
        emoji: '🎖️',
    },
    {
        id: 'presidential',
        title: 'Presidential Candidate',
        threshold: 1000000000,
        flavorText: 'Not me. Us.',
        emoji: '🇺🇸',
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

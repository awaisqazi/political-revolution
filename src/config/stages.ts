// Stage configuration for political progression
// Players advance through stages by meeting earnings + happiness requirements

export type StageId = 'activist' | 'organizer' | 'city-council' | 'state-rep' | 'congressman' | 'senator' | 'president';

export interface GameStage {
    id: StageId;
    name: string;
    winThreshold: number;   // Lifetime earnings required to win this stage
    happinessRequired: number; // Minimum happiness to advance
    colorTheme: string;     // For UI theming
    emoji: string;
    flavorText: string;
}

export const STAGES: GameStage[] = [
    {
        id: 'activist',
        name: 'Activist',
        winThreshold: 10000,           // $10K to advance
        happinessRequired: 40,
        colorTheme: 'slate',
        emoji: '✊',
        flavorText: 'Every movement starts with one voice',
    },
    {
        id: 'organizer',
        name: 'Organizer',
        winThreshold: 100000,          // $100K to advance
        happinessRequired: 45,
        colorTheme: 'blue',
        emoji: '📢',
        flavorText: 'Building power block by block',
    },
    {
        id: 'city-council',
        name: 'City Council',
        winThreshold: 1000000,         // $1M to advance
        happinessRequired: 50,
        colorTheme: 'cyan',
        emoji: '🏙️',
        flavorText: 'Local politics is where change begins',
    },
    {
        id: 'state-rep',
        name: 'State Representative',
        winThreshold: 10000000,        // $10M to advance
        happinessRequired: 55,
        colorTheme: 'indigo',
        emoji: '⭐',
        flavorText: 'The capitol awaits your arrival',
    },
    {
        id: 'congressman',
        name: 'Congressman',
        winThreshold: 100000000,       // $100M to advance
        happinessRequired: 60,
        colorTheme: 'violet',
        emoji: '🏛️',
        flavorText: 'Representing the people in Washington',
    },
    {
        id: 'senator',
        name: 'Senator',
        winThreshold: 1000000000,      // $1B to advance
        happinessRequired: 70,
        colorTheme: 'purple',
        emoji: '🎖️',
        flavorText: 'A national voice for the movement',
    },
    {
        id: 'president',
        name: 'President',
        winThreshold: 10000000000,     // $10B - final stage
        happinessRequired: 100,         // Need max happiness for Utopia
        colorTheme: 'rose',
        emoji: '🇺🇸',
        flavorText: 'The highest office. The biggest responsibility.',
    },
];

// Helper functions
export function getStageById(id: StageId): GameStage | undefined {
    return STAGES.find(s => s.id === id);
}

export function getStageByIndex(index: number): GameStage | undefined {
    return STAGES[index];
}

export function getNextStage(currentIndex: number): GameStage | undefined {
    return STAGES[currentIndex + 1];
}

// Check if player can advance to next stage
export function canPromoteStage(currentIndex: number, lifetimeEarnings: number, happiness: number): boolean {
    const currentStage = STAGES[currentIndex];
    const nextStage = STAGES[currentIndex + 1];

    if (!currentStage || !nextStage) return false;

    return lifetimeEarnings >= currentStage.winThreshold && happiness >= currentStage.happinessRequired;
}

// Calculate morale multiplier based on happiness
// At 50% happiness: 1.0x multiplier
// At 100% happiness: 1.5x multiplier
// Below 50%: drops below 1.0x
export function getMoraleMultiplier(happiness: number): number {
    const normalized = (happiness - 50) / 50; // -1 to 1
    return 1 + (normalized * 0.5); // 0.5 to 1.5
}

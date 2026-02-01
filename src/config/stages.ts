// Stage configuration for political progression
// Players advance through stages by meeting earnings + happiness requirements

export type StageId = 'activist' | 'organizer' | 'city-council' | 'state-rep' | 'congressman' | 'senator' | 'president';

export type ThemeCategory = 'city' | 'state' | 'national';

export interface Opponent {
    name: string;
    title: string;
    imagePrompt: string;
    description: string;
    health: number;
    damagePerTurn: number;
}

export interface GameStage {
    id: StageId;
    name: string;
    winThreshold: number;   // Lifetime earnings required to win this stage
    happinessRequired: number; // Minimum happiness to advance
    colorTheme: string;     // For UI theming (legacy)
    emoji: string;
    flavorText: string;
    // Phase 9: Visual Theming
    themeCategory: ThemeCategory;     // For dilemma filtering
    backgroundStyle: string;          // Tailwind classes for main bg
    accentColor: string;              // Base accent color (e.g., 'blue', 'purple', 'rose')
    accentGradient: string;           // Gradient classes for buttons
    // Phase 11: Debate Opponent
    opponent?: Opponent;              // The opponent to defeat in the debate
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
        themeCategory: 'city',
        backgroundStyle: 'bg-slate-900/60',
        accentColor: 'blue',
        accentGradient: 'from-blue-600 to-cyan-500',
        opponent: {
            name: 'Councilman Crumb',
            title: "The Landlord's Puppet",
            imagePrompt: 'Smug middle-aged politician in expensive suit, slicked back hair, dismissive expression',
            description: 'A career politician backed by real estate developers who has never met a tenant he couldn\'t evict.',
            health: 50,
            damagePerTurn: 8,
        },
    },
    {
        id: 'organizer',
        name: 'Organizer',
        winThreshold: 100000,          // $100K to advance
        happinessRequired: 45,
        colorTheme: 'blue',
        emoji: '📢',
        flavorText: 'Building power block by block',
        themeCategory: 'city',
        backgroundStyle: 'bg-slate-900/60',
        accentColor: 'blue',
        accentGradient: 'from-blue-600 to-cyan-500',
        opponent: {
            name: 'Commissioner Cline',
            title: "The Developer's Ally",
            imagePrompt: 'Stern woman in power suit with pearl necklace, cold calculating eyes, forced smile',
            description: 'She\'s approved every luxury condo project while blocking affordable housing for a decade.',
            health: 75,
            damagePerTurn: 10,
        },
    },
    {
        id: 'city-council',
        name: 'City Council',
        winThreshold: 1000000,         // $1M to advance
        happinessRequired: 50,
        colorTheme: 'cyan',
        emoji: '🏙️',
        flavorText: 'Local politics is where change begins',
        themeCategory: 'city',
        backgroundStyle: 'bg-slate-900/60',
        accentColor: 'blue',
        accentGradient: 'from-blue-600 to-cyan-500',
        opponent: {
            name: 'Mayor Morton',
            title: 'The Machine Politician',
            imagePrompt: 'Heavyset older man with American flag pin, fake tan, pointing aggressively at camera',
            description: 'Twenty years in office. Zero progress. Infinite corruption.',
            health: 100,
            damagePerTurn: 12,
        },
    },
    {
        id: 'state-rep',
        name: 'State Representative',
        winThreshold: 10000000,        // $10M to advance
        happinessRequired: 55,
        colorTheme: 'indigo',
        emoji: '⭐',
        flavorText: 'The capitol awaits your arrival',
        themeCategory: 'state',
        backgroundStyle: 'bg-indigo-950/60',
        accentColor: 'purple',
        accentGradient: 'from-purple-600 to-violet-500',
        opponent: {
            name: 'Senator Stalemate',
            title: 'The Party Insider',
            imagePrompt: 'Elderly senator in navy suit, patronizing smile, surrounded by lobbyists in shadows',
            description: 'He\'s been "working across the aisle" for 30 years without passing a single progressive bill.',
            health: 125,
            damagePerTurn: 14,
        },
    },
    {
        id: 'congressman',
        name: 'Congressman',
        winThreshold: 100000000,       // $100M to advance
        happinessRequired: 60,
        colorTheme: 'violet',
        emoji: '🏛️',
        flavorText: 'Representing the people in Washington',
        themeCategory: 'state',
        backgroundStyle: 'bg-indigo-950/60',
        accentColor: 'purple',
        accentGradient: 'from-purple-600 to-violet-500',
        opponent: {
            name: 'Governor Gridlock',
            title: 'The Status Quo Defender',
            imagePrompt: 'Polished politician in expensive watch, rehearsed gestures, empty eyes behind glasses',
            description: 'Vetoed healthcare, education, and climate bills. Approved every corporate tax break.',
            health: 150,
            damagePerTurn: 16,
        },
    },
    {
        id: 'senator',
        name: 'Senator',
        winThreshold: 1000000000,      // $1B to advance
        happinessRequired: 70,
        colorTheme: 'purple',
        emoji: '🎖️',
        flavorText: 'A national voice for the movement',
        themeCategory: 'national',
        backgroundStyle: 'bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30',
        accentColor: 'rose',
        accentGradient: 'from-rose-600 to-amber-500',
        opponent: {
            name: 'President Titan',
            title: 'The Billionaire Incumbent',
            imagePrompt: 'Imposing figure behind presidential podium, golden cufflinks, smug billionaire energy',
            description: 'Net worth: $50 billion. Tax paid last year: $750. Democracy is just a business expense to him.',
            health: 200,
            damagePerTurn: 18,
        },
    },
    {
        id: 'president',
        name: 'President',
        winThreshold: 10000000000,     // $10B - final stage
        happinessRequired: 100,         // Need max happiness for Utopia
        colorTheme: 'rose',
        emoji: '🇺🇸',
        flavorText: 'The highest office. The biggest responsibility.',
        themeCategory: 'national',
        backgroundStyle: 'bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30',
        accentColor: 'rose',
        accentGradient: 'from-rose-600 to-amber-500',
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

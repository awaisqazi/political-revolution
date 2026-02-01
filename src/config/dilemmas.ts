// Political Dilemmas - Interactive decision events
// Replace passive news with meaningful choices that affect gameplay

import type { ThemeCategory } from './stages';

export interface DilemmaEffect {
    funds?: number;        // Direct fund change
    popularity?: number;   // Popularity multiplier change (-0.1 to +0.1)
    happiness?: number;    // Happiness change (-10 to +10)
    volunteers?: number;   // Volunteer change
}

export interface DilemmaChoice {
    text: string;
    effects: DilemmaEffect;
    flavor: string;
}

export interface Dilemma {
    id: string;
    title: string;
    description: string;
    stage: ThemeCategory;
    emoji: string;
    choiceA: DilemmaChoice;
    choiceB: DilemmaChoice;
}

// ================================================
// CITY DILEMMAS - Local, personal, community issues
// ================================================

const CITY_DILEMMAS: Dilemma[] = [
    {
        id: 'budget-crisis',
        title: 'The Budget Crisis',
        description: 'Teachers are striking for better pay, but the city budget is already stretched thin. The union demands action.',
        stage: 'city',
        emoji: '💰',
        choiceA: {
            text: 'Support the Strike',
            effects: { popularity: 0.15, funds: -5000, happiness: 8 },
            flavor: 'The union remembers those who stand with workers!',
        },
        choiceB: {
            text: 'Negotiate Quietly',
            effects: { popularity: -0.08, funds: 2000, happiness: -5 },
            flavor: 'The budget is balanced, but teachers feel betrayed.',
        },
    },
    {
        id: 'zoning-fight',
        title: 'The Zoning Fight',
        description: 'A developer wants to build luxury condos on the site of a beloved community garden. Neighbors are organizing.',
        stage: 'city',
        emoji: '🏗️',
        choiceA: {
            text: 'Protect the Garden',
            effects: { popularity: 0.12, happiness: 10, funds: -3000 },
            flavor: 'The community celebrates! You\'re a local hero.',
        },
        choiceB: {
            text: 'Allow Development',
            effects: { popularity: -0.1, happiness: -8, funds: 8000 },
            flavor: 'New housing is built, but the neighborhood feels different now.',
        },
    },
    {
        id: 'police-oversight',
        title: 'Police Oversight Vote',
        description: 'There\'s a proposal for a civilian police review board. The police union is strongly opposed.',
        stage: 'city',
        emoji: '⚖️',
        choiceA: {
            text: 'Support Oversight',
            effects: { popularity: 0.1, happiness: 12, volunteers: 5 },
            flavor: 'Activists rally to your cause! The movement grows.',
        },
        choiceB: {
            text: 'Table the Issue',
            effects: { popularity: -0.05, happiness: -3, funds: 1000 },
            flavor: 'You avoided controversy, but the community is disappointed.',
        },
    },
    {
        id: 'small-business-crisis',
        title: 'Small Business Crisis',
        description: 'A big-box store wants to open downtown. Local shop owners say it will destroy them.',
        stage: 'city',
        emoji: '🏪',
        choiceA: {
            text: 'Block the Big Box',
            effects: { popularity: 0.08, happiness: 6, funds: -4000 },
            flavor: 'Main Street merchants throw you a thank-you party!',
        },
        choiceB: {
            text: 'Welcome Competition',
            effects: { popularity: -0.06, happiness: -4, funds: 6000 },
            flavor: 'New jobs are created, but several beloved shops close.',
        },
    },
];

// ================================================
// STATE DILEMMAS - Legislative, institutional issues
// ================================================

const STATE_DILEMMAS: Dilemma[] = [
    {
        id: 'healthcare-bill',
        title: 'The Healthcare Bill',
        description: 'A bill to expand Medicaid reaches the floor. Insurance lobbyists are pushing hard against it.',
        stage: 'state',
        emoji: '🏥',
        choiceA: {
            text: 'Champion the Bill',
            effects: { popularity: 0.15, happiness: 15, funds: -20000 },
            flavor: 'Thousands gain coverage. You\'re a healthcare hero!',
        },
        choiceB: {
            text: 'Seek Compromise',
            effects: { popularity: -0.05, happiness: 3, funds: 10000 },
            flavor: 'A watered-down bill passes. Progress, but at what cost?',
        },
    },
    {
        id: 'tax-reform',
        title: 'Tax Reform Showdown',
        description: 'You can either close corporate loopholes or cut property taxes. Both are popular, but you can only pick one.',
        stage: 'state',
        emoji: '📊',
        choiceA: {
            text: 'Close Loopholes',
            effects: { popularity: 0.12, happiness: 10, funds: 15000 },
            flavor: 'Corporations are furious, but working families cheer!',
        },
        choiceB: {
            text: 'Cut Property Taxes',
            effects: { popularity: 0.08, happiness: 5, funds: -10000 },
            flavor: 'Homeowners love you. Renters... not so much.',
        },
    },
    {
        id: 'infrastructure-scandal',
        title: 'The Infrastructure Scandal',
        description: 'An investigation reveals corruption in a highway project. Your ally is implicated.',
        stage: 'state',
        emoji: '🛣️',
        choiceA: {
            text: 'Demand Accountability',
            effects: { popularity: 0.2, happiness: 8, volunteers: 10 },
            flavor: 'Your integrity shines. New supporters flood in!',
        },
        choiceB: {
            text: 'Defend Your Ally',
            effects: { popularity: -0.15, happiness: -10, funds: 5000 },
            flavor: 'Your ally is grateful, but the press is merciless.',
        },
    },
    {
        id: 'education-funding',
        title: 'Education Funding Fight',
        description: 'Rural and urban districts are fighting over school funding formulas. Both sides want your support.',
        stage: 'state',
        emoji: '🎓',
        choiceA: {
            text: 'Prioritize Equity',
            effects: { popularity: 0.1, happiness: 12, funds: -8000 },
            flavor: 'Underfunded schools get a lifeline. Parents are grateful.',
        },
        choiceB: {
            text: 'Maintain Status Quo',
            effects: { popularity: -0.05, happiness: -5, funds: 3000 },
            flavor: 'You avoided the fight, but inequality persists.',
        },
    },
];

// ================================================
// NATIONAL DILEMMAS - Federal, high-stakes issues
// ================================================

const NATIONAL_DILEMMAS: Dilemma[] = [
    {
        id: 'climate-crisis',
        title: 'The Climate Crisis Vote',
        description: 'A historic climate bill is on the floor. Fossil fuel donors threaten to fund your opponent.',
        stage: 'national',
        emoji: '🌍',
        choiceA: {
            text: 'Vote for the Planet',
            effects: { popularity: 0.2, happiness: 20, funds: -50000 },
            flavor: 'History will remember this moment. Young voters surge!',
        },
        choiceB: {
            text: 'Abstain',
            effects: { popularity: -0.1, happiness: -15, funds: 30000 },
            flavor: 'You kept donor support, but activists feel betrayed.',
        },
    },
    {
        id: 'war-powers',
        title: 'War Powers Resolution',
        description: 'The president requests authorization for military action. Intelligence is murky.',
        stage: 'national',
        emoji: '⚔️',
        choiceA: {
            text: 'Vote Against War',
            effects: { popularity: 0.15, happiness: 10, volunteers: 20 },
            flavor: 'The anti-war movement rallies behind you!',
        },
        choiceB: {
            text: 'Support the President',
            effects: { popularity: -0.08, happiness: -12, funds: 20000 },
            flavor: 'Party leadership is pleased. Your base is not.',
        },
    },
    {
        id: 'supreme-court',
        title: 'Supreme Court Nomination',
        description: 'A controversial nominee faces confirmation. Voting no could have lasting political consequences.',
        stage: 'national',
        emoji: '⚖️',
        choiceA: {
            text: 'Vote No',
            effects: { popularity: 0.18, happiness: 15, funds: -25000 },
            flavor: 'You stood on principle. Donations pour in from activists!',
        },
        choiceB: {
            text: 'Vote Yes',
            effects: { popularity: -0.12, happiness: -18, funds: 40000 },
            flavor: 'Establishment donors reward your pragmatism.',
        },
    },
    {
        id: 'whistleblower',
        title: 'The Whistleblower',
        description: 'A government whistleblower leaks evidence of surveillance overreach. They\'re asking for your protection.',
        stage: 'national',
        emoji: '🔔',
        choiceA: {
            text: 'Protect the Whistleblower',
            effects: { popularity: 0.15, happiness: 12, volunteers: 15 },
            flavor: 'You\'re a champion of transparency! Trust surges.',
        },
        choiceB: {
            text: 'Stay Silent',
            effects: { popularity: -0.1, happiness: -8, funds: 15000 },
            flavor: 'The intelligence community owes you a favor...',
        },
    },
];

// Combined list for easy access
export const ALL_DILEMMAS: Dilemma[] = [
    ...CITY_DILEMMAS,
    ...STATE_DILEMMAS,
    ...NATIONAL_DILEMMAS,
];

// Get dilemmas for a specific stage category
export function getDilemmasForStage(stage: ThemeCategory): Dilemma[] {
    return ALL_DILEMMAS.filter(d => d.stage === stage);
}

// Get a random dilemma for a stage category
export function getRandomDilemma(stage: ThemeCategory): Dilemma | null {
    const dilemmas = getDilemmasForStage(stage);
    if (dilemmas.length === 0) return null;
    return dilemmas[Math.floor(Math.random() * dilemmas.length)];
}

import type { StageId } from './stages';

export interface Policy {
    id: string;
    name: string;
    description: string;
    cost: number;
    multiplier: number;
    triggerId?: string; // The activity ID this boosts (e.g., 'leafleting'). If undefined, it's Global.
    type: 'activity' | 'global'; // 'activity' boosts one thing; 'global' boosts ALL revenue.
    requiredOwned?: number; // Min ownership of triggerId to show this policy
    tier: number; // 1-7 for UI grouping

    // Stage & Happiness System
    stage: StageId; // Which stage unlocks this policy
    happinessChange: number; // How much this affects public happiness (can be 0)
    impactTitle?: string; // Modal headline when passed
    impactDescription?: string; // Educational text explaining WHY this matters

    // Phase 15: Polling Power
    popularityBonus?: number; // Instant popularity boost when purchased (e.g., 0.05 = +5% popularity multiplier)
}

// Helper to generate activity upgrades
function activityUpgrade(
    id: string, name: string, description: string,
    cost: number, multiplier: number, triggerId: string,
    requiredOwned: number, tier: number,
    stage: StageId = 'activist', happinessChange: number = 0,
    impactTitle?: string, impactDescription?: string,
    popularityBonus?: number
): Policy {
    return {
        id, name, description, cost, multiplier, triggerId,
        type: 'activity', requiredOwned, tier,
        stage, happinessChange, impactTitle, impactDescription, popularityBonus
    };
}

function globalUpgrade(
    id: string, name: string, description: string,
    cost: number, multiplier: number, requiredOwned: number, tier: number,
    stage: StageId = 'activist', happinessChange: number = 0,
    impactTitle?: string, impactDescription?: string,
    popularityBonus?: number
): Policy {
    return {
        id, name, description, cost, multiplier,
        type: 'global', requiredOwned, tier,
        stage, happinessChange, impactTitle, impactDescription, popularityBonus
    };
}

export const POLICIES: Policy[] = [
    // ═══════════════════════════════════════════════════════════════
    // ACTIVIST STAGE - GRASSROOTS BASICS ($250 to $25K)
    // ═══════════════════════════════════════════════════════════════

    // LEAFLETING (📄)
    activityUpgrade('union-flyers', 'Union-Made Flyers', 'Show solidarity with union printers',
        250, 3, 'leafleting', 10, 1, 'activist', 0),
    activityUpgrade('comfy-sneakers', 'Comfy Sneakers', 'Walk twice as far without blisters',
        2500, 3, 'leafleting', 25, 1, 'activist', 0),

    // PHONE BANKING (📞)
    activityUpgrade('auto-dialer', 'Auto-Dialer System', 'Triple your daily call volume',
        500, 3, 'phone-banking', 10, 1, 'activist', 0),
    activityUpgrade('headsets', 'Noise-Canceling Headsets', 'Focus without distractions',
        5000, 3, 'phone-banking', 25, 1, 'activist', 0),

    // ═══════════════════════════════════════════════════════════════
    // ORGANIZER STAGE - BUILDING INFRASTRUCTURE ($10K to $250K)
    // ═══════════════════════════════════════════════════════════════

    activityUpgrade('qr-codes', 'QR Code Flyers', 'Link to donation page instantly',
        25000, 3, 'leafleting', 50, 2, 'organizer', 0),
    activityUpgrade('voter-database', 'Voter Database Access', 'Target likely supporters',
        50000, 3, 'phone-banking', 50, 2, 'organizer', 0),

    // TABLING (🎪)
    activityUpgrade('pop-up-tent', 'Pop-Up Tent Deluxe', 'Professional display booth',
        1000, 3, 'tabling', 10, 1, 'organizer', 0),
    activityUpgrade('free-snacks', 'Free Snack Bar', 'Nothing draws a crowd like food',
        10000, 3, 'tabling', 25, 2, 'organizer', 0),
    activityUpgrade('voter-reg', 'Voter Registration Drive', 'Sign up new voters on the spot',
        100000, 3, 'tabling', 50, 3, 'organizer', 2,
        'Democracy Expanded!', '5,000 previously unregistered citizens can now vote.'),

    // TOWN HALL (🏛️)
    activityUpgrade('sound-system', 'Professional Sound System', 'Crystal clear audio for all',
        2000, 3, 'town-hall', 10, 1, 'organizer', 0),
    activityUpgrade('catering', 'Community Catering', 'Local food builds local trust',
        20000, 3, 'town-hall', 25, 2, 'organizer', 0),

    // Global organizer upgrades
    globalUpgrade('volunteer-pizza', 'Pizza Party Fridays', 'Keep volunteers fueled',
        5000, 2, 10, 1, 'organizer', 1,
        'Morale Boost!', 'Happy volunteers work harder. The movement grows stronger.'),
    globalUpgrade('yard-signs', 'Reusable Yard Signs', 'Recycled materials for the planet',
        50000, 2, 25, 2, 'organizer', 1,
        'Green Campaign!', 'Your campaign reduces waste while spreading the message.'),

    // ═══════════════════════════════════════════════════════════════
    // CITY COUNCIL - LOCAL POLICY ($100K to $2M)
    // ═══════════════════════════════════════════════════════════════

    activityUpgrade('bilingual-flyers', 'Bilingual Outreach', 'Reach immigrant communities',
        250000, 3, 'leafleting', 100, 3, 'city-council', 2,
        'Community United!', 'Immigrant families finally feel heard.'),
    activityUpgrade('predictive-dialer', 'Predictive Dialing AI', 'Skip disconnected numbers',
        500000, 3, 'phone-banking', 100, 3, 'city-council', 0),
    activityUpgrade('petition-tablets', 'Digital Petition Kiosks', 'Collect signatures faster',
        1000000, 3, 'tabling', 100, 4, 'city-council', 0),
    activityUpgrade('livestream', 'Livestream Setup', 'Reach voters who cannot attend',
        200000, 3, 'town-hall', 50, 3, 'city-council', 0),
    activityUpgrade('childcare', 'Free Childcare Services', 'Let parents participate fully',
        2000000, 3, 'town-hall', 100, 4, 'city-council', 3,
        'Parents Empowered!', 'Working parents can finally attend town halls.'),

    // UNION RALLY (✊)
    activityUpgrade('megaphones', 'Industrial Megaphones', 'Your voice carries for blocks',
        4000, 3, 'union-rally', 10, 1, 'city-council', 0),
    activityUpgrade('solidarity-merch', 'Solidarity Merchandise', 'T-shirts fund the movement',
        40000, 3, 'union-rally', 25, 2, 'city-council', 0),

    // City Council Global Reforms
    globalUpgrade('eviction-defense', 'Eviction Defense Fund', 'Protect families from displacement',
        150000, 2, 30, 3, 'city-council', 4,
        'Families Protected!', '1,200 families saved from eviction. The community stays together.'),
    globalUpgrade('sanctuary-city', 'Sanctuary City Policy', 'Protect immigrant neighbors',
        300000, 2, 40, 3, 'city-council', 5,
        'Safe Haven!', 'Immigrant families can report crimes without fear of deportation.'),

    // ═══════════════════════════════════════════════════════════════
    // STATE REP - STATE LEVEL ($500K to $10M)
    // ═══════════════════════════════════════════════════════════════

    activityUpgrade('union-hall-rental', 'Union Hall Rental', 'Free venues from labor allies',
        400000, 3, 'union-rally', 50, 3, 'state-rep', 0),
    activityUpgrade('strike-fund', 'Strike Solidarity Fund', 'Support workers in need',
        4000000, 3, 'union-rally', 100, 4, 'state-rep', 3,
        'Workers United!', 'When workers strike, the community has their back.'),

    // VIRAL TIKTOK (📱)
    activityUpgrade('ring-light', 'Ring Light Setup', 'Look professional on every take',
        10000, 3, 'tiktok', 10, 2, 'state-rep', 0),
    activityUpgrade('trending-sounds', 'Trending Sound Library', 'Catch every viral wave',
        100000, 3, 'tiktok', 25, 3, 'state-rep', 0),
    activityUpgrade('duet-influencers', 'Influencer Duets', 'Collaborate with progressive creators',
        1000000, 3, 'tiktok', 50, 4, 'state-rep', 2,
        'Youth Engaged!', 'A new generation discovers the movement through social media.',
        0.08), // +8% popularity surge!
    activityUpgrade('tiktok-ads', 'Targeted TikTok Ads', 'Reach persuadable young voters',
        10000000, 3, 'tiktok', 100, 5, 'state-rep', 0,
        undefined, undefined, 0.1), // +10% popularity surge!

    // State Rep Global Reforms
    globalUpgrade('min-wage-15', '$15 State Minimum Wage', 'No worker should live in poverty',
        500000, 3, 20, 3, 'state-rep', 4,
        'Living Wage!', 'Workers across the state get a raise. Poverty drops 25%.'),
    globalUpgrade('paid-family-leave', 'Paid Family Leave', '12 weeks for new parents',
        2000000, 3, 30, 4, 'state-rep', 5,
        'Families First!', 'New parents can bond with their children without financial ruin.'),
    globalUpgrade('rent-control', 'State Rent Control', 'Cap annual rent increases at 3%',
        5000000, 3, 50, 4, 'state-rep', 5,
        'Renters Protected!', 'Families can stay in their homes. Displacement stops.'),

    // ═══════════════════════════════════════════════════════════════
    // CONGRESSMAN - FEDERAL HOUSE ($5M to $100M)
    // ═══════════════════════════════════════════════════════════════

    // BUS TOUR (🚌)
    activityUpgrade('bus-wrap', 'Campaign Bus Wrap', 'Turn your bus into a billboard',
        25000, 3, 'bus-tour', 10, 2, 'congressman', 0,
        undefined, undefined, 0.03), // +3% visibility boost
    activityUpgrade('wifi-hotspot', 'Mobile WiFi Hotspot', 'Work and stream on the road',
        250000, 3, 'bus-tour', 25, 3, 'congressman', 0),
    activityUpgrade('local-stops', 'Local Diner Stops', 'Shake hands in every small town',
        2500000, 3, 'bus-tour', 50, 4, 'congressman', 2,
        'Main Street Reached!', 'Rural communities feel seen for the first time in years.',
        0.1), // +10% popularity surge from grassroots love!
    activityUpgrade('tour-documentary', 'Behind-the-Scenes Documentary', 'Netflix picks up your story',
        25000000, 3, 'bus-tour', 100, 5, 'congressman', 0,
        'Media Sensation!', 'Your documentary inspires millions. A new wave of supporters joins.',
        0.15), // +15% MASSIVE popularity surge!

    // Congressman Global Reforms
    globalUpgrade('infrastructure-bill', 'Infrastructure Investment', 'Roads, bridges, broadband for all',
        20000000, 4, 40, 4, 'congressman', 5,
        'Rebuilding America!', 'Crumbling infrastructure is repaired. Rural areas get internet.'),
    globalUpgrade('climate-corps', 'Civilian Climate Corps', 'Green jobs for young people',
        50000000, 4, 60, 5, 'congressman', 6,
        'Climate Jobs!', '500,000 young people get good-paying jobs fighting climate change.'),

    // ═══════════════════════════════════════════════════════════════
    // SENATOR - US SENATE ($50M to $1B)
    // ═══════════════════════════════════════════════════════════════

    // DEBATE (📺)
    activityUpgrade('debate-coach', 'Debate Coach', 'Sharpen your rhetoric',
        50000, 3, 'debate', 10, 2, 'senator', 0),
    activityUpgrade('research-team', 'Opposition Research Team', 'Know their weaknesses',
        500000, 3, 'debate', 25, 3, 'senator', 0),
    activityUpgrade('fact-checkers', 'Live Fact-Check Team', 'Counter lies in real-time',
        5000000, 3, 'debate', 50, 4, 'senator', 3,
        'Truth Prevails!', 'Disinformation loses its power when every lie is corrected.'),
    activityUpgrade('debate-ads', 'Post-Debate Ad Blitz', 'Amplify your best moments',
        50000000, 3, 'debate', 100, 5, 'senator', 0),

    // Senator Global Reforms
    globalUpgrade('filibuster-reform', 'Filibuster Reform', 'Make the Senate work again',
        100000000, 5, 50, 5, 'senator', 6,
        'Democracy Unblocked!', 'The minority can no longer block the will of the people.'),
    globalUpgrade('voting-rights-act', 'Voting Rights Act', 'End voter suppression nationwide',
        200000000, 5, 75, 6, 'senator', 8,
        'Right to Vote!', 'Automatic voter registration. Election Day is a holiday.'),
    globalUpgrade('free-college', 'Free Public College', 'Higher education for all',
        500000000, 6, 100, 6, 'senator', 7,
        'Education for All!', 'Student debt forgiven. Future generations start debt-free.'),

    // ═══════════════════════════════════════════════════════════════
    // PRESIDENT - THE WHITE HOUSE ($500M to $10B+)
    // ═══════════════════════════════════════════════════════════════

    // STADIUM (🏟️)
    activityUpgrade('jumbotron', 'Jumbotron Graphics', 'Massive visual impact',
        100000, 3, 'stadium', 10, 3, 'president', 0,
        undefined, undefined, 0.05), // +5% from massive visibility
    activityUpgrade('pyrotechnics', 'Pyrotechnic Show', 'Unforgettable entrances',
        1000000, 3, 'stadium', 25, 4, 'president', 0,
        undefined, undefined, 0.08), // +8% viral moments!
    activityUpgrade('headline-act', 'Headline Musical Act', 'Concert becomes rally',
        10000000, 3, 'stadium', 50, 5, 'president', 3,
        'Culture Shifts!', 'When artists stand with the movement, hearts and minds follow.',
        0.15), // +15% celebrity endorsement surge!
    activityUpgrade('multi-stadium', 'Multi-City Stadium Tour', 'Simultaneous events nationwide',
        100000000, 3, 'stadium', 100, 6, 'president', 4,
        'Movement Nationalized!', 'The entire country watches. This is a movement.',
        0.2), // +20% MASSIVE national surge!

    // PRESIDENTIAL REFORMS
    globalUpgrade('green-new-deal', 'Green New Deal', 'Jobs and climate action together',
        500000000, 5, 50, 5, 'president', 8,
        'Climate Action!', 'Millions of green jobs. Carbon emissions cut 50%.'),

    globalUpgrade('medicare-for-all', 'Medicare For All', 'Healthcare as a human right',
        1000000000, 6, 75, 6, 'president', 10,
        'Healthcare Guaranteed!', '30 million uninsured now covered. Medical bankruptcies: ZERO.'),

    globalUpgrade('housing-for-all', 'Housing For All', 'End homelessness as policy',
        2000000000, 7, 100, 6, 'president', 10,
        'Homelessness Ended!', 'Every American has a roof over their head.'),

    globalUpgrade('ubi-platform', 'Universal Basic Income', 'Freedom Dividend for every citizen',
        5000000000, 8, 150, 7, 'president', 12,
        'Poverty Abolished!', 'Every citizen receives $1,000/month. Poverty rates: near-zero.'),

    globalUpgrade('citizens-united-repeal', 'Citizens United Repeal', 'Money out of politics',
        7500000000, 9, 200, 7, 'president', 12,
        'Democracy Restored!', 'Corporations are not people. Money is not speech.'),

    // THE ULTIMATE POLICY
    globalUpgrade('universal-basic-services', 'Universal Basic Services', 'Healthcare, housing, education, food—all guaranteed',
        10000000000, 10, 250, 7, 'president', 15,
        'UTOPIA ACHIEVED', 'Hunger, poverty, and homelessness eradicated. The revolution is complete.'),
];

// Get policy by ID
export function getPolicyById(id: string): Policy | undefined {
    return POLICIES.find(p => p.id === id);
}

// Get policies grouped by tier
export function getPoliciesByTier(): Record<number, Policy[]> {
    return POLICIES.reduce((acc, policy) => {
        if (!acc[policy.tier]) acc[policy.tier] = [];
        acc[policy.tier].push(policy);
        return acc;
    }, {} as Record<number, Policy[]>);
}

// Get policies for a specific stage
export function getPoliciesForStage(stageId: StageId): Policy[] {
    return POLICIES.filter(p => p.stage === stageId);
}

// Get all stages that have policies
export function getStagesWithPolicies(): StageId[] {
    const stageOrder: StageId[] = ['activist', 'organizer', 'city-council', 'state-rep', 'congressman', 'senator', 'president'];
    const stagesWithPolicies = new Set(POLICIES.map(p => p.stage));
    return stageOrder.filter(s => stagesWithPolicies.has(s));
}

// Check if all President-stage policies are unlocked (required for Utopia)
export function hasAllPresidentPolicies(unlockedPolicies: string[]): boolean {
    const presidentPolicies = getPoliciesForStage('president');
    return presidentPolicies.every(p => unlockedPolicies.includes(p.id));
}

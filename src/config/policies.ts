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
}

// Helper to generate activity upgrades
function activityUpgrade(
    id: string, name: string, description: string,
    cost: number, multiplier: number, triggerId: string,
    requiredOwned: number, tier: number
): Policy {
    return { id, name, description, cost, multiplier, triggerId, type: 'activity', requiredOwned, tier };
}

function globalUpgrade(
    id: string, name: string, description: string,
    cost: number, multiplier: number, requiredOwned: number, tier: number
): Policy {
    return { id, name, description, cost, multiplier, type: 'global', requiredOwned, tier };
}

export const POLICIES: Policy[] = [
    // ═══════════════════════════════════════════════════════════════
    // LEAFLETING (📄) - $250 to $250K
    // ═══════════════════════════════════════════════════════════════
    activityUpgrade('union-flyers', 'Union-Made Flyers', 'Show solidarity with union printers', 250, 3, 'leafleting', 10, 1),
    activityUpgrade('comfy-sneakers', 'Comfy Sneakers', 'Walk twice as far without blisters', 2500, 3, 'leafleting', 25, 1),
    activityUpgrade('qr-codes', 'QR Code Flyers', 'Link to donation page instantly', 25000, 3, 'leafleting', 50, 2),
    activityUpgrade('bilingual-flyers', 'Bilingual Outreach', 'Reach immigrant communities', 250000, 3, 'leafleting', 100, 3),

    // ═══════════════════════════════════════════════════════════════
    // PHONE BANKING (📞) - $500 to $500K
    // ═══════════════════════════════════════════════════════════════
    activityUpgrade('auto-dialer', 'Auto-Dialer System', 'Triple your daily call volume', 500, 3, 'phone-banking', 10, 1),
    activityUpgrade('headsets', 'Noise-Canceling Headsets', 'Focus without distractions', 5000, 3, 'phone-banking', 25, 1),
    activityUpgrade('voter-database', 'Voter Database Access', 'Target likely supporters', 50000, 3, 'phone-banking', 50, 2),
    activityUpgrade('predictive-dialer', 'Predictive Dialing AI', 'Skip disconnected numbers', 500000, 3, 'phone-banking', 100, 3),

    // ═══════════════════════════════════════════════════════════════
    // TABLING (🎪) - $1K to $1M
    // ═══════════════════════════════════════════════════════════════
    activityUpgrade('pop-up-tent', 'Pop-Up Tent Deluxe', 'Professional display booth', 1000, 3, 'tabling', 10, 1),
    activityUpgrade('free-snacks', 'Free Snack Bar', 'Nothing draws a crowd like food', 10000, 3, 'tabling', 25, 2),
    activityUpgrade('voter-reg', 'Voter Registration Drive', 'Sign up new voters on the spot', 100000, 3, 'tabling', 50, 3),
    activityUpgrade('petition-tablets', 'Digital Petition Kiosks', 'Collect signatures faster', 1000000, 3, 'tabling', 100, 4),

    // ═══════════════════════════════════════════════════════════════
    // TOWN HALL (🏛️) - $2K to $2M
    // ═══════════════════════════════════════════════════════════════
    activityUpgrade('sound-system', 'Professional Sound System', 'Crystal clear audio for all', 2000, 3, 'town-hall', 10, 1),
    activityUpgrade('catering', 'Community Catering', 'Local food builds local trust', 20000, 3, 'town-hall', 25, 2),
    activityUpgrade('livestream', 'Livestream Setup', 'Reach voters who cannot attend', 200000, 3, 'town-hall', 50, 3),
    activityUpgrade('childcare', 'Free Childcare Services', 'Let parents participate fully', 2000000, 3, 'town-hall', 100, 4),

    // ═══════════════════════════════════════════════════════════════
    // UNION RALLY (✊) - $4K to $4M
    // ═══════════════════════════════════════════════════════════════
    activityUpgrade('megaphones', 'Industrial Megaphones', 'Your voice carries for blocks', 4000, 3, 'union-rally', 10, 1),
    activityUpgrade('solidarity-merch', 'Solidarity Merchandise', 'T-shirts fund the movement', 40000, 3, 'union-rally', 25, 2),
    activityUpgrade('strike-fund', 'Strike Fund Support', 'Stand with workers financially', 400000, 3, 'union-rally', 50, 3),
    activityUpgrade('labor-coalition', 'Multi-Union Coalition', 'Unite all local unions', 4000000, 3, 'union-rally', 100, 4),

    // ═══════════════════════════════════════════════════════════════
    // TIKTOK (📱) - $10K to $10M
    // ═══════════════════════════════════════════════════════════════
    activityUpgrade('ring-light', 'Professional Ring Light', 'Look good on camera', 10000, 3, 'tiktok', 10, 2),
    activityUpgrade('video-editor', 'Video Editor Software', 'Slick transitions and effects', 100000, 3, 'tiktok', 25, 3),
    activityUpgrade('influencer-collab', 'Influencer Collaborations', 'Borrow their audience', 1000000, 3, 'tiktok', 50, 4),
    activityUpgrade('viral-consultant', 'Viral Content Consultant', 'Algorithm optimization', 10000000, 3, 'tiktok', 100, 5),

    // ═══════════════════════════════════════════════════════════════
    // BUS TOUR (🚌) - $25K to $25M
    // ═══════════════════════════════════════════════════════════════
    activityUpgrade('wrapped-bus', 'Campaign-Wrapped Bus', 'Mobile billboard', 25000, 3, 'bus-tour', 10, 2),
    activityUpgrade('tour-coordinator', 'Tour Coordinator', 'Maximize stops per day', 250000, 3, 'bus-tour', 25, 3),
    activityUpgrade('press-bus', 'Press Bus Following', 'Media covers every stop', 2500000, 3, 'bus-tour', 50, 4),
    activityUpgrade('celebrity-riders', 'Celebrity Tour Guests', 'A-listers draw crowds', 25000000, 3, 'bus-tour', 100, 5),

    // ═══════════════════════════════════════════════════════════════
    // DEBATE (📺) - $50K to $50M
    // ═══════════════════════════════════════════════════════════════
    activityUpgrade('debate-coach', 'Debate Coach', 'Sharpen your rhetoric', 50000, 3, 'debate', 10, 2),
    activityUpgrade('research-team', 'Opposition Research Team', 'Know their weaknesses', 500000, 3, 'debate', 25, 3),
    activityUpgrade('fact-checkers', 'Live Fact-Check Team', 'Counter lies in real-time', 5000000, 3, 'debate', 50, 4),
    activityUpgrade('debate-ads', 'Post-Debate Ad Blitz', 'Amplify your best moments', 50000000, 3, 'debate', 100, 5),

    // ═══════════════════════════════════════════════════════════════
    // STADIUM (🏟️) - $100K to $100M
    // ═══════════════════════════════════════════════════════════════
    activityUpgrade('jumbotron', 'Jumbotron Graphics', 'Massive visual impact', 100000, 3, 'stadium', 10, 3),
    activityUpgrade('pyrotechnics', 'Pyrotechnic Show', 'Unforgettable entrances', 1000000, 3, 'stadium', 25, 4),
    activityUpgrade('headline-act', 'Headline Musical Act', 'Concert becomes rally', 10000000, 3, 'stadium', 50, 5),
    activityUpgrade('multi-stadium', 'Multi-City Stadium Tour', 'Simultaneous events nationwide', 100000000, 3, 'stadium', 100, 6),

    // ═══════════════════════════════════════════════════════════════
    // GLOBAL UPGRADES - $500K to $5B
    // ═══════════════════════════════════════════════════════════════
    globalUpgrade('grassroots-training', 'Grassroots Training', 'All volunteers work more efficiently', 500000, 2, 50, 3),
    globalUpgrade('small-dollar', 'Small Dollar Fundraising', 'ActBlue integration drives donations', 2000000, 2, 100, 4),
    globalUpgrade('union-coalition', 'National Union Coalition', 'AFL-CIO endorsement unlocks labor vote', 10000000, 3, 150, 5),
    globalUpgrade('green-new-deal', 'Green New Deal Platform', 'Climate voters flock to your campaign', 50000000, 3, 200, 5),
    globalUpgrade('medicare-for-all', 'Medicare For All Platform', 'Healthcare as human right resonates', 150000000, 5, 300, 6),
    globalUpgrade('housing-for-all', 'Housing For All Platform', 'End homelessness as policy goal', 500000000, 5, 400, 6),
    globalUpgrade('ubi-platform', 'Universal Basic Income', 'Freedom Dividend excites voters', 1000000000, 7, 500, 7),
    globalUpgrade('citizens-united-repeal', 'Citizens United Repeal', 'The ultimate campaign finance reform', 5000000000, 9, 750, 7),
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

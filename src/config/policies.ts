export interface Policy {
    id: string;
    name: string;
    description: string;
    cost: number;
    multiplier: number;
    triggerId?: string; // The activity ID this boosts (e.g., 'leafleting'). If undefined, it's Global.
    type: 'activity' | 'global'; // 'activity' boosts one thing; 'global' boosts ALL revenue.
    requiredOwned?: number; // Min ownership of triggerId to show this policy
}

export const POLICIES: Policy[] = [
    // Tier 1: Leafleting
    { id: 'comfy-sneakers', name: 'Comfy Sneakers', description: 'Leafleting efficiency x3', cost: 250, multiplier: 3, triggerId: 'leafleting', type: 'activity', requiredOwned: 10 },
    { id: 'glossy-paper', name: 'Glossy Flyers', description: 'Leafleting efficiency x3', cost: 1000, multiplier: 3, triggerId: 'leafleting', type: 'activity', requiredOwned: 25 },

    // Tier 2: Phone Banking
    { id: 'auto-dialer', name: 'Robo-Dialer 3000', description: 'Phone Banking efficiency x3', cost: 5000, multiplier: 3, triggerId: 'phone-banking', type: 'activity', requiredOwned: 10 },
    { id: 'headsets', name: 'Noise-Canceling Headsets', description: 'Phone Banking efficiency x3', cost: 15000, multiplier: 3, triggerId: 'phone-banking', type: 'activity', requiredOwned: 25 },

    // Tier 3: Tabling
    { id: 'pop-up-tent', name: 'Pop-Up Tent Deluxe', description: 'Tabling efficiency x3', cost: 50000, multiplier: 3, triggerId: 'tabling', type: 'activity', requiredOwned: 10 },
    { id: 'free-snacks', name: 'Free Snack Bar', description: 'Tabling efficiency x3', cost: 150000, multiplier: 3, triggerId: 'tabling', type: 'activity', requiredOwned: 25 },

    // Tier 4: Town Hall
    { id: 'sound-system', name: 'Professional Sound System', description: 'Town Hall efficiency x3', cost: 500000, multiplier: 3, triggerId: 'town-hall', type: 'activity', requiredOwned: 10 },
    { id: 'catering', name: 'Community Catering', description: 'Town Hall efficiency x3', cost: 1500000, multiplier: 3, triggerId: 'town-hall', type: 'activity', requiredOwned: 25 },

    // Tier 5: Union Rally
    { id: 'megaphones', name: 'Industrial Megaphones', description: 'Union Rally efficiency x3', cost: 5000000, multiplier: 3, triggerId: 'union-rally', type: 'activity', requiredOwned: 10 },
    { id: 'solidarity-merch', name: 'Solidarity Merchandise', description: 'Union Rally efficiency x3', cost: 15000000, multiplier: 3, triggerId: 'union-rally', type: 'activity', requiredOwned: 25 },

    // Global Boosts (require total activities >= threshold)
    { id: 'grassroots-training', name: 'Grassroots Training', description: 'All volunteers work 2x faster', cost: 500000, multiplier: 2, type: 'global', requiredOwned: 50 },
    { id: 'union-endorsement', name: 'National Union Endorsement', description: 'Global Revenue x3', cost: 10000000, multiplier: 3, type: 'global', requiredOwned: 100 },
];

// Get policy by ID
export function getPolicyById(id: string): Policy | undefined {
    return POLICIES.find(p => p.id === id);
}

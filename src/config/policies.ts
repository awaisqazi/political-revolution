export interface Policy {
    id: string;
    name: string;
    description: string;
    cost: number;
    multiplier: number;
    triggerId?: string; // The activity ID this boosts (e.g., 'leafleting'). If undefined, it's Global.
    type: 'activity' | 'global'; // 'activity' boosts one thing; 'global' boosts ALL revenue.
}

export const POLICIES: Policy[] = [
    // Tier 1: Leafleting
    { id: 'comfy-sneakers', name: 'Comfy Sneakers', description: 'Leafleting efficiency x3', cost: 250, multiplier: 3, triggerId: 'leafleting', type: 'activity' },
    { id: 'glossy-paper', name: 'Glossy Flyers', description: 'Leafleting efficiency x3', cost: 1000, multiplier: 3, triggerId: 'leafleting', type: 'activity' },

    // Tier 2: Phone Banking
    { id: 'auto-dialer', name: 'Robo-Dialer 3000', description: 'Phone Banking efficiency x3', cost: 5000, multiplier: 3, triggerId: 'phone-banking', type: 'activity' },
    { id: 'headsets', name: 'Noise-Canceling Headsets', description: 'Phone Banking efficiency x3', cost: 15000, multiplier: 3, triggerId: 'phone-banking', type: 'activity' },

    // Global Boosts
    { id: 'grassroots-training', name: 'Grassroots Training', description: 'All volunteers work 2x faster', cost: 500000, multiplier: 2, type: 'global' },
    { id: 'union-endorsement', name: 'National Union Endorsement', description: 'Global Revenue x3', cost: 10000000, multiplier: 3, type: 'global' },
];

// Get policy by ID
export function getPolicyById(id: string): Policy | undefined {
    return POLICIES.find(p => p.id === id);
}

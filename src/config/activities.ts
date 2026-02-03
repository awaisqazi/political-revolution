import { ACQUIRING_MULTIPLIER, MANAGER_COST_MULTIPLIER } from './gameConfig';

export interface ActivityConfig {
    id: string;
    name: string;
    description: string;
    baseCost: number;
    baseTime: number; // in milliseconds
    baseRevenue: number;
    emoji: string;
    image?: string; // Phase 17: Visual art
}

// 9 Activities with exponential scaling
export const ACTIVITIES: ActivityConfig[] = [
    {
        id: 'leafleting',
        name: 'Leafleting',
        description: 'Hand out flyers in your neighborhood',
        baseCost: 4,
        baseTime: 1000,
        baseRevenue: 1,
        emoji: '📄',
        image: `${import.meta.env.BASE_URL}images/icons/leafleting.png`,
    },
    {
        id: 'phone-banking',
        name: 'Phone Banking',
        description: 'Call voters and spread the message',
        baseCost: 60,
        baseTime: 3000,
        baseRevenue: 3,
        emoji: '📞',
        image: `${import.meta.env.BASE_URL}images/icons/phone-bank.png`,
    },
    {
        id: 'tabling',
        name: 'Farmers Market Tabling',
        description: 'Set up a booth and engage with locals',
        baseCost: 720,
        baseTime: 6000,
        baseRevenue: 12,
        emoji: '🎪',
        image: `${import.meta.env.BASE_URL}images/icons/petition.png`,
    },
    {
        id: 'town-hall',
        name: 'Town Hall Meeting',
        description: 'Host community discussions',
        baseCost: 8640,
        baseTime: 12000,
        baseRevenue: 48,
        emoji: '🏛️',
        image: `${import.meta.env.BASE_URL}images/icons/solidarity-block.png`,
    },
    {
        id: 'union-rally',
        name: 'Union Rally',
        description: 'Organize workers for collective action',
        baseCost: 103680,
        baseTime: 24000,
        baseRevenue: 192,
        emoji: '✊',
        image: `${import.meta.env.BASE_URL}images/icons/union-hall.png`,
    },
    {
        id: 'tiktok',
        name: 'Viral TikTok Campaign',
        description: 'Reach millions with viral content',
        baseCost: 1244160,
        baseTime: 48000,
        baseRevenue: 768,
        emoji: '📱',
        image: `${import.meta.env.BASE_URL}images/icons/media-blitz.png`,
    },
    {
        id: 'bus-tour',
        name: 'Bus Tour',
        description: 'Travel across the state spreading hope',
        baseCost: 14929920,
        baseTime: 96000,
        baseRevenue: 3072,
        emoji: '🚌',
        image: `${import.meta.env.BASE_URL}images/icons/campaign-bus.png`,
    },
    {
        id: 'debate',
        name: 'Televised Debate',
        description: 'Make your case on the national stage',
        baseCost: 179159040,
        baseTime: 192000,
        baseRevenue: 12288,
        emoji: '📺',
        image: `${import.meta.env.BASE_URL}images/icons/general-strike.png`,
    },
    {
        id: 'stadium',
        name: 'Stadium Event',
        description: 'Fill a stadium with passionate supporters',
        baseCost: 2149908480,
        baseTime: 384000,
        baseRevenue: 49152,
        emoji: '🏟️',
        image: `${import.meta.env.BASE_URL}images/icons/stadium-rally.png`,
    },
];

// Calculate cost for next activity purchase
export function getActivityCost(baseCost: number, owned: number): number {
    return Math.floor(baseCost * Math.pow(ACQUIRING_MULTIPLIER, owned));
}

// Calculate total cost to buy N activities (geometric series)
export function getBulkPurchaseCost(baseCost: number, owned: number, quantity: number): number {
    if (quantity <= 0) return 0;
    // Sum of geometric series: baseCost * r^owned * (1 - r^n) / (1 - r)
    // where r = ACQUIRING_MULTIPLIER, n = quantity
    const r = ACQUIRING_MULTIPLIER;
    const firstTermCost = baseCost * Math.pow(r, owned);
    const totalCost = firstTermCost * (1 - Math.pow(r, quantity)) / (1 - r);
    return Math.floor(totalCost);
}

// Calculate max affordable quantity given available funds
export function getMaxAffordable(baseCost: number, owned: number, funds: number): number {
    if (funds <= 0) return 0;
    // Binary search for max affordable
    let low = 0;
    let high = 10000; // Reasonable upper bound
    while (low < high) {
        const mid = Math.ceil((low + high + 1) / 2);
        if (getBulkPurchaseCost(baseCost, owned, mid) <= funds) {
            low = mid;
        } else {
            high = mid - 1;
        }
    }
    return low;
}

// Calculate manager cost
export function getManagerCost(baseCost: number): number {
    return Math.floor(baseCost * MANAGER_COST_MULTIPLIER);
}

// Get activity by ID
export function getActivityById(id: string): ActivityConfig | undefined {
    return ACTIVITIES.find(a => a.id === id);
}

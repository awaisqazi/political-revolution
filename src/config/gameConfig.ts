// ================================================
// MATHEMATICAL DNA - Core Game Balance Constants
// ================================================

// Cost Scaling
export const ACQUIRING_MULTIPLIER = 1.15;
export const UPGRADE_PRICE_MULTIPLIER = 1.15;

// Revenue Scaling
export const UPGRADE_PROFIT_MULTIPLIER = 1.25;
export const NATIONAL_ENDORSEMENT_MULTIPLIER = 7.77; // Reserved for late-game

// Momentum System
export const MOMENTUM_DECAY_RATE = 5; // -5% per second
export const MOMENTUM_BONUS_THRESHOLD_1 = 50; // 1.5x multiplier
export const MOMENTUM_BONUS_THRESHOLD_2 = 90; // 2.0x multiplier
export const MOMENTUM_CLICK_INCREMENT = 8; // +8% per click

// Manager pricing: 50-100x base activity cost
export const MANAGER_COST_MULTIPLIER = 75;

// Prestige
export const VOLUNTEER_DIVISOR = 1_000_000_000_000; // 1 trillion
export const VOLUNTEER_BONUS_PER = 0.02; // +2% per volunteer
export const VOLUNTEER_MOMENTUM_DECAY_REDUCTION = 0.005; // -0.5% decay per volunteer

// Offline progression cap (max 8 hours)
export const OFFLINE_MAX_SECONDS = 8 * 60 * 60;

// Starting funds
export const STARTING_FUNDS = 5;

// Format large numbers
export function formatNumber(n: number): string {
    if (n >= 1e15) return `${(n / 1e15).toFixed(2)}Q`;
    if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
    return n.toFixed(n < 100 ? 2 : 0);
}

// Calculate momentum bonus multiplier
export function getMomentumMultiplier(momentum: number): number {
    if (momentum >= MOMENTUM_BONUS_THRESHOLD_2) return 2.0;
    if (momentum >= MOMENTUM_BONUS_THRESHOLD_1) return 1.5;
    return 1.0;
}

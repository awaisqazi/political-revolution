/**
 * Format a number as money with K, M, B suffixes for readability
 * @example formatMoney(1200) -> "$1.2k"
 * @example formatMoney(1500000) -> "$1.5M"
 * @example formatMoney(1000000000) -> "$1.0B"
 */
export function formatMoney(amount: number): string {
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (absAmount >= 1000000000000) {
        return `${sign}$${(absAmount / 1000000000000).toFixed(1)}T`;
    }
    if (absAmount >= 1000000000) {
        return `${sign}$${(absAmount / 1000000000).toFixed(1)}B`;
    }
    if (absAmount >= 1000000) {
        return `${sign}$${(absAmount / 1000000).toFixed(1)}M`;
    }
    if (absAmount >= 1000) {
        return `${sign}$${(absAmount / 1000).toFixed(1)}k`;
    }
    return `${sign}$${Math.floor(absAmount)}`;
}

/**
 * Format a number with commas for readability
 */
export function formatNumber(num: number): string {
    return num.toLocaleString();
}

/**
 * Format a number with K, M, B, T suffixes (no currency symbol)
 * @example formatCompactNumber(1200) -> "1.2k"
 */
export function formatCompactNumber(num: number): string {
    const absNum = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    if (absNum >= 1000000000000) {
        return `${sign}${(absNum / 1000000000000).toFixed(2)}T`;
    }
    if (absNum >= 1000000000) {
        return `${sign}${(absNum / 1000000000).toFixed(2)}B`;
    }
    if (absNum >= 1000000) {
        return `${sign}${(absNum / 1000000).toFixed(2)}M`;
    }
    if (absNum >= 1000) {
        return `${sign}${(absNum / 1000).toFixed(1)}k`;
    }
    return `${sign}${Math.floor(absNum)}`;
}

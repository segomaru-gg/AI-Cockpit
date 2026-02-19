/**
 * Utility functions for consistent local date handling.
 * Prevents timezone issues by strictly using local system time for YYYY-MM-DD formatting.
 */

/**
 * Returns a YYYY-MM-DD string for the given date based on LOCAL system time.
 * @param date - The date object to format
 */
export function toLocalISOString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Returns a YYYY-MM-DD string for the current local "today".
 */
export function getTodayLocal(): string {
    return toLocalISOString(new Date());
}

/**
 * Parses a YYYY-MM-DD string into a Date object (set to local midnight).
 * @param dateStr - YYYY-MM-DD string
 */
export function parseLocalISOString(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/**
 * Returns a Date object representing the start of the current week (Sunday)
 * based on the local system time.
 * @param date - Optional reference date (default: today)
 */
export function getStartOfWeekLocal(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day; // Adjusts to Sunday
    return new Date(d.setDate(diff));
}

/**
 * Returns a Date object representing the end of the current week (Saturday)
 * based on the local system time.
 */
export function getEndOfWeekLocal(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() + (6 - day); // Adjusts to Saturday
    return new Date(d.setDate(diff));
}

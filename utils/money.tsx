import type { Timestamp } from "firebase/firestore";

// Converts firestore timestamp to milliseconds
const toMillis = (t: Timestamp) => t.toMillis();

export const computeMoneySaved = (
    opts: {
        createdAt: Timestamp | null;
        costPerWeek: number;
        manualSpendAdjustments?: number;
        now?: number;
    }
) => {
    const { createdAt, costPerWeek, manualSpendAdjustments = 0, now = Date.now() } = opts;

    if (!createdAt || !Number.isFinite(costPerWeek) || costPerWeek <= 0) return 0;
    
    const startMs = toMillis(createdAt);

    // Calculates how many milliseconds their are in a week
    const msPerWeek = 7 * 24 * 60 * 60 *1000;
    const weeks = Math.max(0, (now - startMs) / msPerWeek);

    const saved = costPerWeek * weeks - manualSpendAdjustments;

    // Rounds the number to the nearest number
    return Number(Math.max(0, saved).toFixed(0));
};
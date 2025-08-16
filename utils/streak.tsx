import { Timestamp } from "firebase/firestore";

// How many milliseconds are in a day
export const dayms = 24*60*60*1000;

// Firestore timestamp to millisecond
const toMillis = (t?: Timestamp | null) => (t ?t.toMillis() : 0);

// Calculates the streak into days
export const computeCurrentStreakDays = (opts: {
    lastIncident?: Timestamp | null;
    createdAt?: Timestamp | null;
    now?: number;
}) => {
    const now = opts.now ?? Date.now();
    const sinceMs = toMillis(opts.lastIncident) || toMillis(opts.createdAt);

    if (!sinceMs) return 0;

    const days = Math.floor((now - sinceMs) / dayms);

    return Math.max(0, days)
}
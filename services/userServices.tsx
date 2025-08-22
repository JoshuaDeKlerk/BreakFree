import { doc, DocumentData, getDoc, increment, onSnapshot, runTransaction, serverTimestamp, setDoc, Timestamp, updateDoc } from "firebase/firestore"
import { db } from "../firebase"
import { computeCurrentStreakDays } from "../utils/streak";

// function for creating user collection
export const createUserDoc = async(uid: string) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        await setDoc(ref, {
            createdAt: serverTimestamp(),
            onboardingCompleted: true,
            habitType: "vaping",
            longestStreak: 0,
            lastIncident: serverTimestamp(),
            dailyAvgUses: 0,
            costPerWeek: 0,
            quitGoalDate: null,
            manualSpendAdjustments: 0,
        });
    }
}

// function for money saved
export const userDocRef = (uid: string) => doc(db, "users", uid);

export const listenToUserDoc = (
    uid: string,
    onData: (data: DocumentData | undefined) => void,
    onError?: (e: unknown) => void
) => {
    const ref = userDocRef(uid);
    return onSnapshot(
        ref,
        (snap) => onData(snap.exists() ? snap.data() : undefined),
        onError
    );
};

// function for streaks
export const recordSlip = async (uid: string) => {
    const ref = userDocRef(uid);

    await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        const d = (snap.exists() ? (snap.data() as DocumentData) : null) ?? {};

        const currentStreakDays = computeCurrentStreakDays({
            lastIncident: d.lastIncident as Timestamp | undefined,
            createdAt: d.createdAt as Timestamp | undefined,
            now: Date.now(),
        });

        const prevLongest = Number(d.longestStreak ?? 0);
        const nextLongest = Math.max(prevLongest, currentStreakDays);

        tx.set(
            ref,
            {
                lastIncident: serverTimestamp(),
                longestStreak: nextLongest,
            },
            { merge: true }
        );
    });
};

// set weekly spend (ZAR per week)
export const setCostPerWeek = async (uid: string, amount: number) => {
  const ref = userDocRef(uid);
  const sanitized = Math.max(0, Math.round(amount));
  await updateDoc(ref, { costPerWeek: sanitized });
};

// add a spend adjustment (subtracts from saved total)
export const addManualSpend = async (uid: string, amount: number) => {
  const ref = userDocRef(uid);
  const sanitized = Math.max(0, Math.round(amount));
  await updateDoc(ref, { manualSpendAdjustments: increment(sanitized) });
};
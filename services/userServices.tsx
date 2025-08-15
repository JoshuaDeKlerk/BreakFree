import { doc, DocumentData, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "../firebase"
import { useAuth } from "../context/AuthContext";

// function for creating user collection
export const createUserDoc = async(uid: string) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        await setDoc(ref, {
            createdAt: serverTimestamp(),
            onboardingCompleted: true,
            habitType: "vaping",
            currentStreak: 0,
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
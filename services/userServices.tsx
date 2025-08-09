import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "../firebase"

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
            lastIncident: null,
            dailyAvgUses: 0,
            costPerUnit: 0,
            quitGoalDate: null
        });
    }
}
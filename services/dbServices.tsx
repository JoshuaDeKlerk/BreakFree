import { collection, doc, getDoc, getDocs, query, Timestamp, where } from "firebase/firestore";
import { db } from "../firebase";

export type CravingClock = {
  lastIncident: Timestamp;
  userId?: string;
};

export const getCravingClockData = async (uid: string): Promise<CravingClock | null> => {
  const byUidRef = doc(db, "timers", uid);
  const byUidSnap = await getDoc(byUidRef);
  if (byUidSnap.exists()) {
    return byUidSnap.data() as CravingClock;
  }

  const q = query(collection(db, "timers"), where("userId", "==", uid));
  const snaps = await getDocs(q);
  if (!snaps.empty) {
    return snaps.docs[0].data() as CravingClock;
  }

  return null;
};

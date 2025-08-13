import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

export type CravingClock = {
  lastIncident: Timestamp | null;
};

export const getCravingClockData = async (uid: string): Promise<CravingClock | null> => {

  // Reads data from db and from users table
  const ref = doc(db, "users", uid)
  const snap = await getDoc(ref);
  if(!snap.exists()) return null;

  // Sets data as a firestore timestamp
  const data: any = snap.data() || {};
  const lastIncident = data.lastIncident instanceof Timestamp ? data.lastIncident : null;

  return {lastIncident}
};

import {  collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../firebase";
import { recordSlip } from "./userServices";

export type EntryType = "craving" | "slip" | "note";
export type Mood = "bored" | "stressed" | "anxious" | "other" | null;

export async function uploadVoiceAndCreateEntry(params: {
  uid: string;
  type: EntryType;
  mood: Mood;
  handled: boolean;
  localUri?: string;
  durationSec?: number | null;
}) {
  const { uid, type, mood, handled, localUri, durationSec = null } = params;

  const entryRef = doc(collection(db, "entries"));
  const entryId = entryRef.id;

  // Upload voice
  let voiceNoteUrl: string | null = null;
  if (localUri) {
    const res = await fetch(localUri);
    const blob = await res.blob();
    const dateFolder = new Date().toISOString().split("T")[0];
    const storageRef = ref(storage, `voice/${uid}/${dateFolder}/${entryId}.m4a`);
    await uploadBytes(storageRef, blob, { contentType: "audio/m4a" });
    voiceNoteUrl = await getDownloadURL(storageRef);
  }

  const batch = writeBatch(db);

  // Create entry
  batch.set(entryRef, {
    entryId,
    userId: uid,
    timestamp: serverTimestamp(),
    type,
    mood,
    handled,
    voiceNoteUrl,
    durationSec,
  });

  await batch.commit();
  if (type === "slip") {
    await recordSlip(uid);
  }

  return { entryId, voiceNoteUrl };

}
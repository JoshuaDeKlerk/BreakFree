import { collection, doc, DocumentData, onSnapshot, orderBy, query, QueryDocumentSnapshot, where } from "firebase/firestore";
import { EntryType, Mood } from "./logService";
import { db } from "../firebase";

export type VoiceNoteEntry = {
    entryId: string;
    userId: string;
    type: EntryType;
    mood: Mood;
    handled: boolean;
    voiceNoteUrl: string;
    durationSec: number | null;
    timestamp: any;
}

// Map the firestore document
const toVoiceNoteEntry = (
    doc: QueryDocumentSnapshot<DocumentData>
): VoiceNoteEntry | null => {
    const d = doc.data();

    // If voiceNoteUrl is missing it will skip it
    if (!d?.voiceNoteUrl) return null;
    return {
        entryId: d.entryId ?? doc.id,
        userId: d.userId,
        type: d.type as EntryType,
        mood: (d.mood ?? null) as Mood,
        handled: !!d.handled,
        voiceNoteUrl: d.voiceNoteUrl,
        durationSec: d.durationSec ?? null,
        timestamp: d.timestamp ?? null,
    };
};

export const listenToVoiceNotes = (
    uid: string,
    onChange: (rows: VoiceNoteEntry[]) => void,
    onError?: (err: any) => void
) => {
    // Current users voice notes
    const q = query(
        collection(db, "entries"),
        where("userId", "==", uid),
        where("hasVoiceNote", "==", true),
        orderBy("timestamp", "desc")
    );

    // Real time listener
    return onSnapshot(
        q,
        (snap) => {
            const rows: VoiceNoteEntry[] = [];
            snap.forEach((doc) => {
                const row = toVoiceNoteEntry(doc);
                if (row) rows.push(row);
            });
            onChange(rows);
        },
        (err) => onError?.(err)
    );
};
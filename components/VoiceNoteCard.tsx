import { Audio, AVPlaybackStatusSuccess } from "expo-av";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
    entry: {
        entryId: string;
        mood: string | null;
        handled: boolean;
        timestamp: any;
        durationSec?: number | null;
        voiceNoteUrl: string;
    };
};

// Format the time for if the duration is missing
const formatDuration = (sec: number | null | undefined) => {
    if (!sec || sec <= 0) return "0:01";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
};

// Converts the timestamp to a date
const formatDate = (ts: any) => {
    if (!ts) return "";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const VoiceNoteCard: React.FC<Props> = ({ entry }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);

    // Toggle to switch what state is during play
    const playToggle = async () => {
        if (!entry.voiceNoteUrl) return;

        // When playing pause
        if (isPlaying && sound) {
            await sound.pauseAsync();
            setIsPlaying(false);
            return;
        }

        // If no sound is loaded it creates and loads the sound
        if (!sound) {
            const { sound: newSound } = await Audio.Sound.createAsync({ uri: entry.voiceNoteUrl });
            setSound(newSound);

            // When the voice note is done playing, reset
            newSound.setOnPlaybackStatusUpdate((status) => {
                const s = status as AVPlaybackStatusSuccess;
                if (s.isLoaded && s.didJustFinish) {
                    setIsPlaying(false);
                };
            });

            await newSound.playAsync();
            setIsPlaying(true);
        } else {
            // Continue with existing sound
            await sound.playAsync();
            setIsPlaying(true);
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (sound) sound.unloadAsync();
        };
    }, [sound]);

    return (
        <View style={[styles.card, !entry.handled && styles.cardDanger]}>
            <Pressable style={[styles.playBtn, !entry.handled && styles.playBtnDanger]} onPress={playToggle}>
                <Text style={styles.playTxt}>
                    {isPlaying ? "⏸" : "▶︎"}
                </Text>
            </Pressable>

            <View style={{ flex: 1 }}>
                <Text style={[styles.mood, !entry.handled && styles.textDanger]}>
                    {entry.mood ?? "No Mood"}
                </Text>

                <Text style={styles.date}>
                    {formatDate(entry.timestamp)}
                </Text>
            </View>

            <Text style={[styles.duration, !entry.handled && styles.textDanger]}>
                {formatDuration(entry.durationSec)}
            </Text>
        </View>
    );
};

export default VoiceNoteCard;

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        marginVertical: 6,
        borderWidth: 1,
        borderColor: "#eee",
    },
    cardDanger: {
        backgroundColor: "#fff5f5",
        borderColor: "#ffcccc",
    },
    playBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#111",
        marginRight: 12,
    },
    playBtnDanger: {
        backgroundColor: "#c1121f",
    },
    playTxt: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
    },
    mood: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111",
    },
    date: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
    duration: {
        fontWeight: "700",
        color: "#111",
    },
    textDanger: {
        color: "#b31313",
    },
});
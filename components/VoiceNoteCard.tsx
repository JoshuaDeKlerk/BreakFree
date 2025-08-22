import { Audio, AVPlaybackStatusSuccess } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
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

    const alert = !entry.handled;

    return (
        <View style={[styles.card, alert && styles.cardAlert]}>
            {/* Play button with gradient ring */}
            <Pressable onPress={playToggle} style={styles.playWrap}>
                <LinearGradient
                colors={isPlaying ? ["#5BDADE", "#2651E0"] : ["#2F2F2F", "#2C2C2C"]}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={[styles.playOuter, isPlaying && styles.playOuterActive, alert && styles.playOuterAlert]}
                >
                <View style={styles.playInner}>
                    <Text style={styles.playTxt}>{isPlaying ? "⏸" : "▶︎"}</Text>
                </View>
                </LinearGradient>
            </Pressable>

            {/* Middle: mood + date */}
            <View style={{ flex: 1 }}>
                <View style={styles.moodRow}>
                <Text style={[styles.mood, alert && styles.textAlert]} numberOfLines={1}>
                    {entry.mood ?? "No Mood"}
                </Text>
                {/* subtle dot separator */}
                <View style={styles.dot} />
                <Text style={styles.date}>{formatDate(entry.timestamp)}</Text>
                </View>
            </View>

            {/* Right: duration pill */}
            <LinearGradient
                colors={alert ? ["#FF6B6E", "#FF9AA2"] : ["#2651E0", "#5BDADE"]}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={styles.durPill}
            >
                <View style={styles.durInner}>
                <Text style={[styles.duration, alert && styles.textAlert]}>{formatDuration(entry.durationSec)}</Text>
                </View>
            </LinearGradient>
        </View>
    );
};

export default VoiceNoteCard;

const CARD_BG = "#1C1C1C";
const TEXT_PRIMARY = "#E8F0FF";
const TEXT_SECONDARY = "rgba(232,240,255,0.7)";
const CYAN_BORDER = "rgba(91,218,222,0.25)";

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 12,
        marginVertical: 6,
        borderWidth: 1,
        borderColor: CYAN_BORDER,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
        gap: 12,
    },
    cardAlert: {
        borderColor: "rgba(255,107,110,0.45)",
        backgroundColor: "#261c1d",
    },

    // Play button
    playWrap: { width: 56, height: 56 },
    playOuter: {
        flex: 1,
        borderRadius: 28,
        padding: 2, // gradient ring thickness
        justifyContent: "center",
        alignItems: "center",
    },
    playOuterActive: {
        shadowColor: "#5BDADE",
        shadowOpacity: 0.45,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    playOuterAlert: {
        shadowColor: "#FF6B6E",
    },
    playInner: {
        width: "100%",
        height: "100%",
        borderRadius: 26,
        backgroundColor: CARD_BG,
        borderWidth: 1,
        borderColor: "rgba(232,240,255,0.06)",
        alignItems: "center",
        justifyContent: "center",
    },
    playTxt: {
        color: TEXT_PRIMARY,
        fontSize: 18,
        fontWeight: "700",
    },

    // Middle
    moodRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    mood: {
        fontSize: 16,
        fontWeight: "700",
        color: TEXT_PRIMARY,
        maxWidth: "70%",
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "rgba(232,240,255,0.35)",
        marginHorizontal: 8,
    },
    date: {
        fontSize: 12,
        color: TEXT_SECONDARY,
    },

    // Duration pill (right)
    durPill: {
        borderRadius: 999,
        padding: 1.5,
        minWidth: 62,
    },
    durInner: {
        backgroundColor: CARD_BG,
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    duration: {
        fontWeight: "800",
        color: TEXT_PRIMARY,
        letterSpacing: 0.3,
        fontSize: 13,
    },

    // Alert text tone
    textAlert: {
        color: "#FF9AA2",
    },
});
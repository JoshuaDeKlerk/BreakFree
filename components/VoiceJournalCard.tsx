import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Modal, Pressable, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useAudioRecorder,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
  AudioModule,
} from "expo-audio";
import { useAuth } from "../context/AuthContext";
import { uploadVoiceAndCreateEntry, EntryType, Mood } from "../services/logService";

// Props for the component
type Props = {
  visible: boolean;
  onClose: () => void;
  defaultType?: EntryType;
  onSlip?: () => void;
};

const VoiceJournalCard: React.FC<Props> = ({ visible, onClose, defaultType = "craving", onSlip }) => {

    // From the AuthContext
    const {user} = useAuth();

    // Default Values for certain things
    const [phase, setPhase] = useState<"idle" | "recording" | "saving">("idle");
    const [durationSec, setDurationSec] = useState(0);
    const [mood, setMood] = useState<Mood>(null);
    const [type, setType] = useState<EntryType>(defaultType);
    const [msg, setMsg] = useState("Hold anywhere to record");

    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(recorder);

    const isStartingRef = useRef(false);
    const isStoppingRef = useRef(false);

    const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startedAtRef = useRef<number | null>(null);

    // Pulse while recording
    const pulse = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (phase === "recording") {
        const loop = Animated.loop(
            Animated.sequence([
            Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
        }
    }, [phase, pulse]);

    const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
    const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.22] });

    // Gives the modal values  when it appears
    useEffect(() => {
        if (visible) {
            setPhase("idle");
            setDurationSec(0);
            setMood(null);
            setType(defaultType);
            setMsg("Hold anywhere to record");
            clearTicker();
        } else {
            clearTicker();
        // proactively stop any ongoing recording if modal hides
            (async () => {
                try {
                    if (recorderState.isRecording) {
                        await recorder.stop();
                }
                } catch {}
                try {
                    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
                } catch {}
                    setPhase("idle");
            })();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, defaultType]);

    // request mic + set audio mode once
    useEffect(() => {
        (async () => {
        try {
            const perm = await AudioModule.requestRecordingPermissionsAsync();
            if (!perm.granted) {
            setMsg("Microphone permission denied");
            return;
            }
            await setAudioModeAsync({
            allowsRecording: false, // we enable it only right before recording
            playsInSilentMode: true,
            });
        } catch {}
        })();
    }, []);   

    // Clears Timers values
    const clearTicker = () => {
        if (tickerRef.current) {
            clearInterval(tickerRef.current);
            tickerRef.current = null;
        }
            startedAtRef.current = null;
    };

    const startRecording = async () => {
        if (phase !== "idle") return;
        if (isStartingRef.current || isStoppingRef.current) return;
        isStartingRef.current = true;

        try {
            // ensure audio mode is set for recording
            await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });

            // prepare and start
            await recorder.prepareToRecordAsync();
            recorder.record(); // non-async

            // UI updates
            setPhase("recording");
            setMsg("Recording... release to stop");
            setDurationSec(0);
            startedAtRef.current = Date.now();
            tickerRef.current = setInterval(() => {
                if (startedAtRef.current) {
                    const sec = Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000));
                    setDurationSec(sec);
                }
            }, 250);
        } catch (e: any) {
            console.log("start recording error", e);
            setMsg("Recording failed");
            setPhase("idle");
            // safe fallback: disable recording mode
            try {
                await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
            } catch {}
        } finally {
            isStartingRef.current = false;
        }
    };

    const stopAndFinalize = async () => {
        if (phase !== "recording") return;
        if (isStoppingRef.current) return;
        isStoppingRef.current = true;

        clearTicker();
        setPhase("saving");
        setMsg("Saving…");

        try {
            // stop (uri will be on recorder.uri)
            await recorder.stop();

            // prefer precise duration from recorder state if available
            const sec = Math.max(durationSec, Math.round((recorderState.durationMillis ?? 0) / 1000));
            setDurationSec(sec);

            if (sec < 1) {
                setMsg("Too short");
                setPhase("idle");
                return;
            }

            const uri = recorder.uri ?? undefined;

            if (user?.uid) {
                await uploadVoiceAndCreateEntry({
                uid: user.uid,
                type,
                mood,
                handled: type !== "slip",
                localUri: uri,
                durationSec: sec,
                });
                if (type === "slip") onSlip?.();
                setMsg("Uploaded!");
            }

            setTimeout(() => {
                setPhase("idle");
                onClose();
        }, 400);
        } catch (e) {
        console.log("stop/save error", e);
        setMsg("Save failed");
        setPhase("idle");
        } finally {
        try {
            await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
        } catch {}
        isStoppingRef.current = false;
        }
    };

    // Compact else if function, shows message during recording
    const hint =
        phase === "recording"
            ? `Recording… ${durationSec}s (release to stop)`
            : phase === "saving"
            ? "Saving…"
            : msg;

    // Render nothing when modal isn't visible
    if (!visible) return null;

    const slip = type === "slip";

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
            hardwareAccelerated
        >
            {/* IMPORTANT: match IntroPopup structure */}
            <GestureHandlerRootView style={{ flex: 1 }}>
                {/* Backdrop that centers content */}
                <Pressable style={styles.backdrop} onPress={onClose}>
                {/* Card */}
                <Pressable style={[styles.card, slip && styles.cardSlip]} onPress={() => {}}>
                    <Text style={styles.title}>How are you feeling?</Text>

                    {/* Mood chips */}
                    <View style={styles.moodRow}>
                    {(["bored", "stressed", "anxious", "other"] as Mood[]).map((m) => {
                        const active = mood === m;
                        return (
                        <Pressable
                            key={m || "other"}
                            onPress={() => setMood(m)}
                            hitSlop={8}
                            style={[styles.moodChip, active && styles.moodChipActive]}
                        >
                            {active && (
                            <LinearGradient
                                colors={["#2651E0", "#5BDADE"]}
                                start={{ x: 0, y: 1 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFillObject}
                            />
                            )}
                            <Text style={[styles.moodTxt, active && styles.moodTxtActive]}>{m}</Text>
                        </Pressable>
                        );
                    })}
                    </View>

                    {/* Type toggle */}
                    <Pressable
                    onPress={() => setType((prev) => (prev === "craving" ? "slip" : "craving"))}
                    hitSlop={8}
                    style={[styles.toggle, slip ? styles.toggleSlip : styles.toggleCraving]}
                    >
                    <Text style={[styles.toggleTxt, slip ? styles.toggleTxtSlip : styles.toggleTxtCraving]}>
                        {slip ? "Logging a SLIP (tap to switch)" : "Logging a CRAVING (tap to switch)"}
                    </Text>
                    </Pressable>

                    {/* Hold area */}
                    <Pressable
                        onLongPress={() => { Promise.resolve().then(startRecording); }}
                        delayLongPress={200}
                        onPressOut={stopAndFinalize}
                        android_ripple={{ color: "rgba(255,255,255,0.06)" }}
                        style={styles.holdArea}
                        hitSlop={10}
                    >
                    <LinearGradient
                        colors={slip ? ["#F59E0B", "#EF4444"] : ["#2651E0", "#5BDADE"]}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.holdRing}
                    >
                        <View style={styles.holdInner}>
                        {phase === "recording" && (
                            <Animated.View
                            style={[
                                styles.pulse,
                                { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
                            ]}
                            />
                        )}

                        <Text style={[styles.hint, phase !== "idle" && styles.hintActive]}>{hint}</Text>
                        {phase === "recording" && <Text style={styles.timeBig}>{durationSec}s</Text>}
                        </View>
                    </LinearGradient>
                    </Pressable>

                    <Text style={styles.note}>Press-and-hold to record. Release to save.</Text>
                </Pressable>
                </Pressable>
            </GestureHandlerRootView>
        </Modal>
    );
};

export default VoiceJournalCard;

const TEXT_PRIMARY = "#E8F0FF";
const TEXT_SECONDARY = "rgba(232,240,255,0.75)";
const CARD_BORDER = "rgba(91,218,222,0.25)";
const CARD_BORDER_SLIP = "rgba(239,68,68,0.35)";

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    card: {
        width: "100%",
        maxWidth: 420,
        borderRadius: 20,
        backgroundColor: "#1C1C1C",
        padding: 18,
        gap: 12,
        borderWidth: 1,
        borderColor: CARD_BORDER,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
    },
    cardSlip: { borderColor: CARD_BORDER_SLIP },
    title: { fontSize: 18, fontWeight: "800", color: TEXT_PRIMARY, letterSpacing: 0.2 },
    moodRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    moodChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: "#2C2C2C",
        borderWidth: 1,
        borderColor: "rgba(232,240,255,0.08)",
        overflow: "hidden",
    },
    moodChipActive: { borderColor: "rgba(91,218,222,0.45)", backgroundColor: "transparent" },
    moodTxt: { color: TEXT_SECONDARY, fontWeight: "700", letterSpacing: 0.2 },
    moodTxtActive: { color: TEXT_PRIMARY },
    toggle: {
        alignSelf: "flex-start",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
    },
    toggleCraving: { borderColor: "rgba(91,218,222,0.45)", backgroundColor: "rgba(91,218,222,0.08)" },
    toggleSlip: { borderColor: "rgba(239,68,68,0.45)", backgroundColor: "rgba(239,68,68,0.08)" },
    toggleTxt: { fontSize: 12.5, fontWeight: "700", letterSpacing: 0.2 },
    toggleTxtCraving: { color: TEXT_PRIMARY },
    toggleTxtSlip: { color: "#FFD0D0" },
    holdArea: { marginTop: 6, borderRadius: 16, overflow: "hidden" },
    holdRing: { borderRadius: 16, padding: 2 },
    holdInner: {
        backgroundColor: "#0F0F0F",
        borderRadius: 14,
        minHeight: 120,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(232,240,255,0.06)",
    },

    pulse: {
        position: "absolute",
        top: 8,
        bottom: 8,
        left: 8,
        right: 8,
        borderRadius: 14,
        backgroundColor: "#5BDADE",
    },
    hint: { color: TEXT_SECONDARY, fontSize: 14, letterSpacing: 0.2 },
    hintActive: { color: TEXT_PRIMARY },
    timeBig: { marginTop: 6, color: TEXT_PRIMARY, fontSize: 22, fontWeight: "800", letterSpacing: 0.3 },
    note: { fontSize: 12, color: "rgba(232,240,255,0.6)", textAlign: "center" },
});

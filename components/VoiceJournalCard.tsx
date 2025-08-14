import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Modal, Pressable } from "react-native";
import { useAuth } from "../context/AuthContext";
import { uploadVoiceAndCreateEntry, EntryType, Mood } from "../services/logService";

// Props for the component
type Props = {
  visible: boolean;
  onClose: () => void;
  defaultType?: EntryType;
  onSlip?: () => void;
};

// Tells expo-av how to record for different platforms
const recordingOptions: Audio.RecordingOptions = {
    android: {
        extension: ".m4a",
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
    },
    ios: {
        extension: ".m4a",
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
        outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    },
    web: undefined as any,
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
    const [localUri, setLocalUri] = useState<string | undefined>(undefined)

    const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startedAtRef = useRef<number | null>(null);
    const recordingRef = useRef<Audio.Recording | null>(null);

    // Gives the modal values  when it appears
    useEffect(() => {
        if (visible) {
            setPhase("idle");
            setDurationSec(0);
            setMood(null);
            setType(defaultType);
            setMsg("Hold anywhere to record");
            setLocalUri(undefined)
            clearTicker();
        } else {
            clearTicker();
        }
    }, [visible, defaultType]);

    // Makes sure timer stops running when modal disappears
    useEffect(() => () => clearTicker(), []);

    // Clears Timers values
    const clearTicker = () => {
        if (tickerRef.current) {
            clearInterval(tickerRef.current);
            tickerRef.current = null;
        }
            startedAtRef.current = null;
    };

    const startRecording = async () => {
        // Prevents a double start
        if (phase !== "idle") return;

        try {

            // Asks for mic permission
            const { granted } = await Audio.requestPermissionsAsync();
            // If mic permissions are disabled
            if (!granted) {
                setMsg("Microphone permission denied");
                return
            }
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                staysActiveInBackground: false
            });
            
            // Create and start the recording
            const { recording } = await Audio.Recording.createAsync(recordingOptions);
            recordingRef.current = recording;
            
            // Updates the ui to show that its recording
            setPhase("recording")
            setMsg("Recording... release to stop");
            setDurationSec(0);
            startedAtRef.current = Date.now();
            tickerRef.current = setInterval(() => {
                if (startedAtRef.current) {
                    const sec = Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000));
                    setDurationSec(sec);
                }
            }, 250);

        // Error Handling
        } catch (e) {
            setMsg("Recording failed");
            setPhase("idle")
        }
    };

    const stopAndFinalize = async () => {

        // Only stops the recording if its recording
        if (phase !== "recording") return;

        clearTicker();
        setPhase("saving");
        setMsg("Saving…");

        try {

            // Gets the recording
            const rec = recordingRef.current;
            if (!rec) throw new Error("no-recording");

            // Stop the recording and stores it
            await rec.stopAndUnloadAsync();
            const status = await rec.getStatusAsync();
            const sec = status.durationMillis ? Math.round(status.durationMillis / 1000) : 0;
            setDurationSec(sec);

            // Makes sure the recording is longer than 1 second
            if (sec < 1) {
                setMsg("Too short");
                setPhase("idle");
                return
            }

            const uri = rec.getURI() || undefined;
            setLocalUri(uri);

            // Saves the recording into entries
            if(user?.uid) {
                await uploadVoiceAndCreateEntry({
                    uid: user.uid,
                    type,
                    mood,
                    handled: type !== "slip",
                    localUri: uri,
                    durationSec: sec,
                });
                // Runs onSlip function if its a slip
                if (type === "slip") onSlip?.();
                setMsg("Uploaded!")
            }

            // Closes the modal after reset
            setTimeout(() => {
                setPhase("idle");
                onClose();
            }, 400);

        // Error Handling
        } catch (e) {
            console.log("stop/ save error", e);
            setMsg("Save failed");
            setPhase("idle");
        } finally {
            recordingRef.current = null;
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
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

    return (
        <Modal
            transparent
            visible
            animationType="fade"
            onRequestClose={onClose}
            presentationStyle="overFullScreen"
            hardwareAccelerated
        >

            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <Text style={styles.title}>How are you feeling?</Text>

                    <View style={styles.moodRow}>
                        {(["bored","stressed","anxious","other"] as Mood[]).map(m => (
                        <Pressable
                            key={m || "other"}
                            onPress={() => setMood(m)}
                            hitSlop={8}
                            style={[styles.moodChip, mood === m && styles.moodChipActive]}
                        >
                            <Text>{m}</Text>
                        </Pressable>
                        ))}
                    </View>

                    <Pressable
                        onPress={() => setType(prev => (prev === "craving" ? "slip" : "craving"))}
                        hitSlop={8}
                    >
                        <Text style={styles.toggle}>
                            {type === "slip" ? "Logging a SLIP (tap to switch)" : "Logging a CRAVING (tap to switch)"}
                        </Text>
                    </Pressable>

                    {/* Hold area */}
                    <Pressable
                        onLongPress={startRecording}
                        delayLongPress={200}
                        onPressOut={stopAndFinalize}
                        android_ripple={{ color: "rgba(0,0,0,0.05)" }}
                        style={[styles.holdArea, phase !== "idle" && styles.holdAreaActive]}
                        hitSlop={10}
                    >
                        <Text style={styles.hint}>{hint}</Text>
                    </Pressable>

                    <Text style={styles.note}>
                        Press-and-hold to record. Release to save.
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

export default VoiceJournalCard;

const styles = StyleSheet.create({
    backdrop: { 
        flex:1, 
        backgroundColor:"rgba(0,0,0,0.5)", 
        alignItems:"center", 
        justifyContent:"center", 
        padding:24 
    },
    card: { 
        width:"100%", 
        borderRadius:16, 
        backgroundColor:"white", 
        padding:20, 
        gap:12 
    },
    title: { 
        fontSize:18, 
        fontWeight:"700" 
    },
    moodRow: { 
        flexDirection:"row", 
        gap:8, 
        flexWrap:"wrap" },
    moodChip: { 
        paddingVertical:6, 
        paddingHorizontal:10, 
        borderRadius:999, 
        backgroundColor:"#f1f1f1" 
    },
    moodChipActive: { 
        backgroundColor:"#c4c4c4ff" 
    },
    holdArea: { 
        marginTop:8, 
        height:120, 
        borderRadius:12, 
        backgroundColor:"#f9fafb", 
        alignItems:"center", 
        justifyContent:"center" 
    },
    holdAreaActive: { 
        backgroundColor:"#eef6ff" 
    },
    hint: { 
        fontSize:14, 
        opacity:0.8 
    },
    note: { 
        fontSize:12, 
        opacity:0.6, 
        textAlign:"center" 
    },
    toggle: { 
        fontSize:12, 
        opacity:0.7 
    }
});

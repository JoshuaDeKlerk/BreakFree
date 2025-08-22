import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { getCravingClockData } from "../services/dbServices";
import { LinearGradient } from "expo-linear-gradient";

// Converts to readable time format
const formatDuration = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    return days > 0
        ? `${days}d ${hours}h ${minutes}m`
        : `${hours}h ${minutes}m ${seconds}s`;
}

type Props = { overrideLastIncidentMs?: number | null };

const RadialTimer: React.FC<Props> = ({ overrideLastIncidentMs }) => {
    const { user } = useAuth();
    const [elapsedTime, setElapsedTime] = useState("");

    // Keeps start time without rerendering
    const lastMsRef = useRef<number | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Pulse effect
    const pulse = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const loop = Animated.loop(
        Animated.sequence([
            Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
        );
        loop.start();
        return () => loop.stop();
    }, [pulse]);
    const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.015] });

    // Function to make the radial clock start ticking if the intro popup is used
    const startTicker = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (lastMsRef.current != null) {
                setElapsedTime(formatDuration(Date.now() - lastMsRef.current));
            }
        }, 1000);
    }

    // Updates timestamp when a slip is logged
    useEffect(() => {
        if (overrideLastIncidentMs != null) {
            lastMsRef.current = overrideLastIncidentMs;
            setElapsedTime(formatDuration(Date.now() - overrideLastIncidentMs));
            startTicker();
        }
    }, [overrideLastIncidentMs]);

    useEffect(() => {
        if (!user?.uid) return;
        
        let cancelled = false;

        (async () => {
            try {
            if (overrideLastIncidentMs != null) return;

            const data = await getCravingClockData(user.uid); 
            const ts =data?.lastIncident;

            // Shows if there wasn't a incident yet
            if (!ts) {
                if (!cancelled) setElapsedTime("No Data");
                return;
            }

            // Runs when there wasnt a slip
            if (overrideLastIncidentMs == null) {
                lastMsRef.current =
                    typeof (ts as any).toMillis === "function"
                        ? (ts as any).toMillis()
                        : Date.parse(String(ts));
                if (!cancelled && lastMsRef.current != null) {
                    setElapsedTime(formatDuration(Date.now() - lastMsRef.current))
                }
            }

            // Clears old interval
            if (intervalRef.current) clearInterval(intervalRef.current);

            // Update time every second
            intervalRef.current = setInterval(() => {
                if (lastMsRef.current != null) {
                    setElapsedTime(formatDuration(Date.now() - lastMsRef.current));
                }
            }, 1000);
            } catch (e) {
                console.log("Failed to load craving clock:", e);
                if (!cancelled) setElapsedTime("Error");
            }
        })();
        
        // Cleans up unmount
        return () => {
            cancelled = true;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        }, [user?.uid, overrideLastIncidentMs]);

        const SIZE = 240;   
        const THICK = 6;     
        const INNER = SIZE - THICK * 2;
        
        const isStatus = elapsedTime === "No Data" || elapsedTime === "Error";


        return (
            <View style={styles.wrap}>
                <Animated.View style={{ transform: [{ scale }] }}>
                    {/* Gradient ring */}
                    <LinearGradient
                        colors={["#2651E0", "#5BDADE"]}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                            width: SIZE,
                            height: SIZE,
                            borderRadius: SIZE / 2,
                            padding: THICK,
                            shadowColor: "#5BDADE",
                            shadowOpacity: 0.25,
                            shadowRadius: 16,
                            shadowOffset: { width: 0, height: 8 },
                            elevation: 8,
                        }}
                    >
                    {/* Inner circle */}
                    <View style={[ styles.circle, { width: INNER, height: INNER, borderRadius: 800 } ]}>
                        <Text style={styles.label}>Since last slip</Text>

                        <Text style={[ styles.time, isStatus && { color: "rgba(232,240,255,0.7)", fontWeight: "600" }]}
                        accessibilityRole="text"
                        accessibilityLabel={`Elapsed time ${elapsedTime}`}
                        >
                            {elapsedTime}
                        </Text>

                        <Text style={styles.subtle}>
                            Keep going — one second at a time
                        </Text>
                    </View>
                    </LinearGradient>
                </Animated.View>
            </View>
        );
    }

export default RadialTimer

const BG = "#0F0F0F";
const CARD_BG = "#1C1C1C";
const TEXT_PRIMARY = "#E8F0FF";
const TEXT_SECONDARY = "rgba(232,240,255,0.7)";

const styles = StyleSheet.create({
    wrap: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 24,
    },
    circle: {
        backgroundColor: CARD_BG,
        borderWidth: 1,
        borderColor: "rgba(232,240,255,0.06)",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        overflow: "hidden"
    },
    label: {
        color: TEXT_SECONDARY,
        fontSize: 13,
        letterSpacing: 0.3,
    },
    time: {
        color: TEXT_PRIMARY,
        fontSize: 28,
        fontWeight: "800",
        letterSpacing: 0.3,
    },
    subtle: {
        color: TEXT_SECONDARY,
        fontSize: 12,
    },
});
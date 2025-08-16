import { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { getCravingClockData } from "../services/dbServices";

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


        return (
            <View style={styles.container}>
                <TextInput 
                    style={styles.timerText}
                    value={elapsedTime}
                    editable={false}
                />
            </View>
        );
    }

export default RadialTimer

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    timerText: {
        fontSize: 24,
        textAlign: 'center',
        marginVertical: 20,
    },
});
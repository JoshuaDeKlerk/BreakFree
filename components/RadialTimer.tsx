import { useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { getCravingClockData } from "../services/dbServices";

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

const RadialTimer = () => {
    const { user } = useAuth();
    const [elapsedTime, setElapsedTime] = useState("");

    useEffect(() => {
    if (!user?.uid) return;

    (async () => {
        try {
        const data = await getCravingClockData(user.uid); 
        if (!data?.lastIncident) {
            setElapsedTime("No data");
            return;
        }
        const lastMs = data.lastIncident.toMillis();
        const diff = Date.now() - lastMs;
        setElapsedTime(formatDuration(diff));
        } catch (e) {
        console.log("Failed to load craving clock:", e);
        setElapsedTime("Error");
        }
    })();
    }, [user?.uid]);


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
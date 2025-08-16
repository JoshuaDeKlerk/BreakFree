import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { computeCurrentStreakDays } from "../utils/streak";
import { listenToUserDoc } from "../services/userServices";

const StreakCard = () => {
    // Pulls uid from the auth context
    const { user, loading } = useAuth();

    const [currentDays, setCurrentDays] = useState(0);
    const [longestDays, setLongestDays] = useState(0);

    useEffect(() => {
        // When auth is loading do not set up listeners
        if (loading) return;

        // When user is signed out
        if (!user) {
            setCurrentDays(0);
            setLongestDays(0);
            return;
        }

        let lastDoc: any = null;

        const recompute = () => {
            if (!lastDoc) return;

            // Calculates the streak
            const now = Date.now();
            const cur = computeCurrentStreakDays({
                lastIncident: lastDoc.lastIncident ?? null,
                createdAt: lastDoc.createdAt ?? null,
                now,
            });
            setCurrentDays(cur);
            setLongestDays(Number(lastDoc.longestStreak ?? 0));
        };

        // Updates the ui in realtime
        const unsub = listenToUserDoc(
            user.uid,
            (d) => {
                lastDoc = d || {};
                recompute();
            },
            () => {
                lastDoc = null;
                setCurrentDays(0);
                setLongestDays(0);
            }
        );

        // Keeps streak display accurate to the minute
        const timer = setInterval(recompute, 60 * 1000);

        // Cleanup
        return () => {
            clearInterval(timer);
            unsub?.();
        };
    }, [user?.uid, loading]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Current Streak</Text>
            <Text style={styles.big}>
                {currentDays} {currentDays === 1 ? "day" : "days"}
            </Text>
            <Text style={styles.sub}>
                Best: {longestDays} {longestDays === 1 ? "day" : "days"}
            </Text>
        </View>
    );
}

export default StreakCard

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontSize: 12,
        opacity: 0.6,
        marginBottom: 4,
    },
    big: {
        fontSize: 24,
        fontWeight: "700",
    },
    sub: {
        fontSize: 12,
        opacity: 0.7,
        marginTop: 2,
    }
});

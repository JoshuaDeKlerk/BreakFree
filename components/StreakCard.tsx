import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { computeCurrentStreakDays } from "../utils/streak";
import { listenToUserDoc } from "../services/userServices";
import { LinearGradient } from "expo-linear-gradient";

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

    const isPB = currentDays > 0 && currentDays >= longestDays;

    return (
        <View style={styles.card} accessibilityRole="summary">
            {/* Header row */}
            <View style={styles.headerRow}>
                <Text style={styles.title}>Current Streak</Text>
                <View style={[styles.badge, isPB && styles.badgeGold]}>
                    <Text style={[styles.badgeTxt, isPB && styles.badgeTxtGold]}>
                        {isPB ? "🔥 New best" : "Streak"}
                    </Text>
                </View>
            </View>

            {/* Main value */}
            <Text style={styles.big}>
                {currentDays} {currentDays === 1 ? "day" : "days"}
            </Text>

            {/* Subtext */}
            <Text style={styles.sub}>
                Best: {longestDays} {longestDays === 1 ? "day" : "days"}
            </Text>
            </View>
    );
}

export default StreakCard

const TEXT_PRIMARY = "#E8F0FF";
const TEXT_SECONDARY = "rgba(232,240,255,0.75)";
const CARD_BG = "#1C1C1C";
const CARD_BORDER = "rgba(245,158,11,0.35)"; 

const styles = StyleSheet.create({
    card: {
        backgroundColor: CARD_BG,
        borderWidth: 1,
        borderColor: CARD_BORDER,
        borderRadius: 16,
        padding: 16,
        gap: 8,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    title: {
        color: TEXT_SECONDARY,
        fontSize: 12.5,
        letterSpacing: 0.3,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(232,240,255,0.12)",
        backgroundColor: "rgba(232,240,255,0.04)",
    },
    badgeGold: {
        borderColor: "rgba(245,158,11,0.45)",
        backgroundColor: "rgba(245,158,11,0.08)",
    },
    badgeTxt: {
        color: TEXT_SECONDARY,
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
    badgeTxtGold: {
        color: "#FFE8A3",
    },
    big: {
        color: TEXT_PRIMARY,
        fontSize: 24,
        fontWeight: "800",
        letterSpacing: 0.2,
    },
    sub: {
        color: TEXT_SECONDARY,
        fontSize: 12.5,
        marginTop: -2,
    },
    accent: {
        height: 3,
        width: 64,
        borderRadius: 999,
        marginTop: 6,
    },
});

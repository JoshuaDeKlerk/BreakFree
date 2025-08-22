import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { listenToUserDoc } from "../services/userServices";
import { computeMoneySaved } from "../utils/money";
import { LinearGradient } from "expo-linear-gradient";

const MoneySavedCard = () => {
    // Gets user from AuthContext
    const { user, loading } = useAuth();

    // State for calculated money saved
    const [ saved, setSaved ] = useState(0);

    useEffect(() => {
        if (loading) return;

        // If there isn't a user logged in, reset saved amount
        if (!user) { 
            setSaved(0); 
            return; 
        }

        const unsub = listenToUserDoc(
            user.uid,
            (d) => {
                if (!d) return setSaved(0);

                // Calculate the money saved
                setSaved(
                    computeMoneySaved({
                        createdAt: d.createdAt ?? null,
                        costPerWeek: d.costPerWeek ?? 0,
                        manualSpendAdjustments: d.manualSpendAdjustments ?? 0,
                    })
                );                 
            },
            // When error happens reset saved amount
            () => setSaved(0)
        );
        // Cleanup
        return unsub;
    }, [user?.uid, loading]);

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Money Saved</Text>

            <View style={styles.row}>
                <Text style={styles.amount}>
                {Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: "ZAR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(saved)}
                </Text>
            </View>
        </View>
    );
}

export default MoneySavedCard

const TEXT_PRIMARY = "#E8F0FF";
const TEXT_SECONDARY = "rgba(232,240,255,0.75)";
const CARD_BG = "#15402fff";    
const CARD_BORDER = "rgba(91,218,222,0.25)";

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
    title: {
        color: TEXT_SECONDARY,
        fontSize: 12.5,
        letterSpacing: 0.3,
    },
    row: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 8,
    },
    amount: {
        color: TEXT_PRIMARY,
        fontSize: 24,
        fontWeight: "800",
        letterSpacing: 0.2,
    },
});
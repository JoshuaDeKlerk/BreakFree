import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { listenToUserDoc } from "../services/userServices";
import { computeMoneySaved } from "../utils/money";

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
        <View style={styles.container}>
            <Text style={styles.title}>Money Saved</Text>
            <Text style={styles.amount}>
                {Intl.NumberFormat(undefined, { style: "currency", currency: "ZAR", minimumFractionDigits: 0, maximumFractionDigits: 0}).format(saved)}
            </Text>
        </View>
    );
}

export default MoneySavedCard

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#e6f7ec"
    },
    title: {
        fontSize: 12,
        opacity: 0.6
    },
    amount: {
        fontSize: 24,
        fontWeight: "700"
    }
});

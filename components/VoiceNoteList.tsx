import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import { listenToVoiceNotes, VoiceNoteEntry } from "../services/voiceNoteService";
import { FlatList, RefreshControl } from "react-native-gesture-handler";
import VoiceNoteCard from "./VoiceNoteCard";

type Props = {
    initialNumToRender?: number;
    contentPadding?: number;
}

const VoiceNoteList: React.FC<Props> = ({ initialNumToRender = 10, contentPadding = 16}) => {

    // Uid from auth context
    const { user } = useAuth();

    const [items, setItems] = useState<VoiceNoteEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If no user is signed in it should clear the list
    useEffect(() => {
        if (!user?.uid) {
            setLoading(false);
            setItems([]);
        }
    }, [user?.uid]);

    // Gets the users voice note after loading
    useEffect(() => {
        if (!user?.uid) return;

        setLoading(true);
        setError(null);

        const unsub = listenToVoiceNotes(user.uid, (entries) => {
            setItems(entries);
            setLoading(false);
            setRefreshing(false);
        },
        // Error handling
        (err) => {
            console.error("listenToVoiceNotes error", err);
            setError("Could not load voice notes.");
            setLoading(false);
            setRefreshing(false);
        }
    );
    // Cleanup
    return unsub;
    }, [user?.uid]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    // Key extractor for Flatlist items
    const keyExtractor = useCallback((item: VoiceNoteEntry) => item.entryId, []);

    // Styling for list
    const contentStyle = useMemo(
        () => [{ padding: contentPadding, paddingBottom: contentPadding + 24}],
        [contentPadding]
    );

    // When loading ui will look like this
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
                <Text style={[styles.muted, { marginTop: 8 }]}>Loading your voice notes…</Text>
            </View>
        );
    }

    // If their is an error ui will look like this
    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.title}>Oops</Text>
                <Text style={styles.muted}>{error}</Text>
                <Text style={[styles.muted, { marginTop: 6 }]}>
                If you just added this feature, Firestore may require a composite index. Open the link shown in the console once.
                </Text>
            </View>
        );
    }

    // If the user does not have a voice note ui will look like this
    if (items.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={styles.title}>No voice notes yet</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={items}
            keyExtractor={keyExtractor}
            renderItem={({item}) => <VoiceNoteCard entry={item}/>}
            contentContainerStyle={contentStyle}
            initialNumToRender={initialNumToRender}
            ItemSeparatorComponent={() => <View style={{ height: 12}}/>}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#999"/>
            }
            accessibilityRole="list"
            accessibilityLabel="List of voice notes"
        />
    );
}

export default VoiceNoteList

const styles = StyleSheet.create({
    center: {
        flex: 1,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 6,
    },
    muted: {
        fontSize: 14,
        opacity: 0.6,
        textAlign: "center",
    },
});

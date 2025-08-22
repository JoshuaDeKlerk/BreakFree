import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { getUserInfo, logoutUser, updateUserProfile } from "../services/authServices";
import { useMemo, useState } from "react";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { HoldPill } from "../components/HoldPill";
import { LinearGradient } from "expo-linear-gradient";

const AVATAR_SIZE = 100;

const Profile = () => {
    const { user } = useAuth();
    const u = getUserInfo();

    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [photoURL, setPhotoURL] = useState(user?.photoURL || "");

    const email = user?.email ?? u?.email ?? "";
    const uid = user?.uid ?? u?.uid ?? "";

    const initials = useMemo(() =>{
        const src = (displayName || email || "U").trim();
        if (!src) return "U";
        const parts = src.replace(/@.*$/, "").split(/[ ._]/).filter(Boolean);
        const first = parts[0]?.[0] ?? "U";
        const second = parts[1]?.[0] ?? "";
        return (first + second).toUpperCase();
    }, [displayName, email]);

    // handle logout
    const handleLogout = () => {
        logoutUser();
    };

    // Handle profile update
    const handleUpdateProfile = () => {
        updateUserProfile(displayName, photoURL);
    }

    const hasPhoto = !!photoURL;

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Your Profile</Text>
                    <Text style={styles.sub}>Make it yours—hold to save changes.</Text>
                </View>

                {/* Avatar + Info Card */}
                <View style={styles.card}>
                    <View style={styles.avatarWrap}>
                        <LinearGradient
                            colors={["#2651E0", "#5BDADE"]}
                            start={{ x: 0, y: 1 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.avatarRing}
                        />
                        <View style={styles.avatarHole} />

                        {hasPhoto ? (

                        <Image source={{ uri: photoURL }} style={styles.avatar} />

                        ) : (
                            <View style={[styles.avatar, styles.avatarFallback]}>
                                <Text style={styles.initials}>{initials}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.identBlock}>
                        <Text style={styles.identName}>{displayName || "Unnamed"}</Text>
                        {!!email && <Text style={styles.identMeta}>{email}</Text>}
                        {!!uid && <Text style={styles.identMetaDim}>{uid}</Text>}
                    </View>
                </View>

                {/* Edit Form */}
                <View style={styles.formCard}>
                    <Text style={styles.label}>Display Name</Text>
                    <TextInput
                        style={styles.input}
                        value={displayName}
                        onChangeText={setDisplayName}
                        placeholder="Enter display name"
                        placeholderTextColor="rgba(232,240,255,0.75)"
                        autoCorrect={false}
                    />

                    <Text style={[styles.label, { marginTop: 14 }]}>Photo URL</Text>
                    <TextInput
                        style={styles.input}
                        value={photoURL}
                        onChangeText={setPhotoURL}
                        placeholder="https://example.com/me.jpg"
                        placeholderTextColor="rgba(232,240,255,0.75)"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <View style={{ gap: 12, marginTop: 24 }}>
                        <HoldPill label="Hold to Update Profile" onConfirm={handleUpdateProfile} variant="primary" />
                        <HoldPill label="Hold to Sign Out" onConfirm={handleLogout} variant="secondary" />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

export default Profile

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#0F0F10",
    },
    container: {
        flex: 1,
        padding: 20,
        gap: 16,
    },
    header: {
        marginTop: 4,
        marginBottom: 2,
    },
    title: {
        color: "#E8F0FF",
        fontSize: 28,
        fontWeight: "800",
        letterSpacing: 0.2,
    },
    sub: {
        color: "rgba(232,240,255,0.75)",
        marginTop: 4,
        fontSize: 13,
        letterSpacing: 0.3,
    },
    card: {
        backgroundColor: "#1C1C1C",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(91,218,222,0.25)",
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    avatarWrap: {
        width: AVATAR_SIZE + 12,
        height: AVATAR_SIZE + 12,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarRing: {
        position: "absolute",
        width: AVATAR_SIZE + 12,
        height: AVATAR_SIZE + 12,
        borderRadius: (AVATAR_SIZE + 12) / 2,
        opacity: 0.85,
    },
    avatarHole: {
        position: "absolute",
        width: AVATAR_SIZE + 6,
        height: AVATAR_SIZE + 6,
        borderRadius: (AVATAR_SIZE + 6) / 2,
        backgroundColor: "#1C1C1C",
    },
    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        backgroundColor: "#2C2C2C",
    },
    avatarFallback: {
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(232,240,255,0.1)",
    },
    initials: {
        color: "#E8F0FF",
        fontSize: 28,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    identBlock: {
        flex: 1,
        minHeight: AVATAR_SIZE / 1.1,
        justifyContent: "center",
    },
    identName: {
        color: "#E8F0FF",
        fontSize: 18,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
    identMeta: {
        color: "rgba(232,240,255,0.85)",
        marginTop: 6,
        fontSize: 13,
    },
    identMetaDim: {
        color: "rgba(232,240,255,0.6)",
        marginTop: 4,
        fontSize: 11,
    },

    // Form card
    formCard: {
        backgroundColor: "#1C1C1C",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(91,218,222,0.25)",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    label: {
        color: "#E8F0FF",
        fontSize: 12,
        marginBottom: 6,
        letterSpacing: 0.4,
        marginLeft: 6,
    },
    input: {
        height: 50,
        borderRadius: 25,
        paddingHorizontal: 14,
        backgroundColor: "#2C2C2C",
        color: "#E8F0FF",
        borderWidth: 1,
        borderColor: "rgba(91,218,222,0.25)",
        fontSize: 15,
    },
});

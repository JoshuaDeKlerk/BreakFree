import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { registerUser } from "../services/authServices";
import { HoldPill } from "../components/HoldPill";
import Logo from '../assets/Welcome/WelcomeLogo.svg';

const RegistrationScreen = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigation:any = useNavigation();

    // Register user
    const doRegister = () => registerUser(email, password);
    // Navigate to login
    const goToLogin = () => navigation.navigate('Login');

    return (
        <ImageBackground
        source={require("../assets/Login/LoginBg.png")}
        style={styles.bg}
        resizeMode="contain"
        >
            <SafeAreaView style={styles.safe}>
                <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.container}
                >
                    <View style={styles.header}>
                        <Logo width={200} height={200} />
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.title}>Create Account</Text>

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="you@example.com"
                            placeholderTextColor="rgba(232, 240, 255, 0.8)"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Create a password"
                            placeholderTextColor="rgba(232, 240, 255, 0.8)"
                            secureTextEntry
                        />

                        <View style={{ display: "flex", gap: 12, marginTop: 40 }}>
                            <HoldPill label="Hold to Create Account" onConfirm={doRegister} variant="primary" />
                            <HoldPill label="Back to Login" onConfirm={goToLogin} variant="secondary" />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ImageBackground>
    );
}

export default RegistrationScreen

const styles = StyleSheet.create({
    bg: { 
        flex: 1 
    },
    safe: { 
        flex: 1 
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: "center",
    },
    header: {
        alignItems: "center",
        marginBottom: 12,
    },
    card: {
        padding: 20,
    },
    title: {
        color: "#E8F0FF",
        fontSize: 30,
        fontWeight: "700",
        letterSpacing: 0.3,
        marginBottom: 30,
        textAlign: "center",

    },
    label: {
        color: "#E8F0FF",
        fontSize: 12,
        marginBottom: 6,
        letterSpacing: 0.4,
        marginLeft: 20,
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

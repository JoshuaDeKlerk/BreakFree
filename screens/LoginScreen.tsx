import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loginUser } from "../services/authServices";
import Logo from '../assets/Welcome/WelcomeLogo.svg';
import { HoldPill } from "../components/HoldPill";

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigation:any = useNavigation();

    // Navigate to Registration
    const goToRegistration = () => navigation.navigate('Registration');
    // Login user
    const doLogin = () => loginUser(email, password);

    return (
        <ImageBackground
            source={require('../assets/Login/LoginBg.png')}
            style={styles.bg}
            resizeMode="contain"
        >
            <SafeAreaView style={styles.safe}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.container}
                >
                    <View style={styles.header}>
                        <Logo width={200} height={200} />
                    </View>

                    <View style={styles.card}>
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
                            placeholder="Your password"
                            placeholderTextColor="rgba(232, 240, 255, 0.8)"
                            secureTextEntry
                        />
                        <View style={{ display: 'flex', gap: 12, marginTop: 40 }} >
                            <HoldPill label="Hold to Login" onConfirm={doLogin} variant="primary" />
                            <HoldPill label="Create Account" onConfirm={goToRegistration} variant="secondary" />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView> 
        </ImageBackground>
    );
}

export default LoginScreen

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
})

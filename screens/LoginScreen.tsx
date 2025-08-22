import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loginUser } from "../services/authServices";
import Logo from '../assets/Welcome/WelcomeLogo.svg';
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

// Long Press props
type HoldPillProps = {
    label: string;
    onConfirm: () => void;
    durationMs?: number;
    variant?: "primary" | "secondary";
};

// LongPress Function
export const HoldPill = ({ label, onConfirm, durationMs = 800, variant = "primary" }: HoldPillProps) => {
    const progress = useSharedValue(0);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
            cancelAnimation(progress);
        };
    }, []);

    // Animates the fill of the pill
    const fillStyle = useAnimatedStyle(() => ({
        width: `${Math.min(Math.max(progress.value, 0), 1) * 100}%`,
    }));

    // Starts the hold animation
    const startHold = () => {
        cancelAnimation(progress);
        progress.value = withTiming(1, {
            duration: durationMs,
            easing: Easing.out(Easing.quad),
        });
    };

    // Resets the fill animation
    const resetFill = (snap: boolean = false) => {
        cancelAnimation(progress);
        progress.value = withTiming(0, { duration: snap ? 0 : 120 });
    };

    // Long Press Gesture
    const longPress = Gesture.LongPress()
        .runOnJS(true)          
        .minDuration(durationMs)
        .maxDistance(32)
        .shouldCancelWhenOutside(false)
        .hitSlop(20)
        .onBegin(() => { startHold(); }) 
        .onEnd((_e, success) => {
            if (success) {
                onConfirm();
            } else {
                resetFill();
            }
        })
        .onFinalize(() => {
            resetFill(true);
        });

    const isPrimary = variant === "primary";

    return (
        <GestureDetector gesture={longPress}>
            <Animated.View style={[styles.pillWrap]}>
                {isPrimary ? (
                    <LinearGradient
                        colors={["#2651E0", "#5BDADE"]}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.pillBg}
                    />
                ) : (
                    <View style={[styles.pillBg, styles.pillSecondary]} />
                )}

                <Animated.View
                    style={[
                        styles.pillFill,
                        isPrimary ? styles.pillFillPrimary : styles.pillFillSecondary,
                        fillStyle,
                    ]}
                />

                    <Text style={[styles.pillText, isPrimary ? styles.pillTextDark : styles.pillTextLight]}>
                        {label}
                    </Text>

                </Animated.View>
        </GestureDetector>
    );
};


const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigation:any = useNavigation();

    // Route Helpers
    const goToRegistration = () => navigation.navigate('Registration');
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
    pillWrap: {
        height: 56,
        borderRadius: 28,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 2,
    },
    pillBg: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 28,
    },
    pillSecondary: {
        backgroundColor: "#1C1C1C",
        borderWidth: 1,
        borderColor: "rgba(91,218,222,0.5)",
    },
    pillFill: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        width: "100%",
        backfaceVisibility: "hidden",
    },
    pillFillPrimary: {
        backgroundColor: "rgba(14,16,19,0.15)",
    },
    pillFillSecondary: {
        backgroundColor: "rgba(91,218,222,0.18)",
    },
    pillText: {
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.4,
        fontFamily: "SamsungSansMedium",
    },
    pillTextDark: { 
        color: "#0E1013" 
    },
    pillTextLight: { 
        color: "#E8F0FF" 
    },
})

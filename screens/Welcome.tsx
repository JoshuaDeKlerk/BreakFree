import { Image, ImageBackground, SafeAreaView, StyleSheet, Text, View } from "react-native";
import Logo from "../assets/Welcome/WelcomeLogo.svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Extrapolate, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

const CenterLogo = require("../assets/Welcome/CenterLogo.png");

const WelcomeScreen = ( ) => {
    const navigation = useNavigation<any>();

    // Values for react reanimated
    const translateX = useSharedValue(0);
    const dragStartX = useSharedValue(0);

    // Pill width to make sure the slider doesnt go over it
    const [pillWidth, setPillWidth] = useState(0);

    // Constraints for the slider
    const BADGE_SIZE = 56;
    const EDGE_INSET = 8;

    // The max the slider the badge can go
    const maxEdge = Math.max(0, (pillWidth - BADGE_SIZE) / 2 - EDGE_INSET);

    // How far the user should slide to trigger the navigation
    const threshold = Math.max(80, maxEdge * 0.65);

    // Reset the slider position
    const resetSlider = useCallback((animated = true) => {
        dragStartX.value = 0;
        translateX.value = animated
            ? withSpring(0, { damping: 14, stiffness: 140 })
            : 0;
    }, [dragStartX, translateX]);

    // Reset the slider position when the screen is focused
    useFocusEffect(
        useCallback(() => {
            resetSlider(true);
            return () => {
                resetSlider(false);
            };
        }, [resetSlider])
    );

    // Gesture for the slider
    const gesture = Gesture.Pan()
        .onBegin(() => {
            dragStartX.value = translateX.value;
        })
        .onUpdate((e) => {
            const next = dragStartX.value + e.translationX;
            translateX.value = Math.min(maxEdge, Math.max(-maxEdge, next));
        })
        .onEnd(() => {
            if (translateX.value > threshold) {
                translateX.value = withSpring(maxEdge, { damping: 14, stiffness: 140 }, () => {
                    runOnJS(navigation.navigate)("Registration");
                });
            } else if (translateX.value < -threshold) {
                translateX.value = withSpring(-maxEdge, { damping: 14, stiffness: 140 }, () => {
                    runOnJS(navigation.navigate)("Login");
                });
            } else {
                translateX.value = withSpring(0, { damping: 14, stiffness: 140 });
            }
        });
    
    // Animated styles
    const badgeAnim = useAnimatedStyle(() => {
        const scale = 1 + Math.abs(translateX.value) / (maxEdge || 1) * 0.05;
        return {
            transform: [{ translateX: translateX.value }, { scale }],
            shadowOpacity: 0.05 + Math.abs(translateX.value) / (maxEdge || 1) * 0.3,
        };
    });

    // Glow effect for left chip
    const leftGlow = useAnimatedStyle(() => ({
        opacity: interpolate(
            translateX.value,
            [-maxEdge, -maxEdge * 0.4, -maxEdge * 0.15, 0],
            [1, 0.85, 0.4, 0],
            Extrapolate.CLAMP
        ),
    }));

    // Glow effect for right chip
    const rightGlow = useAnimatedStyle(() => ({
        opacity: interpolate(
            translateX.value,
            [maxEdge * 0.15, maxEdge * 0.4, maxEdge],
            [0, 0.4, 0.85, 1],
            Extrapolate.CLAMP
        ),
    }));


    return (
        <ImageBackground
            source={require('../assets/Welcome/WelcomeBg.png')}
            style={styles.container}
            resizeMode="contain"
        >
            <StatusBar style="light" />

            <SafeAreaView style={styles.overlay}>

                {/* Logo */}
                <Logo width={250} height={250} style={{ marginTop: -300 }}/>

                {/* Slider */}
                <View style={styles.pill} onLayout={(e) => setPillWidth(e.nativeEvent.layout.width)}>

                    <View style={styles.sideChip}>
                        <Animated.View
                            pointerEvents="none"
                            style={[StyleSheet.absoluteFillObject, styles.chipGradientWrap, leftGlow]}
                        >
                        <LinearGradient
                            colors={["#2651E0", "#5BDADE"]}
                            start={{ x: 0, y: 1 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFillObject}
                        />
                        </Animated.View>
                        <Text style={styles.sideText}>Log In</Text>
                    </View>

                    <GestureDetector gesture={gesture}>
                        <Animated.View style={[styles.centerBadge, badgeAnim]}>
                            <Image source={CenterLogo} style={{ width: 50, height: 50, marginLeft: 2 }} />
                        </Animated.View>
                    </GestureDetector>

                    <View style={styles.sideChip}>
                        <Animated.View
                            pointerEvents="none"
                            style={[StyleSheet.absoluteFillObject, styles.chipGradientWrap, rightGlow]}
                        >
                        <LinearGradient
                            colors={["#2651E0", "#5BDADE"]}
                            start={{ x: 0, y: 1 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFillObject}
                        />
                        </Animated.View>
                        <Text style={styles.sideText}>Sign Up</Text>
                    </View>
                </View>

                {/* Hint text */}
                <Text style={styles.hint}>
                    Swipe To Choose
                </Text>
            </SafeAreaView>
        </ImageBackground>
    );
}

export default WelcomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        gap: 16,
    },
    pill: {
        position: "absolute",
        backgroundColor: "#2C2C2C",
        bottom: 90,
        left: 30,
        right: 30,
        height: 80,
        borderRadius: 45,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    sideChip: {
        width: 120,
        height: 80,
        borderRadius: 45,
        backgroundColor: "#1c1c1c",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(91, 218, 222, 0.5)",
        overflow: "hidden", 
    },
    chipGradientWrap: {
        borderRadius: 36,
    },
    sideText: {
        color: "#E8F0FF",
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: 0.2,
        fontFamily: "SamsungSansMedium",
    },
    centerBadge: {
        position: "absolute",
        zIndex: 2,           
        width: 70,
        height: 70,
        borderRadius: 50,
        left: "50%",
        marginLeft: -35,    
        backgroundColor: "#1C1C1C",
        alignItems: "center",
        justifyContent: "center",
    },
    hint: {
        position: "absolute",
        bottom: 60,
        color: "rgba(232, 240, 255, 0.8)",
        fontSize: 12,
        letterSpacing: 0.8,
    },
});
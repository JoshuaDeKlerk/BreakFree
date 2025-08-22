import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

// Hold to press props
type HoldPillProps = {
    label: string;
    onConfirm: () => void;
    durationMs?: number;
    variant?: "primary" | "secondary";
};

export const HoldPill = ({ label, onConfirm, durationMs = 800, variant = "primary" }: HoldPillProps) => {
    const progress = useSharedValue(0);
    const isMounted = useRef(true);

    // Cleanup on unmount
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

const styles = StyleSheet.create({
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
});
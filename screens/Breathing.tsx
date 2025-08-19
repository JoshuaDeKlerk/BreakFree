import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { cancelAnimation, interpolateColor, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";

type Phase = "Ready" | "Inhale" | "Hold" | "Exhale";

// How long each phase takes
const INHALE_MS = 4000;
const HOLD_MS = 4000;
const EXHALE_MS = 4000;

// Amount of repeats
const CYCLES = 3;

// Color of each phase
const PHASE_COLORS = ["#43d0a6", "#3b82f6", "#8b5cf6", "#14b8a6"];

export default function BreathingExercise() {
    const scale = useSharedValue(1);
    const colorStage = useSharedValue(0);
    const running = useSharedValue(0);

    // Starts the breathing animation
    const startWorklet = () => {
        "worklet";
        if (running.value) return;
        running.value = 1;

        // Reset values
        scale.value = withTiming(1, { duration: 0 });
        colorStage.value = withTiming(0, { duration: 0 });

        // Scale animation
        scale.value = withRepeat(
            withSequence(
            withTiming(1.9, { duration: INHALE_MS }),
            withDelay(HOLD_MS, withTiming(1, { duration: EXHALE_MS })) 
        ),
        CYCLES,
        false,
            (finished) => {
                // Return to initial state when finished
                if (finished) {
                    running.value = 0;
                    colorStage.value = withTiming(0, { duration: 200 });
                    scale.value = withTiming(1, { duration: 220 });
                }
            }
        );

        // Color animation
        const oneColorCycle = withSequence(
            withTiming(1, { duration: 200 }),
            withDelay(INHALE_MS, withTiming(2, { duration: 200 })),
            withDelay(HOLD_MS, withTiming(3, { duration: 200 })),
            withDelay(EXHALE_MS, withTiming(0, { duration: 200 }))
        );

        colorStage.value = withRepeat(oneColorCycle, CYCLES, false);
    };

    // Stops the breathing animation
    const stopWorklet = () => {
        "worklet";
        running.value = 0;
        cancelAnimation(scale);
        cancelAnimation(colorStage);
        colorStage.value = withTiming(0, { duration: 200 });
        scale.value = withTiming(1, { duration: 220 });
    };

    // Cleanup
    useEffect(() => {
        return () => {
            cancelAnimation(scale);
            cancelAnimation(colorStage);
        };
    }, []);

    // Animated style for react reanimated
    const animatedStyle = useAnimatedStyle(() => {
        const bg = interpolateColor(colorStage.value, [0, 1, 2, 3], PHASE_COLORS);
        return {
            backgroundColor: bg,
            transform: [{ scale: scale.value }],
        };
    });

    // Long press gesture
    const longPress = Gesture.LongPress()
        .minDuration(500)
        .maxDistance(30)
        .hitSlop(20)
        .shouldCancelWhenOutside(false)
        .onBegin(() => {
        scale.value = withTiming(1.05, { duration: 120 });
        })
        .onEnd((_e, success) => {
        if (success) {
            startWorklet();
        }
        })
        .onFinalize(() => {
        if (!running.value) {
            scale.value = withTiming(1, { duration: 120 });
            colorStage.value = withTiming(0, { duration: 120 });
        }
        });

    return (
        <View style={styles.container}>
            <GestureDetector gesture={longPress}>
                <Animated.View style={[styles.circle, animatedStyle]} accessible accessibilityRole="image" accessibilityLabel="Breathing guide. Long press and hold to begin."/>
            </GestureDetector>
            <Text style={styles.label}>
                Press & hold
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
    },
    circle: { 
        width: 180, 
        height: 180, 
        borderRadius: 90 
    },
    label: { 
        marginTop: 20, 
        color: "black", 
        fontSize: 16, 
        opacity: 0.9, 
        paddingHorizontal: 16, 
        textAlign: "center" 
    },
});

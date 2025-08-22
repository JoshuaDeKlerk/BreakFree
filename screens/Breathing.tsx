import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector, Pressable } from "react-native-gesture-handler";
import Animated, { cancelAnimation, Extrapolate, interpolate, interpolateColor, runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming, runOnUI } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

type Phase = "Ready" | "Inhale" | "Hold" | "Exhale";

// How long each phase takes
const INHALE_MS = 4000;
const HOLD_MS = 4000;
const EXHALE_MS = 4000;
// Amount of repeats
const CYCLES = 3;

// Visual tuning
const SIZE = 200;
const PRESS_SCALE = 1.03;  
const INHALE_SCALE = 1.25;

// Aura range
const AURA_MIN = 1.06;
const AURA_MAX = 1.2;

// Color of each phase
const PHASE_COLORS = ["#43d0a6", "#3b82f6", "#8b5cf6", "#14b8a6"];

export default function BreathingExercise() {
    const scale = useSharedValue(1);
    const colorStage = useSharedValue(0);
    const running = useSharedValue(0);
    const aura = useSharedValue(0);

    const [phase, setPhase] = useState<Phase>("Ready");

    useAnimatedReaction(
        () => {
            const v = colorStage.value;
            const next: Phase = v < 0.5 ? "Ready" : v < 1.5 ? "Inhale" : v < 2.5 ? "Hold" : "Exhale";
            return next;
        },
        (next, prev) => {
            "worklet";
            if (next !== prev) runOnJS(setPhase)(next);
        }
    );

    // Starts the breathing animation
    const startWorklet = () => {
        "worklet";
        if (running.value) return;
        running.value = 1;

        // Reset values
        scale.value = withTiming(1, { duration: 0 });
        colorStage.value = withTiming(0, { duration: 0 });
        aura.value = withTiming(0, { duration: 0 });

        // Scale animation
        scale.value = withRepeat(
            withSequence(
                withTiming(INHALE_SCALE, { duration: INHALE_MS }),
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
                    aura.value = withTiming(0, { duration: 200 });
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

        // gentle aura pulse while running
        aura.value = withRepeat(
        withSequence(
            withTiming(1, { duration: 1200 }),
            withTiming(0.2, { duration: 1200 })
        ),
        -1,
        true
        );
    };

    // Stops the breathing animation
    const stopWorklet = () => {
        "worklet";
        running.value = 0;
        cancelAnimation(scale);
        cancelAnimation(colorStage);
        cancelAnimation(aura);
        colorStage.value = withTiming(0, { duration: 200 });
        scale.value = withTiming(1, { duration: 220 });
        aura.value = withTiming(0, { duration: 200 });
    };

    // Cleanup
    useEffect(() => {
        return () => {
            cancelAnimation(scale);
            cancelAnimation(colorStage);
            cancelAnimation(aura);
        };
    }, []);

    // Haptics (JS timers aligned to phase starts)
    const fireHaptics = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        let t = 0;
        const bumps: number[] = [];
        for (let i = 0; i < CYCLES; i++) {
            // Inhale start
            bumps.push(t);
            t += INHALE_MS;
            // Hold start
            bumps.push(t);
            t += HOLD_MS;
            // Exhale start
            bumps.push(t);
            t += EXHALE_MS;
        }
        const timers = bumps.map((ms, idx) =>
            setTimeout(() => {
                Haptics.impactAsync(
                    idx % 3 === 0
                    ? Haptics.ImpactFeedbackStyle.Medium // Inhale
                    : idx % 3 === 1
                    ? Haptics.ImpactFeedbackStyle.Light // Hold
                    : Haptics.ImpactFeedbackStyle.Soft // Exhale
                );
            }, ms)
        );
        setTimeout(() => timers.forEach(clearTimeout), t + 50);
    };

    // Long press gesture
    const longPress = Gesture.LongPress()
        .minDuration(500)
        .maxDistance(30)
        .hitSlop(20)
        .shouldCancelWhenOutside(false)
        .onBegin(() => {
            scale.value = withTiming(PRESS_SCALE, { duration: 120 });
        })
        .onEnd((_e, success) => {
            if (success) {
                startWorklet();
                runOnJS(fireHaptics)();   
            }
        })
        .onFinalize(() => {
            if (!running.value) {
                scale.value = withTiming(1, { duration: 120 });
                colorStage.value = withTiming(0, { duration: 120 });
                aura.value = withTiming(0, { duration: 120 });
            }
        });

    // --- Animated styles
    const ballStyle = useAnimatedStyle(() => {
        const bg = interpolateColor(colorStage.value, [0, 1, 2, 3], PHASE_COLORS);
        return {
            backgroundColor: bg,
            transform: [{ scale: scale.value }],
        };
    });

    const auraStyle = useAnimatedStyle(() => ({
        opacity: interpolate(aura.value, [0, 1], [0.15, 0.5], Extrapolate.CLAMP),
        transform: [{ scale: interpolate(aura.value, [0, 1], [AURA_MIN, AURA_MAX]) }],
    }));

    // Phase chip opacities
    const inhaleStyle = useAnimatedStyle(() => ({
        opacity: interpolate(colorStage.value, [0, 1, 2], [0.25, 1, 0.25], Extrapolate.CLAMP),
    }));
    const holdStyle = useAnimatedStyle(() => ({
        opacity: interpolate(colorStage.value, [1, 2, 3], [0.25, 1, 0.25], Extrapolate.CLAMP),
    }));
    const exhaleStyle = useAnimatedStyle(() => ({
        opacity: interpolate(colorStage.value, [2, 3, 0], [0.25, 1, 0.25], Extrapolate.CLAMP),
    }));

    return (
        <View style={styles.safe}>
            <View style={styles.container}>
                {/* Card frame */}
                <View style={styles.card}>
                    {/* Breathing circle */}
                    <GestureDetector gesture={longPress}>
                        <View style={styles.pad}>
                        {/* Glow aura */}
                        <Animated.View style={[styles.circle, styles.aura, auraStyle]}>
                            <LinearGradient
                            colors={["#2651E0", "#5BDADE"]}
                            start={{ x: 0, y: 1 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFillObject}
                            />
                        </Animated.View>

                        {/* Core ball */}
                        <Animated.View
                            style={[styles.circle, ballStyle]}
                            accessible
                            accessibilityRole="image"
                            accessibilityLabel="Breathing guide. Long press and hold to begin."
                        />
                        </View>
                    </GestureDetector>

                    {/* Phase chips */}
                    <View style={styles.chipsRow}>
                        <Animated.Text style={[styles.chip, inhaleStyle]}>Inhale</Animated.Text>
                        <Animated.Text style={[styles.chip, holdStyle]}>Hold</Animated.Text>
                        <Animated.Text style={[styles.chip, exhaleStyle]}>Exhale</Animated.Text>
                    </View>

                    {/* Hint */}
                    <Text style={styles.hint}>Press & hold to begin. {CYCLES} cycles · {INHALE_MS/1000}/{HOLD_MS/1000}/{EXHALE_MS/1000}s</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { 
        flex: 1, 
        backgroundColor: "#1C1C1C",
    },
    container: { 
        flex: 1, 
        padding: 20, 
        justifyContent: "center" 
    },
    card: {
        paddingVertical: 22,
        paddingHorizontal: 16,
        alignItems: "center",
    },
    pad: { 
        alignItems: "center", 
        justifyContent: "center", 
        paddingVertical: 12 
    },
    circle: { width: SIZE, 
        height: SIZE, 
        borderRadius: SIZE / 2 
    },
    aura: {
        position: "absolute",
        overflow: "hidden", 
    },
    chipsRow: { 
        flexDirection: "row", 
        gap: 12, 
        marginTop: 50 
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "#2C2C2C",
        borderWidth: 1,
        borderColor: "rgba(91,218,222,0.25)",
        color: "#E8F0FF",
        fontSize: 12.5,
        letterSpacing: 0.3,
    },
    hint: {
        marginTop: 14,
        fontSize: 12,
        color: "rgba(232,240,255,0.7)",
        letterSpacing: 0.3,
        textAlign: "center",
    },
});

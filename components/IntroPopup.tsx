import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Extrapolate, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useEffect } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Props for the slider
type Props = {
    visible: boolean;
    title? : string;
    message? : string;
    onConfirm: () => Promise<void> | void;
    onRequestClose?: () => void;
    confirmHint?: string;
    disableBackdropDismiss?: boolean;
    loading?: boolean;
    onBeginClock?: (startedMs: number) => void;
};

const TRACK_WIDTH = 250;
const KNOB_SIZE = 44;
const PADDING = 6;
const THRESHOLD = 0.8;

// Values for the slider
const IntroPopup: React.FC<Props> = ({
    visible,
    title = "Ready to start your journey?",
    message = "Addictions are hard to break. It won’t be easy—but you’re not alone.",
    onConfirm,
    onRequestClose,
    confirmHint = "Swipe to begin",
    disableBackdropDismiss = true,
    loading = false,
    onBeginClock,
}) => {
    
    const x = useSharedValue(0);
    const confirmed = useSharedValue(false);

    const maxX = TRACK_WIDTH - KNOB_SIZE - PADDING * 2;

    // When slider is to the right function should run
    const handleConfirm = async () => {
        try {
            onBeginClock?.(Date.now());
            await onConfirm();
        } finally {
            x.value = 0;
            confirmed.value = false;
        }
    };

    // Slider functionality
    const pan = Gesture.Pan()
        .enabled(!loading)
        .onChange((e) => {
            if (confirmed.value) return;
            x.value = Math.max(0, Math.min(x.value + e.changeX, maxX));
        })
        .onEnd(() => {
        if (confirmed.value) return;
        const progress = x.value / maxX;
        if (progress >= THRESHOLD) {
            confirmed.value = true;
            runOnJS(handleConfirm)();
        } else {
            x.value = withTiming(0, { duration: 180 });
        }
        });

    // Reset when reopened
    useEffect(() => {
        if (visible) {
            x.value = 0;
            confirmed.value = false;
        }
    }, [visible]);

    const knobStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: x.value }],
    }));

    // Fill background behind the knob
    const fillStyle = useAnimatedStyle(() => ({
        width: PADDING + KNOB_SIZE / 2 + x.value,
    }));

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Pressable
                style={styles.backdrop}
                onPress={() => {
                    if (!disableBackdropDismiss && onRequestClose) onRequestClose();
                }}
                >
                    <Pressable style={[styles.card, loading && { opacity: 0.9 }]} onPress={() => {}}>
                        <View style={styles.headerWrap}>
                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.body}>{message}</Text>
                        </View>

                        <GestureDetector gesture={pan}>
                            <View style={styles.trackContainer}>
                                {/* Gradient fill under the knob */}
                                <Animated.View style={[styles.fill, fillStyle]}>
                                    <LinearGradient
                                        colors={["#2651E0", "#5BDADE"]}
                                        start={{ x: 0, y: 1 }}
                                        end={{ x: 1, y: 0 }}
                                        style={StyleSheet.absoluteFillObject}
                                    />
                                </Animated.View>

                                {/* Hint text */}
                                <Text style={[styles.hint, loading && { opacity: 0.35 }]}>
                                    {loading ? "Please wait..." : confirmHint}
                                </Text>

                                {/* Knob */}
                                <Animated.View
                                    style={[styles.knob, knobStyle, loading && { opacity: 0.6 }]}
                                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                >
                                    {loading ? <ActivityIndicator /> : <Text style={styles.knobText}>➜</Text>}
                                </Animated.View>
                            </View>
                        </GestureDetector>
                    </Pressable>
                </Pressable>
            </GestureHandlerRootView>
        </Modal>
    );
}

export default IntroPopup

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    card: {
        width: "100%",
        borderRadius: 20,
        backgroundColor: "#1C1C1C",
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(91,218,222,0.25)",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    headerWrap: {
        marginBottom: 16,
        gap: 20,
    },
    title: {
        color: "#E8F0FF",
        fontSize: 20,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
    body: {
        color: "rgba(232,240,255,0.85)",
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },

    trackContainer: {
        width: TRACK_WIDTH,
        alignSelf: "center",
        padding: PADDING,
        borderRadius: 999,
        backgroundColor: "#2C2C2C",
        overflow: "hidden",
        justifyContent: "center",
        height: KNOB_SIZE + PADDING * 2,
        position: "relative",
        borderWidth: 1,
        borderColor: "rgba(91,218,222,0.25)",
    },
    hint: {
        position: "absolute",
        alignSelf: "center",
        fontSize: 12.5,
        letterSpacing: 0.4,
        color: "rgba(232,240,255,0.7)",
    },
    fill: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        borderRadius: 999,
    },
    knob: {
        width: KNOB_SIZE,
        height: KNOB_SIZE,
        borderRadius: KNOB_SIZE / 2,
        backgroundColor: "#1C1C1C",
        borderWidth: 1,
        borderColor: "rgba(232,240,255,0.075)",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        left: PADDING,
        top: PADDING,
    },
    knobText: {
        color: "#E8F0FF",
        fontSize: 20,
        fontWeight: "700",
    },
    smallNote: {
        marginTop: 12,
        fontSize: 12,
        color: "rgba(232,240,255,0.6)",
        textAlign: "center",
    },
});
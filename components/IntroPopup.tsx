import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useEffect } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";

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

    const fillStyle = useAnimatedStyle(() => ({
        width: PADDING + KNOB_SIZE / 2 + x.value,
    }));


    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
            <GestureHandlerRootView style={{flex: 1}}>
                <Pressable
                    style={styles.backdrop}
                    onPress={() => {
                    if (!disableBackdropDismiss && onRequestClose) onRequestClose();
                    }}
                >
                    <Pressable style={styles.card} onPress={() => {}}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.body}>{message}</Text>

                        <GestureDetector gesture={pan}>
                            <View style={styles.trackContainer}>
                                <Animated.View style={[styles.fill, fillStyle]} />
                                <Text style={styles.hint}>{loading ? "Please wait..." : confirmHint}</Text>

                                <Animated.View
                                    style={[styles.knob, knobStyle]}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    {loading ? <ActivityIndicator /> : <Text style={styles.knobText}>➜</Text>}
                                </Animated.View>
                            </View>
                        </GestureDetector>
                        
                        <Text style={styles.smallNote}>You can adjust this later in Settings.</Text>
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
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "white",
    padding: 20,
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  body: { fontSize: 14, opacity: 0.85, marginBottom: 16, lineHeight: 20 },
  trackContainer: {
    width: TRACK_WIDTH,
    alignSelf: "center",
    padding: PADDING,
    borderRadius: 999,
    backgroundColor: "#f1f1f1",
    overflow: "hidden",
    justifyContent: "center",
    height: KNOB_SIZE + PADDING * 2,
    position: "relative",
  },
  hint: {
    position: "absolute",
    alignSelf: "center",
    fontSize: 13,
    opacity: 0.6,
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#e6f7ec",
    borderRadius: 999,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
    position: "absolute",
    left: PADDING,
    top: PADDING,
  },
  knobText: { fontSize: 20, fontWeight: "700" },
  smallNote: { marginTop: 10, fontSize: 12, opacity: 0.6, textAlign: "center" },
});
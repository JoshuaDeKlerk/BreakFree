import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { goTo } from "../navigationRef";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigationState } from "@react-navigation/native";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

type NavItems = {
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon?: keyof typeof Ionicons.glyphMap;
    route: string;
};

const ITEMS: NavItems[] = [
    { name: "Home", icon: "home-outline", activeIcon: "home", route: "Home" },
    { name: "Exercise", icon: "barbell-outline", activeIcon: "barbell", route: "Exercise" },
    { name: "Logs", icon: "document-text-outline", activeIcon: "document-text", route: "Logs" },
    { name: "Profile", icon: "person-outline", activeIcon: "person", route: "Profile" },
]

function useCurrentRouteName() {
    const rootState = useNavigationState((state) => state);
    const getLeaf = (s: any): string | null => {
        if (!s) return null;
        let cur = s;
        while (cur?.routes?.length) {
            const r = cur.routes[cur.index ?? 0];
            if (!r?.state) return r?.name ?? null;
            cur = r.state;
        }
        return null;
    };
    return getLeaf(rootState);
}

const BottomNavBar = () => {
    const insets = useSafeAreaInsets();
    const current = useCurrentRouteName();

    return (
        <View style={[ styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) } ]}>
            {/* thin cyan accent line at the top */}
            <LinearGradient
                colors={["rgba(91,218,222,0.45)", "rgba(91,218,222,0)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.topAccent}
            />

            <View style={styles.row}>
                {ITEMS.map((item) => {
                    const progress = useSharedValue(0);
                    const isActive = current === item.route;
                    const onSuccess = (route: string) => goTo(route);

                    const gesture = Gesture.LongPress()
                        .runOnJS(true)
                        .onStart(() => {
                        progress.value = withTiming(1, { duration: 600 });
                        })
                        .onEnd((_e, success) => {
                        progress.value = withTiming(0, { duration: 180 });
                        if (success) runOnJS(onSuccess)(item.route);
                        });

                    const glowStyle = useAnimatedStyle(() => ({
                        opacity: isActive
                        ? 0.9
                        : interpolate(progress.value, [0, 1], [0, 0.85]),
                        transform: [
                        {
                            scale: isActive
                            ? 1.08
                            : interpolate(progress.value, [0, 1], [0.9, 1.1]),
                        },
                        ],
                    }));


                    const itemStyle = useAnimatedStyle(() => ({
                        transform: [{ scale: withTiming(isActive ? 1.06 : progress.value ? 1.08 : 1) }],
                        opacity: withTiming(progress.value ? 0.9 : 1),
                    }));


                    const iconStyle = useAnimatedStyle(() => ({
                        opacity: withTiming(progress.value ? 1 : 0.9),
                    }));

                    return (
                        <GestureDetector key={item.name} gesture={gesture}>
                            <Animated.View style={[styles.item, itemStyle]}>
                                {/* soft gradient glow */}
                                <Animated.View style={[StyleSheet.absoluteFill, styles.glowWrap, glowStyle]}>
                                    <LinearGradient
                                        colors={["#2651E0", "#5BDADE"]}
                                        start={{ x: 0, y: 1 }}
                                        end={{ x: 1, y: 0 }}
                                        style={StyleSheet.absoluteFill}
                                    />
                                </Animated.View>

                                <Animated.View style={iconStyle}>
                                    <Ionicons name={item.icon} size={26} color="#E8F0FF" />
                                </Animated.View>
                                <Text style={styles.label}>{item.name}</Text>
                            </Animated.View>
                        </GestureDetector>
                    );
                })}
            </View>
        </View>
    );
};

export default BottomNavBar;

const styles = StyleSheet.create({
    wrap: {
        backgroundColor: "#1C1C1C",
        borderTopWidth: 1,
        borderTopColor: "rgba(91,218,222,0.25)",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: -6 },
        elevation: 12,
    },
    topAccent: {
        height: 2,
        opacity: 0.7,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingTop: 12,
        paddingHorizontal: 10,
    },
    item: {
        width: 80,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2C2C2C",
        borderWidth: 1,
        borderColor: "rgba(91,218,222,0.25)",
        overflow: "hidden",
    },
    glowWrap: {
        borderRadius: 28,
        opacity: 0,
    },
    label: {
        marginTop: 4,
        fontSize: 11.5,
        color: "#E8F0FF",
        letterSpacing: 0.3,
    },
});

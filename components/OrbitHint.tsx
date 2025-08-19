import React from "react";
import { StyleSheet, Text, View } from "react-native";

// All the swipe directions
export type HintDir = "up" | "down" | "left" | "right" | null;

type Props = {
    active: HintDir;
    dim?: number;
    bright?: number;
    inset?: number;
};

const OrbitHint: React.FC<Props> = ({ active, dim = 0.35, bright = 0.9, inset = 24}) => {
    const alpha = (d: Exclude<HintDir, null>) => (active === d ? bright : dim);
  return (
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>

            <View style={[styles.upWrap, { top: inset }]}>
                <View style={[styles.tag, { opacity: alpha("up") }]}>
                    <Text style={styles.txt}>Profile ↑</Text>
                </View>
            </View>

            <View style={[styles.rightWrap, { right: inset }]}>
                <View style={[styles.tag, { opacity: alpha("right") }]}>
                    <Text style={styles.txt}>Logs →</Text>
                </View>
            </View>

            <View style={[styles.downWrap, { bottom: inset }]}>
                <View style={[styles.tag, { opacity: alpha("down") }]}>
                    <Text style={styles.txt}>Back ↓</Text>
                </View>
            </View>

            <View style={[styles.leftWrap, { left: inset }]}>
                <View style={[styles.tag, { opacity: alpha("left") }]}>
                    <Text style={styles.txt}>← Exercise</Text>
                </View>
            </View>
        </View>
  );
}

export default OrbitHint

const styles = StyleSheet.create({
    upWrap: { 
        position: "absolute", 
        left: 0, 
        right: 0, 
        alignItems: "center" 
    },
    rightWrap: { 
        position: "absolute", 
        top: 0, 
        bottom: 0, 
        justifyContent: "center", 
        alignItems: "flex-end" 
    },
    downWrap: { 
        position: "absolute", 
        left: 0, 
        right: 0, 
        alignItems: "center" 
    },
    leftWrap: { 
        position: "absolute", 
        top: 0, bottom: 0, 
        justifyContent: "center", 
        alignItems: "flex-start" 
    },
    tag: {
        backgroundColor: "rgba(0,0,0,0.08)",
        position: "absolute",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        minWidth: 80,    
    },
    txt: { 
        fontSize: 12, 
        color: "#000",
        textAlign: "center"
    },
});
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
     const α = (d: Exclude<HintDir, null>) => (active === d ? bright : dim);

    return (
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
            {/* Donut ring */}
            <View style={styles.ringWrap}>
                <View style={styles.ring} />

                {/* Diagonal dividers (X) */}
                <View style={styles.ringClip}>
                    <View style={[styles.divider, { transform: [{ rotate: "45deg" }] }]} />
                    <View style={[styles.divider, { transform: [{ rotate: "-45deg" }] }]} />
                </View>

                {/* Inner cutout */}
                <View style={styles.cutout} />

                {/* Labels */}
                <View style={[styles.topLabel, { top: inset }]}>
                    <Text style={[styles.lblText, { opacity: α("up") }]}>Profile</Text>
                </View>

                <View style={[styles.rightLabel, { right: inset }]}>
                    <Text style={[styles.lblTextVert, { opacity: α("right") }]}>Logs</Text>
                </View>

                <View style={[styles.bottomLabel, { bottom: inset }]}>
                    <Text style={[styles.lblText, { opacity: α("down") }]}>Back</Text>
                </View>

                <View style={[styles.leftLabel, { left: inset }]}>
                    <Text style={[styles.lblTextVert, { opacity: α("left") }]}>Exercise</Text>
                </View>
            </View>
        </View>
    );
}

export default OrbitHint

const RING_BG = "#2E2E2E";    
const CUTOUT_BG = "#1A1A1A";  
const DIVIDER = "#1F1F1F";       
const TEXT = "#E8F0FF";

const styles = StyleSheet.create({
    ringWrap: {
        position: "absolute",
        alignSelf: "center",
        top: 0,
        bottom: 0,
        justifyContent: "center",
        aspectRatio: 1,
    },
    ring: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: RING_BG,
        borderRadius: 9999,
        opacity: 0.9,
    },
    ringClip: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 9999,
        overflow: "hidden", 
    },
    divider: {
        position: "absolute",
        left: "50%",
        top: "-10%",
        width: 5,            
        height: "120%",  
        marginLeft: -2.5,
        backgroundColor: DIVIDER,
        opacity: 0.9,
        borderRadius: 5,
    },
    cutout: {
        position: "absolute",
        alignSelf: "center",
        width: "56%",   
        aspectRatio: 1,
        borderRadius: 9999,
        backgroundColor: CUTOUT_BG,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    topLabel:   { position: "absolute", left: 0, right: 0, alignItems: "center" },
    rightLabel: { position: "absolute", top: 0, bottom: 0, justifyContent: "center", alignItems: "flex-end" },
    bottomLabel:{ position: "absolute", left: 0, right: 0, alignItems: "center" },
    leftLabel:  { position: "absolute", top: 0, bottom: 0, justifyContent: "center", alignItems: "flex-start" },
    lblText: {
        color: TEXT,
        fontSize: 14,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    lblTextVert: {
        color: TEXT,
        fontSize: 14,
        fontWeight: "700",
        letterSpacing: 0.2,
        transform: [{ rotate: "90deg" }],
    },
});
import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";
import { addManualSpend, setCostPerWeek } from "../services/userServices";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const MoneySavedPopup: React.FC<Props> = ({ visible, onClose }) => {
  const { user } = useAuth();
  const [weekly, setWeekly] = useState<string>("");
  const [spent, setSpent] = useState<string>("");

  useEffect(() => {
    if (!visible) {
      setWeekly("");
      setSpent("");
    }
  }, [visible]);

  const onSaveWeekly = async () => {
    const v = Number(weekly.replace(/,/g, "."));
    if (!user?.uid || !Number.isFinite(v) || v < 0) return;
    await setCostPerWeek(user.uid, v);
    onClose();
  };

  const onAddSpent = async () => {
    const v = Number(spent.replace(/,/g, "."));
    if (!user?.uid || !Number.isFinite(v) || v <= 0) return;
    await addManualSpend(user.uid, v);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={styles.backdrop}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.card}>
          <Text style={styles.title}>Money Settings</Text>

          <View style={styles.block}>
            <Text style={styles.label}>How much do you spend on vaping per week?</Text>
            <TextInput
              value={weekly}
              onChangeText={setWeekly}
              placeholder="e.g. 250"
              placeholderTextColor="rgba(232,240,255,0.4)"
              keyboardType="numeric"
              style={styles.input}
            />
            <Pressable onPress={onSaveWeekly} style={styles.btn}>
              <LinearGradient colors={["#2651E0", "#5BDADE"]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={styles.btnGrad}>
                <Text style={styles.btnTxt}>Save Weekly Amount</Text>
              </LinearGradient>
            </Pressable>
          </View>

          <View style={styles.sep} />

          <View style={styles.block}>
            <Text style={styles.label}>Did you spend anything this week? Enter amount to subtract.</Text>
            <TextInput
              value={spent}
              onChangeText={setSpent}
              placeholder="e.g. 60"
              placeholderTextColor="rgba(232,240,255,0.4)"
              keyboardType="numeric"
              style={styles.input}
            />
            <Pressable onPress={onAddSpent} style={styles.btn}>
              <LinearGradient colors={["#F59E0B", "#EF4444"]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={styles.btnGrad}>
                <Text style={styles.btnTxt}>Add Spend</Text>
              </LinearGradient>
            </Pressable>
          </View>

          <Pressable onPress={onClose} style={styles.dismiss}>
            <Text style={styles.dismissTxt}>Close</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default MoneySavedPopup;

const BG = "#1C1C1C";
const TEXT_PRIMARY = "#E8F0FF";
const TEXT_SECONDARY = "rgba(232,240,255,0.75)";
const CARD_BORDER = "rgba(91,218,222,0.25)";

const styles = StyleSheet.create({
    backdrop: { 
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
        alignItems: "center",
        justifyContent: "center",
    },
    card: {
        width: "90%",
        maxWidth: 420,
        borderRadius: 20,
        backgroundColor: BG,
        padding: 20,
        gap: 18,
        borderWidth: 1,
        borderColor: CARD_BORDER,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
        margin: 30,
    },
    title: { 
        color: TEXT_PRIMARY, 
        fontSize: 20, 
        fontWeight: "800", 
        letterSpacing: 0.3,
        textAlign: "center",
        marginBottom: 4,
    },
    block: { 
        gap: 12,
    },
    label: { 
        color: TEXT_SECONDARY, 
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "500"
    },
    input: {
        borderWidth: 1,
        borderColor: "rgba(232,240,255,0.15)",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: TEXT_PRIMARY,
        fontSize: 16,
        backgroundColor: "#0F0F0F",
    },
    btn: { 
        overflow: "hidden", 
        borderRadius: 999, 
        alignSelf: "flex-start"
    },
    btnGrad: { 
        borderRadius: 999, 
        paddingVertical: 12, 
        paddingHorizontal: 18, 
        alignItems: "center", 
        justifyContent: "center" 
    },
    btnTxt: { 
        color: TEXT_PRIMARY, 
        fontWeight: "800", 
        letterSpacing: 0.4, 
        fontSize: 14.5,
        textTransform: "uppercase"
    },
    sep: { 
        height: 1, 
        backgroundColor: "rgba(232,240,255,0.08)",
        marginVertical: 2
    },
    dismiss: { 
        alignSelf: "center", 
        paddingVertical: 8, 
        paddingHorizontal: 12 
    },
    dismissTxt: { 
        color: "rgba(232,240,255,0.7)", 
        fontSize: 13,
        fontWeight: "600"
    },
});

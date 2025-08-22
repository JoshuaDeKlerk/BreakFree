import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

// Database imports
import { db } from "../firebase";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { createUserDoc } from "../services/userServices";
import { useAuth } from "../context/AuthContext";

// Component imports
import RadialTimer from "../components/RadialTimer";
import IntroPopup from "../components/IntroPopup";
import VoiceJournalCard from "../components/VoiceJournalCard";
import MoneySavedCard from "../components/MoneySavedCard";
import StreakCard from "../components/StreakCard";
import OrbitHint, { HintDir } from "../components/OrbitHint";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import MoneySavedPopup from "./MoneySavedPopup";

type Dir = "up" | "down" | "left" | "right" | null;
type SolidDir = "up" | "down" | "left" | "right";

const Home = () => {

  const [showIntro, setShowIntro] = useState(false);
  const [showVoiceCard, setShowVoiceCard] = useState(false);
  const [showMoneyPopup, setShowMoneyPopup] = useState(false);
  const [lastIncidentMs, setLastIncidentMs] = useState<number | null>(null);
  const [active, setActive] = useState<HintDir>(null);

  // Auth Context
  const { user, loading } = useAuth();

  // React Navigation
  const navigation = useNavigation<any>();


  useEffect(() =>{
    let cancelled = false;

    // checks user id through auth context
    const checkOnBoarding = async () => {
      if (loading) return;
      if (!user?.uid) {
        if (!cancelled) setShowIntro(false);
        return;
      }

      // Gets the user id
      const snap = await getDoc(doc(db, "users", user.uid));
      const done = snap.exists() && snap.data()?.onboardingCompleted === true;
      if (!cancelled) setShowIntro(!done);
    };

    checkOnBoarding();
    return () => {cancelled = true;};
  }, [user, loading]);

    const handleConfirmIntro = async () => {
    if (!user?.uid) return;

    // Creates user if there is no user
    await createUserDoc(user.uid); 
    
    const now = Date.now();
    setLastIncidentMs(now);

    await updateDoc(doc(db, "users", user.uid), {
      lastIncident: serverTimestamp(),
    });      

    setShowIntro(false);
  };

  // Swipe distance for function
  const MIN_DIST = 70;

  // Calculate the direction of the swipe
  const computeDir = (dx: number, dy: number): Dir => {
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const inRange = (target: number, lock = 35) =>
      Math.abs(((angle - target + 180 +360) % 360) - 180) <= lock;

    if (inRange(0)) return "right";
    if (inRange(180) || inRange(-180)) return "left";
    if (inRange(90)) return "down";
    if (inRange(-90)) return "up";
    return null;
  };

  // Will use the direction to trigger a function
  const actOnDirection = (dir: SolidDir) => {
    if (dir === "right") {
      navigation.navigate("Logs");
    } else if (dir === "left") {
      navigation.navigate("Exercise");
    } else if (dir === "up") {
      navigation.navigate("Profile");
    } else if (dir === "down") {
      // placeholder;
    }
  };

  // Gesture Handler
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const d = computeDir(e.translationX, e.translationY);
      runOnJS(setActive)(d);
    })
    .onEnd((e) => {
      const dir = computeDir(e.translationX, e.translationY);
      const dist = Math.hypot(e.translationX, e.translationY);
      if (dir && dist >= MIN_DIST) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        runOnJS(actOnDirection)(dir as SolidDir);
      }
      runOnJS(setActive)(null);
    })
    .onFinalize(() => { 
      runOnJS(setActive)(null); 
    })
    .runOnJS(true);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Home</Text>
          <Text style={styles.subheading}>Swipe on the clock to navigate.</Text>
        </View>

        {/* Timer Card */}
        <GestureDetector gesture={pan}>
          <View
            style={styles.timerCard}
            accessible
            accessibilityLabel="Swipe on the clock: up to Profile, left to Exercise, right to Logs"
          >
            <RadialTimer overrideLastIncidentMs={lastIncidentMs} />
            {active && <OrbitHint active={active} />}
          </View>
        </GestureDetector>

        {/* Stats (stacked) */}
        <View style={styles.statsStack}>
          <StreakCard />
          <Pressable onPress={() => setShowMoneyPopup(true)} style={{ borderRadius: 16 }}>
            <MoneySavedCard />
          </Pressable>
        </View>

        {/* Voice Journal CTA */}
        <Pressable
          onPress={() => setShowVoiceCard(true)}
          style={styles.ctaButton}
          accessibilityRole="button"
          android_ripple={{ color: "rgba(255,255,255,0.08)", borderless: false }}
        >
          <LinearGradient
            colors={["#2651E0", "#5BDADE"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGrad}
          >
            <Text style={styles.ctaTxt}>Open Voice Journal</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Intro popup */}
      <IntroPopup
        visible={showIntro}
        onConfirm={handleConfirmIntro}
        confirmHint="Swipe to begin"
        disableBackdropDismiss={true}
      />

      {/* Voice Journal */}
      <VoiceJournalCard
        visible={showVoiceCard}
        onClose={() => setShowVoiceCard(false)}
        onSlip={() => setLastIncidentMs(Date.now())}
      />
      
      {/* Money Saved Popup */}
      <MoneySavedPopup visible={showMoneyPopup} onClose={() => setShowMoneyPopup(false)} />
    </SafeAreaView>
  );
};

export default Home;

const BG = "#1C1C1C";
const TEXT_PRIMARY = "#E8F0FF";
const TEXT_SECONDARY = "rgba(232,240,255,0.7)";


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 6,
    gap: 16,
    flex: 1,
  },
  header: { paddingTop: 6 },
  heading: {
    color: TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  subheading: {
    color: TEXT_SECONDARY,
    fontSize: 13.5,
    marginTop: 4,
  },
  timerCard: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  statsStack: {
    gap: 12, 
  },
  ctaButton: {
    overflow: "hidden",
    borderRadius: 999,
    alignSelf: "stretch",
  },
  ctaGrad: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaTxt: {
    color: TEXT_PRIMARY,
    fontWeight: "800",
    letterSpacing: 0.3,
    fontSize: 15,
  },
});

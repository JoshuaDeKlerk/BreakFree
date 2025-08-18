import { Button, StyleSheet, Text, View } from "react-native";
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

type Dir = "up" | "down" | "left" | "right" | null;
type SolidDir = "up" | "down" | "left" | "right";

const Home = () => {

  const [showIntro, setShowIntro] = useState(false);
  const [showVoiceCard, setShowVoiceCard] = useState(false);
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
      navigation.navigate("Profile");
    } else if (dir === "left") {
      navigation.navigate("Logs");
    } else if (dir === "up") {
      // empty so that user can cancel
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
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={styles.container}>
        <GestureDetector gesture={pan}>
          <View style={styles.timerBlock} accessible accessibilityLabel="Swipe right for Profile, Down To Cancel">
            {/* Radial Timer */}
            <RadialTimer overrideLastIncidentMs={lastIncidentMs}/>

            {/* Nav Overlay */}
            {active && <OrbitHint active={active} />}
          </View>
        </GestureDetector>

        {/* Stats Row */}
        <View style={styles.row}>
          {/* Money Saved Card */}
          <View style={{ flex: 1 }}>
            <MoneySavedCard />
          </View>

          {/* Streak Card */}
          <View style={{ flex: 1 }}>
            <StreakCard />
          </View>
        </View>

        {/* Voice Card */}
        <Button title="Open Voice Journal" onPress={() => setShowVoiceCard(true)} />

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
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
      padding: 20,
  },
  timerBlock: {
    width: 300,
    height: 340,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  hint: { 
    position: "absolute", 
    bottom: 0, 
    opacity: 0.6, 
    fontSize: 12 
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
  }
});

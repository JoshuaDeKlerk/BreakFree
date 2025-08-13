import { Button, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RadialTimer from "../components/RadialTimer";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { createUserDoc } from "../services/userServices";
import IntroPopup from "../components/IntroPopup";
import { useAuth } from "../context/AuthContext";
import VoiceJournalCard from "../components/VoiceJournalCard";

const Home = () => {

  const [showIntro, setShowIntro] = useState(false);
  const [showVoiceCard, setShowVoiceCard] = useState(false);
  const { user, loading } = useAuth();

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
    await createUserDoc(user.uid); // creates the user if their is no user
    setShowIntro(false);
  };


  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={styles.container}>
        <RadialTimer />

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
      <VoiceJournalCard visible={showVoiceCard} onClose={() => setShowVoiceCard(false)} />
    </SafeAreaView>
  );
}

export default Home

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },

});

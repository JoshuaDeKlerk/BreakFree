import { Button, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RadialTimer from "../components/RadialTimer";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { createUserDoc } from "../services/userServices";
import IntroPopup from "../components/IntroPopup";
import { useAuth } from "../context/AuthContext";
import VoiceJournalCard from "../components/VoiceJournalCard";
import MoneySavedCard from "../components/MoneySavedCard";
import StreakCard from "../components/StreakCard";

const Home = () => {

  const [showIntro, setShowIntro] = useState(false);
  const [showVoiceCard, setShowVoiceCard] = useState(false);
  const [lastIncidentMs, setLastIncidentMs] = useState<number | null>(null);
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

    // Creates user if there is no user
    await createUserDoc(user.uid); 
    
    const now = Date.now();
    setLastIncidentMs(now);

    await updateDoc(doc(db, "users", user.uid), {
      lastIncident: serverTimestamp(),
    });      

    setShowIntro(false);
  };


  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={styles.container}>

        {/* Radial Timer */}
        <RadialTimer overrideLastIncidentMs={lastIncidentMs}/>

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
}

export default Home

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    row: {
      flexDirection: "row",
      gap: 12,
      alignItems: "stretch",
    }
});

import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import VoiceNoteList from "../components/VoiceNoteList";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";

const CravingLog = () => {
  return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Craving Log</Text>
            <Text style={styles.subtitle}>
              Your voice notes, reflections, and moments of progress.
            </Text>
            <LinearGradient
              colors={["#2651E0", "#5BDADE"]}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.accent}
            />
          </View>

          {/* VoiceNote List */}
          <View style={styles.listWrap}>
            <VoiceNoteList contentPadding={20} initialNumToRender={12} />
          </View>
        </View>
      </SafeAreaView>
  );
}

export default CravingLog

const BG = "#1C1C1C";
const TEXT_PRIMARY = "#E8F0FF";
const TEXT_SECONDARY = "rgba(232,240,255,0.7)";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: BG,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(91,218,222,0.15)",
  },
  title: {
    color: TEXT_PRIMARY,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontSize: 13.5,
    marginTop: 6,
  },
  accent: {
    height: 3,
    width: 74,
    borderRadius: 999,
    marginTop: 12,
  },
  listWrap: {
    flex: 1,
    backgroundColor: BG,
  },
});

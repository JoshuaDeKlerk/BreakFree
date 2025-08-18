import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import VoiceNoteList from "../components/VoiceNoteList";

const CravingLog = () => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={styles.container}>
        <Text>Craving Log</Text>

        {/* VoiceNote List */}
        <VoiceNoteList/>
      </View>
    </SafeAreaView>
  );
}

export default CravingLog

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },

});

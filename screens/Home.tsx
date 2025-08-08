import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RadialTimer from "../components/RadialTimer";

const Home = () => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={styles.container}>
        <Text>Home</Text>
        <RadialTimer />
      </View>
    </SafeAreaView>
  );
}

export default Home

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },

});

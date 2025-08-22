// MainLayout.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./screens/Home";
import ProfileScreen from "./screens/ProfileScreen";
import CravingLog from "./screens/CravingLog";
import BreathingExercise from "./screens/Breathing";
import BottomNavBar from "./components/BottomNav";

const Stack = createNativeStackNavigator();

const MainLayout = () => {
  return (
    <View style={styles.wrap}>
      <View style={styles.content}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Exercise" component={BreathingExercise} />
          <Stack.Screen name="Logs" component={CravingLog} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </View>

      <BottomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#000" },
  content: { flex: 1 },
});

export default MainLayout;

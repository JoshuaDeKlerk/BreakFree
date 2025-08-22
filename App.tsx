import "react-native-gesture-handler";
import 'react-native-reanimated';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import WelcomeScreen from "./screens/Welcome";

// Auth Context
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MainLayout from "./MainLayout";
import { navRef } from "./navigationRef";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Could show a loading spinner here
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainLayout} />
        </>
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Registration" component={RegistrationScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
    return (
      <GestureHandlerRootView style={{ flex: 1}}>
        <AuthProvider>
          <NavigationContainer ref={navRef}>
            <RootNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </AuthProvider>       
      </GestureHandlerRootView>

    );
}





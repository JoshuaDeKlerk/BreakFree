import "react-native-gesture-handler";

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import Home from './screens/Home';
import ProfileScreen from "./screens/ProfileScreen";

// Auth Context
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";


const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Could show a loading spinner here
  }

  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      ) : (
        <>
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
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </AuthProvider>       
      </GestureHandlerRootView>

    );
}





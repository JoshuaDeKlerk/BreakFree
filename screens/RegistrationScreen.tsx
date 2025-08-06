import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { registerUser } from "../services/authServices";

const RegistrationScreen = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigation:any = useNavigation();

    const goToLogin = () => {
        navigation.navigate('Login');
    };

    // Register Function
    const register = () => {
        // Call the registerUser function from authServices
        registerUser(email, password);
    };
    
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={styles.container}>

        <Text style={styles.title}>Sign Up</Text>

        <TextInput
            style={styles.inputField}
            placeholder="Your Email"
            onChangeText={newText => setEmail(newText)}
            defaultValue={email}
        />

        <TextInput
            style={styles.inputField}
            placeholder="Your Password"
            onChangeText={newText => setPassword(newText)}
            defaultValue={password}
            secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={register}>
            <Text style={styles.buttonText}>Register Button</Text>
        </TouchableOpacity>

        <Pressable style={styles.LoginButton} onPress={goToLogin}>
            <Text style={styles.LoginButtonText}>Log In Instead</Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}

export default RegistrationScreen

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    inputField: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    button: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    LoginButton: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    LoginButtonText: {
        color: 'white',
        marginRight: 5,
    },
});

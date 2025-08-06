import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { getUserInfo, logoutUser, updateUserProfile } from "../services/authServices";
import { Button } from "@react-navigation/elements";
import { useState } from "react";

const Profile = () => {
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [photoURL, setPhotoURL] = useState(user?.photoURL || "");


    // handle logout
    const handleLogout = () => {
        logoutUser();
    };

    // Handle profile update
    const handleUpdateProfile = () => {
        updateUserProfile(displayName, photoURL);
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
           <View style={{padding:20}}>

                {/*Show logged in user info */}
                <Image source={{ uri: photoURL }} style={styles.avatar} />
                <Text>{getUserInfo()?.displayName}</Text>
                <Text>{getUserInfo()?.email}</Text>
                <Text>{getUserInfo()?.uid}</Text>


                {/* Update the profile display name */}
                <TextInput
                    style={styles.input}
                    placeholder="Enter new display name"
                    value={displayName}
                    onChangeText={setDisplayName}
                />

                {/* Update the profile phot URL */}
                <TextInput
                    style={styles.input}
                    placeholder="Enter new photo URL"
                    value={photoURL}
                    onChangeText={setPhotoURL}
                />

                <TouchableOpacity style={[styles.button]} onPress={handleUpdateProfile}>
                    <Text style={styles.buttonText}>Update Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, { backgroundColor: "red" }]} onPress={handleLogout}>
                    <Text style={styles.buttonText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

export default Profile

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
    }
});

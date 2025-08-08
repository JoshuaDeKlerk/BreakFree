import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut, updateProfile } from "firebase/auth";
import { auth, provider } from "../firebase";
import { getRedirectResult } from "firebase/auth";
import * as Google from 'expo-auth-session';
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";

// Register using email and password
export const registerUser = (email: string, password: string) => {
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;

        console.log("User registered", user.email)

    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log("Error Message:", errorMessage)

    });
}   

// Login using email and password
export const loginUser = (email: string, password: string) => {
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        
        console.log("User logged in:", user.email)
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log("Error Message:", errorMessage)
    });
}

// Logout Function
export const logoutUser = () => {
    signOut(auth)
    .then(() => {
        console.log("User logged out successfully");
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log("Error Message:", errorMessage)
    });
}

// User Info Function
export const getUserInfo = () => {
    const user = auth.currentUser;

   if (user !== null) {
        return {
            displayName: user.displayName || "No display name set",
            email: user.email,
            photoURL: user.photoURL || "No photo URL set",
            emailVerified: user.emailVerified,
            uid: user.uid
        };
    }
    return null;
};

// Update a User's Profile
export const updateUserProfile = (displayName: string, photoURL: string) => {
    const user = auth.currentUser;
    if (user) {
        updateProfile(user, {
            displayName: displayName,
            photoURL: photoURL?.trim() !== "" ? photoURL.trim() : undefined
        })
        .then(() => {
            console.log("Profile updated successfully");
        })
        .catch((error) => {
            console.log("Error updating profile:", error.message);
        });
    } else {
        // Handle case where user is not logged in
        console.log("No user is currently logged in.");
    }
};

// Get the current user
export const getCurrentUser = () => {
    onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        // ...
    } else {
        // User is signed out
        // ...
    }
    });
}
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCUkBo1obT5scX2ubF8ZjhCCqDsVbwB56A",
  authDomain: "breakfree-b89ff.firebaseapp.com",
  projectId: "breakfree-b89ff",
  storageBucket: "breakfree-b89ff.firebasestorage.app",
  messagingSenderId: "300111198092",
  appId: "1:300111198092:web:69ee312d57794aaf8348a9",
  measurementId: "G-ZJ3TXZHXHX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
// Google Auth Provider
export const provider = new GoogleAuthProvider();
// Initialize Firestore
export const db = getFirestore(app);

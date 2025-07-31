// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAdahyVL_vKNG6C1VGY4Joj9UcN-yNmOqc",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "helferlain-a4178.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "helferlain-a4178",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "helferlain-a4178.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "310206528843",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:310206528843:web:75b01569432e56cf92fcce",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-EB4E99V27Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
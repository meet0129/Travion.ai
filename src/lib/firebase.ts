
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';



// Firebase configuration - Replace with your actual config
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCvO2yhUnMFx4IN_lZ5wx5uhh4YU1-EmNI",
  authDomain: "travion-953d9.firebaseapp.com",
  projectId: "travion-953d9",
  storageBucket: "travion-953d9.firebasestorage.app",
  messagingSenderId: "913506073655",
  appId: "1:913506073655:web:36f7383c9cc01e0bf853b2",
  measurementId: "G-S22CVRXVRP"
};

// Initialize Firebase


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Authentication functions
export const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider);

export const signInWithEmail = (email: string, password: string) => 
  signInWithEmailAndPassword(auth, email, password);

export const createUserWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signOutUser = () => signOut(auth);

export const onAuthStateChangedListener = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

export default app;

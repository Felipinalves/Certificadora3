// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDsPOYp3CoBBf0o7oI2G0Yqpssvsr1zzew",
  authDomain: "certificadora3-f25b7.firebaseapp.com",
  projectId: "certificadora3-f25b7",
  storageBucket: "certificadora3-f25b7.firebasestorage.app",
  messagingSenderId: "108280779742",
  appId: "1:108280779742:web:0f1ed29799dab749e3c34f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication and Firestore services
export const auth = getAuth(app);
export const db = getFirestore(app);


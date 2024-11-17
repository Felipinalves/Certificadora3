// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";

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

// Function to fetch all users
export const getUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "usuarios"));
  const users = [];
  querySnapshot.forEach((doc) => {
    const user = doc.data();
    user.id = doc.id;
    users.push(user);
  });
  return users;
};

// Save user information in Firestore
const saveUserInformation = async (res, additionalData = {}) => {
  const userDocRef = doc(db, "usuarios", res.user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    await setDoc(userDocRef, {
      uid: res.user.uid,
      nome: res.user.displayName || additionalData.nome || "Usuário",
      email: res.user.email,
      cargo: "membro externo", // Default role
      ...additionalData,
    });
  }
};

// Get current user info
export const getCurrentUserInfo = async (uid) => {
  const userDocRef = doc(db, "usuarios", uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return userDocSnap.data();
  } else {
    console.error("Usuário não encontrado.");
    return null;
  }
};

// Update user role
export const updateUserRole = async (uid, newRole) => {
  const userDocRef = doc(db, "usuarios", uid);
  await updateDoc(userDocRef, { cargo: newRole });
};

// Email SignUp
export const signUpEmail = async (e) => {
  e.preventDefault();
  const nome = e.target[0].value;
  const email = e.target[1].value;
  const password = e.target[2].value;

  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    res.user.displayName = nome;
    await saveUserInformation(res, { nome });
  } catch (err) {
    console.error(err);
    alert("Erro ao criar conta. Tente novamente.");
  }
};

// Email SignIn
export const signInEmail = async (e) => {
  e.preventDefault();
  const email = e.target[0].value;
  const password = e.target[1].value;

  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const userInfo = await getCurrentUserInfo(res.user.uid);

    if (!userInfo) {
      // Save user information if it doesn't exist
      await saveUserInformation(res);
    }
  } catch (err) {
    console.error(err);
    alert("Erro ao fazer login. Verifique suas credenciais.");
  }
};

// Google SignIn
const provider = new GoogleAuthProvider();
export const signInGoogle = async (e) => {
  e.preventDefault();
  try {
    const res = await signInWithPopup(auth, provider);
    await saveUserInformation(res);
  } catch (err) {
    console.error(err);
    alert("Erro ao fazer login com o Google. Tente novamente.");
  }
};

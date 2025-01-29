import { auth, db } from "../firebase/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";

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
  const saveUserInformation = async (response, additionalData = {}) => {
    const user = response.user
    const userDocRef = doc(db, "usuarios", user.uid);
    const userDocSnap = await getDoc(userDocRef);
  
    if (!userDocSnap.exists()) {
        try {
            await setDoc(userDocRef, {
                uid: user.uid,
                nome: user.displayName || additionalData.nome || "Usuário",
                email: user.email,
                foto: user.photoURL || "https://cdn.quasar.dev/img/boy-avatar.png",
                cargo: "membro externo", // Default role
                ...additionalData,
            });
        } catch (err) {
            console.error("Erro ao salvar usuário:", err);
        }
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
  export const signUpEmail = async (nome, email, password) => {  
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      res.user.displayName = nome;
      await saveUserInformation(res, { nome });
    } catch (error) {
      console.error(error);
      alert("Erro ao criar conta. Tente novamente.");
    }
  };
  
  // Email SignIn
  export const signInEmail = async (email, password) => {

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const userInfo = await getCurrentUserInfo(res.user.uid);
  
      if (!userInfo) {
        // Save user information if it doesn't exist
        await saveUserInformation(res);
      }
    } catch (error) {
        throw error
    }
  };
  
  // Google SignIn
  const provider = new GoogleAuthProvider();
  export const signInGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      await saveUserInformation(res);
    } catch (error) {
        throw error
    }
  };
  
export const checkAdmin = async (user) => {
    try {
        const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
        const userData = usuariosSnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .find((u) => u.email === user.email);

        if (userData && userData.cargo === "administrador")
            return true
        else
            return false
        
    } catch (error) {
        throw error
    }
};
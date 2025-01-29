import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";

export const createProject = async (nome, descricao) => {
    try {
    await addDoc(collection(db, "projetos"), {
        nome,
        descricao,
        dataCriacao: serverTimestamp(),
      });
    } catch (error) {
        throw error
    }  
}

export const getProjects = async () => {
    try {
        const projetosSnapshot = await getDocs(collection(db, "projetos"));
        const projetosData = projetosSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return projetosData;
    } catch (error) {
        throw error
    }

}
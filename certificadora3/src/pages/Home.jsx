import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Home = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          // Salva ou atualiza os dados do usuário no Firestore
          const userDocRef = doc(db, "usuarios", currentUser.uid);
          await setDoc(
            userDocRef,
            {
              nome: currentUser.displayName || "Usuário Sem Nome",
              email: currentUser.email,
              foto: currentUser.photoURL || null, // Salva a imagem se existir
            },
            { merge: true }
          );
        } catch (err) {
          setError("Erro ao salvar os dados do usuário.");
          console.error("Erro ao salvar no Firestore:", err);
        }
      } else {
        setError("Usuário não autenticado.");
      }
    });

    return () => unsubscribe(); // Limpa o listener ao desmontar o componente
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-semibold mb-4">Bem-vindo(a)!</h1>
        <p className="text-lg text-gray-700 mb-2">
          Nome: {user.displayName || "Usuário Sem Nome"}
        </p>
        <p className="text-lg text-gray-700 mb-2">Email: {user.email}</p>
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt="Imagem do Usuário"
            className="w-24 h-24 rounded-full mx-auto mt-4"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto mt-4">
            <p className="text-gray-500">Sem Foto</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

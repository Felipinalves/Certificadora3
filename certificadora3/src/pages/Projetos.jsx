import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, doc, getDoc, getDocs, addDoc, updateDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import logo from "../images/logo.png";

const Projetos = () => {
    const { id } = useParams(); // Obtém o ID do projeto da URL
    const [projeto, setProjeto] = useState(null);
    const [ideias, setIdeias] = useState([]);
    const [novaIdeia, setNovaIdeia] = useState("");
    const [user, setUser] = useState(null);
    const [curtidas, setCurtidas] = useState([]);
  
    const auth = getAuth();
  
    // Carregar informações do projeto
    useEffect(() => {
      const fetchProjeto = async () => {
        try {
          const projetoRef = doc(db, "projetos", id);
          const projetoSnap = await getDoc(projetoRef);
  
          if (projetoSnap.exists()) {
            setProjeto(projetoSnap.data());
          } else {
            console.log("Projeto não encontrado");
          }
        } catch (error) {
          console.error("Erro ao buscar o projeto:", error);
        }
      };
  
      fetchProjeto();
    }, [id]);
  
    // Carregar ideias do projeto
    useEffect(() => {
      const fetchIdeias = async () => {
        try {
          const ideiasRef = collection(db, "projetos", id, "ideias");
          const ideiasSnap = await getDocs(ideiasRef);
  
          const ideiasData = ideiasSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setIdeias(ideiasData);
        } catch (error) {
          console.error("Erro ao buscar as ideias:", error);
        }
      };
  
      fetchIdeias();
    }, [id]);
  
    // Verificar se o usuário está logado
    useEffect(() => {
      const checkAuth = async () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
          setUser(currentUser);
          // Carregar curtidas do usuário
          const userCurtidasRef = doc(db, "usuarios", currentUser.uid);
          const userCurtidasSnap = await getDoc(userCurtidasRef);
          if (userCurtidasSnap.exists()) {
            setCurtidas(userCurtidasSnap.data().curtidas || []);
          }
        }
      };
  
      checkAuth();
    }, [auth]);
  
    // Criar nova ideia
    const handleNovaIdeia = async () => {
      if (novaIdeia.trim()) {
        try {
          const ideiasRef = collection(db, "projetos", id, "ideias");
          await addDoc(ideiasRef, {
            texto: novaIdeia,
            autor: user.email,
            curtidas: 0,
          });
          setNovaIdeia(""); // Limpar o campo de nova ideia
          alert("Ideia adicionada com sucesso!");
        } catch (error) {
          console.error("Erro ao adicionar nova ideia:", error);
        }
      }
    };
  
    // Curtir uma ideia
    const handleCurtir = async (ideiaId) => {
      if (user) {
        const novasCurtidas = [...curtidas, ideiaId];
        setCurtidas(novasCurtidas);
  
        const userRef = doc(db, "usuarios", user.uid);
        await updateDoc(userRef, {
          curtidas: novasCurtidas,
        });
  
        const ideiaRef = doc(db, "projetos", id, "ideias", ideiaId);
        const ideiaSnap = await getDoc(ideiaRef);
        const novaQtdCurtidas = ideiaSnap.data().curtidas + 1;
  
        await updateDoc(ideiaRef, {
          curtidas: novaQtdCurtidas,
        });
      }
    };
  
    return (
      <div className="bg-[#5F328D] min-h-screen text-white">
        {/* Navbar */}
        <nav className="shadow-md py-4 px-6 flex justify-between items-center" style={{ backgroundColor: "#441870" }}>
          <div className="flex items-center">
            <img src={logo} alt="Logo do Projeto" className="w-10 h-10 mr-3" />
            <h1 className="text-xl font-regular text-white" style={{ fontFamily: "Abril Fatface" }}>Banco de Ideias</h1>
          </div>
        </nav>
  
        {/* Título do Projeto */}
        {projeto && (
          <div className="text-center mt-12">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "Abril Fatface" }}>{projeto.nome}</h2>
            <p className="text-lg text-gray-200 mb-8">{projeto.descricao}</p>
          </div>
        )}
  
        {/* Sugerir uma Ideia */}
        {user && (
          <div className="text-center mt-8">
            <h3 className="text-2xl mb-4"  style={{ fontFamily: "Abril Fatface" }}>Sugerir uma Ideia</h3>
            <textarea
              className="w-3/4 md:w-1/2 p-4 text-black rounded-lg"
              placeholder="Escreva sua ideia aqui..."
              value={novaIdeia}
              onChange={(e) => setNovaIdeia(e.target.value)}
            />
            <button
              onClick={handleNovaIdeia}
              className="mt-4 bg-pink-500 text-white py-2 px-4 rounded-md"
            >
              Enviar Ideia
            </button>
          </div>
        )}
  
        {/* Ideias Existentes */}
        <div className="mt-12 px-6">
          <h3 className="text-2xl text-center mb-6"  style={{ fontFamily: "Abril Fatface" }}>Ideias para o Projeto</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ideias.map((ideia) => (
              <div key={ideia.id} className="bg-white p-4 rounded-lg shadow-md text-gray-800">
                <p>{ideia.texto}</p>
                <p className="text-sm text-gray-500 mt-2">Por: {ideia.autor}</p>
                <div className="flex justify-between items-center mt-4">
                  <span>{ideia.curtidas} Curtidas</span>
                  <button
                    onClick={() => handleCurtir(ideia.id)}
                    className={`bg-pink-500 text-white px-4 py-2 rounded-md ${curtidas.includes(ideia.id) ? "bg-gray-500" : ""}`}
                    disabled={curtidas.includes(ideia.id)}
                  >
                    {curtidas.includes(ideia.id) ? "Já Curti" : "Curtir"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

export default Projetos;
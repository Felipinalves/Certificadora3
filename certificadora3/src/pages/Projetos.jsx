import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, doc, getDoc, getDocs, addDoc, updateDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.png";

const Projetos = () => {
    const { id } = useParams(); // Obtém o ID do projeto da URL
    const [projeto, setProjeto] = useState(null);
    const [ideias, setIdeias] = useState([]);
    const [novaIdeia, setNovaIdeia] = useState('');
    const [user, setUser] = useState(null);
    const [curtidas, setCurtidas] = useState([]);
    const [menuAberto, setMenuAberto] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    
    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    const navigate = useNavigate();
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
          console.log(ideiasSnap.docs);
  
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
  
      const handleLogout = async () => {
        try {
          await signOut(auth);
          navigate("/"); // Redireciona para a página de login após logout
        } catch (error) {
          console.error("Erro ao deslogar:", error);
        }
      };

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

          // Atualizar a lista de ideias sem precisar recarregar a página
          const ideiasSnap = await getDocs(ideiasRef);
          const ideiasData = ideiasSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setIdeias(ideiasData);

          // Fechar o modal
          closeModal();
        } catch (error) {
          console.error("Erro ao adicionar nova ideia:", error);
        }
      }
    };
  
    // // Curtir uma ideia
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

    //form-ideia modal
    const Modal = ({ isOpen, onClose }) => {
      if (!isOpen) return null;
  
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl transform transition-all max-w-md w-full">
          <form>
            <div className="mb-4">
              <label htmlFor="textarea" className="block text-gray-700 text-center mt-2 mb-6">Mensagem</label>
              <textarea
                id="textarea"
                rows="4"
                value={novaIdeia}  // Bind novaIdeia state to textarea
                onChange={(e) => setNovaIdeia(e.target.value)}  // Update novaIdeia when user types
                className="w-full text-black h-40 resize-none p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="Digite sua mensagem..."
              ></textarea>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleNovaIdeia}  // Send the new idea to Firestore
                className="bg-teal-400 hover:bg-teal-500 text-white py-2 px-4 rounded-lg"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      </div>
      );
    };
  
    return (
      <div className="bg-[#5F328D] min-h-screen text-white">
        {/* Navbar */}
        <nav className="shadow-md py-4 px-6 flex justify-between items-center" style={{ backgroundColor: "#441870" }}>
          <div className="flex items-center">
            <img src={logo} alt="Logo do Projeto" className="w-10 h-10 mr-3" />
            <h1 className="text-xl font-regular text-white" style={{ fontFamily: "Abril Fatface" }}>Banco de Ideias</h1>
          </div>
          {user && (
          <div className="relative">
            <img
              src={user.photoURL || "https://via.placeholder.com/40"}
              alt="Foto do usuário"
              className="w-10 h-10 rounded-full border border-white cursor-pointer"
              onClick={() => setMenuAberto(!menuAberto)}
            />
            {menuAberto && (
              <div className="absolute right-0 mt-2 bg-white shadow-md rounded-md w-40">
                <ul>
                  <li
                    className="px-4 py-2 text-gray-800 hover:bg-gray-200 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Sair
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
        </nav>
  
        {/* Título do Projeto */}
        {projeto && (
          <div className="text-left mt-12 px-12 lg:px-24">
            <h2 className="text-2xl text-yellow-400 font-bold mb-4 font-abril" style={{ textShadow: "-2px 2px #A85750",}}>{projeto.nome}</h2>
            <div className="flex justify-center items-center lg:gap-20 gap-6 flex-wrap lg:flex-nowrap">
              <p className="text-base font-almarai text-gray-200">{projeto.descricao}</p>
              <button
                onClick={openModal}
                className="bg-emerald-500 font-almarai hover:bg-teal-500 font-bold text-white py-2 px-4 rounded-lg transition duration-300 text-nowrap"
              >
                Mande sua ideia aqui!
              </button>

              <Modal isOpen={modalOpen} onClose={closeModal} />
            </div>
          </div>
        )}
  
        {/* Ideias Existentes */}
        <div className="mt-12 px-6">
          <h3 className="text-2xl text-left mb-6"  style={{ fontFamily: "Abril Fatface" }}>Ideias para o Projeto</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ideias.map((ideia) => (
              <div key={ideia.id} className="bg-white p-4 rounded-lg shadow-md text-gray-800">
                <p>{ideia.texto}</p>
                <p className="text-sm text-gray-500 mt-2">Por: {ideia.autor}</p>
                <div className="flex justify-between items-center mt-4">
                  <button className="bg-red-400 text-white px-4 py-2 rounded-md ">Negar</button>
                  <button className="bg-yellow-400 text-white px-4 py-2 rounded-md ">Media</button>
                  <button
                    onClick={() => handleCurtir(ideia.id)}
                    className={`bg-emerald-400 text-white px-4 py-2 rounded-md ${curtidas.includes(ideia.id) ? "bg-gray-500" : ""}`}
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
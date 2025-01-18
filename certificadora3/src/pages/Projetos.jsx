import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, doc, getDoc, getDocs, addDoc, updateDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import logo from "../images/logo.png";

const Projetos = () => {
    const { id } = useParams(); // Obtém o ID do projeto da URL
    const [projeto, setProjeto] = useState(null);
    const [ideias, setIdeias] = useState([]);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [curtidas, setCurtidas] = useState([]);
    const [melhoresIdeias, setMelhoresIdeias] = useState([]);
    const [menuAberto, setMenuAberto] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    
    const [votosUsuario, setVotosUsuario] = useState({
      curtidas: [],
      negadas: [],
      medias: []
    });

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
      
      /// Verificar se o usuário é admin
      const userDoc = await getDoc(doc(db, "usuarios", currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setIsAdmin(userData.cargo === 'administrador');
        
        // Carregar votos do usuário
        setVotosUsuario({
          curtidas: userData.curtidas || [],
          negadas: userData.negadas || [],
          medias: userData.medias || []
        });
        setCurtidas(userData.curtidas || []);
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
    const handleNovaIdeia = async (texto) => {
      if (texto.trim()) {
        try {
          const ideiasRef = collection(db, "projetos", id, "ideias");
          await addDoc(ideiasRef, {
            texto: texto,
            autor: user.displayName || 'Usuário Anônimo',
            curtidas: 0,
            negadas: 0,
            medias: 0
          });
          
          // Atualizar a lista de ideias
          const ideiasSnap = await getDocs(ideiasRef);
          const ideiasData = ideiasSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setIdeias(ideiasData);
          closeModal();
        } catch (error) {
          console.error("Erro ao adicionar nova ideia:", error);
        }
      }
    };
  
const handleNegar = async (ideiaId) => {
  if (user && !votosUsuario.negadas.includes(ideiaId)) {
    try {
      const ideiaRef = doc(db, "projetos", id, "ideias", ideiaId);
      const ideiaSnap = await getDoc(ideiaRef);
      const ideiaData = ideiaSnap.data();
      
      let updateData = {};
      const userRef = doc(db, "usuarios", user.uid);
      const novosVotos = { ...votosUsuario };

      // Se tinha curtida, remove
      if (votosUsuario.curtidas.includes(ideiaId)) {
        novosVotos.curtidas = votosUsuario.curtidas.filter(id => id !== ideiaId);
        updateData.curtidas = ideiaData.curtidas - 1;
      }
      
      // Se tinha voto média, remove
      if (votosUsuario.medias.includes(ideiaId)) {
        novosVotos.medias = votosUsuario.medias.filter(id => id !== ideiaId);
        updateData.medias = ideiaData.medias - 1;
      }

      // Adiciona voto negativo
      novosVotos.negadas = [...votosUsuario.negadas, ideiaId];
      updateData.negadas = (ideiaData.negadas || 0) + 1;

      await updateDoc(ideiaRef, updateData);
      await updateDoc(userRef, novosVotos);
      setVotosUsuario(novosVotos);
      setCurtidas(novosVotos.curtidas);

      // Atualiza a lista de ideias
      await atualizarIdeias();
    } catch (error) {
      console.error("Erro ao negar ideia:", error);
    }
  }
};

const handleMedia = async (ideiaId) => {
  if (user && !votosUsuario.medias.includes(ideiaId)) {
    try {
      const ideiaRef = doc(db, "projetos", id, "ideias", ideiaId);
      const ideiaSnap = await getDoc(ideiaRef);
      const ideiaData = ideiaSnap.data();
      
      let updateData = {};
      const userRef = doc(db, "usuarios", user.uid);
      const novosVotos = { ...votosUsuario };

      // Se tinha curtida, remove
      if (votosUsuario.curtidas.includes(ideiaId)) {
        novosVotos.curtidas = votosUsuario.curtidas.filter(id => id !== ideiaId);
        updateData.curtidas = ideiaData.curtidas - 1;
      }
      
      // Se tinha voto negativo, remove
      if (votosUsuario.negadas.includes(ideiaId)) {
        novosVotos.negadas = votosUsuario.negadas.filter(id => id !== ideiaId);
        updateData.negadas = ideiaData.negadas - 1;
      }

      // Adiciona voto média
      novosVotos.medias = [...votosUsuario.medias, ideiaId];
      updateData.medias = (ideiaData.medias || 0) + 1;

      await updateDoc(ideiaRef, updateData);
      await updateDoc(userRef, novosVotos);
      setVotosUsuario(novosVotos);
      setCurtidas(novosVotos.curtidas);

      // Atualiza a lista de ideias
      await atualizarIdeias();
    } catch (error) {
      console.error("Erro ao marcar como média:", error);
    }
  }
};

const handleCurtir = async (ideiaId) => {
  if (user && !votosUsuario.curtidas.includes(ideiaId)) {
    try {
      const ideiaRef = doc(db, "projetos", id, "ideias", ideiaId);
      const ideiaSnap = await getDoc(ideiaRef);
      const ideiaData = ideiaSnap.data();
      
      let updateData = {};
      const userRef = doc(db, "usuarios", user.uid);
      const novosVotos = { ...votosUsuario };

      // Se tinha voto negativo, remove
      if (votosUsuario.negadas.includes(ideiaId)) {
        novosVotos.negadas = votosUsuario.negadas.filter(id => id !== ideiaId);
        updateData.negadas = ideiaData.negadas - 1;
      }
      
      // Se tinha voto média, remove
      if (votosUsuario.medias.includes(ideiaId)) {
        novosVotos.medias = votosUsuario.medias.filter(id => id !== ideiaId);
        updateData.medias = ideiaData.medias - 1;
      }

      // Adiciona curtida
      novosVotos.curtidas = [...votosUsuario.curtidas, ideiaId];
      updateData.curtidas = (ideiaData.curtidas || 0) + 1;

      await updateDoc(ideiaRef, updateData);
      await updateDoc(userRef, novosVotos);
      setVotosUsuario(novosVotos);
      setCurtidas(novosVotos.curtidas);

      // Atualiza a lista de ideias
      await atualizarIdeias();
    } catch (error) {
      console.error("Erro ao curtir ideia:", error);
    }
  }
};

// Função auxiliar para atualizar as ideias
const atualizarIdeias = async () => {
  const ideiasRef = collection(db, "projetos", id, "ideias");
  const ideiasSnap = await getDocs(ideiasRef);
  const ideiasData = ideiasSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  setIdeias(ideiasData);
  
  // Atualizar melhores ideias
  const melhores = ideiasData
    .sort((a, b) => (b.curtidas || 0) - (a.curtidas || 0))
    .slice(0, 5);
  setMelhoresIdeias(melhores);
};

    useEffect(() => {
      const fetchMelhoresIdeias = async () => {
        try {
          const ideiasRef = collection(db, "projetos", id, "ideias");
          const ideiasSnap = await getDocs(ideiasRef);
          const todasIdeias = ideiasSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Ordenar por curtidas e pegar as 5 melhores
          const melhores = todasIdeias
            .sort((a, b) => (b.curtidas || 0) - (a.curtidas || 0))
            .slice(0, 5);
          
          setMelhoresIdeias(melhores);
        } catch (error) {
          console.error("Erro ao buscar melhores ideias:", error);
        }
      };
    
      fetchMelhoresIdeias();
    }, [id, ideias]);

    //form-ideia modal
    const Modal = ({ isOpen, onClose }) => {


      // Criar um estado local para o texto
      const [textoIdeia, setTextoIdeia] = useState('');
  
      // Função para lidar com o envio
      const handleEnviar = () => {
        handleNovaIdeia(textoIdeia); // Passa o texto para a função principal
        setTextoIdeia(''); // Limpa o campo local
      };

      if (!isOpen) return null;
  
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl transform transition-all max-w-md w-full">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <label htmlFor="textarea" className="block text-gray-700 text-center mt-2 mb-6">Mensagem</label>
                <textarea
                  id="textarea"
                  rows="4"
                  value={textoIdeia}
                  onChange={(e) => setTextoIdeia(e.target.value)}
                  className="w-full text-black h-40 resize-none p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
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
                  onClick={handleEnviar}
                  className="bg-teal-400 hover:bg-teal-500 text-white py-2 px-4 rounded-lg"
                  style={{ backgroundColor: "#672883" }}
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
            <Link to="/home">
              <img src={logo} alt="Logo do Projeto" className="w-10 h-10 cursor-pointer" />
            </Link>
            <h1 className="text-xl font-regular text-white ml-3" style={{ fontFamily: "Abril Fatface" }}>
              Banco de Ideias
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            {isAdmin && (
              <Link 
                to="/manage-roles"
                className="text-white hover:text-yellow-400 transition-colors duration-200"
              >
                Controle de Usuários
              </Link>
            )}
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
          </div>
        </nav>
  
        {/* Título do Projeto */}
        {projeto && (
          <div className="text-left mt-12 px-12 lg:px-24">
            <h2 
              className="text-2xl text-yellow-400 font-bold mb-4 font-abril" 
              style={{ textShadow: "-2px 2px #A85750"}}
            >
              {projeto.nome}
            </h2>
            <div className="w-full flex items-center gap-8">
              <div className="flex-1 min-w-0">
                <p className="text-base font-almarai text-gray-200 break-words">
                  {projeto.descricao}
                </p>
              </div>
              <button
                onClick={openModal}
                className="flex-shrink-0 w-48 bg-emerald-500 font-almarai hover:bg-teal-500 font-bold text-white py-2 px-4 rounded-lg transition duration-300"
              >
                Mande sua ideia aqui!
              </button>
              <Modal isOpen={modalOpen} onClose={closeModal} />
            </div>
          </div>
        )}

         {/* Melhores Ideias */}
          <div className="mt-12 px-6 lg:px-24">
            <h3 className="text-2xl text-left mb-6" style={{ fontFamily: "Abril Fatface" }}>
              Melhores Ideias
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {melhoresIdeias.map((ideia) => (
                <div key={ideia.id} className="bg-white p-4 rounded-lg shadow-md text-gray-800">
                  <p>{ideia.texto}</p>
                  <p className="text-sm text-gray-500 mt-2">Por: {ideia.autor}</p>
                  <div className="flex justify-end items-center mt-4">
                    <div className="bg-emerald-400 text-black px-6 py-2 rounded-full flex items-center gap-2">
                      <span>{ideia.curtidas || 0}</span>
                      <span>👍</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lista completa de ideias */}    
          <div className="mt-12 px-6 lg:px-24">
          <h3 className="text-2xl text-left mb-6" style={{ fontFamily: "Abril Fatface" }}>
            Todas as Ideias
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ideias.map((ideia) => (
              <div key={ideia.id} className="bg-white p-4 rounded-lg shadow-md text-gray-800">
                <p>{ideia.texto}</p>
                <p className="text-sm text-gray-500 mt-2">Por: {ideia.autor}</p>
                <div className="flex justify-between items-center mt-4">
                  <button 
                    onClick={() => handleNegar(ideia.id)}
                    className="bg-red-400 text-white px-4 py-2 rounded-full hover:bg-red-500"
                  >
                    Negar
                  </button>
                  <button 
                    onClick={() => handleMedia(ideia.id)}
                    className="bg-yellow-400 text-white px-4 py-2 rounded-full hover:bg-yellow-500"
                  >
                    Media
                  </button>
                  <button
                    onClick={() => handleCurtir(ideia.id)}
                    className={`${
                      curtidas.includes(ideia.id) 
                        ? "bg-gray-500" 
                        : "bg-emerald-400 hover:bg-emerald-500"
                    } text-white px-4 py-2 rounded-full`}
                    disabled={curtidas.includes(ideia.id)}
                  >
                    {curtidas.includes(ideia.id) ? "Já apoiei" : "Apoiar"}
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
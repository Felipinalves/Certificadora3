import React, { useState, useEffect } from "react";
import { getProjects } from "../controller/ProjectController";
import { checkAdmin } from "../controller/UserController"
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import logo from "../images/logo.png";

const Home = () => {
  const [projetos, setProjetos] = useState([]);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  const itensPorPagina = 3;
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchProjetos = async () => {
      try {
        setProjetos(await getProjects());
      } catch (error) {
        console.error("Erro ao buscar projetos:", error);
      }
    };

    fetchProjetos();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) =>  {
      setUser(user);

      // Verifica se o usuário é administrador sem salvar dados no Firebase
      if (user) {
        try {
          setIsAdmin(await checkAdmin(user))
        } catch (error) {
          console.error("Erro ao verificar cargo do usuário:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redireciona para a página de login após logout
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  };

  const projetosFiltrados = projetos.filter((projeto) =>
    projeto.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const handleProximo = () => {
    if ((paginaAtual + 1) * itensPorPagina < projetosFiltrados.length) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const handleAnterior = () => {
    if (paginaAtual > 0) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  return (
    <div className="bg-[#5F328D] min-h-screen">
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

      {/* Barra de Pesquisa */}
      <div className="text-center mt-8">
        <h2
          className="text-4xl font-abril mb-8 lg:mt-18 text-center text-[#FEC745]"
          style={{ textShadow: "-2px 2px #A85750",}}
        >
          Acesse um projeto!
        </h2>
        <input
          type="text"
          placeholder="Buscar projeto..."
          className="border lg:mb-12 border-gray-300 rounded-md py-2 px-4  w-3/5 md:w-1/2"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Carrossel */}
      <div className="mt-8 wrap mx-8 md:mx-28 lg:mx-24 flex justify-center items-center relative">
        {projetos.length > 3 && (
          <button
            className="absolute left-0 bg-purple-600 text-white px-3 pt-1 pb-1.5 rounded-full hover:bg-purple-700"
            onClick={handleAnterior}
          >
            &#x3c;
          </button>
        )}
        <div className="mx-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {projetosFiltrados
    .slice(paginaAtual * itensPorPagina, (paginaAtual + 1) * itensPorPagina)
    .map((projeto) => (
      <div key={projeto.id} className="bg-white rounded-md p-4 shadow-md w-60">
        <h3 className="text-lg break-words font-bold">{projeto.nome}</h3>
        <p className="text-sm break-words text-gray-600">{projeto.descricao}</p>
        <p className="text-sm text-gray-500">
          Criado em: {projeto.dataCriacao ? new Date(projeto.dataCriacao.seconds * 1000).toLocaleDateString() : "Data indisponível"}
        </p>
        
        {/* Botão Acessar - Redireciona para a página do projeto */}
        <button
          onClick={() => navigate(`/projeto/${projeto.id}`)} // Navega para a página do projeto com o ID
          className="mt-4 bg-pink-500 text-white py-2 px-4 rounded-md"
        >
          Acessar
        </button>
      </div>
    ))}
</div>

        {projetos.length > 3 && (
          <button
            className="absolute right-0 bg-purple-600 text-white px-3 pt-1 pb-1.5 rounded-full hover:bg-purple-700"
            onClick={handleProximo}
          >
            &#x3e;
          </button>
        )}
      </div>

      {/* Dots */}
      {projetos.length > 3 && (
        <div className="flex justify-center mt-4">
          {Array.from({
            length: Math.ceil(projetosFiltrados.length / itensPorPagina),
          }).map((_, index) => (
            <span
              key={index}
              className={`h-2 w-2 mx-1 rounded-full ${
                index === paginaAtual ? "bg-purple-600" : "bg-gray-300"
              }`}
            ></span>
          ))}
        </div>
      )}
      <br />
      {/* Botão flutuante */}
      {isAdmin && (
        <button
          onClick={() => navigate("/cadastrar-projeto")}
          className="fixed bottom-12 right-12 pb-1 flex justify-center items-center w-10 h-10 bg-purple-600 text-white text-2xl leading-6 rounded-full shadow-lg hover:bg-yellow-500 hover:text-black focus:outline-none focus:ring-2 focus:ring-yellow-500">
          +
        </button>
      )}
    </div>
  );
};

export default Home;

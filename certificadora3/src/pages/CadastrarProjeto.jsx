import React, { useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.png";

const CadastrarProjeto = () => {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSalvar = async () => {
    if (!nome || !descricao) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
  
    setLoading(true);
  
    try {
      console.log("Salvando projeto...");
      const docRef = await addDoc(collection(db, "projetos"), {
        nome,
        descricao,
        dataCriacao: serverTimestamp(),
      });
      console.log("Projeto salvo com ID:", docRef.id);
      navigate("/home");
    } catch (error) {
      console.error("Erro ao salvar projeto:", error.message);
      alert("Houve um erro ao salvar o projeto. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    navigate("/home");
  };

  return (
    <div style={{ backgroundColor: "#5F328D", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav
        className="shadow-md py-4 px-6 flex justify-between items-center"
        style={{ backgroundColor: "#441870" }}
      >
        <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
          <img src={logo} alt="Logo do Projeto" className="w-10 h-10 mr-3" />
          <h1
            className="text-xl font-regular text-white"
            style={{ fontFamily: "Abril Fatface" }}
          >
            Banco de Ideias
          </h1>
        </div>
      </nav>

      {/* Título */}
      <div className="text-center mt-8">
        <h2
          className="text-2xl font-regular mb-6"
          style={{
            fontFamily: "Abril Fatface",
            fontSize: "40px",
            color: "#FEC745",
            textShadow: "-2px 2px #A85750",
          }}
        >
          Cadastrar Projeto
        </h2>
      </div>

      {/* Formulário */}
      <div className="px-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <label className="block text-white font-medium mb-2" htmlFor="nome">
            Nome do Projeto
          </label>
          <input
            id="nome"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Digite o nome do projeto"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-white font-medium mb-2" htmlFor="descricao">
            Descrição do Projeto
          </label>
          <textarea
            id="descricao"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Digite a descrição do projeto"
            rows="5"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          ></textarea>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleCancelar}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            className="px-4 py-2 text-black rounded-md"
            style={{backgroundColor:'#FFFFFF'}}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CadastrarProjeto;

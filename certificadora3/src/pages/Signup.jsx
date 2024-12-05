import React, { useState } from "react";
import { auth } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // Ícones de visibilidade
import { FcGoogle } from "react-icons/fc"; // Ícone do Google

import signupBackground from "../images/signup_background.png";
import logo from "../images/logo.png";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/"); // Redireciona após cadastro bem-sucedido
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.");
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err) {
      setError("Erro ao criar conta com o Google.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100"
    style={{ backgroundImage: `url(${signupBackground})` }}
    >
      {/* Navbar */}
      <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center"
      style={{ backgroundColor: "#441870" }}
      >
        <div className="flex items-center">
          <img src={logo} alt="Logo do Projeto" className="w-10 h-10 mr-3" />
          <h1 className="text-xl font-regular text-white" style={{ fontFamily: "Abril Fatface" }}>
            Banco de Ideias
          </h1>
        </div>
      </nav>

      {/* Signup Form */}
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm" style={{backgroundColor:"#F5D7BC"}}>
          <h2 className="text-2xl font-regular mb-6 text-center"
            style={{ fontFamily: "Abril Fatface", fontSize: "40px", color:"#FEC745", textShadow: "-2px 2px #A85750" }}>Criar Conta</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Nome */}
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            {/* Email */}
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Senha */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-3 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
              </button>
            </div>

            {/* Confirmar Senha */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Confirmar Senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-3 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
              </button>
            </div>

            {/* Mensagem de erro de senha */}
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-sm mt-1">As senhas são diferentes.</p>
            )}

            {/* Botão Criar Conta */}
            <button
              type="submit"
              className={`w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 ${
                password !== confirmPassword ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{backgroundColor:"#672883"}}
              disabled={password !== confirmPassword}
            >
              Criar Conta
            </button>

            {/* Botão Criar Conta com Google */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center bg-gray-100 py-2 rounded-md border border-gray-300 hover:bg-gray-200"
            >
              <FcGoogle size={20} className="mr-2" />
              Criar Conta com o Google
            </button>
          </form>

          {/* Link para Login */}
          <p className="text-center text-gray-600 mt-4">
            Já possui uma conta?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-blue-500 underline"
              style={{color:"#672883"}}
            >
              Entrar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

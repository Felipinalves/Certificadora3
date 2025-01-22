import React, { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import background from "../images/login_background.png";
import logo from "../images/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  const saveUserToFirestore = async (user, displayName = null) => {
    const userRef = doc(collection(db, "usuarios"), user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      try {
        await setDoc(userRef, {
          nome: displayName || user.displayName || "Usuário",
          email: user.email,
          foto: user.photoURL || "",
          cargo: "membro externo",
        });
      } catch (err) {
        console.error("Erro ao salvar usuário:", err);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Buscar dados do usuário no Firestore
      const userRef = doc(collection(db, "usuarios"), user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        user.displayName = userData.nome;
      }
      
      navigate("/home");
    } catch (err) {
      setError("Falha ao fazer login. Verifique suas credenciais.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await saveUserToFirestore(user);
      navigate("/home");
    } catch (err) {
      setError("Falha ao fazer login com o Google.");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center"
      style={{ backgroundImage: `url(${background})` }}
    >
      {/* Navbar */}
      <nav
        className="shadow-md py-4 px-6 flex justify-between items-center"
        style={{ backgroundColor: "#441870" }}
      >
        <div className="flex items-center">
          <img src={logo} alt="Logo do Projeto" className="w-10 h-10 mr-3" />
          <h1 className="text-xl font-regular text-white" style={{ fontFamily: "Abril Fatface" }}>
            Banco de Ideias
          </h1>
        </div>
      </nav>

      {/* Login Form */}
      <div className="flex-grow flex items-center justify-center">
        <div className="p-8 rounded-lg shadow-lg w-full max-w-sm" style={{ backgroundColor: "#F5D7BC" }}>
          <h2
            className="text-2xl font-regular mb-6 text-center"
            style={{ fontFamily: "Abril Fatface", fontSize: "40px", color: "#FEC745", textShadow: "-2px 2px #A85750" }}
          >
            Login
          </h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Campo de Email */}
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Campo de Senha */}
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

            {/* Botão Primário */}
            <button
              type="submit"
              className="w-full text-white py-2 rounded-md hover:bg-blue-600"
              style={{ backgroundColor: "#672883" }}
            >
              Login
            </button>

            {/* Botão Secundário: Logar com Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center bg-gray-100 py-2 rounded-md border border-gray-300 hover:bg-gray-200"
            >
              <FcGoogle size={20} className="mr-2" />
              Logar com o Google
            </button>
          </form>

          {/* Link para a tela de cadastro */}
          <p className="text-center text-gray-600 mt-4">
            Não possui uma conta?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="underline"
              style={{ color: "#672883" }}
            >
              Inscrever-se
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

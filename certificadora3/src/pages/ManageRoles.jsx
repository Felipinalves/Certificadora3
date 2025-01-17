import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

import logo from "../images/logo.png";

const ManageRoles = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [menuAberto, setMenuAberto] = useState(false);
  const usersPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "usuarios", user.uid);
          const userSnapshot = await getDoc(userDocRef);

          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            setCurrentUser({ ...userData, uid: user.uid });

            if (userData.cargo !== "administrador") {
              navigate("/home");
            }
          } else {
            setError("Usuário não encontrado no Firestore.");
          }
        } catch (err) {
          console.error("Erro ao verificar o cargo:", err);
          setError("Erro ao verificar o cargo do usuário.");
        }
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "usuarios"));
        const usersData = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => user.id !== currentUser?.uid);

        setUsers(usersData);
      } catch (err) {
        console.error("Erro ao carregar usuários:", err);
        setError("Erro ao carregar os usuários.");
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      const userDoc = doc(db, "usuarios", userId);
      await updateDoc(userDoc, { cargo: newRole });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, cargo: newRole } : user
        )
      );
    } catch (err) {
      console.error("Erro ao atualizar o cargo:", err);
      setError("Erro ao atualizar o cargo.");
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(users.length / usersPerPage);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-100"
      style={{ backgroundColor: "#5F328D" }}
    >
      {/* Navbar */}
      <nav
        className="shadow-md py-4 px-6 flex justify-between items-center"
        style={{ backgroundColor: "#441870" }}
      >
        <div className="flex items-center">
        <Link to="/home">
          <img src={logo} alt="Logo do Projeto" className="w-10 h-10 mr-3 cursor-pointer" />
        </Link>
          <h1
            className="text-xl font-regular text-white"
            style={{ fontFamily: "Abril Fatface" }}
          >
            Banco de Ideias
          </h1>
        </div>
        {currentUser && (
          <div className="relative">
            <img
              src={currentUser.photoURL || "https://via.placeholder.com/40"}
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

      <div className="flex-grow p-4">
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <h2
          className="text-2xl font-regular mb-8 text-center mt-4"
          style={{
            fontFamily: "Abril Fatface",
            fontSize: "40px",
            color: "#FEC745",
            textShadow: "-2px 2px #A85750",
          }}
        >
          Membros do Projeto
        </h2>

        <div className="lg:w-3/5 align-middle mx-auto sm:w-1/8">
          <table className="min-w-full bg-white rounded-t-lg shadow-md">
            <thead style={{ backgroundColor: "#F8F3DF" }}>
              <tr>
                <th className="p-3 text-left text-sm font-semibold rounded-tl-lg">Nome</th>
                <th className="p-3 text-left text-sm font-semibold">Email</th>
                <th className="p-3  text-left text-sm hidden lg:block font-semibold">Cargo Atual</th>
                <th className="p-3 text-left text-sm font-semibold rounded-tr-lg">Novo Cargo</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-3 text-sm">{user.nome}</td>
                  <td className="p-3 text-sm break-normal">{user.email}</td>
                  <td className="p-3 hidden lg:block text-sm">{user.cargo}</td>
                  <td className="p-3">
                    <select
                      value={user.cargo}
                      onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                      className="border border-gray-300 rounded-md p-2"
                    >
                      <option value="administrador">Administrador</option>
                      <option value="membro interno">Membro Interno</option>
                      <option value="membro externo">Membro Externo</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Paginação */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={goToPreviousPage}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={goToNextPage}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
                <span className="font-medium">{Math.min(indexOfLastUser, users.length)}</span> of{" "}
                <span className="font-medium">{users.length}</span> results
              </p>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={goToPreviousPage}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => goToPage(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === index + 1
                        ? "bg-[#5F328D] text-white"
                        : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={goToNextPage}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  &gt;
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageRoles;

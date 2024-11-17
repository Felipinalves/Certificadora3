import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import logo from "../images/logo.png";

const ManageRoles = () => {
  const [users, setUsers] = useState([]); // Lista de usuários
  const [currentUser, setCurrentUser] = useState(null); // Usuário logado
  const [error, setError] = useState(""); // Mensagens de erro
  const [currentPage, setCurrentPage] = useState(1); // Página atual
  const usersPerPage = 5; // Número de usuários por página
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
    <div className="min-h-screen flex flex-col bg-gray-100"
    style={{ backgroundColor: "#f8f3df" }}>
      {/* Navbar */}
      <nav
        className="shadow-md py-4 px-6 flex justify-between items-center"
        style={{ backgroundColor: "#5F328D" }}
      >
        <div className="flex items-center">
          <img src={logo} alt="Logo do Projeto" className="w-10 h-10 mr-3" />
          <h1 className="text-xl font-regular text-white" style={{ fontFamily: "Abril Fatface" }}>
            Gerenciar Usuários
          </h1>
        </div>
      </nav>

      <div className="flex-grow p-4">

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg shadow-md">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left text-sm font-semibold">Nome</th>
                <th className="p-3 text-left text-sm font-semibold">Email</th>
                <th className="p-3 text-left text-sm font-semibold">Cargo Atual</th>
                <th className="p-3 text-left text-sm font-semibold">Novo Cargo</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-3 text-sm">{user.nome}</td>
                  <td className="p-3 text-sm">{user.email}</td>
                  <td className="p-3 text-sm">{user.cargo}</td>
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
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
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
              <span className="font-medium">
                {Math.min(indexOfLastUser, users.length)}
              </span>{" "}
              of <span className="font-medium">{users.length}</span> results
            </p>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
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
  );
};

export default ManageRoles;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from "./pages/Home";
import ManageRoles from './pages/ManageRoles';
import CadastrarProjeto from './pages/CadastrarProjeto';
import Projetos from './pages/Projetos';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/manage-roles" element={<ManageRoles />} />
        <Route path="/cadastrar-projeto" element={<CadastrarProjeto />} />
        <Route path='/projeto/:id' element={<Projetos/>}></Route>
      </Routes>
    </Router>
  );
}

export default App;

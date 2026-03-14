import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componentes
import Navbar from './components/Navbar';
import Equipos from './pages/Equipos';
import Participantes from './pages/Participantes';
import Partidos from './pages/Partidos';
import Consultas from './pages/Consultas';
import Inicio from './pages/Inicio';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/equipos" element={<Equipos />} />
            <Route path="/participantes" element={<Participantes />} />
            <Route path="/partidos" element={<Partidos />} />
            <Route path="/consultas" element={<Consultas />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login"; // Página de login
import ScoresChart from "./ScoresChart"; // Página de gráficos
import ProtectedRoute from "./ProtectedRoute"; // Proteção de rota

const AppRoutes = ({ user, setUser }) => {
  return (
    <Router>
      <Routes>
        {/* Rota de Login */}
        <Route path="/login" element={<Login onLogin={setUser} />} />

        {/* Rota Protegida */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user}>
              <ScoresChart />
            </ProtectedRoute>
          }
        />

        {/* Rota Padrão */}
        <Route path="*" element={<Login onLogin={setUser} />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";
import "./Login.css";
import logo from "./assets/images/logo.png";


const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "IDATE/Libras";
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onLogin(userCredential.user);
      navigate("/admin");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("Usuário não encontrado.");
      } else if (err.code === "auth/wrong-password") {
        setError("Senha incorreta.");
      } else {
        setError("Erro ao fazer login: " + err.message);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
      <img src={logo} alt="Logo" className="login-logo" />
        <h2>IDATE/Libras</h2>
        <p className="login-subtitle">Bem-vindo ao IDATE/Libras</p>
        <p className="login-instruction">Por favor, preencha abaixo para continuar</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
            />
          </div>
          <div className="form-group">
            <label>Senha:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>
          <button type="submit" className="login-button">Entrar</button>
        </form>

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default Login;

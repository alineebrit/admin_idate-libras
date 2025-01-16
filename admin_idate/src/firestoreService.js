 // Importações do Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Importações do React
import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2"; // Gráficos de barra
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registro dos componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Configuração do Firebase (substitua pelos seus valores)
const firebaseConfig = {
    apiKey: "AIzaSyCMyDpjWTESA6Qn3Waz2Q0o48CHapoq4fU",
    authDomain: "idate-libras.firebaseapp.com",
    projectId: "idate-libras",
    storageBucket: "idate-libras.firebasestorage.app",
    messagingSenderId: "319032257250",
    appId: "1:319032257250:web:bfed84c5acaa095c4c8cbb",
    measurementId: "G-HTELLQ3LJM"
  };

// Inicialização do Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

/**
 * Busca todos os documentos da coleção 'scores'.
 * @returns {Array} Lista de documentos com os dados salvos.
 */
async function fetchScoresFromFirestore() {
  try {
    const querySnapshot = await getDocs(collection(db, "scores"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Dados carregados do Firestore:", data);
    return data;
  } catch (error) {
    console.error("Erro ao buscar os dados do Firestore:", error);
    return [];
  }
}

/**
 * Filtra os dados por mês, semana ou dia.
 * @param {Array} scores - Dados completos do Firestore.
 * @param {string} filter - Filtro selecionado (month, week, day).
 * @returns {Array} Dados filtrados.
 */
function filterScoresByDate(scores, filter) {
  const now = new Date();

  return scores.filter((score) => {
    if (!score.timestamp) return false;
    const date = score.timestamp.toDate();

    if (filter === "month") {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    } else if (filter === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return date >= oneWeekAgo && date <= now;
    } else if (filter === "day") {
      return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    return true; // Retorna tudo se nenhum filtro for aplicado
  });
}

// Exemplo de Componente React com Gráficos e Filtros
const ScoresChart = () => {
  const [scores, setScores] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);
  const [filter, setFilter] = useState("month"); // Filtro inicial (mês)

  // Carregar os dados do Firestore ao montar o componente
  useEffect(() => {
    const loadScores = async () => {
      const data = await fetchScoresFromFirestore();
      setScores(data);
    };

    loadScores();
  }, []);

  // Atualizar os dados filtrados sempre que o filtro ou os dados mudarem
  useEffect(() => {
    const data = filterScoresByDate(scores, filter);
    setFilteredScores(data);
  }, [scores, filter]);

  // Preparar os dados para o gráfico
  const chartData = {
    labels: filteredScores.map((score) => {
      const date = score.timestamp.toDate();
      return date.toLocaleDateString("pt-BR");
    }),
    datasets: [
      {
        label: "Pontuações",
        data: filteredScores.map((score) => score.score),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h2>Gráficos de Pontuação</h2>

      {/* Filtros */}
      <div>
        <label>Filtrar por:</label>
        <select onChange={(e) => setFilter(e.target.value)} value={filter}>
        <option value="month">Ano</option>
          <option value="month">Mês</option>
          <option value="week">Semana</option>
          <option value="day">Dia</option>
        </select>
      </div>

      {/* Gráfico */}
      <div style={{ width: "600px", height: "400px", margin: "auto" }}>
        <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export default ScoresChart;

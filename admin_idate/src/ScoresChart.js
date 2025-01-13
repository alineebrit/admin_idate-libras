// Importações do Firebase
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Importações do React
import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";

// Importações necessárias para o Chart.js
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
  
// Inicializa o Firebase
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
    return data;
  } catch (error) {
    console.error("Erro ao buscar os dados do Firestore:", error);
    return [];
  }
}

/**
 * Busca todos os usuários da coleção 'users'.
 * @returns {Array} Lista de usuários ({ userId, name }).
 */
async function fetchUsersFromFirestore() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = querySnapshot.docs.map((doc) => ({
      userId: doc.id,
      ...doc.data(),
    }));
    return users;
  } catch (error) {
    console.error("Erro ao buscar os usuários do Firestore:", error);
    return [];
  }
}

/**
 * Filtra os dados por mês, semana, dia ou usuário.
 * @param {Array} scores - Dados completos do Firestore.
 * @param {string} filter - Filtro de data (month, week, day).
 * @param {string} userId - ID do usuário para filtrar.
 * @returns {Array} Dados filtrados.
 */
function filterScores(scores, filter, userId) {
  const now = new Date();

  return scores.filter((score) => {
    if (!score.timestamp) return false;

    const date = score.timestamp.toDate();
    const matchesUser = userId ? score.userId === userId : true;

    if (filter === "month") {
      return (
        matchesUser &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    } else if (filter === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return matchesUser && date >= oneWeekAgo && date <= now;
    } else if (filter === "day") {
      return (
        matchesUser &&
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    return matchesUser;
  });
}

// Componente React para exibir os gráficos
const ScoresChart = () => {
  const [scores, setScores] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);
  const [filter, setFilter] = useState("month"); // Filtro inicial (mês)
  const [userId, setUserId] = useState(""); // Filtro por usuário
  const [users, setUsers] = useState([]); // Lista de usuários ({ userId, name })

  // Carregar os dados do Firestore ao montar o componente
  useEffect(() => {
    const loadData = async () => {
      const scoresData = await fetchScoresFromFirestore();
      setScores(scoresData);

      const usersData = await fetchUsersFromFirestore();
      setUsers(usersData);
    };

    loadData();
  }, []);

  // Atualizar os dados filtrados sempre que o filtro, o usuário ou os dados mudarem
  useEffect(() => {
    const data = filterScores(scores, filter, userId);
    setFilteredScores(data);
  }, [scores, filter, userId]);

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
        <label>Filtrar por data:</label>
        <select onChange={(e) => setFilter(e.target.value)} value={filter}>
          <option value="month">Mês</option>
          <option value="week">Semana</option>
          <option value="day">Dia</option>
        </select>

        <label>Filtrar por usuário:</label>
        <select onChange={(e) => setUserId(e.target.value)} value={userId}>
          <option value="">Todos</option>
          {users.map((user) => (
            <option key={user.userId} value={user.userId}>
              {user.name}
            </option>
          ))}
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

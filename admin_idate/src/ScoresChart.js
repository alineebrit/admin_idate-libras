import { getFirestore, collection, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
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

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCMyDpjWTESA6Qn3Waz2Q0o48CHapoq4fU",
  authDomain: "idate-libras.firebaseapp.com",
  projectId: "idate-libras",
  storageBucket: "idate-libras.firebasestorage.app",
  messagingSenderId: "319032257250",
  appId: "1:319032257250:web:bfed84c5acaa095c4c8cbb",
  measurementId: "G-HTELLQ3LJM",
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
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
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
    return querySnapshot.docs.map((doc) => ({
      userId: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Erro ao buscar os usuários do Firestore:", error);
    return [];
  }
}

/**
 * Filtra os dados por data e usuário.
 * @param {Array} scores - Dados completos do Firestore.
 * @param {string} filter - Filtro de data (month, week, day, year).
 * @param {string} userId - ID do usuário para filtrar.
 * @returns {Array} Dados filtrados.
 */
function filterScores(scores, filter, userId) {
  const now = new Date();

  return scores.filter((score) => {
    const date = score.timestamp?.toDate?.();
    if (!date) return false;

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
    } else if (filter === "year") {
      return matchesUser && date.getFullYear() === now.getFullYear();
    }

    return matchesUser;
  });
}

const ScoresChart = () => {
  const [scores, setScores] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);
  const [filter, setFilter] = useState("month");
  const [userId, setUserId] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Nova variável de busca
  const [users, setUsers] = useState([]);
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    const loadData = async () => {
      const scoresData = await fetchScoresFromFirestore();
      setScores(scoresData);

      const usersData = await fetchUsersFromFirestore();
      setUsers(usersData);

      const userMapping = {};
      usersData.forEach((user) => {
        userMapping[user.userId] = user.name;
      });
      setUserMap(userMapping);
    };

    loadData();
  }, []);

  useEffect(() => {
    const data = filterScores(scores, filter, userId);
    setFilteredScores(data);
  }, [scores, filter, userId]);

  // Filtro de usuários baseado na busca
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chartData = {
    labels: filteredScores.map((score) => {
      const date = score.timestamp.toDate();
      return date.toLocaleString("pt-BR");
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const score = filteredScores[context.dataIndex];
            const userName = userMap[score.userId] || "Desconhecido";
            return `${userName}: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Data e Hora", // Rótulo do eixo horizontal
          font: {
            size: 14,
            weight: "bold",
          },
        },
        ticks: {
          autoSkip: true,
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        title: {
          display: true,
          text: "Pontuação", // Rótulo do eixo vertical
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
    },
  };

  return (
    <div>
      <h2>Gráficos de Pontuação</h2>

      <div>
        <label>Filtrar por data:</label>
        <select onChange={(e) => setFilter(e.target.value)} value={filter}>
          <option value="month">Mês</option>
          <option value="week">Semana</option>
          <option value="day">Dia</option>
          <option value="year">Ano</option>
        </select>

        <label>Buscar usuário:</label>
        <input
          type="text"
          placeholder="Digite o nome"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <label>Filtrar por usuário:</label>
        <select onChange={(e) => setUserId(e.target.value)} value={userId}>
          <option value="">Todos</option>
          {filteredUsers.map((user) => (
            <option key={user.userId} value={user.userId}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ width: "600px", height: "400px", margin: "auto" }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default ScoresChart;

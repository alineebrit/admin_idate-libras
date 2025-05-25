import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
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
import "./ScoresChart.css";

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

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

/**
 * Busca pontuações do Firestore e usuários associados.
 */
async function fetchScoresAndUsers() {
  try {
    const scoresSnapshot = await getDocs(collection(db, "scores"));
    const scoresData = scoresSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    });

    const usersSnapshot = await getDocs(collection(db, "users"));
    const usersData = usersSnapshot.docs.reduce((acc, doc) => {
      const userData = doc.data();
      acc[doc.id] = userData.name;
      return acc;
    }, {});

    const scoresWithUsers = scoresData.map((score) => ({
      ...score,
      user: score.name || usersData[score.userId] || "Desconhecido", // ✅ Aqui agora está certo
    }));

    return scoresWithUsers;
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return [];
  }
}


const ScoresChart = () => {
  const [scores, setScores] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);
  const [filter, setFilter] = useState("month");
  const [userFilter, setUserFilter] = useState("Todos");
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadScores = async () => {
      const data = await fetchScoresAndUsers();
      setScores(data);
      const uniqueUsers = ["Todos", ...new Set(data.map((score) => score.user).filter(Boolean))];
      setUsers(uniqueUsers);
    };

    loadScores();
  }, []);

  useEffect(() => {
    let filteredData = scores;

    if (userFilter !== "Todos") {
      filteredData = filteredData.filter((score) => score.user === userFilter);
    }

    const now = new Date();
    filteredData = filteredData.filter((score) => {
      if (!score.timestamp) return false;
      const date = new Date(score.timestamp.seconds * 1000);

      if (filter === "year") return date.getFullYear() === now.getFullYear();
      if (filter === "month") return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      if (filter === "week") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return date >= oneWeekAgo && date <= now;
      }
      if (filter === "day") {
        return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      return true;
    });

    setFilteredScores(filteredData);
  }, [scores, userFilter, filter]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchTerm(query);

    const matchingUsers = users.filter((user) => user.toLowerCase().includes(query));
    if (matchingUsers.length === 1) {
      setUserFilter(matchingUsers[0]);
    }
  };

  // 🔧 Definição do gráfico corrigida antes do return
  const chartData = {
    labels: filteredScores.map((score) =>
      new Date(score.timestamp.seconds * 1000).toLocaleString("pt-BR")
    ),
    datasets: [
      {
        label: "Pontuações",
        data: filteredScores.map((score) => score.score),
        backgroundColor: "rgba(18, 48, 104, 0.6)",
        borderColor: "rgba(18, 48, 104, 1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(255, 99, 132, 0.7)",
        hoverBorderColor: "rgba(255, 99, 132, 1)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const score = filteredScores[tooltipItem.dataIndex];
            return `Usuário: ${score.user} | Tipo: ${score.idateType || "N/A"} | Pontuação: ${score.score}`;
          },
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <h2>Gráficos de Pontuação</h2>

      <div className="filters">
        {/* Filtro por usuário */}
        <div className="filter-item">
          <label>Filtrar por usuário:</label>
          <select onChange={(e) => setUserFilter(e.target.value)} value={userFilter}>
            {users.map((user) => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>

        <div className="filter-item search-box-container">
  <label>Buscar:</label>
  <div className="search-input">
    <span className="search-icon">🔍</span>
    <input 
      type="text" 
      className="search-box"
      placeholder="Buscar usuário..." 
      value={searchTerm} 
      onChange={handleSearch} 
    />
  </div>
</div>


        {/* Filtro por data */}
        <div className="filter-item">
          <label>Filtrar por data:</label>
          <select onChange={(e) => setFilter(e.target.value)} value={filter}>
            <option value="year">Ano</option>
            <option value="month">Mês</option>
            <option value="week">Semana</option>
            <option value="day">Dia</option>
          </select>
        </div>
      </div>

      <div className="chart-wrapper">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default ScoresChart;


import React, { useState } from "react";
import AppRoutes from "./routes";

const App = () => {
  const [user, setUser] = useState(null); // Estado para armazenar o usuário autenticado

  return (
    <div>
      <AppRoutes user={user} setUser={setUser} />
    </div>
  );
};

export default App;
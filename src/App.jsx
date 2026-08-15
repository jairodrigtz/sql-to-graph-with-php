import React, { useEffect, useState } from "react";
import Graph from "./components/Graph";
import { ApiService } from "./services/ApiService";
import NavBar from "./components/NavBar";
import Inputs from "./components/Inputs";
import Favorites from "./components/Favorites";
import Login from "./components/Login";
import Register from "./components/Register";
import { getMe, logout } from "./services/AuthService";
import "./index.css";
import "./Spinner.css";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoginView, setIsLoginView] = useState(true);

  const {
    query, setQuery,
    version, setVersion,
    explainJSON, setExplainJSON,
    explainTree, setExplainTree,
    urlResult, handleSubmit,
    loading, cleanForm
  } = ApiService();

  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem("favorites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getMe();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      setUser(null);
    }
  };

  const exists = favorites.some(
    fav => JSON.stringify(fav.explainJSON) === JSON.stringify(explainJSON)
  );

  const addFavorite = () => {
    if (!query || !urlResult || exists) return;
    setFavorites([...favorites, { query, url: urlResult, explainJSON }]);
  };

  const removeFavorite = (index) => {
    setFavorites(favorites.filter((_, i) => i !== index));
  };

  if (authLoading) {
    return (
      <div>
        <NavBar user={null} onLogout={handleLogout} />
        <div className="flex justify-center items-center h-[60vh]">
          <span className="loader"></span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <NavBar user={null} onLogout={handleLogout} />
        {isLoginView ? (
          <Login
            onLoginSuccess={(loggedInUser) => setUser(loggedInUser)}
            onSwitchToRegister={() => setIsLoginView(false)}
          />
        ) : (
          <Register
            onRegisterSuccess={(registeredUser) => setUser(registeredUser)}
            onSwitchToLogin={() => setIsLoginView(true)}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <NavBar user={user} onLogout={handleLogout} />
      <div className="px-4 mt-6 flex gap-6">
        <div className="flex-1 basis-7/10">
          <input
            type="text"
            placeholder="Versión MySQL"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="mb-4 border px-2 py-1 rounded w-[300px]"
          />

          <Inputs
            query={query}
            setQuery={setQuery}
            explainJSON={explainJSON}
            setExplainJSON={setExplainJSON}
            explainTree={explainTree}
            setExplainTree={setExplainTree}
          />

          <div className="flex flex-row justify-center my-6 gap-4">
            <button
              className="bg-[#0c2041] text-white px-10 py-3 border rounded shadow-lg hover:bg-[#14356b] transition"
              onClick={handleSubmit}
            >
              {loading ? "Cargando..." : "Generar Grafo"}
            </button>
            {urlResult && (
              <button
                className="bg-[#0c2041] text-white px-10 py-3 border rounded shadow-lg hover:bg-[#14356b] transition"
                onClick={cleanForm}
              >
                Limpiar 🧹
              </button>
            )}
          </div>

          {loading && (
            <div className="flex justify-center my-4">
              <span className="loader"> </span>
            </div>
          )}

          {urlResult && !loading && (
            <div style={{ marginTop: 30 }}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Resultado:</h4>
                <button
                  onClick={addFavorite}
                  disabled={exists}
                  className={`px-4 py-1 rounded transition ${
                    exists
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-yellow-400 text-black hover:bg-yellow-500"
                  }`}
                >
                  ⭐ Añadir a favoritos
                </button>
              </div>

              <Graph explainUrl={urlResult} />
            </div>
          )}
        </div>

        <div className="flex-1 basis-3/10">
          <Favorites favorites={favorites} onRemove={removeFavorite} />
        </div>
      </div>
    </div>
  );
}

export default App;

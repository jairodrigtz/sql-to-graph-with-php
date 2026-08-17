import React, { useEffect, useState } from "react";
import Graph from "./components/Graph";
import { ApiService } from "./services/ApiService";
import NavBar from "./components/NavBar";
import Inputs from "./components/Inputs";
import Favorites from "./components/Favorites";
import Login from "./components/Login";
import Register from "./components/Register";
import { getMe, logout } from "./services/AuthService";
import { getFavorites, addFavorite, removeFavorite } from "./services/FavoriteService";
import "./index.css";
import "./Spinner.css";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoginView, setIsLoginView] = useState(true);

  const [favorites, setFavorites] = useState([]);
  const [favoritesError, setFavoritesError] = useState(null);
  const [selectedGraphUrl, setSelectedGraphUrl] = useState(null);

  const {
    query, setQuery,
    version, setVersion,
    explainJSON, setExplainJSON,
    explainTree, setExplainTree,
    urlResult, queryId, handleSubmit,
    loading, cleanForm
  } = ApiService();

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
    localStorage.removeItem("favorites"); // los favoritos ahora viven en el backend
  }, []);

  // recarga la lista de favoritos del usuario logueado
  const loadFavorites = async () => {
    try {
      setFavorites(await getFavorites());
      setFavoritesError(null);
    } catch (err) {
      setFavoritesError(err.message);
    }
  };

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    loadFavorites();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      setUser(null);
      setSelectedGraphUrl(null);
    }
  };

  const exists = favorites.some(fav => Number(fav.query_id) === Number(queryId));

  const handleAddFavorite = async () => {
    if (!queryId || exists) return;
    try {
      await addFavorite(queryId);
      await loadFavorites();
    } catch (err) {
      setFavoritesError(err.message);
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      await removeFavorite(favoriteId);
      if (favorites.some(fav => fav.id === favoriteId && fav.query?.graph_url === selectedGraphUrl)) {
        setSelectedGraphUrl(null);
      }
      await loadFavorites();
    } catch (err) {
      setFavoritesError(err.message);
    }
  };

  // se muestra el grafo del favorito elegido o, si no hay, el recién generado
  const graphUrl = selectedGraphUrl || urlResult;

  const handleGenerate = () => {
    setSelectedGraphUrl(null);
    handleSubmit();
  };

  const handleClean = () => {
    setSelectedGraphUrl(null);
    cleanForm();
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
              onClick={handleGenerate}
            >
              {loading ? "Cargando..." : "Generar Grafo"}
            </button>
            {urlResult && (
              <button
                className="bg-[#0c2041] text-white px-10 py-3 border rounded shadow-lg hover:bg-[#14356b] transition"
                onClick={handleClean}
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

          {graphUrl && !loading && (
            <div style={{ marginTop: 30 }}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">
                  {selectedGraphUrl ? "Grafo del favorito:" : "Resultado:"}
                </h4>
                {!selectedGraphUrl && (
                  <button
                    onClick={handleAddFavorite}
                    disabled={exists}
                    className={`px-4 py-1 rounded transition ${
                      exists
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-yellow-400 text-black hover:bg-yellow-500"
                    }`}
                  >
                    ⭐ {exists ? "Ya está en favoritos" : "Añadir a favoritos"}
                  </button>
                )}
              </div>

              <Graph explainUrl={graphUrl} />
            </div>
          )}
        </div>

        <div className="flex-1 basis-3/10">
          <Favorites
            favorites={favorites}
            error={favoritesError}
            onSelect={(url) => setSelectedGraphUrl(url)}
            onRemove={handleRemoveFavorite}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

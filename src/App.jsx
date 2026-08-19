import React, { useEffect, useState } from "react";
import Graph from "./components/Graph";
import { ApiService } from "./services/ApiService";
import NavBar from "./components/NavBar";
import Inputs from "./components/Inputs";
import Favorites from "./components/Favorites";
import History from "./components/History";
import Login from "./components/Login";
import Register from "./components/Register";
import { getMe, logout } from "./services/AuthService";
import { getFavorites, addFavorite, removeFavorite } from "./services/FavoriteService";
import { getQueries, getQuery } from "./services/QueryService";
import "./index.css";
import "./Spinner.css";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoginView, setIsLoginView] = useState(true);

  const [favorites, setFavorites] = useState([]);
  const [favoritesError, setFavoritesError] = useState(null);
  const [selectedGraphUrl, setSelectedGraphUrl] = useState(null);
  const [selectedGraphSource, setSelectedGraphSource] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [sidebarView, setSidebarView] = useState("favorites");

  const {
    query, setQuery,
    version, setVersion,
    explainJSON, setExplainJSON,
    explainTree, setExplainTree,
    urlResult, queryId, setQueryId, handleSubmit,
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

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      setHistory(await getQueries());
      setHistoryError(null);
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setHistory([]);
      return;
    }
    loadFavorites();
    loadHistory();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      setUser(null);
      setSelectedGraphUrl(null);
      setSelectedGraphSource(null);
      setHistory([]);
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
        setSelectedGraphSource(null);
      }
      await loadFavorites();
    } catch (err) {
      setFavoritesError(err.message);
    }
  };

  // se muestra el grafo del favorito elegido o, si no hay, el recién generado
  const graphUrl = selectedGraphUrl || urlResult;

  const handleGenerate = async () => {
    setSelectedGraphUrl(null);
    setSelectedGraphSource(null);
    const createdQuery = await handleSubmit();
    if (createdQuery) {
      await loadHistory();
      setSidebarView("history");
    }
  };

  const handleClean = () => {
    setSelectedGraphUrl(null);
    setSelectedGraphSource(null);
    cleanForm();
  };

  const handleSelectFavorite = (url) => {
    setSelectedGraphUrl(url);
    setSelectedGraphSource("favorite");
  };

  const handleSelectHistory = async (id) => {
    try {
      const savedQuery = await getQuery(id);
      if (!savedQuery) return;

      setQuery(savedQuery.query || "");
      setVersion(savedQuery.version || "8.0.32");
      setExplainJSON(savedQuery.explain_json || "");
      setExplainTree(savedQuery.explain_tree || "");
      setQueryId(savedQuery.id);
      setSelectedGraphUrl(savedQuery.graph_url || null);
      setSelectedGraphSource("history");
      setHistoryError(null);
    } catch (err) {
      setHistoryError(err.message);
    }
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
                  {selectedGraphSource === "favorite"
                    ? "Grafo del favorito:"
                    : selectedGraphSource === "history"
                      ? "Grafo del historial:"
                      : "Resultado:"}
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
          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={() => setSidebarView("favorites")}
              className={`px-4 py-2 rounded transition ${
                sidebarView === "favorites"
                  ? "bg-[#0c2041] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Favoritos
            </button>
            <button
              type="button"
              onClick={() => setSidebarView("history")}
              className={`px-4 py-2 rounded transition ${
                sidebarView === "history"
                  ? "bg-[#0c2041] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Historial
            </button>
          </div>

          {sidebarView === "favorites" ? (
            <Favorites
              favorites={favorites}
              error={favoritesError}
              onSelect={handleSelectFavorite}
              onRemove={handleRemoveFavorite}
            />
          ) : (
            <History
              queries={history}
              loading={historyLoading}
              error={historyError}
              onSelect={handleSelectHistory}
              onRefresh={loadHistory}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

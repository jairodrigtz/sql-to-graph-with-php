import { API_BASE_URL } from "../config";

export async function getFavorites() {
  const response = await fetch(`${API_BASE_URL}/api/favorites`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "Error al cargar los favoritos.");
  }

  return data.favorites || [];
}

export async function addFavorite(queryId) {
  const response = await fetch(`${API_BASE_URL}/api/favorites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ query_id: queryId }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "Error al guardar el favorito.");
  }

  return data.favorite;
}

export async function removeFavorite(favoriteId) {
  const response = await fetch(`${API_BASE_URL}/api/favorites/${favoriteId}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "Error al quitar el favorito.");
  }

  return data;
}

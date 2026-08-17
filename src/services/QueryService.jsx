import { API_BASE_URL } from "../config";

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "Error al cargar el historial.");
  }

  return data;
}

export async function getQueries() {
  const data = await request("/api/queries");
  return data.queries || [];
}

export async function getQuery(queryId) {
  const data = await request(`/api/queries/${queryId}`);
  return data.query || null;
}

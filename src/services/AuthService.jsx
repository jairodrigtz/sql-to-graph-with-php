import { API_BASE_URL } from "../config";

export async function register(name, email, password) {
  const response = await fetch(`${API_BASE_URL}/api/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "Error al registrar el usuario.");
  }

  return data;
}

export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "Error al iniciar sesión.");
  }

  return data;
}

export async function logout() {
  const response = await fetch(`${API_BASE_URL}/api/logout`, {
    method: "POST",
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "Error al cerrar sesión.");
  }

  return data;
}

export async function getMe() {
  const response = await fetch(`${API_BASE_URL}/api/me`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return null;
  }

  return data.user || null;
}

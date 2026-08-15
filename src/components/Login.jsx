import React, { useState } from "react";
import { login } from "../services/AuthService";

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Por favor ingresa correo y contraseña.");
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.message || "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-[#0c2041] text-center mb-6">
        Iniciar Sesión
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0c2041]"
            placeholder="correo@ejemplo.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0c2041]"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0c2041] text-white py-2.5 px-4 rounded font-medium shadow hover:bg-[#14356b] transition duration-200 disabled:opacity-50"
        >
          {loading ? "Cargando..." : "Iniciar Sesión"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        ¿No tienes una cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-[#0c2041] font-semibold underline hover:text-blue-800"
        >
          Regístrate aquí
        </button>
      </div>
    </div>
  );
};

export default Login;

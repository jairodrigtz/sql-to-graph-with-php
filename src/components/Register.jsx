import React, { useState } from "react";
import { register } from "../services/AuthService";

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const data = await register(name, email, password);
      if (data.user) {
        onRegisterSuccess(data.user);
      }
    } catch (err) {
      setError(err.message || "Error al registrar usuario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-[#0c2041] text-center mb-6">
        Crear Cuenta
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0c2041]"
            placeholder="Tu nombre"
            required
          />
        </div>

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
            Contraseña (mín. 6 caracteres)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0c2041]"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0c2041] text-white py-2.5 px-4 rounded font-medium shadow hover:bg-[#14356b] transition duration-200 disabled:opacity-50"
        >
          {loading ? "Cargando..." : "Registrarse"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tienes una cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-[#0c2041] font-semibold underline hover:text-blue-800"
        >
          Inicia sesión aquí
        </button>
      </div>
    </div>
  );
};

export default Register;

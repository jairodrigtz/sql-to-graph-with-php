import React from "react";
import "../index.css";
import logo from "../assets/JsonAGrafoNB.png";

const NavBar = ({ user, onLogout }) => {
  return (
    <nav className="bg-[#0c2041] text-light h-[77px]">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center">
          <img
            src={logo}
            alt="logo"
            className="h-16 w-auto mr-6 ml-4"
          />
          <h3 className="text-white text-lg whitespace-nowrap">
            Guía visual de consultas SQL
          </h3>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-white text-sm font-medium">
              Hola, <span className="font-semibold">{user.name}</span>
            </span>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded shadow transition duration-200"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;








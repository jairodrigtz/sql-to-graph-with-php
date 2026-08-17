import React from "react";

function Favorites({ favorites, error, onSelect, onRemove }) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">⭐ Consultas y grafos favoritos</h2>

      {error && (
        <p className="mb-2 text-sm text-red-600">{error}</p>
      )}

      {favorites.length === 0 ? (
        <p className="text-gray-500">No tienes favoritos aún.</p>
      ) : (
        <div className="relative bg-[#FCF2E8] rounded-lg overflow-hidden shadow">
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">Consulta</th>
                  <th className="border px-4 py-2 text-left">Ver grafo</th>
                  <th className="border px-4 py-2 text-left">Acción</th>
                </tr>
              </thead>
              <tbody>
                {favorites.map((fav) => (
                  <tr key={fav.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 whitespace-pre-wrap">
                      {fav.query ? fav.query.query : "Consulta no disponible"}
                    </td>
                    <td className="border px-4 py-2 whitespace-nowrap">
                      <button
                        onClick={() => onSelect(fav.query.graph_url)}
                        disabled={!fav.query}
                        className="text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                      >
                        Ver grafo
                      </button>
                    </td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => onRemove(fav.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Favorites;

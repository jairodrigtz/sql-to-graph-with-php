import React from "react";

function History({ queries, loading, error, onSelect, onRefresh }) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Historial de consultas</h2>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="text-sm text-blue-700 hover:underline disabled:text-gray-400"
        >
          {loading ? "Cargando..." : "Actualizar"}
        </button>
      </div>

      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

      {!loading && queries.length === 0 ? (
        <p className="text-gray-500">No tienes consultas en el historial.</p>
      ) : (
        <div className="relative bg-[#FCF2E8] rounded-lg overflow-hidden shadow">
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">Consulta</th>
                  <th className="border px-4 py-2 text-left">Fecha</th>
                  <th className="border px-4 py-2 text-left">Acción</th>
                </tr>
              </thead>
              <tbody>
                {queries.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 whitespace-pre-wrap break-words max-w-[260px]">
                      {item.query}
                    </td>
                    <td className="border px-4 py-2 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSelect(item.id)}
                        className="text-blue-600 hover:underline"
                      >
                        Recuperar
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

export default History;

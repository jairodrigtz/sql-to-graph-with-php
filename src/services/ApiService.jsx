import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

export const ApiService = () => {
  const [query, setQuery] = useState("");
  const [version, setVersion] = useState("8.0.32");
  const [explainJSON, setExplainJSON] = useState("");
  const [explainTree, setExplainTree] = useState("");
  const [urlResult, setUrlResult] = useState(null);
  const [queryId, setQueryId] = useState(null); // id que devuelve el backend, necesario para favoritos
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!query.trim() || !explainJSON.trim()) {
      alert("Debes ingresar tanto el query como el EXPLAIN FORMAT=JSON (como string).\nEstos campos son obligatorios.");
      return null;
    }
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/queries`,
        {
          query,
          version,
          explain_json: explainJSON,
          explain_tree: explainTree || "",
        },
        {
          withCredentials: true,
        }
      );

      if (res.data && res.data.result && res.data.result.graph_url) {
        setUrlResult(res.data.result.graph_url);
        setQueryId(res.data.result.id);
        return res.data.result;
      }
      return null;
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        let mensaje = "";
        if (errorData.message) {
          mensaje = errorData.message;
        } else if (errorData.error) {
          mensaje = errorData.error;
        } else {
          mensaje = "Error al procesar la consulta.";
        }
        if (errorData.details) {
          let detailsText = "";
          if (typeof errorData.details === "object" && errorData.details !== null) {
            if (Array.isArray(errorData.details.errors)) {
              detailsText = errorData.details.errors
                .map((e) => e.message || e.error || String(e))
                .join("\n");
            } else if (errorData.details.message) {
              detailsText = errorData.details.message;
            } else {
              detailsText = JSON.stringify(errorData.details, null, 2);
            }
          } else {
            detailsText = String(errorData.details);
          }

          if (detailsText) {
            mensaje += `\n\nDetalles: ${detailsText}`;
          }
        }

        alert("Error en la consulta:\n" + mensaje);
      } else {
        alert("Error de conexión con el servidor backend.");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cleanForm = () => {
    setQuery("");
    setExplainJSON("");
    setExplainTree("");
    setUrlResult(null);
    setQueryId(null);
  };

  return {
    query, setQuery,
    version, setVersion,
    explainJSON, setExplainJSON,
    explainTree, setExplainTree,
    urlResult, setUrlResult,
    queryId, setQueryId,
    loading, setLoading,
    handleSubmit,
    cleanForm
  };
};

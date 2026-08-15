import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

export const ApiService = () => {
  const [query, setQuery] = useState("");
  const [version, setVersion] = useState("8.0.32");
  const [explainJSON, setExplainJSON] = useState("");
  const [explainTree, setExplainTree] = useState("");
  const [urlResult, setUrlResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!query.trim() || !explainJSON.trim()) {
      alert("Debes ingresar tanto el query como el EXPLAIN FORMAT=JSON (como string).\nEstos campos son obligatorios.");
      return;
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
        console.log(res.data.result.graph_url);
      }
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
          const detailsStr = typeof errorData.details === "object"
            ? JSON.stringify(errorData.details, null, 2)
            : String(errorData.details);
          mensaje += `\n\nDetalles: ${detailsStr}`;
        }
        alert("Error en la consulta:\n" + mensaje);
      } else {
        alert("Error de conexión con el servidor backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  const cleanForm = () => {
    setQuery("");
    setExplainJSON("");
    setExplainTree("");
    setUrlResult(null);
  };

  return {
    query, setQuery,
    version, setVersion,
    explainJSON, setExplainJSON,
    explainTree, setExplainTree,
    urlResult, setUrlResult,
    loading, setLoading,
    handleSubmit,
    cleanForm
  };
};

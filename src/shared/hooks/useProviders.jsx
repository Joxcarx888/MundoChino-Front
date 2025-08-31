import { useState, useEffect, useCallback } from "react";
import {
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  hardDeleteProvider,
} from "../../services/api";

export const useProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Cargar proveedores al iniciar
  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getProviders();
      if (!res.error) setProviders(res.providers || []);
      else setError(res.error);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // ✅ Crear
  const addProvider = async (data) => {
    const res = await createProvider(data);
    if (!res.error) {
      fetchProviders();
      return res;
    }
    setError(res.error);
    return res;
  };

  // ✅ Editar
  const editProvider = async (id, data) => {
    const res = await updateProvider(id, data);
    if (!res.error) {
      fetchProviders();
      return res;
    }
    setError(res.error);
    return res;
  };

  // ✅ Eliminar (soft)
  const removeProvider = async (id) => {
    const res = await deleteProvider(id);
    if (!res.error) {
      fetchProviders();
      return res;
    }
    setError(res.error);
    return res;
  };

  // ✅ Eliminar (hard)
  const removeProviderPermanently = async (id) => {
    const res = await hardDeleteProvider(id);
    if (!res.error) {
      fetchProviders();
      return res;
    }
    setError(res.error);
    return res;
  };

  return {
    providers,
    loading,
    error,
    fetchProviders,
    addProvider,
    editProvider,
    removeProvider,
    removeProviderPermanently,
  };
};

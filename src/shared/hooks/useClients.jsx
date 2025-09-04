// src/hooks/useClients.js
import { useState, useEffect, useCallback } from "react";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from "../../services/"; // o donde tengas tu clientApi

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Cargar clientes al iniciar
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getClients();
      if (!res.error) setClients(res.clients || []);
      else setError(res.error);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // ✅ Crear
  const addClient = async (data) => {
    const res = await createClient(data);
    if (!res.error) {
      fetchClients();
      return res;
    }
    setError(res.error);
    return res;
  };

  // ✅ Editar
  const editClient = async (id, data) => {
    const res = await updateClient(id, data);
    if (!res.error) {
      fetchClients();
      return res;
    }
    setError(res.error);
    return res;
  };

  // ✅ Eliminar (soft)
  const removeClient = async (id) => {
    const res = await deleteClient(id);
    if (!res.error) {
      fetchClients();
      return res;
    }
    setError(res.error);
    return res;
  };

  return {
    clients,
    loading,
    error,
    fetchClients,
    addClient,
    editClient,
    removeClient,
  };
};

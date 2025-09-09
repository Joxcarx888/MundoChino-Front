// src/hooks/useUsers.js
import { useState, useEffect, useCallback } from "react";
import {
  getUsers,
  register,
  updateUser,
  deleteUser,
  hardDeleteUser,
} from "../../services/api"; // Ajusta la ruta según tu estructura

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Cargar usuarios al iniciar
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      if (!res.error && res.success) {
        setUsers(res.users || []);
      } else {
        setError(res.error || "Error al obtener usuarios");
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ✅ Crear usuario (usa register)
  const addUser = async (data) => {
    const res = await register(data);
    if (!res.error && res.success) {
      fetchUsers();
      return res;
    }
    setError(res.error || "Error al crear usuario");
    return res;
  };

  // ✅ Editar usuario
  const editUser = async (id, data) => {
    const res = await updateUser(id, data);
    if (!res.error && res.success) {
      fetchUsers();
      return res;
    }
    setError(res.error || "Error al editar usuario");
    return res;
  };

  // ✅ Eliminar lógico
  const removeUser = async (id) => {
    const res = await deleteUser(id);
    if (!res.error && res.success) {
      fetchUsers();
      return res;
    }
    setError(res.error || "Error al eliminar usuario");
    return res;
  };

  // ✅ Eliminar físico
  const removeUserHard = async (id) => {
    const res = await hardDeleteUser(id);
    if (!res.error && res.success) {
      fetchUsers();
      return res;
    }
    setError(res.error || "Error al eliminar usuario (hard)");
    return res;
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    addUser,
    editUser,
    removeUser,
    removeUserHard,
  };
};

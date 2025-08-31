// src/api/providerApi.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3333/MundoChino/v1/",
  timeout: 5000,
});

apiClient.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("user");
    if (user) {
      const token = JSON.parse(user).token;
      config.headers["x-token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = async (data) => {
  try {
    return await apiClient.post("auth/login", data);
  } catch (e) {
    return { error: true, e };
  }
};

export const register = async (data) => {
  try {
    return await apiClient.post("auth/register", data);
  } catch (e) {
    return { error: true, e };
  }
};


export const getProviders = async () => {
  try {
    const res = await apiClient.get("provider/");
    return res.data;
  } catch (error) {
    return { error: true, error };
  }
};

// ✅ Crear proveedor
export const createProvider = async (data) => {
  try {
    const res = await apiClient.post("provider/", data);
    return res.data;
  } catch (error) {
    return { error: true, error };
  }
};

// ✅ Editar proveedor
export const updateProvider = async (id, data) => {
  try {
    const res = await apiClient.put(`provider/${id}`, data);
    return res.data;
  } catch (error) {
    return { error: true, error };
  }
};

// ✅ Eliminar proveedor (soft delete)
export const deleteProvider = async (id) => {
  try {
    const res = await apiClient.delete(`provider/${id}`);
    return res.data;
  } catch (error) {
    return { error: true, error };
  }
};

// ✅ Eliminar proveedor permanentemente (hard delete)
export const hardDeleteProvider = async (id) => {
  try {
    const res = await apiClient.delete(`provider/hard/${id}`);
    return res.data;
  } catch (error) {
    return { error: true, error };
  }
};

export default apiClient;

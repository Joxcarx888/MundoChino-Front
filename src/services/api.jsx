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

// =================== AUTH ===================
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

// =================== PROVIDERS ===================
export const getProviders = async () => {
  try {
    const res = await apiClient.get("provider/");
    return res.data;
  } catch (e) {
    return { error: true, e };
  }
};

export const createProvider = async (data) => {
  try {
    const res = await apiClient.post("provider/", data);
    return res.data;
  } catch (e) {
    return { error: true, e };
  }
};

export const updateProvider = async (id, data) => {
  try {
    const res = await apiClient.put(`provider/${id}`, data);
    return res.data;
  } catch (e) {
    return { error: true, e };
  }
};

export const deleteProvider = async (id) => {
  try {
    const res = await apiClient.delete(`provider/${id}`);
    return res.data;
  } catch (e) {
    return { error: true, e };
  }
};

export const hardDeleteProvider = async (id) => {
  try {
    const res = await apiClient.delete(`provider/hard/${id}`);
    return res.data;
  } catch (e) {
    return { error: true, e };
  }
};

// =================== INVOICES ===================
export const getInvoices = async () => {
  try {
    const res = await apiClient.get("invoice/");
    return res.data;
  } catch (e) {
    return { error: true, e };
  }
};

export const createInvoice = async (data) => {
  try {
    const res = await apiClient.post("invoice/", data);
    return res.data;
  } catch (e) {
    return { error: true, e };
  }
};

export const updateInvoice = async (id, data) => {
  try {
    const res = await apiClient.put(`invoice/${id}`, data);
    return res.data;
  } catch (e) {
    return { error: true, e };
  }
};

export const deleteInvoice = async (id) => {
  try {
    const res = await apiClient.delete(`invoice/${id}`);
    return res.data;
  } catch (e) {
    return { error: true, e };
  }
};

export const hardDeleteInvoice = async (id) => {
  try {
    const res = await apiClient.delete(`invoice/hard/${id}`);
    return res.data;
  } catch (e) {
    return { error: true, e };
  }
};

// =================== PRODUCTS ===================
export const getProducts = async () => {
  try {
    const res = await apiClient.get("product/");
    return res.data;
  } catch (e) {
    return { error: true, e };
  }
};


export const createProduct = async (formData) => {
  try {
    const res = await apiClient.post("product/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (e) {
    return { error: true, e };
  }
};

export const updateProduct = async (id, formData) => {
  try {
    const res = await apiClient.put(`product/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (e) {
    return { error: true, e };
  }
};

export const deleteProduct = async (id) => {
  try {
    const res = await apiClient.delete(`product/${id}`);
    return res.data;
  } catch (e) {
    return { error: true, e };
  }
};

export const hardDeleteProduct = async (id) => {
  try {
    const res = await apiClient.delete(`product/hard/${id}`);
    return res.data;
  } catch (e) {
    return { error: true, e };
  }
};

export const getClients = async () => {
  try {
    const res = await apiClient.get("client/");
    return res.data;
  } catch (e) {
    return { error: true, e };
  }
};

export const createClient = async (data) => {
  try {
    const res = await apiClient.post("client/", data);
    return res.data;
  } catch (e) {
    return { error: true, e };
  }
};

export const updateClient = async (id, data) => {
  try {
    const res = await apiClient.put(`client/${id}`, data);
    return res.data;
  } catch (e) {
    return { error: true, e };
  }
};

export const deleteClient = async (id) => {
  try {
    const res = await apiClient.delete(`client/${id}`);
    return res.data;
  } catch (e) {
    return { error: true, e };
  }
};


export default apiClient;

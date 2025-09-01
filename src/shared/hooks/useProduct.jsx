// src/hooks/useProducts.js
import { useState, useEffect } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  hardDeleteProduct,
} from "../../services/api";

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await getProducts();
    if (!res.error) {
      setProducts(res.products || []);
    }
    setLoading(false);
  };

  const addProduct = async (formData) => {
    const res = await createProduct(formData);
    if (!res.error) {
      fetchProducts();
    }
    return res;
  };

  const editProduct = async (id, formData) => {
    const res = await updateProduct(id, formData);
    if (!res.error) {
      fetchProducts();
    }
    return res;
  };

  const removeProduct = async (id, hard = false) => {
    const res = hard ? await hardDeleteProduct(id) : await deleteProduct(id);
    if (!res.error) {
      fetchProducts();
    }
    return res;
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, fetchProducts, addProduct, editProduct, removeProduct };
};

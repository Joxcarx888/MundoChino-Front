import { useState, useEffect } from "react";
import {
  getSales,
  createSale,
  updateSale,
  deleteSale,
  hardDeleteSale,
} from "../../services/api";

export const useSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    setLoading(true);
    const res = await getSales();
    if (!res.error) {
      setSales(res.sales || []);
    }
    setLoading(false);
  };

  const addSale = async (data) => {
    const res = await createSale(data);
    if (!res.error) {
      fetchSales();
    }
    return res;
  };

  const editSale = async (id, data) => {
    const res = await updateSale(id, data);
    if (!res.error) {
      fetchSales();
    }
    return res;
  };

  const removeSale = async (id, hard = false) => {
    const res = hard ? await hardDeleteSale(id) : await deleteSale(id);
    if (!res.error) {
      fetchSales();
    }
    return res;
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return { sales, loading, fetchSales, addSale, editSale, removeSale };
};

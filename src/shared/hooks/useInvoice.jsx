import { useState, useEffect } from "react";
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  hardDeleteInvoice,
} from "../../services/api";

export const useInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    setLoading(true);
    const res = await getInvoices();
    if (!res.error) {
      setInvoices(res.invoices || []);
    }
    setLoading(false);
  };

  const addInvoice = async (data) => {
    const res = await createInvoice(data);
    if (!res.error) {
      fetchInvoices();
    }
    return res;
  };

  const editInvoice = async (id, data) => {
    const res = await updateInvoice(id, data);
    if (!res.error) {
      fetchInvoices();
    }
    return res;
  };

  const removeInvoice = async (id, hard = false) => {
    const res = hard ? await hardDeleteInvoice(id) : await deleteInvoice(id);
    if (!res.error) {
      fetchInvoices();
    }
    return res;
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return { invoices, loading, fetchInvoices, addInvoice, editInvoice, removeInvoice };
};

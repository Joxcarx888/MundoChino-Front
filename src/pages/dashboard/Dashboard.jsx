import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CustomNavbar from "../../components/navbar/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";

export const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const cards = [
    { label: "Productos", path: "/products", color: "primary" },
    { label: "Facturas", path: "/invoices", color: "success" },
    { label: "Clientes", path: "/clients", color: "warning" },
  ];

  return (
    <div className="dashboard-page">
      {/* Navbar */}
      <CustomNavbar />

      {/* Contenido principal */}
      <div className="container mt-5 pt-5">
        <h1 className="fw-bold mb-4">
          Bienvenido {user?.name || user?.username} al centro de control de Mundo Chino GT
        </h1>

        <div className="row g-4">
          {cards.map((card, index) => (
            <div key={card.path} className="col-12 col-md-4">
              <motion.div
                className={`dashboard-card text-white bg-${card.color} shadow-lg text-center p-5`}
                whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                onClick={() => navigate(card.path)}
                style={{ cursor: "pointer", borderRadius: "1rem" }}
              >
                <h3 className="fw-semibold">{card.label}</h3>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

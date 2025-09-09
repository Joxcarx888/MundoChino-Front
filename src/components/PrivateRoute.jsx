// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";

export const PrivateRoute = ({ children, allowedRoles }) => {
  const storedUser = JSON.parse(localStorage.getItem("user"));

  // ❌ No logueado → redirigir al dashboard
  if (!storedUser) {
    return <Navigate to="/dashboard" />;
  }

  // ❌ Logueado pero sin rol permitido → redirigir al dashboard
  if (allowedRoles && !allowedRoles.includes(storedUser.role)) {
    return <Navigate to="/dashboard" />;
  }

  // ✅ Acceso permitido
  return children;
};

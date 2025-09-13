import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const PrivateRoute = ({ children, allowedRoles }) => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // ❌ No logueado → redirigir al login
  if (!storedUser || !token) {
    return <Navigate to="/auth" />;
  }

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000; // en segundos

    // ❌ Token vencido
    if (decoded.exp && decoded.exp < now) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return <Navigate to="/auth" />;
    }
  } catch (e) {
    // ❌ Token inválido
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return <Navigate to="/auth" />;
  }

  // ❌ Logueado pero sin rol permitido → redirigir al dashboard
  if (allowedRoles && !allowedRoles.includes(storedUser.role)) {
    return <Navigate to="/dashboard" />;
  }

  // ✅ Acceso permitido
  return children;
};

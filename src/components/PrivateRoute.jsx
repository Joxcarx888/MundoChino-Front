import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const PrivateRoute = ({ children, allowedRoles }) => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = storedUser?.token; // ✅ leer token desde user

  console.log("StoredUser:", storedUser);
  console.log("Token desde storedUser:", token);

  if (!storedUser || !token) {
    console.warn("❌ No hay usuario o token");
    return <Navigate to="/auth" />;
  }

  try {
    const decoded = jwtDecode(token);
    console.log("Token decodificado:", decoded);

    const now = Date.now() / 1000;

    if (decoded.exp && decoded.exp < now) {
      console.warn("❌ Token vencido");
      localStorage.clear();
      return <Navigate to="/auth" />;
    }

    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      console.warn("❌ Rol no permitido:", decoded.role);
      return <Navigate to="/dashboard" />;
    }
  } catch (e) {
    console.error("❌ Error al decodificar token:", e);
    localStorage.clear();
    return <Navigate to="/auth" />;
  }

  console.log("✅ Acceso permitido");
  return children;
};

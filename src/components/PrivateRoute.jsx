import { Navigate } from "react-router-dom";

export const PrivateRoute = ({ children, allowedRoles }) => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const userRole = user.role?.toUpperCase();

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};
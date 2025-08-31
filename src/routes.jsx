import { Navigate } from "react-router-dom";
import { DashboardPage } from "./pages/dashboard";
import { ProvidersPage } from "./pages/providers";
import { Auth } from "./pages/auth/auth";
import { PrivateRoute } from "./components/PrivateRoute";

const routes = [
  { path: '/auth', element: <Auth /> },

  // Dashboard protegido solo para ADMIN y CLIENT
  { 
    path: '/dashboard', 
    element: (
      <PrivateRoute allowedRoles={["ADMIN", "CLIENT"]}>
        <DashboardPage />
      </PrivateRoute>
    ) 
  },

  { path: '/providers', element: <ProvidersPage /> },

  { path: '*', element: <Navigate to="/dashboard" /> }
];

export default routes;
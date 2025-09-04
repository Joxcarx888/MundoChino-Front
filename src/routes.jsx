import { Navigate } from "react-router-dom";
import { DashboardPage } from "./pages/dashboard";
import { ProvidersPage } from "./pages/providers";
import { InvoicesPage } from "./pages/invoices";
import { ProductsPage } from "./pages/products";
import { ClientsPage } from "./pages/clients";
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

  { path: '/invoices', element: <InvoicesPage /> },

  { path: '/products', element: <ProductsPage /> },

  { path: '/clients', element: <ClientsPage /> },

  { path: '*', element: <Navigate to="/dashboard" /> }
];

export default routes;
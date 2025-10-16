import { Navigate } from "react-router-dom";
import { DashboardPage } from "./pages/dashboard";
import { ProvidersPage } from "./pages/providers";
import { InvoicesPage } from "./pages/invoices";
import { ProductsPage } from "./pages/products";
import { ClientsPage } from "./pages/clients";
import { SalesPage } from "./pages/sales";
import { Auth } from "./pages/auth/auth";
import { UsersPage } from "./pages/users";
import { PrivateRoute } from "./components/PrivateRoute";

const routes = [
  { path: "/auth", element: <Auth /> },

  { path: "/dashboard", element: <DashboardPage /> },

  { path: "/providers", element: <ProvidersPage /> },

  { 
    path: "/invoices", 
    element: (
      <PrivateRoute allowedRoles={["ADMIN"]}>
        <InvoicesPage />
      </PrivateRoute>
    ) 
  },

  { path: "/products", element: <ProductsPage /> },

  { path: "/clients", element: <ClientsPage /> },

  { path: "/sales", element: <SalesPage /> },

  { 
    path: "/users", 
    element: (
      <PrivateRoute allowedRoles={["ADMIN"]}>
        <UsersPage />
      </PrivateRoute>
    ) 
  },

  { path: "*", element: <Navigate to="/auth" /> },
];

export default routes;

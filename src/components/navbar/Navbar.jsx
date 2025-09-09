import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/img/Logo.png";
import "./navbar.css"; 
import { logout } from "../../shared/hooks/useLogout";

const CustomNavbar = () => {
  const navigate = useNavigate();

  // ✅ Obtener user de localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const role = storedUser?.role || null;

  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar bg="light" expand="lg" fixed="top" className="custom-navbar shadow-sm">
      <Container>
        <Navbar.Brand onClick={() => navigate("/")} className="brand">
          <img src={logo} alt="Logo" className="logo" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link onClick={() => navigate("/dashboard")}>Inicio</Nav.Link>
            <Nav.Link onClick={() => navigate("/products")}>Productos</Nav.Link>
            <Nav.Link onClick={() => navigate("/providers")}>Proveedores</Nav.Link>
            <Nav.Link onClick={() => navigate("/invoices")}>Compras</Nav.Link>
            <Nav.Link onClick={() => navigate("/clients")}>Clientes</Nav.Link>
            <Nav.Link onClick={() => navigate("/sales")}>Ventas</Nav.Link>

            {/* ✅ Solo aparece si es ADMIN */}
            {role === "ADMIN" && (
              <Nav.Link onClick={() => navigate("/users")}>Usuarios</Nav.Link>
            )}

            <Nav.Link onClick={handleLogout}>Cerrar Sesión</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;

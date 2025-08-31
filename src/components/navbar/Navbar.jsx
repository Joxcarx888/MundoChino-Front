import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/img/Logo.png";
import "./navbar.css"; 
import { logout } from "../../shared/hooks/useLogout"; // importamos tu hook

const CustomNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Borra el localStorage y redirige
  };

  return (
    <Navbar bg="light" expand="lg" fixed="top" className="custom-navbar shadow-sm">
      <Container>
        <Navbar.Brand onClick={() => navigate("/")} className="brand">
          <img src={logo} alt="Logo" className="logo" />
          Mundo Chino GT
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link onClick={() => navigate("/products")}>Productos</Nav.Link>
            <Nav.Link onClick={() => navigate("/providers")}>Proveedores</Nav.Link>
            <Nav.Link onClick={() => navigate("/invoices")}>Facturas</Nav.Link>
            <Nav.Link onClick={() => navigate("/clients")}>Clientes</Nav.Link>
            <Nav.Link onClick={handleLogout}>Cerrar Sesión</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;

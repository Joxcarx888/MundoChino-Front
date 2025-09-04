// src/pages/clients/ClientsPage.jsx
import { useState, useMemo } from "react";
import { useClients } from "../../shared/hooks/useClients"; 
import { Button, Form, Container, Row, Col, Card, Modal } from "react-bootstrap";
import { toast } from "react-hot-toast";
import CustomNavbar from "../../components/navbar/Navbar";
import "./Clients.css";

export const ClientsPage = () => {
  const { clients, addClient, editClient, removeClient, loading } = useClients();
  const [search, setSearch] = useState({
    nombre: "",
    nit: "",
    email: "",
    telefono: "",
  });

  const [newClient, setNewClient] = useState({
    nombre: "",
    nit: "",
    email: "",
    telefono: "",
  });

  const [editModal, setEditModal] = useState(false);
  const [editClientData, setEditClientData] = useState({
    id: "",
    nombre: "",
    nit: "",
    email: "",
    telefono: "",
  });

  // Filtrar clientes por todos los campos
  const filteredClients = useMemo(() => {
    return clients.filter((c) =>
      c.nombre.toLowerCase().includes(search.nombre.toLowerCase()) &&
      c.nit.toLowerCase().includes(search.nit.toLowerCase()) &&
      (c.email || "").toLowerCase().includes(search.email.toLowerCase()) &&
      (c.telefono || "").toLowerCase().includes(search.telefono.toLowerCase())
    );
  }, [clients, search]);

  // Agregar cliente
  const handleAddClient = async () => {
    if (!newClient.nombre.trim() || !newClient.nit.trim()) {
      toast.error("Nombre y NIT son obligatorios");
      return;
    }
    const res = await addClient(newClient);
    if (!res.error) {
      toast.success("Cliente agregado");
      setNewClient({ nombre: "", nit: "", email: "", telefono: "" });
    }
  };

  // Abrir modal para editar
  const handleOpenEditModal = (client) => {
    setEditClientData({
      id: client._id,
      nombre: client.nombre || "",
      nit: client.nit || "",
      email: client.email || "",
      telefono: client.telefono || "",
    });
    setEditModal(true);
  };

  // Guardar cambios del modal
  const handleSaveEdit = async () => {
    if (!editClientData.nombre.trim() || !editClientData.nit.trim()) {
      toast.error("Nombre y NIT son obligatorios");
      return;
    }
    const { id, nombre, nit, email, telefono } = editClientData;
    const res = await editClient(id, { nombre, nit, email, telefono });
    if (!res.error) {
      toast.success("Cliente actualizado");
      setEditModal(false);
    }
  };

  const handleDeleteClient = async (id) => {
    if (window.confirm("¿Eliminar este cliente?")) {
      const res = await removeClient(id);
      if (!res.error) toast.success("Cliente eliminado");
    }
  };

  return (
    <>
      <CustomNavbar />
      <Container className="clients-page my-5 pt-5">
        <h2 className="mb-4">Clientes</h2>

        {/* Buscador por todos los campos */}
        <Row className="mb-3 g-2 align-items-center">
          <Col md={3} sm={6} className="mb-2">
            <Form.Control
              type="text"
              placeholder="Buscar por Nombre..."
              value={search.nombre}
              onChange={(e) => setSearch({ ...search, nombre: e.target.value })}
            />
          </Col>
          <Col md={3} sm={6} className="mb-2">
            <Form.Control
              type="text"
              placeholder="Buscar por NIT..."
              value={search.nit}
              onChange={(e) => setSearch({ ...search, nit: e.target.value })}
            />
          </Col>
          <Col md={3} sm={6} className="mb-2">
            <Form.Control
              type="text"
              placeholder="Buscar por Email..."
              value={search.email}
              onChange={(e) => setSearch({ ...search, email: e.target.value })}
            />
          </Col>
          <Col md={3} sm={6} className="mb-2">
            <Form.Control
              type="text"
              placeholder="Buscar por Teléfono..."
              value={search.telefono}
              onChange={(e) => setSearch({ ...search, telefono: e.target.value })}
            />
          </Col>
        </Row>

        {/* Agregar cliente */}
        <Row className="mb-4 g-2 add-client-row">
          <Col md={2} sm={6}>
            <Form.Control
              type="text"
              placeholder="Nombre *"
              value={newClient.nombre}
              onChange={(e) =>
                setNewClient({ ...newClient, nombre: e.target.value })
              }
              className="mb-2"
            />
          </Col>
          <Col md={2} sm={6}>
            <Form.Control
              type="text"
              placeholder="NIT *"
              value={newClient.nit}
              onChange={(e) =>
                setNewClient({ ...newClient, nit: e.target.value })
              }
              className="mb-2"
            />
          </Col>
          <Col md={3} sm={6}>
            <Form.Control
              type="email"
              placeholder="Email"
              value={newClient.email}
              onChange={(e) =>
                setNewClient({ ...newClient, email: e.target.value })
              }
              className="mb-2"
            />
          </Col>
          <Col md={3} sm={6}>
            <Form.Control
              type="text"
              placeholder="Teléfono"
              value={newClient.telefono}
              onChange={(e) =>
                setNewClient({ ...newClient, telefono: e.target.value })
              }
              className="mb-2"
            />
          </Col>
          <Col md={2} sm={12}>
            <Button className="w-100 mb-2" onClick={handleAddClient}>
              Agregar
            </Button>
          </Col>
        </Row>

        {/* Lista de clientes */}
        {loading ? (
          <p>Cargando clientes...</p>
        ) : filteredClients.length === 0 ? (
          <p>No se encontraron clientes.</p>
        ) : (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {filteredClients.map((client) => (
              <Col key={client._id}>
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column justify-content-between">
                    <Card.Title>{client.nombre}</Card.Title>
                    <div className="card-details">
                      <div>NIT: {client.nit}</div>
                      {client.email && <div>Email: {client.email}</div>}
                      {client.telefono && <div>Teléfono: {client.telefono}</div>}
                    </div>
                    <div className="mt-3 d-flex justify-content-between">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleOpenEditModal(client)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteClient(client._id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Modal de edición */}
        <Modal show={editModal} onHide={() => setEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Cliente</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  value={editClientData.nombre}
                  onChange={(e) =>
                    setEditClientData({ ...editClientData, nombre: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>NIT *</Form.Label>
                <Form.Control
                  type="text"
                  value={editClientData.nit}
                  onChange={(e) =>
                    setEditClientData({ ...editClientData, nit: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={editClientData.email || ""}
                  onChange={(e) =>
                    setEditClientData({ ...editClientData, email: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  value={editClientData.telefono || ""}
                  onChange={(e) =>
                    setEditClientData({ ...editClientData, telefono: e.target.value })
                  }
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              Guardar
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

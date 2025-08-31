import { useState, useMemo } from "react";
import { useProviders } from "../../shared/hooks/useProviders"; 
import { Button, Form, Container, Row, Col, Card, Modal } from "react-bootstrap";
import { toast } from "react-hot-toast";
import CustomNavbar from "../../components/navbar/Navbar";
import "./Provider.css";

export const ProvidersPage = () => {
  const { providers, addProvider, editProvider, removeProvider, loading } = useProviders();
  const [search, setSearch] = useState("");

  const [newProvider, setNewProvider] = useState({
    name: "",
    email: "",
    number: "",
  });

  const [editModal, setEditModal] = useState(false);
  const [editProviderData, setEditProviderData] = useState({
    id: "",
    name: "",
    email: "",
    number: "",
  });

  const filteredProviders = useMemo(() => {
    return providers.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [providers, search]);

  // Agregar proveedor
  const handleAddProvider = async () => {
    if (!newProvider.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    const res = await addProvider(newProvider);
    if (!res.error) {
      toast.success("Proveedor agregado");
      setNewProvider({ name: "", email: "", number: "" });
    }
  };

  // Abrir modal para editar
  const handleOpenEditModal = (provider) => {
    setEditProviderData({
      id: provider._id,
      name: provider.name || "",
      email: provider.email || "",
      number: provider.number || "",
    });
    setEditModal(true);
  };

  // Guardar cambios del modal
  const handleSaveEdit = async () => {
    if (!editProviderData.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    const { id, name, email, number } = editProviderData;
    const res = await editProvider(id, { name, email, number });
    if (!res.error) {
      toast.success("Proveedor actualizado");
      setEditModal(false);
    }
  };

  const handleDeleteProvider = async (id) => {
    if (window.confirm("¿Eliminar este proveedor?")) {
      const res = await removeProvider(id);
      if (!res.error) toast.success("Proveedor eliminado");
    }
  };

  return (
    <>
      <CustomNavbar />
      <Container className="providers-page my-5 pt-5">
        <h2 className="mb-4">Proveedores</h2>

        {/* Buscador */}
        <Row className="mb-3 align-items-center">
          <Col md={6} sm={12}>
            <Form.Control
              type="text"
              placeholder="Buscar proveedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
        </Row>

        {/* Agregar proveedor */}
        <Row className="mb-4 g-2 add-provider-row">
          <Col md={3} sm={12}>
            <Form.Control
              type="text"
              placeholder="Nombre *"
              value={newProvider.name}
              onChange={(e) =>
                setNewProvider({ ...newProvider, name: e.target.value })
              }
              className="mb-2"
            />
          </Col>
          <Col md={4} sm={12}>
            <Form.Control
              type="email"
              placeholder="Email"
              value={newProvider.email}
              onChange={(e) =>
                setNewProvider({ ...newProvider, email: e.target.value })
              }
              className="mb-2"
            />
          </Col>
          <Col md={3} sm={12}>
            <Form.Control
              type="text"
              placeholder="Número"
              value={newProvider.number}
              onChange={(e) =>
                setNewProvider({ ...newProvider, number: e.target.value })
              }
              className="mb-2"
            />
          </Col>
          <Col md={2} sm={12}>
            <Button className="w-100 mb-2" onClick={handleAddProvider}>
              Agregar
            </Button>
          </Col>
        </Row>

        {/* Lista de proveedores */}
        {loading ? (
          <p>Cargando proveedores...</p>
        ) : filteredProviders.length === 0 ? (
          <p>No se encontraron proveedores.</p>
        ) : (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {filteredProviders.map((provider) => (
              <Col key={provider._id}>
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column justify-content-between">
                    <Card.Title>{provider.name}</Card.Title>
                    <div className="card-details">
                      {provider.email && <div>Email: {provider.email}</div>}
                      {provider.number && <div>Número: {provider.number}</div>}
                    </div>
                    <div className="mt-3 d-flex justify-content-between">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleOpenEditModal(provider)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteProvider(provider._id)}
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
            <Modal.Title>Editar Proveedor</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  value={editProviderData.name}
                  onChange={(e) =>
                    setEditProviderData({ ...editProviderData, name: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={editProviderData.email || ""}
                  onChange={(e) =>
                    setEditProviderData({ ...editProviderData, email: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Número</Form.Label>
                <Form.Control
                  type="text"
                  value={editProviderData.number || ""}
                  onChange={(e) =>
                    setEditProviderData({ ...editProviderData, number: e.target.value })
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

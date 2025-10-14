// src/pages/users/UsersPage.jsx
import { useState, useEffect, useMemo } from "react";
import { useUsers } from "../../shared/hooks/useUsers";
import { Button, Form, Container, Row, Col, Card, Modal } from "react-bootstrap";
import { toast } from "react-hot-toast";
import CustomNavbar from "../../components/navbar/Navbar";
import "./User.css";

export const UsersPage = () => {
  const { users, addUser, editUser, removeUser, loading } = useUsers();

  const [userList, setUserList] = useState([]);

  useEffect(() => {
    setUserList(users);
  }, [users]);

  const [search, setSearch] = useState({
    name: "",
    username: "",
    email: "",
    role: "",
  });

  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "USER",
  });

  const [editModal, setEditModal] = useState(false);
  const [editUserData, setEditUserData] = useState({
    id: "",
    name: "",
    username: "",
    email: "",
    password: "",
    role: "USER",
  });

  // Filtrar usuarios
  const filteredUsers = useMemo(() => {
    return userList.filter(
      (u) =>
        u.name.toLowerCase().includes(search.name.toLowerCase()) &&
        u.username.toLowerCase().includes(search.username.toLowerCase()) &&
        (u.email || "").toLowerCase().includes(search.email.toLowerCase()) &&
        (u.role || "").toLowerCase().includes(search.role.toLowerCase())
    );
  }, [userList, search]);

  // Agregar usuario
  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.username.trim() || !newUser.password.trim()) {
      toast.error("Nombre, usuario y contraseña son obligatorios");
      return;
    }

    const res = await addUser(newUser);
    if (!res.error) {
      toast.success("Usuario agregado");
      // Actualizar lista local con los datos que conocemos
      const userToAdd = res.user || { ...newUser, uid: Date.now().toString() };
      setUserList((prev) => [...prev, userToAdd]);
      setNewUser({ name: "", username: "", email: "", password: "", role: "USER" });
    }
  };

  // Abrir modal de edición
  const handleOpenEditModal = (user) => {
    setEditUserData({
      id: user.uid,
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      password: "",
      role: user.role || "USER",
    });
    setEditModal(true);
  };

  // Guardar cambios
  const handleSaveEdit = async () => {
    if (!editUserData.name.trim() || !editUserData.username.trim()) {
      toast.error("Nombre y usuario son obligatorios");
      return;
    }

    const { id, name, username, email, password, role } = editUserData;
    const payload = { name, username, email, role };
    if (password.trim()) payload.password = password;

    const res = await editUser(id, payload);
    if (!res.error) {
      toast.success("Usuario actualizado");
      // Actualizar lista local usando datos locales del formulario
      setUserList((prev) =>
        prev.map((u) =>
          u.uid === id ? { ...u, name, username, email, role } : u
        )
      );
      setEditModal(false);
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (id) => {
    if (window.confirm("¿Eliminar este usuario?")) {
      const res = await removeUser(id);
      if (!res.error) {
        toast.success("Usuario eliminado");
        setUserList((prev) => prev.filter((u) => u.uid !== id));
      }
    }
  };

  return (
    <>
      <CustomNavbar />
      <Container className="users-page my-5 pt-5">
        <h2 className="mb-4">Usuarios</h2>

        {/* Buscador */}
        <Row className="mb-3 g-2 align-items-center">
          <Col md={3} sm={6}>
            <Form.Control
              type="text"
              placeholder="Buscar por Nombre..."
              value={search.name}
              autoComplete="off"
              onChange={(e) => setSearch({ ...search, name: e.target.value })}
            />
          </Col>
          <Col md={3} sm={6}>
            <Form.Control
              type="text"
              placeholder="Buscar por Usuario..."
              value={search.username}
              autoComplete="off"
              onChange={(e) => setSearch({ ...search, username: e.target.value })}
            />
          </Col>
          <Col md={3} sm={6}>
            <Form.Control
              type="text"
              placeholder="Buscar por Email..."
              value={search.email}
              autoComplete="off"
              onChange={(e) => setSearch({ ...search, email: e.target.value })}
            />
          </Col>
          <Col md={3} sm={6}>
            <Form.Control
              type="text"
              placeholder="Buscar por Rol..."
              value={search.role}
              autoComplete="off"
              onChange={(e) => setSearch({ ...search, role: e.target.value })}
            />
          </Col>
        </Row>

        {/* Agregar usuario */}
        <Row className="mb-4 g-2 align-items-end">
          <Col md={2} sm={6}>
            <Form.Group>
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                type="text"
                value={newUser.name}
                autoComplete="off"
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={2} sm={6}>
            <Form.Group>
              <Form.Label>Usuario *</Form.Label>
              <Form.Control
                type="text"
                value={newUser.username}
                autoComplete="off"
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={3} sm={6}>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={newUser.email}
                autoComplete="off"
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={2} sm={6}>
            <Form.Group>
              <Form.Label>Contraseña *</Form.Label>
              <Form.Control
                type="password"
                value={newUser.password}
                autoComplete="new-password"
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={2} sm={6}>
            <Form.Group>
              <Form.Label>Rol</Form.Label>
              <Form.Select
                value={newUser.role}
                autoComplete="off"
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={1} sm={12}>
            <Button className="w-100" onClick={handleAddUser}>
              Agregar
            </Button>
          </Col>
        </Row>

        {/* Lista de usuarios */}
        {loading ? (
          <p>Cargando usuarios...</p>
        ) : filteredUsers.length === 0 ? (
          <p>No se encontraron usuarios.</p>
        ) : (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {filteredUsers.map((user) => (
              <Col key={user.uid}>
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column justify-content-between">
                    <Card.Title>{user.name}</Card.Title>
                    <div className="card-details">
                      <div>Usuario: {user.username}</div>
                      {user.email && <div>Email: {user.email}</div>}
                      <div>Rol: {user.role}</div>
                    </div>
                    <div className="mt-3 d-flex justify-content-between">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleOpenEditModal(user)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteUser(user.uid)}
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
        <Modal
          show={editModal}
          onHide={() => setEditModal(false)}
          contentClassName="user-modal"
        >

          <Modal.Header closeButton>
            <Modal.Title>Editar Usuario</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  autoComplete="off"
                  value={editUserData.name}
                  onChange={(e) =>
                    setEditUserData({ ...editUserData, name: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Usuario *</Form.Label>
                <Form.Control
                  type="text"
                  autoComplete="off"
                  value={editUserData.username}
                  onChange={(e) =>
                    setEditUserData({ ...editUserData, username: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  autoComplete="off"
                  value={editUserData.email || ""}
                  onChange={(e) =>
                    setEditUserData({ ...editUserData, email: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nueva Contraseña (Opcional)</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Dejar en blanco si no cambia"
                  autoComplete="new-password"
                  value={editUserData.password}
                  onChange={(e) =>
                    setEditUserData({ ...editUserData, password: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Rol</Form.Label>
                <Form.Select
                  autoComplete="off"
                  value={editUserData.role}
                  onChange={(e) =>
                    setEditUserData({ ...editUserData, role: e.target.value })
                  }
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </Form.Select>
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

import { useState, useMemo } from "react";
import { Button, Form, Container, Row, Col, Table, Collapse, Modal } from "react-bootstrap";
import { toast } from "react-hot-toast";
import CustomNavbar from "../../components/navbar/Navbar";
import { useInvoices } from "../../shared/hooks/useInvoice";
import { useProviders } from "../../shared/hooks/useProviders";
import { useProducts } from "../../shared/hooks/useProduct";
import "./Invoice.css";

export const InvoicesPage = () => {
  const { invoices, addInvoice, editInvoice, removeInvoice, loading } = useInvoices();
  const { providers } = useProviders();
  const { products } = useProducts();

  const [expanded, setExpanded] = useState(null);

  // filtros
  const [searchNo, setSearchNo] = useState("");
  const [searchSerie, setSearchSerie] = useState("");
  const [searchProveedor, setSearchProveedor] = useState("");
  const [searchProducto, setSearchProducto] = useState("");

  // modal
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  // datos de la factura en edición/creación
  const [formInvoice, setFormInvoice] = useState({
    fechaCompra: "",
    noFactura: "",
    serieFactura: "",
    proveedor: "",
    productos: [],
  });

  // Agregar línea de producto
  const addProductLine = () => {
    setFormInvoice((prev) => ({
      ...prev,
      productos: [
        ...prev.productos,
        {
          producto: "",
          cantidad: 1,
          costoUnitario: 0,
          valorInventario: 0,
          valorConIvaSugerido: 0,
          nuevoProducto: null,
        },
      ],
    }));
  };

  // manejar cambios de producto
  const handleProductChange = (index, field, value) => {
    const updated = [...formInvoice.productos];
    updated[index][field] = value;

    if (field === "costoUnitario" || field === "cantidad") {
      const costo = parseFloat(updated[index].costoUnitario || 0);
      const cant = parseInt(updated[index].cantidad || 0);

      updated[index].valorInventario = costo * cant;
      updated[index].valorConIvaSugerido = costo * (1 + 1.75) * (1.12);
    }

    setFormInvoice((prev) => ({ ...prev, productos: updated }));
  };

  // abrir modal nuevo/editar
  const handleOpenModal = (invoice = null) => {
    if (invoice) {
      setEditingInvoice(invoice._id);
      setFormInvoice({
        fechaCompra: invoice.fechaCompra.split("T")[0],
        noFactura: invoice.noFactura,
        serieFactura: invoice.serieFactura,
        proveedor: invoice.proveedor._id,
        productos: invoice.productos.map((p) => ({
          producto: p.producto._id,
          cantidad: p.cantidad,
          costoUnitario: p.costoUnitario,
          valorInventario: p.subtotal,
          valorConIvaSugerido: p.costoUnitario * (1 + 1.75) * 1.12,
        })),
      });
    } else {
      setEditingInvoice(null);
      setFormInvoice({
        fechaCompra: "",
        noFactura: "",
        serieFactura: "",
        proveedor: "",
        productos: [],
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formInvoice.noFactura.trim()) {
      toast.error("El número de factura es obligatorio");
      return;
    }
    const res = editingInvoice
      ? await editInvoice(editingInvoice, formInvoice)
      : await addInvoice(formInvoice);
    if (!res.error) {
      toast.success(editingInvoice ? "Factura actualizada" : "Factura agregada");
      setShowModal(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar esta factura?")) {
      const res = await removeInvoice(id);
      if (!res.error) toast.success("Factura eliminada");
    }
  };

  // filtrado
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchNo = inv.noFactura.toLowerCase().includes(searchNo.toLowerCase());
      const matchSerie = inv.serieFactura.toLowerCase().includes(searchSerie.toLowerCase());
      const matchProv = searchProveedor ? inv.proveedor._id === searchProveedor : true;
      const matchProd = searchProducto
        ? inv.productos.some((p) => p.producto._id === searchProducto)
        : true;
      return matchNo && matchSerie && matchProv && matchProd;
    });
  }, [invoices, searchNo, searchSerie, searchProveedor, searchProducto]);

  return (
    <>
      <CustomNavbar />
      <Container className="invoices-page my-5 pt-5">
        <h2 className="mb-4">Facturas</h2>

        {/* filtros */}
        <Row className="mb-3 g-2">
          <Col md={3}>
            <Form.Control
              placeholder="Buscar por número"
              value={searchNo}
              onChange={(e) => setSearchNo(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Control
              placeholder="Buscar por serie"
              value={searchSerie}
              onChange={(e) => setSearchSerie(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Select
              value={searchProveedor}
              onChange={(e) => setSearchProveedor(e.target.value)}
            >
              <option value="">Todos los proveedores</option>
              {providers.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select
              value={searchProducto}
              onChange={(e) => setSearchProducto(e.target.value)}
            >
              <option value="">Todos los productos</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.nombreArticulo}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <div className="d-flex justify-content-end mb-3">
          <Button onClick={() => handleOpenModal()}>Agregar Factura</Button>
        </div>

        {/* tabla */}
        {loading ? (
          <p>Cargando facturas...</p>
        ) : (
          <Table bordered hover>
            <thead>
              <tr>
                <th></th>
                <th>Fecha</th>
                <th>Número</th>
                <th>Serie</th>
                <th>Proveedor</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <>
                  <tr key={inv._id}>
                    <td>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setExpanded(expanded === inv._id ? null : inv._id)}
                      >
                        {expanded === inv._id ? "▲" : "▼"}
                      </Button>
                    </td>
                    <td>{new Date(inv.fechaCompra).toLocaleDateString()}</td>
                    <td>{inv.noFactura}</td>
                    <td>{inv.serieFactura}</td>
                    <td>{inv.proveedor?.name}</td>
                    <td>{inv.total}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" onClick={() => handleOpenModal(inv)}>
                        Editar
                      </Button>{" "}
                      {JSON.parse(localStorage.getItem("user"))?.role === "ADMIN" && (
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(inv._id)}>
                          Eliminar
                        </Button>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="7" className="p-0">
                      <Collapse in={expanded === inv._id}>
                        <div className="p-3">
                          <Table size="sm" bordered>
                            <thead>
                              <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Costo</th>
                                <th>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inv.productos.map((p) => (
                                <tr key={p.producto._id}>
                                  <td>{p.producto.nombreArticulo}</td>
                                  <td>{p.cantidad}</td>
                                  <td>{p.costoUnitario}</td>
                                  <td>{p.subtotal}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </Collapse>
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
          </Table>
        )}

        {/* modal */}
       <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
            <Modal.Title>{editingInvoice ? "Editar Factura" : "Agregar Factura"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
            <Row className="mb-3">
                <Col md={4}>
                <Form.Label>Fecha Compra</Form.Label>
                <Form.Control
                    type="date"
                    value={formInvoice.fechaCompra}
                    onChange={(e) =>
                    setFormInvoice({ ...formInvoice, fechaCompra: e.target.value })
                    }
                />
                </Col>
                <Col md={4}>
                <Form.Label>No. Factura</Form.Label>
                <Form.Control
                    value={formInvoice.noFactura}
                    onChange={(e) =>
                    setFormInvoice({ ...formInvoice, noFactura: e.target.value })
                    }
                />
                </Col>
                <Col md={4}>
                <Form.Label>Serie</Form.Label>
                <Form.Control
                    value={formInvoice.serieFactura}
                    onChange={(e) =>
                    setFormInvoice({ ...formInvoice, serieFactura: e.target.value })
                    }
                />
                </Col>
            </Row>
            <Row className="mb-3">
                <Col>
                <Form.Label>Proveedor</Form.Label>
                <Form.Select
                    value={formInvoice.proveedor}
                    onChange={(e) =>
                    setFormInvoice({ ...formInvoice, proveedor: e.target.value })
                    }
                >
                    <option value="">Seleccione proveedor</option>
                    {providers.map((p) => (
                    <option key={p._id} value={p._id}>
                        {p.name}
                    </option>
                    ))}
                </Form.Select>
                </Col>
            </Row>

            <h5>Productos</h5>
            <Row className="mb-2 fw-bold">
                <Col md={3}>Producto</Col>
                <Col md={2}>Cantidad</Col>
                <Col md={2}>Subtotal</Col>
            </Row>

            {formInvoice.productos.map((p, idx) => (
                <Row key={idx} className="mb-2">
                <Col md={3}>
                    <Form.Select
                    value={p.producto}
                    onChange={(e) => handleProductChange(idx, "producto", e.target.value)}
                    >
                    <option value="">Seleccione producto</option>
                    {products.map((prod) => (
                        <option key={prod._id} value={prod._id}>
                        {prod.nombreArticulo}
                        </option>
                    ))}
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Control
                    type="number"
                    value={p.cantidad}
                    onChange={(e) => handleProductChange(idx, "cantidad", e.target.value)}
                    min="1"
                    />
                </Col>
                <Col md={2}>
                    <Form.Control
                    type="number"
                    value={p.valorInventario} // Subtotal calculado
                    readOnly
                    />
                </Col>
                </Row>
            ))}

            <Button size="sm" variant="outline-secondary" onClick={addProductLine}>
                + Agregar producto
            </Button>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave}>
            Guardar
            </Button>
        </Modal.Footer>
        </Modal>

      </Container>
    </>
  );
};

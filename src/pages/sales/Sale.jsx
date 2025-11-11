import { useState, useMemo, useEffect } from "react";
import { Button, Form, Container, Row, Col, Table, Collapse, Modal } from "react-bootstrap";
import { toast } from "react-hot-toast";
import CustomNavbar from "../../components/navbar/Navbar";
import { useSales } from "../../shared/hooks/useSales";
import { useClients } from "../../shared/hooks/useClients";
import { useProducts } from "../../shared/hooks/useProduct";
import "./Sale.css";

export const SalesPage = () => {
  const { sales, addSale, editSale, removeSale, loading } = useSales();
  const { clients, addClient } = useClients();
  const { products } = useProducts();

  const [expanded, setExpanded] = useState(null);

  // filtros
  const [searchNit, setSearchNit] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // modal
  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);

  const [isRecurrent, setIsRecurrent] = useState(false);
  const [nitSearch, setNitSearch] = useState("");
  const [foundClient, setFoundClient] = useState(null);

  useEffect(() => {
    if (isRecurrent && nitSearch.trim()) {
      const client = clients.find(c => c.nit === nitSearch.trim());
      setFoundClient(client || null);
      if (client) {
        setFormSale(prev => ({ ...prev, cliente: client._id }));
      }
    }
  }, [nitSearch, isRecurrent, clients]);



  // datos de la venta en edición/creación
  const [formSale, setFormSale] = useState({
    fechaVenta: "",
    cliente: "",
    productos: [],
  });

  // total calculado
  const totalVenta = useMemo(() => {
    return formSale.productos.reduce((acc, p) => acc + (Number(p.subtotal) || 0), 0);
  }, [formSale.productos]);


  // Agregar línea de producto
  const addProductLine = () => {
    setFormSale((prev) => ({
      ...prev,
      productos: [
        ...prev.productos,
        {
          producto: "",
          cantidad: 1,
          descuento: 0,
          subtotal: 0,
        },
      ],
    }));
  };

  // manejar cambios de producto
  const handleProductChange = (index, field, value) => {
    const updated = [...formSale.productos];
    updated[index][field] = value;

    const productoSeleccionado = products.find(p => p._id === updated[index].producto);
    const precio = productoSeleccionado ? productoSeleccionado.valorReal : 0;
    const cantidad = Number(updated[index].cantidad || 0);
    const descuento = Number(updated[index].descuento || 0);

    updated[index].subtotal = cantidad * precio * (1 - descuento / 100);

    setFormSale((prev) => ({ ...prev, productos: updated }));
  };

  
  // abrir modal nuevo/editar
  const handleOpenModal = (sale = null) => {
    if (sale) {
      setEditingSale(sale._id);
      const fecha = sale.fechaVenta.split("T")[0];

      setFormSale({
        fechaVenta: fecha,
        cliente: sale.cliente._id,
        productos: sale.productos.map((p) => ({
          producto: p.producto._id,
          cantidad: p.cantidad,
          descuento: p.descuento || 0,
          subtotal: p.subtotal,
        })),
      });
    } else {
      setEditingSale(null);
      setFormSale({
        fechaVenta: "",
        cliente: "",
        productos: [],
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      let clientId = formSale.cliente;

      // Si NO es recurrente, se crea cliente nuevo
      if (!isRecurrent) {
        if (!formSale.nombreCliente || !formSale.nitCliente) {
          toast.error("Debe ingresar nombre y NIT del cliente");
          return;
        }
        const resClient = await addClient({
          nombre: formSale.nombreCliente,
          nit: formSale.nitCliente,
        });

        if (resClient.error) {
          toast.error("Error al crear cliente");
          return;
        }
        clientId = resClient.client._id; // 👈 suponiendo que tu API responde con { client }
      }

      // Venta que se enviará
      const ventaData = {
        fechaVenta: formSale.fechaVenta,
        cliente: clientId,
        productos: formSale.productos,
      };

      const res = editingSale
        ? await editSale(editingSale, ventaData)
        : await addSale(ventaData);

      if (!res.error) {
        toast.success(editingSale ? "Venta actualizada" : "Venta agregada");
        setShowModal(false);
      }
    } catch (err) {
      toast.error("Error al guardar la venta");
      console.error(err);
    }
  };



  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar esta venta?")) {
      const res = await removeSale(id);
      if (!res.error) toast.success("Venta eliminada");
    }
  };

  // filtrado solo por fecha y NIT
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const saleDate = sale.fechaVenta.split("T")[0];
      const matchStart = startDate ? saleDate >= startDate : true;
      const matchEnd = endDate ? saleDate <= endDate : true;
      const matchNit = searchNit ? sale.cliente.nit.includes(searchNit) : true;
      return matchStart && matchEnd && matchNit;
    });
  }, [sales, searchNit, startDate, endDate]);

  // total de ventas visibles (respeta los filtros)
const totalFiltrado = useMemo(() => {
  return filteredSales.reduce((acc, sale) => acc + (Number(sale.totalVenta) || 0), 0);
}, [filteredSales]);


  return (
    <>
      <CustomNavbar />
      <Container className="sales-page my-5 pt-5">
        <h2 className="mb-4">Ventas</h2>

        {/* filtros */}
        <Row className="mb-3 g-2">
          <Col md={4}>
            <Form.Control
              placeholder="Buscar por NIT"
              value={searchNit}
              onChange={(e) => setSearchNit(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Control
              type="date"
              placeholder="Fecha inicio"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Control
              type="date"
              placeholder="Fecha fin"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Col>
          <Col md={2}>
            <Button onClick={() => handleOpenModal()}>Agregar Venta</Button>
          </Col>
        </Row>

        {/* tabla */}
        {loading ? (
          <p>Cargando ventas...</p>
        ) : (
          <Table bordered hover>
            <thead>
              <tr>
                <th></th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>NIT</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale._id}>
                  <td>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setExpanded(expanded === sale._id ? null : sale._id)}
                    >
                      {expanded === sale._id ? "▲" : "▼"}
                    </Button>
                  </td>
                  <td>{sale.fechaVenta.split("T")[0]}</td>
                  <td>{sale.cliente?.nombre}</td>
                  <td>{sale.cliente?.nit}</td>
                  <td>{sale.totalVenta}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" onClick={() => handleOpenModal(sale)}>
                      Editar
                    </Button>{" "}
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(sale._id)}>
                      Eliminar
                    </Button>
                  </td>
                  {expanded === sale._id && (
                    <tr>
                      <td colSpan="6" className="p-0">
                        <Collapse in={expanded === sale._id}>
                          <div className="p-3">
                            <Table size="sm" bordered>
                              <thead>
                                <tr>
                                  <th>Producto</th>
                                  <th>Cantidad</th>
                                  <th>Descuento (%)</th>
                                  <th>Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sale.productos.map((p) => (
                                  <tr key={p.producto._id}>
                                    <td>{p.producto.nombreArticulo}</td>
                                    <td>{p.cantidad}</td>
                                    <td>{p.descuento || 0}</td>
                                    <td>{p.subtotal}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </Collapse>
                      </td>
                    </tr>
                  )}
                </tr>
              ))}
            </tbody>
            {/* Total filtrado */}
{filteredSales.length > 0 && (
  <Row className="mt-3">
    <Col md={{ span: 3, offset: 6 }} className="fw-bold text-end">
      Total de ventas en este periodo:
    </Col>
    <Col md={3}>
      <Form.Control type="number" value={totalFiltrado} readOnly />
    </Col>
  </Row>
)}

          </Table>
        )}

        {/* modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" backdrop="static" keyboard={false} contentClassName="custom-sale-modal">
          <Modal.Header closeButton>
            <Modal.Title>{editingSale ? "Editar Venta" : "Agregar Venta"}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form>
              {/* Fecha y (opcionalmente) el cliente */}
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Label>Fecha Venta</Form.Label>
                  <Form.Control
                    type="date"
                    value={formSale.fechaVenta}
                    onChange={(e) => setFormSale({ ...formSale, fechaVenta: e.target.value })}
                  />
                </Col>

                <Col md={8} className="d-flex flex-column">
                  <Form.Check
                    className="mb-2"
                    type="checkbox"
                    label="Cliente recurrente"
                    checked={isRecurrent}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsRecurrent(checked);
                      setNitSearch("");
                      setFoundClient(null);
                      // limpiar campos de cliente nuevo / existente
                      setFormSale((prev) => ({ ...prev, cliente: "", nombreCliente: "", nitCliente: "" }));
                    }}
                  />

                  {isRecurrent ? (
  <div className="cliente-recurrente-box">
    <Form.Label>Buscar cliente por NIT</Form.Label>
    <Form.Control
      className="nit-search-input"
      type="text"
      placeholder="Ingrese NIT del cliente"
      value={nitSearch}
      onChange={(e) => setNitSearch(e.target.value)}
    />

    {foundClient ? (
      <div className="cliente-encontrado mt-2">
        ✅ Cliente encontrado: <strong>{foundClient.nombre}</strong> — NIT: {foundClient.nit}
      </div>
    ) : nitSearch ? (
      <div className="cliente-no-encontrado mt-2">
        ❌ No se encontró cliente con este NIT
      </div>
    ) : null}
  </div>
) : (

                    <>
                      <Form.Label>Nombre del Cliente</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nombre"
                        value={formSale.nombreCliente || ""}
                        onChange={(e) => setFormSale({ ...formSale, nombreCliente: e.target.value })}
                      />
                      <Form.Label className="mt-2">NIT</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="NIT"
                        value={formSale.nitCliente || ""}
                        onChange={(e) => setFormSale({ ...formSale, nitCliente: e.target.value })}
                      />
                    </>
                  )}
                </Col>
              </Row>

              {/* Productos header */}
              <h5>Productos</h5>
              <Row className="mb-2 fw-bold">
                <Col md={3}>Producto</Col>
                <Col md={2}>Cantidad</Col>
                <Col md={2}>Descuento (%)</Col>
                <Col md={2}>Subtotal</Col>
              </Row>

              {/* Filas de productos */}
              {formSale.productos.map((p, idx) => (
  <Row key={idx} className="mb-2">
    <Col md={3}>
      <Form.Label>Buscar producto (SKU o nombre)</Form.Label>
      <Form.Control
        list={`productos-list-${idx}`}
        type="text"
        placeholder="Escribe el SKU o nombre..."
        defaultValue={
          products.find((prod) => prod._id === p.producto)?.sku ||
          products.find((prod) => prod._id === p.producto)?.nombreArticulo ||
          ""
        }
        onChange={(e) => {
          const value = e.target.value;
          const found = products.find(
            (prod) =>
              prod.sku.toLowerCase() === value.toLowerCase() ||
              prod.nombreArticulo.toLowerCase() === value.toLowerCase()
          );
          if (found) {
            handleProductChange(idx, "producto", found._id);
            handleProductChange(idx, "cantidad", 1);
          }
        }}
      />
      <datalist id={`productos-list-${idx}`}>
        {products.map((prod) => (
          <option
            key={prod._id}
            value={prod.sku}
          >{`${prod.sku} - ${prod.nombreArticulo} (Stock: ${prod.cantidad})`}</option>
        ))}
      </datalist>
    </Col>

    <Col md={2}>
      <Form.Label>Cantidad</Form.Label>
      <Form.Control
        type="number"
        value={p.cantidad}
        onChange={(e) => handleProductChange(idx, "cantidad", e.target.value)}
        min="1"
        max={products.find((prod) => prod._id === p.producto)?.cantidad || undefined}
      />
    </Col>

    <Col md={2}>
      <Form.Label>Descuento (%)</Form.Label>
      <Form.Control
        type="number"
        value={p.descuento || 0}
        onChange={(e) => handleProductChange(idx, "descuento", e.target.value)}
        min="0"
        max="100"
      />
    </Col>

    <Col md={2}>
      <Form.Label>Subtotal</Form.Label>
      <Form.Control type="number" value={p.subtotal} readOnly />
    </Col>
  </Row>
))}


              {/* Total general */}
              <Row className="mt-3">
                <Col md={7}></Col>
                <Col md={2} className="fw-bold text-end">
                  Total:
                </Col>
                <Col md={2}>
                  <Form.Control type="number" value={totalVenta} readOnly />
                </Col>
              </Row>

              <Button size="sm" variant="outline-secondary" onClick={addProductLine} className="mt-3">
                + Agregar producto
              </Button>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {editingSale ? "Actualizar" : "Guardar"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

// src/pages/ProductsPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useProducts } from "../../shared/hooks/useProduct";
import { useProviders } from "../../shared/hooks/useProviders";
import CustomNavbar from "../../components/navbar/Navbar";
import "./Product.css";

const role = (() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u).role : "USER";
    } catch {
      return "USER";
    }
  })();

export const ProductsPage = () => {
  const { products, addProduct, editProduct, removeProduct } = useProducts();
  const { providers } = useProviders();

  // Rol desde el login
  const role = (() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u).role : "USER";
    } catch {
      return "USER";
    }
  })();

  // Filtros
  const [filters, setFilters] = useState({
    proveedor: "",
    nombre: "",
    serie: "",
  });

  // Modal y form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    sku: "",
    nombreArticulo: "",
    descripcion: "",
    proveedor: "",
    unidad: "UNIDAD",
    cantidad: 0,
    costoUnitario: 0,
    valorInventario: 0,
    valorConIvaSugerido: 0,
    valorReal: 0,
    porcentajeGanancia: 0,
    paqueteCantidad: "",
    imagenes: [],
  });

  // Helpers
  const formatCurrency = (n) =>
    typeof n === "number" && !Number.isNaN(n)
      ? n.toLocaleString("es-GT", { style: "currency", currency: "GTQ" })
      : "—";

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("es-GT");
  };

  // Auto-cálculos
    useEffect(() => {
  const cantidad = Number(formData.cantidad) || 0;
  const costo = Number(formData.costoUnitario) || 0;
  const ganancia = Number(formData.porcentajeGanancia) || 0; // en %

  const valorInventario = cantidad * costo;

  const valorConIvaSugerido =
    costo > 0
      ? costo * (1 + ganancia / 100) * (1 + 0.12)
      : 0;

  setFormData((prev) => ({
    ...prev,
    valorInventario,
    valorConIvaSugerido,
  }));
}, [formData.cantidad, formData.costoUnitario, formData.porcentajeGanancia]);




const handleOpenModal = (product = null) => {
  setEditingProduct(product);

  if (product) {
    // extraer cantidad del paquete si el producto tiene "PAQUETE de X Unidades"
    let paqueteCantidad = "";
    let unidad = "UNIDAD";
    if (typeof product.unidad === "string") {
      const match = product.unidad.match(/PAQUETE de (\d+)/);
      if (match) {
        paqueteCantidad = match[1];
        unidad = "PAQUETE";
      }
    }

    const cantidad = Number(product.cantidad ?? 0);
    const costo = Number(product.costoUnitario ?? 0);
    const valorConIva = Number(product.valorConIvaSugerido ?? 0);

    // Despejar % ganancia
    const porcentajeGuardado =
      costo > 0 ? Math.round(((valorConIva / (costo * 1.12)) - 1) * 100) : 0;

    const valorInventario = cantidad * costo;

    setFormData({
      sku: product.sku || "",
      nombreArticulo: product.nombreArticulo || "",
      descripcion: product.descripcion || "",
      proveedor: product.proveedor?._id || product.proveedor || "",
      unidad,
      cantidad,
      costoUnitario: costo,
      valorInventario,
      valorConIvaSugerido: valorConIva, // usar el valor que ya está guardado
      valorReal: Number(product.valorReal ?? 0),
      porcentajeGanancia: porcentajeGuardado, // este es solo para mostrar en el input
      paqueteCantidad,
      imagenes: [],
    });
  } else {
    // Limpiar formulario para agregar nuevo producto
    setFormData({
      sku: "",
      nombreArticulo: "",
      descripcion: "",
      proveedor: "",
      unidad: "UNIDAD",
      cantidad: 0,
      costoUnitario: 0,
      valorInventario: 0,
      valorConIvaSugerido: 0,
      valorReal: 0,
      porcentajeGanancia: 0,
      paqueteCantidad: "",
      imagenes: [],
    });
  }

  setIsModalOpen(true);
};


  // Guardar producto
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.sku.trim()) return alert("SKU es requerido");
    if (!formData.nombreArticulo.trim())
      return alert("Nombre del artículo es requerido");
    if (!formData.proveedor)
      return alert("Proveedor es requerido (combobox)");

    // Construir campo unidad
    let unidadFinal = formData.unidad;
    if (formData.unidad === "PAQUETE" && formData.paqueteCantidad) {
      unidadFinal = `PAQUETE de ${formData.paqueteCantidad} Unidades`;
    }

    const fd = new FormData();
    const keys = [
      "sku",
      "nombreArticulo",
      "descripcion",
      "proveedor",
      "cantidad",
      "costoUnitario",
      "valorInventario",
      "valorConIvaSugerido",
      "valorReal",
    ];
    keys.forEach((k) => fd.append(k, formData[k] ?? ""));

    fd.append("unidad", unidadFinal);

    if (formData.imagenes && formData.imagenes.length > 0) {
      for (let i = 0; i < formData.imagenes.length; i++) {
        fd.append("imagenes", formData.imagenes[i]);
      }
    }

    if (editingProduct) {
      await editProduct(editingProduct._id, fd);
    } else {
      await addProduct(fd);
    }
    setIsModalOpen(false);
  };

  // Filtrado en memoria
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const okProv =
        !filters.proveedor || p.proveedor?._id === filters.proveedor;
      const okNombre =
        !filters.nombre ||
        (p.nombreArticulo || "")
          .toLowerCase()
          .includes(filters.nombre.toLowerCase());
      const okSerie =
        !filters.serie ||
        (p.factura?.serieFactura || "").includes(filters.serie);

      return okProv && okNombre && okSerie;
    });
  }, [products, filters]);

  // Totales
  const totalValorInventario = useMemo(() => {
    return filteredProducts.reduce((acc, p) => acc + (Number(p.valorInventario) || 0), 0);
  }, [filteredProducts]);

  const totalValorReal = useMemo(() => {
    return filteredProducts.reduce((acc, p) => acc + (Number(p.valorReal) || 0), 0);
  }, [filteredProducts]);

  return (
    <>
      <CustomNavbar />
      <div id="products-page" className="px-4 py-6">
        <header className="header-row">
          <h1>Productos</h1>
        </header>

        {/* Filtros + Botón */}
        <div className="filters-row">
          <select
            value={filters.proveedor}
            onChange={(e) =>
              setFilters((f) => ({ ...f, proveedor: e.target.value }))
            }
          >
            <option value="">Todos los proveedores</option>
            {providers.map((prov) => (
              <option key={prov._id} value={prov._id}>
                {prov.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={filters.nombre}
            onChange={(e) =>
              setFilters((f) => ({ ...f, nombre: e.target.value }))
            }
          />

          <input
            type="text"
            placeholder="Serie de factura..."
            value={filters.serie}
            onChange={(e) =>
              setFilters((f) => ({ ...f, serie: e.target.value }))
            }
          />

          {role === "ADMIN" && (
            <button className="btn-primary" onClick={() => handleOpenModal()}>
              ➕ Agregar Producto
            </button>
          )}
        </div>

        {/* Tabla */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Imagen</th>
                <th>SKU</th>
                <th>NOMBRE DEL ARTICULO</th>
                <th>DESCRIPCIÓN</th>
                <th>NOMBRE DEL PROVEEDOR</th>
                {role === "ADMIN" &&<th>FECHA DE COMPRA</th>}
                {role === "ADMIN" &&<th>NO. FACTURA</th>}
                {role === "ADMIN" &&<th>SERIE DE FACTURA</th>}
                <th>UNIDAD</th>
                <th>CANT.</th>
                {role === "ADMIN" && <th>COSTO UNITARIO</th>}
                {role === "ADMIN" && <th>VALOR DE INVENTARIO</th>}
                {role === "ADMIN" && <th>VALOR CON IVA Y % SUGERIDO</th>}
                <th>VALOR REAL</th>
                {role === "ADMIN" && <th>Acciones</th>}
              </tr>

            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p._id}>
                  <td data-label="Imagen">
                    {p.imagenes?.length ? (
                      <img
                        src={`http://localhost:3333/${p.imagenes[0]}`}
                        alt={p.nombreArticulo}
                        className="thumb"
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td data-label="SKU"><span>{p.sku}</span></td>
                  <td data-label="NOMBRE DEL ARTICULO"><span>{p.nombreArticulo}</span></td>
                  <td data-label="DESCRIPCIÓN"><span>{p.descripcion}</span></td>
                  <td data-label="PROVEEDOR"><span>{p.proveedor?.name || "—"}</span></td>
                  <td data-label="FECHA DE COMPRA"><span>{formatDate(p.factura?.fechaCompra)}</span></td>
                  <td data-label="NO. FACTURA"><span>{p.factura?.noFactura || "—"}</span></td>
                  <td data-label="SERIE DE FACTURA"><span>{p.factura?.serieFactura || "—"}</span></td>
                  <td data-label="UNIDAD"><span>{p.unidad}</span></td>
                  <td data-label="CANT."><span>{p.cantidad}</span></td>
                 {role === "ADMIN" && (
                    <td data-label="COSTO UNITARIO">
                      <span>{formatCurrency(Number(p.costoUnitario))}</span>
                    </td>
                  )}
                  {role === "ADMIN" && (
                    <td data-label="VALOR DE INVENTARIO">
                      <span>{formatCurrency(Number(p.valorInventario))}</span>
                    </td>
                  )}
                  {role === "ADMIN" && (
                    <td data-label="VALOR CON IVA Y % SUGERIDO">
                      <span>{formatCurrency(Number(p.valorConIvaSugerido ?? 0))}</span>
                    </td>
                  )}
                  <td data-label="VALOR REAL"><span>{formatCurrency(Number(p.valorReal))}</span></td>
                  {role === "ADMIN" && (
                  <td data-label="Acciones" className="actions">
                    {role === "ADMIN" && (
                    <button
                      className="btn-warning"
                      onClick={() => handleOpenModal(p)}
                    >
                      Editar
                    </button>
                    )}   
                    {role === "ADMIN" && (
                      <button
                        className="btn-danger"
                        onClick={() => removeProduct(p._id)}
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                  )}
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={15} className="empty">
                    No hay productos que coincidan con el filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Totales: solo ADMIN ve el total inventario */}
          <div className="table-totals">
            {role === "ADMIN" && (
              <span>Total Valor Inventario: {formatCurrency(totalValorInventario)}</span>
            )}
            <span>Total Valor Real: {formatCurrency(totalValorReal)}</span>
        </div>

        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card">
              <h2>{editingProduct ? "Editar Producto" : "Agregar Producto"}</h2>

              <form onSubmit={handleSubmit} className="form-grid">
                <label>SKU *</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, sku: e.target.value }))
                  }
                  required
                />

                <label>Nombre del Artículo *</label>
                <input
                  type="text"
                  value={formData.nombreArticulo}
                  onChange={(e) =>
                    setFormData((d) => ({
                      ...d,
                      nombreArticulo: e.target.value,
                    }))
                  }
                  required
                />

                <label>Descripción</label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, descripcion: e.target.value }))
                  }
                  className="col-span-2"
                />

                <label>Proveedor *</label>
                <select
                  value={formData.proveedor}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, proveedor: e.target.value }))
                  }
                  required
                >
                  <option value="">Seleccione Proveedor *</option>
                  {providers.map((prov) => (
                    <option key={prov._id} value={prov._id}>
                      {prov.name}
                    </option>
                  ))}
                </select>

                <label>Unidad</label>
                <select
                  value={formData.unidad}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, unidad: e.target.value }))
                  }
                >
                  <option value="UNIDAD">UNIDAD</option>
                  <option value="PAQUETE">PAQUETE</option>
                </select>

                {formData.unidad === "PAQUETE" && (
                  <>
                    <label>Cantidad en Paquete</label>
                    <input
                      type="number"
                      value={formData.paqueteCantidad}
                      onChange={(e) =>
                        setFormData((d) => ({
                          ...d,
                          paqueteCantidad: e.target.value,
                        }))
                      }
                      min="1"
                    />
                  </>
                )}

                <label>Cantidad</label>
                <input
                  type="number"
                  value={formData.cantidad}
                  onChange={(e) =>
                    setFormData((d) => ({
                      ...d,
                      cantidad: Number(e.target.value),
                    }))
                  }
                  min="0"
                />

                <label>Costo Unitario</label>
                <input
                  type="number"
                  value={formData.costoUnitario}
                  onChange={(e) =>
                    setFormData((d) => ({
                      ...d,
                      costoUnitario: Number(e.target.value),
                    }))
                  }
                  min="0"
                  step="0.01"
                />

                <label>% Ganancia</label>
                <input
                  type="number"
                  value={formData.porcentajeGanancia ?? 0}
                  onChange={(e) =>
                    setFormData((d) => ({
                      ...d,
                      porcentajeGanancia: Math.round(Number(e.target.value)), // redondea al entero más cercano
                    }))
                  }
                  min="0"
                  step="1" // opcional, para que el input suba/baje de 1 en 1
                />


                <label>Valor Inventario</label>
                <input
                  type="number"
                  value={formData.valorInventario}
                  disabled
                  className="readonly"
                />

                <label>Valor con IVA Sugerido</label>
                <input
                  type="number"
                  value={Number(formData.valorConIvaSugerido ?? 0).toFixed(2)}
                  disabled
                  className="readonly"
                />

                <label>Valor Real</label>
                <input
                  type="number"
                  value={formData.valorReal}
                  onChange={(e) =>
                    setFormData((d) => ({
                      ...d,
                      valorReal: parseFloat(e.target.value),
                    }))
                  }
                  min="0"
                  step="0.01"
                />

                <label>Imágenes</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, imagenes: e.target.files }))
                  }
                  className="col-span-2"
                />

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-light"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingProduct ? "Actualizar" : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

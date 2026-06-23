import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axiosConfig";
import { useCarrito } from "../context/CarritoContext";
import {
  Package,
  AlertTriangle,
  DollarSign,
  CheckCircle,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  X,
  Plus,
  Save,
  Upload,
  FolderOpen,
  ShoppingCart,
  Minus,
  Plus as PlusIcon,
  Trash,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ========== CARGA AUTOMÁTICA DE IMÁGENES POR CARPETA (sin cambios) ==========
const imageModules = import.meta.glob(
  "/src/assets/productos/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  { eager: true, import: "default" },
);

const imagesByCategory = {
  desengrasantes: [],
  sanitizantes: [],
  otros: [],
};

Object.entries(imageModules).forEach(([path, url]) => {
  const fileName = path.split("/").pop();
  if (path.includes("/desengrasantes/")) {
    imagesByCategory.desengrasantes.push({ path: url, name: fileName });
  } else if (path.includes("/sanitizantes/")) {
    imagesByCategory.sanitizantes.push({ path: url, name: fileName });
  } else {
    imagesByCategory.otros.push({ path: url, name: fileName });
  }
});

// ========== ESTILOS REUTILIZABLES (igual que en Ventas) ==========
const thStyle = {
  textAlign: "left",
  padding: "6px 8px",
  fontWeight: 600,
  color: "#94a3b8",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "0.5px solid rgba(255,255,255,0.08)",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "6px 8px",
  verticalAlign: "middle",
  fontSize: 11,
  color: "#e2e8f0",
};

// ========== TOAST ==========
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "#10b981" : "#ef4444";
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      style={{
        position: "fixed",
        top: 80,
        right: 16,
        zIndex: 9999,
        background: "#252836",
        border: `1px solid ${bgColor}40`,
        borderRadius: 12,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
        color: "#e2e8f0",
        fontSize: 12,
        maxWidth: 320,
        backdropFilter: "blur(8px)",
      }}
    >
      <span style={{ color: bgColor }}>{type === "success" ? "✅" : "❌"}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          color: "#64748b",
          cursor: "pointer",
          padding: 2,
        }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

// ========== METRIC CARD (con inline styles) ==========
const MetricCard = memo(({ title, value, icon: Icon, accent }) => {
  const accentColors = {
    blue: {
      bg: "rgba(79,142,247,0.12)",
      border: "rgba(79,142,247,0.3)",
      text: "#4f8ef7",
    },
    emerald: {
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.3)",
      text: "#10b981",
    },
    red: {
      bg: "rgba(239,68,68,0.12)",
      border: "rgba(239,68,68,0.3)",
      text: "#ef4444",
    },
  };
  const colors = accentColors[accent] || accentColors.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "#252836",
        borderRadius: 12,
        border: "0.5px solid rgba(255,255,255,0.08)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <p
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#e2e8f0",
            marginTop: 2,
          }}
        >
          {value}
        </p>
      </div>
      <div
        style={{
          background: colors.bg,
          border: `0.5px solid ${colors.border}`,
          borderRadius: 10,
          padding: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={18} color={colors.text} />
      </div>
    </motion.div>
  );
});

// ========== PRODUCT CARD (con inline styles) ==========
const ProductCard = memo(({ item, onEdit, onDelete, onReponer }) => {
  const p = item.producto;
  const stockBajo = item.stock_bajo;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: "#252836",
        borderRadius: 12,
        border: "0.5px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
        transition: "background 0.2s, border-color 0.2s",
        display: "flex",
        flexDirection: "column",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#252836";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      {/* Imagen con badge de stock */}
      <div
        style={{
          background: "rgba(0,0,0,0.3)",
          height: 144,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {p.imagen ? (
          <img
            src={p.imagen}
            alt={p.nombre}
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "contain",
              padding: 8,
            }}
          />
        ) : (
          <Package size={36} color="#4a5568" />
        )}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 8px",
            borderRadius: 12,
            fontSize: 9,
            fontWeight: 600,
            border: "0.5px solid",
            background: stockBajo
              ? "rgba(239,68,68,0.2)"
              : "rgba(16,185,129,0.2)",
            borderColor: stockBajo
              ? "rgba(239,68,68,0.3)"
              : "rgba(16,185,129,0.3)",
            color: stockBajo ? "#fca5a5" : "#6ee7b7",
          }}
        >
          {stockBajo ? (
            <>
              <AlertTriangle size={10} /> Stock bajo
            </>
          ) : (
            <>
              <CheckCircle size={10} /> OK
            </>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div
        style={{
          flex: 1,
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div>
          <p style={{ fontSize: 9, fontFamily: "monospace", color: "#64748b" }}>
            {p.codigo}
          </p>
          <h3
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#e2e8f0",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {p.nombre}
          </h3>
          {p.categoria && (
            <span
              style={{
                display: "inline-block",
                marginTop: 4,
                fontSize: 8,
                background: "rgba(255,255,255,0.05)",
                color: "#94a3b8",
                padding: "1px 8px",
                borderRadius: 12,
                border: "0.5px solid rgba(255,255,255,0.06)",
              }}
            >
              {p.categoria}
            </span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            background: "rgba(0,0,0,0.2)",
            borderRadius: 8,
            padding: "4px 10px",
            border: "0.5px solid rgba(255,255,255,0.05)",
          }}
        >
          <div>
            <p
              style={{
                fontSize: 7,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Precio
            </p>
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#e2e8f0",
                fontFamily: "monospace",
              }}
            >
              ${p.precio?.toLocaleString()}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontSize: 7,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Stock
            </p>
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "monospace",
                color: stockBajo ? "#fca5a5" : "#e2e8f0",
              }}
            >
              {p.stock_actual}
            </p>
          </div>
        </div>

        {p.proveedor && (
          <p
            style={{
              fontSize: 8,
              color: "#64748b",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={p.proveedor}
          >
            {p.proveedor}
          </p>
        )}

        <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
          <button
            onClick={() => onEdit(item)}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.05)",
              border: "0.5px solid rgba(255,255,255,0.08)",
              borderRadius: 6,
              padding: "4px 0",
              fontSize: 9,
              color: "#94a3b8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
            }
          >
            <Edit size={11} /> Editar
          </button>
          <button
            onClick={() => onReponer(p)}
            style={{
              flex: 1,
              background: "rgba(79,142,247,0.12)",
              border: "0.5px solid rgba(79,142,247,0.2)",
              borderRadius: 6,
              padding: "4px 0",
              fontSize: 9,
              color: "#4f8ef7",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(79,142,247,0.2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(79,142,247,0.12)")
            }
          >
            <ShoppingCart size={11} /> Reponer
          </button>
          <button
            onClick={() => onDelete(item)}
            style={{
              padding: "4px 8px",
              background: "rgba(255,255,255,0.05)",
              border: "0.5px solid rgba(255,255,255,0.08)",
              borderRadius: 6,
              fontSize: 9,
              color: "#64748b",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

// ========== COMPONENTE PRINCIPAL ==========
const Inventario = () => {
  const {
    items: carritoItems,
    totalItems: carritoCount,
    agregarAlCarrito,
    eliminarDelCarrito,
    actualizarCantidad,
    vaciarCarrito,
    generarPedido,
    loading: carritoLoading,
    totalGeneral,
  } = useCarrito();

  // Estados (sin cambios)
  const [productos, setProductos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [showCarritoModal, setShowCarritoModal] = useState(false);
  const [showCantidadModal, setShowCantidadModal] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [cantidadReponer, setCantidadReponer] = useState(1);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    codigo: "",
    nombre: "",
    categoria: "",
    stock_actual: 0,
    costo: 0,
    precio: 0,
    imagen: null,
    imagenUrl: "",
    proveedor_id: "",
  });
  const [saving, setSaving] = useState(false);
  const [imageSource, setImageSource] = useState("upload");
  const [selectedExistingImage, setSelectedExistingImage] = useState(null);
  const [proveedores, setProveedores] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  // ========== API (sin cambios) ==========
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productosRes, resumenRes] = await Promise.all([
        api.get("/inventario"),
        api.get("/inventario/resumen"),
      ]);
      setProductos(productosRes.data);
      setResumen(resumenRes.data);
    } catch (err) {
      console.error(err);
      setError("Error al cargar los datos del inventario");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProveedores = useCallback(async () => {
    try {
      const res = await api.get("/proveedores");
      setProveedores(res.data);
    } catch (err) {
      console.error("No se pudieron cargar los proveedores", err);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    fetchProveedores();
  }, [fetchAllData, fetchProveedores]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoriaSeleccionada]);

  // ========== HANDLERS (sin cambios) ==========
  const openCreateModal = useCallback(() => {
    setEditingProduct(null);
    setProductForm({
      codigo: "",
      nombre: "",
      categoria: "",
      stock_actual: 0,
      costo: 0,
      precio: 0,
      imagen: null,
      imagenUrl: "",
      proveedor_id: "",
    });
    setImageSource("upload");
    setSelectedExistingImage(null);
    setShowProductModal(true);
  }, []);

  const openEditModal = useCallback((item) => {
    setEditingProduct(item.producto);
    setProductForm({
      codigo: item.producto.codigo,
      nombre: item.producto.nombre,
      categoria: item.producto.categoria || "",
      stock_actual: item.producto.stock_actual,
      costo: item.producto.costo || 0,
      precio: item.producto.precio,
      imagen: item.producto.imagen || null,
      imagenUrl: item.producto.imagen || "",
      proveedor_id: item.producto.proveedor_id || "",
    });
    setImageSource(item.producto.imagen ? "existing" : "upload");
    setSelectedExistingImage(item.producto.imagen || null);
    setShowProductModal(true);
  }, []);

  const handleSaveProduct = useCallback(async () => {
    if (!productForm.codigo || !productForm.nombre || productForm.precio <= 0) {
      setErrorMsg(
        "Completa los campos obligatorios: código, nombre y precio > 0",
      );
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("codigo", productForm.codigo);
      formData.append("nombre", productForm.nombre);
      formData.append("categoria", productForm.categoria || "");
      formData.append("stock_actual", productForm.stock_actual);
      formData.append("costo", productForm.costo);
      formData.append("precio", productForm.precio);
      formData.append("proveedor_id", productForm.proveedor_id);

      if (imageSource === "upload" && productForm.imagen instanceof File) {
        formData.append("imagen", productForm.imagen);
      } else if (imageSource === "existing" && selectedExistingImage) {
        formData.append("imagen", selectedExistingImage);
      }

      if (editingProduct) {
        formData.append("_method", "PUT");
        await api.post(`/inventario/${editingProduct.codigo}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccessMsg("Producto actualizado correctamente");
      } else {
        await api.post("/inventario", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccessMsg("Producto creado correctamente");
      }
      setShowProductModal(false);
      fetchAllData();
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message || "Error al guardar el producto",
      );
    } finally {
      setSaving(false);
    }
  }, [
    productForm,
    imageSource,
    selectedExistingImage,
    editingProduct,
    fetchAllData,
  ]);

  const confirmDelete = (item) => {
    setProductoAEliminar(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!productoAEliminar) return;
    const producto = productoAEliminar.producto;
    try {
      await api.delete(`/inventario/${producto.codigo}`);
      setSuccessMsg(`Producto ${producto.nombre} eliminado`);
      fetchAllData();
      setShowDeleteModal(false);
      setProductoAEliminar(null);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al eliminar el producto");
    }
  };

  const openCantidadModal = (producto) => {
    setSelectedProducto(producto);
    setCantidadReponer(1);
    setShowCantidadModal(true);
  };

  const confirmarAgregar = () => {
    if (cantidadReponer < 1) {
      setErrorMsg("Cantidad inválida");
      return;
    }
    agregarAlCarrito(selectedProducto, cantidadReponer);
    setSuccessMsg(`${selectedProducto.nombre} agregado al carrito`);
    setShowCantidadModal(false);
    setSelectedProducto(null);
  };

  const handleGenerarPedido = async () => {
    try {
      await generarPedido();
      setSuccessMsg("Pedido generado correctamente");
      setShowCarritoModal(false);
      fetchAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // ========== DATOS DERIVADOS ==========
  const categoriasExistentes = useMemo(
    () => [
      ...new Set(
        productos.map((item) => item.producto.categoria).filter(Boolean),
      ),
    ],
    [productos],
  );

  const filteredProductos = useMemo(() => {
    return productos.filter((item) => {
      const p = item.producto;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        p.codigo.toLowerCase().includes(term) ||
        p.nombre.toLowerCase().includes(term);
      const matchesCategoria = categoriaSeleccionada
        ? p.categoria === categoriaSeleccionada
        : true;
      return matchesSearch && matchesCategoria;
    });
  }, [productos, searchTerm, categoriaSeleccionada]);

  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProductos.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const currentCategory = productForm.categoria?.toLowerCase() || "";
  const availableImages = useMemo(
    () => imagesByCategory[currentCategory] || [],
    [currentCategory],
  );
  const hasImagesForCategory = availableImages.length > 0;

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 48px)",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "3px solid transparent",
            borderTop: "3px solid #4f8ef7",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (error)
    return (
      <div
        style={{
          background: "rgba(239,68,68,0.1)",
          border: "1px solid #ef4444",
          borderRadius: 12,
          padding: "24px 32px",
          textAlign: "center",
          color: "#ef4444",
        }}
      >
        <AlertTriangle size={32} style={{ marginBottom: 8 }} />
        <p>{error}</p>
      </div>
    );

  const totalProductos = resumen?.total_productos || 0;
  const stockBajo = resumen?.productos_stock_bajo || 0;
  const valorInventario = resumen?.valor_total_inventario || 0;

  return (
    <div
      style={{
        background: "#1a1d27",
        borderRadius: 12,
        padding: 14,
        width: "100%",
        height: "calc(100vh - 48px)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        fontFamily: "system-ui, sans-serif",
        overflow: "hidden",
        color: "#e2e8f0",
      }}
    >
      <AnimatePresence>
        {successMsg && (
          <Toast
            message={successMsg}
            type="success"
            onClose={() => setSuccessMsg("")}
          />
        )}
        {errorMsg && (
          <Toast
            message={errorMsg}
            type="error"
            onClose={() => setErrorMsg("")}
          />
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 6,
          borderBottom: "0.5px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              background: "#4f5cf7",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Package size={15} color="#fff" />
          </div>
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#e2e8f0",
                lineHeight: 1.2,
              }}
            >
              Inventario
            </p>
            <p style={{ fontSize: 9, color: "#64748b" }}>
              Gestión de productos y reposiciones
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                background: "#252836",
                border: "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: 7,
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Search size={13} color="#64748b" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#e2e8f0",
                  fontSize: 11,
                  width: 100,
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    padding: 2,
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              style={{
                background: "#252836",
                border: "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: 7,
                padding: "4px 8px",
                fontSize: 11,
                color: "#94a3b8",
                outline: "none",
                cursor: "pointer",
                height: 28,
              }}
            >
              <option value="">Todas</option>
              {categoriasExistentes.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button
              onClick={fetchAllData}
              style={{
                background: "#252836",
                border: "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: 7,
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#94a3b8",
              }}
            >
              <RefreshCw size={13} />
            </button>

            <button
              onClick={openCreateModal}
              style={{
                background: "#4f8ef7",
                border: "none",
                borderRadius: 7,
                padding: "4px 12px",
                fontSize: 11,
                fontWeight: 500,
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                height: 28,
              }}
            >
              <Plus size={13} /> Nuevo
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTENIDO PRINCIPAL (scrollable) ── */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* ── MÉTRICAS ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
          }}
        >
          <MetricCard
            title="Total productos"
            value={totalProductos}
            icon={Package}
            accent="blue"
          />
          <MetricCard
            title="Stock bajo"
            value={stockBajo}
            icon={AlertTriangle}
            accent="red"
          />
          <MetricCard
            title="Valor inventario"
            value={`$${valorInventario.toLocaleString()}`}
            icon={DollarSign}
            accent="emerald"
          />
        </div>

        {/* ── GALERÍA DE PRODUCTOS ── */}
        <div
          style={{
            background: "#252836",
            borderRadius: 12,
            border: "0.5px solid rgba(255,255,255,0.08)",
            padding: 14,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <h2
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#e2e8f0",
              }}
            >
              Productos
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 12,
                  fontWeight: 400,
                  color: "#64748b",
                }}
              >
                ({filteredProductos.length})
              </span>
            </h2>
            {categoriaSeleccionada && (
              <button
                onClick={() => setCategoriaSeleccionada("")}
                style={{
                  fontSize: 10,
                  color: "#94a3b8",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <X size={12} /> Quitar filtro
              </button>
            )}
          </div>

          {filteredProductos.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "#64748b",
              }}
            >
              <Package
                size={32}
                style={{ margin: "0 auto 8px", color: "#4a5568" }}
              />
              <p style={{ fontSize: 13 }}>No se encontraron productos</p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: 12,
                  flex: 1,
                }}
              >
                {paginatedProducts.map((item) => (
                  <ProductCard
                    key={item.producto.codigo}
                    item={item}
                    onEdit={openEditModal}
                    onDelete={confirmDelete}
                    onReponer={openCantidadModal}
                  />
                ))}
              </div>

              {/* ── PAGINACIÓN ── */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: "0.5px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 4,
                      background: "#252836",
                      border: "0.5px solid rgba(255,255,255,0.1)",
                      color: "#94a3b8",
                      fontSize: 11,
                      cursor: currentPage === 1 ? "default" : "pointer",
                      opacity: currentPage === 1 ? 0.4 : 1,
                    }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 4,
                      background: "#252836",
                      border: "0.5px solid rgba(255,255,255,0.1)",
                      color: "#94a3b8",
                      fontSize: 11,
                      cursor:
                        currentPage === totalPages ? "default" : "pointer",
                      opacity: currentPage === totalPages ? 0.4 : 1,
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── BOTÓN FLOTANTE DEL CARRITO ── */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowCarritoModal(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 40,
          background: "linear-gradient(135deg, #4f8ef7, #3b6fc9)",
          border: "none",
          borderRadius: 12,
          padding: "8px 14px",
          boxShadow: "0 8px 24px rgba(79,142,247,0.4)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "#fff",
          cursor: "pointer",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <ShoppingCart size={17} />
        <span style={{ fontSize: 11, fontWeight: 600 }}>
          {carritoCount > 0
            ? `${carritoCount} ítem${carritoCount !== 1 ? "s" : ""}`
            : "Carrito"}
        </span>
        {carritoCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              background: "#ef4444",
              color: "#fff",
              fontSize: 8,
              fontWeight: 700,
              borderRadius: "50%",
              width: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #1a1d27",
            }}
          >
            {carritoCount > 99 ? "99+" : carritoCount}
          </span>
        )}
      </motion.button>

      {/* ── MODALES (sin cambios, solo estilo inline) ── */}
      {/* Modal Cantidad */}
      <AnimatePresence>
        {showCantidadModal && selectedProducto && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(4px)",
              }}
              onClick={() => setShowCantidadModal(false)}
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              style={{
                position: "relative",
                background: "#1a1d27",
                border: "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                width: "100%",
                maxWidth: 320,
                padding: 20,
                boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    background: "rgba(79,142,247,0.15)",
                    border: "0.5px solid rgba(79,142,247,0.3)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShoppingCart size={14} color="#4f8ef7" />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 8,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Reponer
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#e2e8f0",
                      lineHeight: 1.2,
                    }}
                  >
                    {selectedProducto.nombre}
                  </p>
                </div>
              </div>

              <label
                style={{
                  display: "block",
                  fontSize: 10,
                  color: "#94a3b8",
                  marginBottom: 4,
                }}
              >
                Cantidad a solicitar
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#252836",
                  border: "0.5px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  padding: 4,
                  marginBottom: 12,
                }}
              >
                <button
                  onClick={() => setCantidadReponer((c) => Math.max(1, c - 1))}
                  style={{
                    width: 28,
                    height: 28,
                    background: "rgba(255,255,255,0.05)",
                    border: "none",
                    borderRadius: 6,
                    color: "#94a3b8",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Minus size={12} />
                </button>
                <input
                  type="number"
                  value={cantidadReponer}
                  onChange={(e) =>
                    setCantidadReponer(
                      Math.max(1, parseInt(e.target.value) || 1),
                    )
                  }
                  min="1"
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#e2e8f0",
                    fontSize: 16,
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                  autoFocus
                />
                <button
                  onClick={() => setCantidadReponer((c) => c + 1)}
                  style={{
                    width: 28,
                    height: 28,
                    background: "rgba(255,255,255,0.05)",
                    border: "none",
                    borderRadius: 6,
                    color: "#94a3b8",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PlusIcon size={12} />
                </button>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setShowCantidadModal(false)}
                  style={{
                    flex: 1,
                    padding: "6px 0",
                    background: "#252836",
                    border: "0.5px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#94a3b8",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarAgregar}
                  style={{
                    flex: 1,
                    padding: "6px 0",
                    background: "#4f8ef7",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Agregar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Confirmar Eliminar */}
      <AnimatePresence>
        {showDeleteModal && productoAEliminar && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(4px)",
              }}
              onClick={() => {
                setShowDeleteModal(false);
                setProductoAEliminar(null);
              }}
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              style={{
                position: "relative",
                background: "#1a1d27",
                border: "0.5px solid rgba(239,68,68,0.3)",
                borderRadius: 12,
                width: "100%",
                maxWidth: 400,
                padding: 24,
                boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: "rgba(239,68,68,0.15)",
                    border: "0.5px solid rgba(239,68,68,0.3)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Trash2 size={16} color="#ef4444" />
                </div>
                <div>
                  <h3
                    style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}
                  >
                    Confirmar eliminación
                  </h3>
                  <p style={{ fontSize: 10, color: "#64748b" }}>
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
                ¿Estás seguro de eliminar el producto{" "}
                <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
                  {productoAEliminar.producto.nombre}
                </span>
                ?
              </p>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProductoAEliminar(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    background: "#252836",
                    border: "0.5px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#94a3b8",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    background: "#ef4444",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DRAWER CARRITO (con inline styles) ── */}
      <AnimatePresence>
        {showCarritoModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(2px)",
              }}
              onClick={() => setShowCarritoModal(false)}
            />
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 340,
                background: "#1a1d27",
                borderLeft: "0.5px solid rgba(255,255,255,0.08)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 0 48px rgba(0,0,0,0.6)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  flexShrink: 0,
                  padding: "16px 16px 12px",
                  borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        background: "rgba(79,142,247,0.12)",
                        border: "0.5px solid rgba(79,142,247,0.2)",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ShoppingCart size={14} color="#4f8ef7" />
                    </div>
                    <div>
                      <h2
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#e2e8f0",
                          lineHeight: 1.2,
                        }}
                      >
                        Carrito
                      </h2>
                      <p style={{ fontSize: 9, color: "#64748b" }}>
                        {carritoCount === 0
                          ? "Sin productos"
                          : `${carritoCount} producto${carritoCount !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCarritoModal(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#64748b",
                      cursor: "pointer",
                      padding: 4,
                      borderRadius: 4,
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Items */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "10px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {carritoItems.length === 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      textAlign: "center",
                      padding: "24px 0",
                    }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        background: "#252836",
                        border: "0.5px solid rgba(255,255,255,0.06)",
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 10,
                      }}
                    >
                      <ShoppingCart size={24} color="#4a5568" />
                    </div>
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      Carrito vacío
                    </p>
                    <p style={{ color: "#64748b", fontSize: 10, marginTop: 2 }}>
                      Agrega productos desde el inventario
                    </p>
                  </div>
                ) : (
                  carritoItems.map((item) => (
                    <motion.div
                      key={item.codigo}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      style={{
                        background: "#252836",
                        borderRadius: 8,
                        border: "0.5px solid rgba(255,255,255,0.05)",
                        padding: "10px 12px",
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          background: "rgba(79,142,247,0.08)",
                          borderRadius: 6,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Package size={12} color="#4f8ef7" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#e2e8f0",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.nombre}
                        </p>
                        <p style={{ fontSize: 8, color: "#64748b" }}>
                          {item.codigo} · ${item.precio.toLocaleString()}/u
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: 4,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              background: "rgba(0,0,0,0.3)",
                              borderRadius: 4,
                              padding: "1px 4px",
                            }}
                          >
                            <button
                              onClick={() =>
                                actualizarCantidad(
                                  item.codigo,
                                  item.cantidad - 1,
                                )
                              }
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#94a3b8",
                                cursor: "pointer",
                                padding: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Minus size={8} />
                            </button>
                            <span
                              style={{
                                fontSize: 10,
                                fontFamily: "monospace",
                                color: "#e2e8f0",
                                width: 18,
                                textAlign: "center",
                              }}
                            >
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() =>
                                actualizarCantidad(
                                  item.codigo,
                                  item.cantidad + 1,
                                )
                              }
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#94a3b8",
                                cursor: "pointer",
                                padding: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <PlusIcon size={8} />
                            </button>
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#e2e8f0",
                              fontFamily: "monospace",
                            }}
                          >
                            ${(item.precio * item.cantidad).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => eliminarDelCarrito(item.codigo)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#64748b",
                          cursor: "pointer",
                          padding: 4,
                          borderRadius: 4,
                          flexShrink: 0,
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#ef4444")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#64748b")
                        }
                      >
                        <Trash2 size={12} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              {carritoItems.length > 0 && (
                <div
                  style={{
                    flexShrink: 0,
                    borderTop: "0.5px solid rgba(255,255,255,0.06)",
                    padding: "12px 14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      background: "#252836",
                      borderRadius: 8,
                      padding: "8px 12px",
                      border: "0.5px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 10,
                      }}
                    >
                      <span style={{ color: "#94a3b8" }}>Productos</span>
                      <span
                        style={{ color: "#e2e8f0", fontFamily: "monospace" }}
                      >
                        {carritoCount}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginTop: 2,
                      }}
                    >
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>
                        Total estimado
                      </span>
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: "#e2e8f0",
                          fontFamily: "monospace",
                        }}
                      >
                        ${totalGeneral.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerarPedido}
                    disabled={carritoLoading}
                    style={{
                      width: "100%",
                      padding: "10px 0",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#fff",
                      cursor: carritoLoading ? "default" : "pointer",
                      opacity: carritoLoading ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    {carritoLoading ? (
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTop: "2px solid #fff",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                    ) : (
                      <>
                        <Sparkles size={14} /> Generar pedido
                      </>
                    )}
                  </motion.button>

                  <button
                    onClick={() => {
                      if (window.confirm("¿Vaciar carrito?")) vaciarCarrito();
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 0",
                      background: "transparent",
                      border: "0.5px solid rgba(255,255,255,0.06)",
                      borderRadius: 8,
                      fontSize: 10,
                      fontWeight: 500,
                      color: "#64748b",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      transition: "color 0.2s, border-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#ef4444";
                      e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#64748b";
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.06)";
                    }}
                  >
                    <Trash2 size={12} /> Vaciar carrito
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL CREAR/EDITAR PRODUCTO ── */}
      <AnimatePresence>
        {showProductModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(4px)",
              }}
              onClick={() => setShowProductModal(false)}
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              style={{
                position: "relative",
                background: "#1a1d27",
                border: "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                width: "100%",
                maxWidth: 680,
                maxHeight: "90vh",
                overflow: "hidden",
                boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 18px",
                  borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                  flexShrink: 0,
                }}
              >
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
                  {editingProduct ? "Editar producto" : "Nuevo producto"}
                </h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setShowProductModal(false)}
                    style={{
                      padding: "4px 12px",
                      background: "#252836",
                      border: "0.5px solid rgba(255,255,255,0.08)",
                      borderRadius: 6,
                      fontSize: 11,
                      color: "#94a3b8",
                      cursor: "pointer",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveProduct}
                    disabled={saving}
                    style={{
                      padding: "4px 12px",
                      background: "#4f8ef7",
                      border: "none",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#fff",
                      cursor: saving ? "default" : "pointer",
                      opacity: saving ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Save size={12} /> {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>

              {/* Body */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px 18px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                {/* Columna izquierda */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 9,
                          color: "#94a3b8",
                          marginBottom: 2,
                        }}
                      >
                        Código *
                      </label>
                      <input
                        type="text"
                        value={productForm.codigo}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            codigo: e.target.value,
                          })
                        }
                        disabled={!!editingProduct}
                        style={{
                          width: "100%",
                          background: "#252836",
                          border: "0.5px solid rgba(255,255,255,0.08)",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 12,
                          color: "#e2e8f0",
                          outline: "none",
                          disabled: !!editingProduct ? { opacity: 0.5 } : {},
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 9,
                          color: "#94a3b8",
                          marginBottom: 2,
                        }}
                      >
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={productForm.nombre}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            nombre: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          background: "#252836",
                          border: "0.5px solid rgba(255,255,255,0.08)",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 12,
                          color: "#e2e8f0",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 9,
                          color: "#94a3b8",
                          marginBottom: 2,
                        }}
                      >
                        Categoría
                      </label>
                      <input
                        type="text"
                        value={productForm.categoria}
                        placeholder="Ej: desengrasantes"
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            categoria: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          background: "#252836",
                          border: "0.5px solid rgba(255,255,255,0.08)",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 12,
                          color: "#e2e8f0",
                          outline: "none",
                          placeholder: { color: "#64748b" },
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 9,
                          color: "#94a3b8",
                          marginBottom: 2,
                        }}
                      >
                        Proveedor
                      </label>
                      <select
                        value={productForm.proveedor_id}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            proveedor_id: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          background: "#252836",
                          border: "0.5px solid rgba(255,255,255,0.08)",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 12,
                          color: "#e2e8f0",
                          outline: "none",
                        }}
                      >
                        <option value="">Seleccionar</option>
                        {proveedores.map((prov) => (
                          <option key={prov.id} value={prov.id}>
                            {prov.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 8,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 9,
                          color: "#94a3b8",
                          marginBottom: 2,
                        }}
                      >
                        Stock
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={productForm.stock_actual}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            stock_actual: parseFloat(e.target.value) || 0,
                          })
                        }
                        style={{
                          width: "100%",
                          background: "#252836",
                          border: "0.5px solid rgba(255,255,255,0.08)",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 12,
                          color: "#e2e8f0",
                          outline: "none",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 9,
                          color: "#94a3b8",
                          marginBottom: 2,
                        }}
                      >
                        Costo
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.costo}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            costo: parseFloat(e.target.value) || 0,
                          })
                        }
                        style={{
                          width: "100%",
                          background: "#252836",
                          border: "0.5px solid rgba(255,255,255,0.08)",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 12,
                          color: "#e2e8f0",
                          outline: "none",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 9,
                          color: "#94a3b8",
                          marginBottom: 2,
                        }}
                      >
                        Precio *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.precio}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            precio: parseFloat(e.target.value) || 0,
                          })
                        }
                        style={{
                          width: "100%",
                          background: "#252836",
                          border: "0.5px solid rgba(255,255,255,0.08)",
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 12,
                          color: "#e2e8f0",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Columna derecha */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <label style={{ fontSize: 9, color: "#94a3b8" }}>
                    Imagen del producto
                  </label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[
                      { key: "upload", icon: Upload, label: "Subir" },
                      { key: "existing", icon: FolderOpen, label: "Carpeta" },
                    ].map(({ key, icon: Icon, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setImageSource(key)}
                        style={{
                          flex: 1,
                          padding: "4px 0",
                          borderRadius: 6,
                          fontSize: 9,
                          border: "0.5px solid",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                          background:
                            imageSource === key
                              ? "rgba(79,142,247,0.15)"
                              : "transparent",
                          borderColor:
                            imageSource === key
                              ? "rgba(79,142,247,0.3)"
                              : "rgba(255,255,255,0.06)",
                          color: imageSource === key ? "#4f8ef7" : "#94a3b8",
                        }}
                      >
                        <Icon size={10} /> {label}
                      </button>
                    ))}
                  </div>

                  {imageSource === "upload" ? (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          imagen: e.target.files[0],
                          imagenUrl: e.target.files[0]
                            ? URL.createObjectURL(e.target.files[0])
                            : "",
                        })
                      }
                      style={{
                        width: "100%",
                        fontSize: 10,
                        background: "#252836",
                        border: "0.5px solid rgba(255,255,255,0.08)",
                        borderRadius: 6,
                        padding: "4px 8px",
                        color: "#94a3b8",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <p style={{ fontSize: 9, color: "#64748b" }}>
                        Categoría:{" "}
                        <span style={{ color: "#e2e8f0" }}>
                          {productForm.categoria || "(sin categoría)"}
                        </span>
                      </p>
                      {productForm.categoria ? (
                        hasImagesForCategory ? (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(3, 1fr)",
                              gap: 6,
                              maxHeight: 160,
                              overflowY: "auto",
                              padding: 4,
                              background: "rgba(0,0,0,0.2)",
                              borderRadius: 6,
                              border: "0.5px solid rgba(255,255,255,0.04)",
                            }}
                          >
                            {availableImages.map((img, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setSelectedExistingImage(img.path);
                                  setProductForm({
                                    ...productForm,
                                    imagen: img.path,
                                    imagenUrl: img.path,
                                  });
                                }}
                                style={{
                                  cursor: "pointer",
                                  border:
                                    selectedExistingImage === img.path
                                      ? "1px solid #4f8ef7"
                                      : "1px solid transparent",
                                  borderRadius: 6,
                                  overflow: "hidden",
                                  transition: "border-color 0.2s",
                                }}
                              >
                                <img
                                  src={img.path}
                                  alt={img.name}
                                  style={{
                                    width: "100%",
                                    height: 56,
                                    objectFit: "cover",
                                  }}
                                />
                                <p
                                  style={{
                                    fontSize: 7,
                                    color: "#64748b",
                                    textAlign: "center",
                                    padding: "2px 0",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {img.name}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p
                            style={{
                              fontSize: 10,
                              color: "#64748b",
                              background: "rgba(0,0,0,0.2)",
                              borderRadius: 6,
                              padding: "8px",
                              textAlign: "center",
                              border: "0.5px solid rgba(255,255,255,0.04)",
                            }}
                          >
                            No hay imágenes en esta carpeta
                          </p>
                        )
                      ) : (
                        <p
                          style={{
                            fontSize: 10,
                            color: "#f59e0b",
                            background: "rgba(245,158,11,0.05)",
                            borderRadius: 6,
                            padding: "8px",
                            textAlign: "center",
                            border: "0.5px solid rgba(245,158,11,0.15)",
                          }}
                        >
                          Ingresa una categoría primero
                        </p>
                      )}
                    </div>
                  )}

                  {(productForm.imagenUrl || selectedExistingImage) && (
                    <div>
                      <p
                        style={{
                          fontSize: 9,
                          color: "#64748b",
                          marginBottom: 2,
                        }}
                      >
                        Vista previa
                      </p>
                      <img
                        src={
                          imageSource === "upload"
                            ? productForm.imagenUrl
                            : selectedExistingImage
                        }
                        alt="preview"
                        style={{
                          height: 64,
                          width: 64,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: "0.5px solid rgba(255,255,255,0.06)",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventario;

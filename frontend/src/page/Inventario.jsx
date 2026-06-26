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

// ========== CARGA AUTOMÁTICA DE IMÁGENES ==========
const imageModules = import.meta.glob("/src/assets/productos/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}", { eager: true, import: "default" });

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
      className="fixed top-20 right-4 z-[9999] bg-[#252836] border border-[${bgColor}]/25 rounded-xl px-4 py-2.5 flex items-center gap-2.5 shadow-xl text-[#e2e8f0] text-xs max-w-[320px] backdrop-blur-md"
      style={{ borderColor: `${bgColor}40` }}
    >
      <span style={{ color: bgColor }}>{type === "success" ? "✅" : "❌"}</span>
      <span>{message}</span>
      <button onClick={onClose} className="bg-transparent border-none text-[#64748b] cursor-pointer p-0.5">
        <X size={14} />
      </button>
    </motion.div>
  );
};

// ========== METRIC CARD ==========
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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-[#252836] rounded-xl border border-white/10 p-3.5 flex items-center justify-between">
      <div>
        <p className="text-[9px] font-semibold text-[#94a3b8] uppercase tracking-wider">{title}</p>
        <p className="text-xl font-bold text-[#e2e8f0] mt-0.5">{value}</p>
      </div>
      <div
        className="p-2 rounded-xl flex items-center justify-center"
        style={{
          background: colors.bg,
          border: `0.5px solid ${colors.border}`,
        }}
      >
        <Icon size={18} color={colors.text} />
      </div>
    </motion.div>
  );
});

// ========== PRODUCT CARD ==========
const ProductCard = memo(({ item, onEdit, onDelete, onReponer }) => {
  const p = item.producto;
  const stockBajo = item.stock_bajo;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#252836] rounded-xl border border-white/10 overflow-hidden flex flex-col cursor-default transition-all duration-200 hover:bg-white/5 hover:border-white/15"
    >
      <div className="bg-black/30 h-36 flex items-center justify-center relative overflow-hidden">
        {p.imagen ? <img src={p.imagen} alt={p.nombre} className="max-h-full max-w-full object-contain p-2" /> : <Package size={36} color="#4a5568" />}
        <div
          className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border ${stockBajo ? "bg-red-500/20 border-red-500/30 text-red-300" : "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"}`}
        >
          {stockBajo ? <AlertTriangle size={10} /> : <CheckCircle size={10} />}
          {stockBajo ? "Stock bajo" : "OK"}
        </div>
      </div>

      <div className="flex-1 p-2.5 flex flex-col gap-1.5">
        <div>
          <p className="text-[9px] font-mono text-[#64748b]">{p.codigo}</p>
          <h3 className="text-sm font-semibold text-[#e2e8f0] leading-tight truncate">{p.nombre}</h3>
          {p.categoria && <span className="inline-block mt-1 text-[8px] bg-white/5 text-[#94a3b8] px-2 py-0.5 rounded-full border border-white/5">{p.categoria}</span>}
        </div>

        <div className="flex justify-between bg-black/20 rounded-lg px-2.5 py-1 border border-white/5">
          <div>
            <p className="text-[7px] text-[#64748b] uppercase tracking-wider">Precio</p>
            <p className="text-sm font-bold text-[#e2e8f0] font-mono">${p.precio?.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[7px] text-[#64748b] uppercase tracking-wider">Stock</p>
            <p className={`text-sm font-bold font-mono ${stockBajo ? "text-red-300" : "text-[#e2e8f0]"}`}>{p.stock_actual}</p>
          </div>
        </div>

        {p.proveedor && (
          <p className="text-[8px] text-[#64748b] truncate" title={p.proveedor}>
            {p.proveedor}
          </p>
        )}

        <div className="flex gap-1 mt-0.5">
          <button
            onClick={() => onEdit(item)}
            className="flex-1 bg-white/5 border border-white/10 rounded-md py-1 text-[9px] text-[#94a3b8] cursor-pointer flex items-center justify-center gap-1 hover:bg-white/10 transition-colors"
          >
            <Edit size={11} /> Editar
          </button>
          <button
            onClick={() => onReponer(p)}
            className="flex-1 bg-blue-500/20 border border-blue-500/30 rounded-md py-1 text-[9px] text-[#4f8ef7] cursor-pointer flex items-center justify-center gap-1 hover:bg-blue-500/30 transition-colors"
          >
            <ShoppingCart size={11} /> Reponer
          </button>
          <button
            onClick={() => onDelete(item)}
            className="px-2 bg-white/5 border border-white/10 rounded-md text-[9px] text-[#64748b] cursor-pointer flex items-center justify-center hover:text-red-500 transition-colors"
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
  const { items: carritoItems, totalItems: carritoCount, agregarAlCarrito, eliminarDelCarrito, actualizarCantidad, vaciarCarrito, generarPedido, loading: carritoLoading, totalGeneral } = useCarrito();

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

  // ========== API ==========
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productosRes, resumenRes] = await Promise.all([api.get("/inventario"), api.get("/inventario/resumen")]);
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

  // ========== HANDLERS ==========
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
      setErrorMsg("Completa los campos obligatorios: código, nombre y precio > 0");
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
      setErrorMsg(err.response?.data?.message || "Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  }, [productForm, imageSource, selectedExistingImage, editingProduct, fetchAllData]);

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
  const categoriasExistentes = useMemo(() => [...new Set(productos.map((item) => item.producto.categoria).filter(Boolean))], [productos]);

  const filteredProductos = useMemo(() => {
    return productos.filter((item) => {
      const p = item.producto;
      const term = searchTerm.toLowerCase();
      const matchesSearch = p.codigo.toLowerCase().includes(term) || p.nombre.toLowerCase().includes(term);
      const matchesCategoria = categoriaSeleccionada ? p.categoria === categoriaSeleccionada : true;
      return matchesSearch && matchesCategoria;
    });
  }, [productos, searchTerm, categoriaSeleccionada]);

  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProductos.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const currentCategory = productForm.categoria?.toLowerCase() || "";
  const availableImages = useMemo(() => imagesByCategory[currentCategory] || [], [currentCategory]);
  const hasImagesForCategory = availableImages.length > 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-48px)]">
        <div className="w-10 h-10 rounded-full border-4 border-transparent border-t-[#4f8ef7] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-[#ef4444] rounded-xl p-6 text-center text-[#ef4444]">
        <AlertTriangle size={32} className="mx-auto mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  const totalProductos = resumen?.total_productos || 0;
  const stockBajo = resumen?.productos_stock_bajo || 0;
  const valorInventario = resumen?.valor_total_inventario || 0;

  return (
    <div className="bg-[#1a1d27] rounded-xl p-3 w-full h-[calc(100vh-48px)] flex flex-col gap-3 font-sans overflow-hidden text-[#e2e8f0]">
      <AnimatePresence>
        {successMsg && <Toast message={successMsg} type="success" onClose={() => setSuccessMsg("")} />}
        {errorMsg && <Toast message={errorMsg} type="error" onClose={() => setErrorMsg("")} />}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex items-center justify-between pb-1.5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7.5 h-7.5 bg-[#4f5cf7] rounded-lg flex items-center justify-center">
            <Package size={15} color="#fff" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#e2e8f0] leading-tight">Inventario</p>
            <p className="text-[9px] text-[#64748b]">Gestión de productos y reposiciones</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="bg-[#252836] border border-white/10 rounded-md px-2 py-1 flex items-center gap-1">
              <Search size={13} color="#64748b" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-[#e2e8f0] text-xs w-24"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="bg-transparent border-none text-[#64748b] cursor-pointer p-0.5">
                  <X size={12} />
                </button>
              )}
            </div>

            <select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              className="bg-[#252836] border border-white/10 rounded-md px-2 py-1 text-xs text-[#94a3b8] outline-none cursor-pointer h-7"
            >
              <option value="">Todas</option>
              {categoriasExistentes.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button onClick={fetchAllData} className="bg-[#252836] border border-white/10 rounded-md w-7 h-7 flex items-center justify-center cursor-pointer text-[#94a3b8]">
              <RefreshCw size={13} />
            </button>

            <button onClick={openCreateModal} className="bg-[#4f8ef7] border-none rounded-md px-3 py-1 text-xs font-medium text-white cursor-pointer flex items-center gap-1 h-7">
              <Plus size={13} /> Nuevo
            </button>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 overflow-auto min-h-0 flex flex-col gap-3">
        {/* MÉTRICAS */}
        <div className="grid grid-cols-3 gap-2.5">
          <MetricCard title="Total productos" value={totalProductos} icon={Package} accent="blue" />
          <MetricCard title="Stock bajo" value={stockBajo} icon={AlertTriangle} accent="red" />
          <MetricCard title="Valor inventario" value={`$${valorInventario.toLocaleString()}`} icon={DollarSign} accent="emerald" />
        </div>

        {/* GALERÍA DE PRODUCTOS */}
        <div className="bg-[#252836] rounded-xl border border-white/10 p-3.5 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2.5">
            <h2 className="text-sm font-semibold text-[#e2e8f0]">
              Productos
              <span className="ml-1.5 text-xs font-normal text-[#64748b]">({filteredProductos.length})</span>
            </h2>
            {categoriaSeleccionada && (
              <button onClick={() => setCategoriaSeleccionada("")} className="text-[10px] text-[#94a3b8] bg-transparent border-none cursor-pointer flex items-center gap-1">
                <X size={12} /> Quitar filtro
              </button>
            )}
          </div>

          {filteredProductos.length === 0 ? (
            <div className="text-center py-8 text-[#64748b]">
              <Package size={32} className="mx-auto mb-2 text-[#4a5568]" />
              <p className="text-sm">No se encontraron productos</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 flex-1">
                {paginatedProducts.map((item) => (
                  <ProductCard key={item.producto.codigo} item={item} onEdit={openEditModal} onDelete={confirmDelete} onReponer={openCantidadModal} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-3 pt-2.5 border-t border-white/5">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded bg-[#252836] border border-white/10 text-[#94a3b8] text-[11px] disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs text-[#94a3b8]">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 rounded bg-[#252836] border border-white/10 text-[#94a3b8] text-[11px] disabled:opacity-40"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* BOTÓN FLOTANTE DEL CARRITO */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowCarritoModal(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-[#4f8ef7] to-[#3b6fc9] border-none rounded-xl px-3.5 py-2 shadow-lg flex items-center gap-2 text-white cursor-pointer font-sans"
        style={{ boxShadow: "0 8px 24px rgba(79,142,247,0.4)" }}
      >
        <ShoppingCart size={17} />
        <span className="text-[11px] font-semibold">{carritoCount > 0 ? `${carritoCount} ítem${carritoCount !== 1 ? "s" : ""}` : "Carrito"}</span>
        {carritoCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#ef4444] text-white text-[8px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center border-2 border-[#1a1d27]">
            {carritoCount > 99 ? "99+" : carritoCount}
          </span>
        )}
      </motion.button>

      {/* MODALES */}

      {/* Modal Cantidad */}
      <AnimatePresence>
        {showCantidadModal && selectedProducto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCantidadModal(false)} />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              className="relative bg-[#1a1d27] border border-white/10 rounded-xl w-full max-w-[320px] p-5 shadow-2xl"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 bg-blue-500/15 border border-blue-500/30 rounded-lg flex items-center justify-center">
                  <ShoppingCart size={14} color="#4f8ef7" />
                </div>
                <div>
                  <p className="text-[8px] text-[#64748b] uppercase tracking-wider">Reponer</p>
                  <p className="text-sm font-semibold text-[#e2e8f0] leading-tight">{selectedProducto.nombre}</p>
                </div>
              </div>

              <label className="block text-[10px] text-[#94a3b8] mb-1">Cantidad a solicitar</label>
              <div className="flex items-center gap-1.5 bg-[#252836] border border-white/10 rounded-lg p-1 mb-3">
                <button
                  onClick={() => setCantidadReponer((c) => Math.max(1, c - 1))}
                  className="w-7 h-7 bg-white/5 border-none rounded-md text-[#94a3b8] cursor-pointer flex items-center justify-center"
                >
                  <Minus size={12} />
                </button>
                <input
                  type="number"
                  value={cantidadReponer}
                  onChange={(e) => setCantidadReponer(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="flex-1 bg-transparent border-none outline-none text-[#e2e8f0] text-base font-bold text-center"
                  autoFocus
                />
                <button onClick={() => setCantidadReponer((c) => c + 1)} className="w-7 h-7 bg-white/5 border-none rounded-md text-[#94a3b8] cursor-pointer flex items-center justify-center">
                  <PlusIcon size={12} />
                </button>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowCantidadModal(false)} className="flex-1 py-1.5 bg-[#252836] border border-white/10 rounded-lg text-xs text-[#94a3b8] cursor-pointer">
                  Cancelar
                </button>
                <button onClick={confirmarAgregar} className="flex-1 py-1.5 bg-[#4f8ef7] border-none rounded-lg text-xs font-semibold text-white cursor-pointer">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => {
                setShowDeleteModal(false);
                setProductoAEliminar(null);
              }}
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              className="relative bg-[#1a1d27] border border-red-500/30 rounded-xl w-full max-w-[400px] p-6 shadow-2xl"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 bg-red-500/15 border border-red-500/30 rounded-lg flex items-center justify-center">
                  <Trash2 size={16} color="#ef4444" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#e2e8f0]">Confirmar eliminación</h3>
                  <p className="text-[10px] text-[#64748b]">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <p className="text-sm text-[#94a3b8] mb-4">
                ¿Estás seguro de eliminar el producto <span className="text-[#e2e8f0] font-semibold">{productoAEliminar.producto.nombre}</span>?
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProductoAEliminar(null);
                  }}
                  className="flex-1 py-2 bg-[#252836] border border-white/10 rounded-lg text-xs text-[#94a3b8] cursor-pointer"
                >
                  Cancelar
                </button>
                <button onClick={handleDelete} className="flex-1 py-2 bg-[#ef4444] border-none rounded-lg text-xs font-semibold text-white cursor-pointer">
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRAWER CARRITO */}
      <AnimatePresence>
        {showCarritoModal && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCarritoModal(false)} />
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="relative w-full max-w-[340px] bg-[#1a1d27] border-l border-white/10 h-full flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex-shrink-0 px-4 py-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-500/15 border border-blue-500/20 rounded-lg flex items-center justify-center">
                      <ShoppingCart size={14} color="#4f8ef7" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#e2e8f0] leading-tight">Carrito</h2>
                      <p className="text-[9px] text-[#64748b]">{carritoCount === 0 ? "Sin productos" : `${carritoCount} producto${carritoCount !== 1 ? "s" : ""}`}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowCarritoModal(false)} className="bg-transparent border-none text-[#64748b] cursor-pointer p-1 rounded">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-3.5 py-2.5 flex flex-col gap-2">
                {carritoItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-6">
                    <div className="w-14 h-14 bg-[#252836] border border-white/5 rounded-xl flex items-center justify-center mb-2.5">
                      <ShoppingCart size={24} color="#4a5568" />
                    </div>
                    <p className="text-[#94a3b8] text-sm font-medium">Carrito vacío</p>
                    <p className="text-[#64748b] text-[10px] mt-0.5">Agrega productos desde el inventario</p>
                  </div>
                ) : (
                  carritoItems.map((item) => (
                    <motion.div
                      key={item.codigo}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-[#252836] rounded-lg border border-white/5 p-2.5 flex gap-2 items-start"
                    >
                      <div className="w-7 h-7 bg-blue-500/10 rounded-md flex items-center justify-center flex-shrink-0">
                        <Package size={12} color="#4f8ef7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-[#e2e8f0] truncate">{item.nombre}</p>
                        <p className="text-[8px] text-[#64748b]">
                          {item.codigo} · ${item.precio.toLocaleString()}/u
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1 bg-black/30 rounded px-1 py-0.5">
                            <button
                              onClick={() => actualizarCantidad(item.codigo, item.cantidad - 1)}
                              className="bg-transparent border-none text-[#94a3b8] cursor-pointer p-0.5 flex items-center justify-center"
                            >
                              <Minus size={8} />
                            </button>
                            <span className="text-[10px] font-mono text-[#e2e8f0] w-4.5 text-center">{item.cantidad}</span>
                            <button
                              onClick={() => actualizarCantidad(item.codigo, item.cantidad + 1)}
                              className="bg-transparent border-none text-[#94a3b8] cursor-pointer p-0.5 flex items-center justify-center"
                            >
                              <PlusIcon size={8} />
                            </button>
                          </div>
                          <span className="text-xs font-bold text-[#e2e8f0] font-mono">${(item.precio * item.cantidad).toLocaleString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => eliminarDelCarrito(item.codigo)}
                        className="bg-transparent border-none text-[#64748b] cursor-pointer p-1 rounded flex-shrink-0 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              {carritoItems.length > 0 && (
                <div className="flex-shrink-0 border-t border-white/5 px-3.5 py-3 flex flex-col gap-2">
                  <div className="bg-[#252836] rounded-lg px-3 py-2 border border-white/5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#94a3b8]">Productos</span>
                      <span className="text-[#e2e8f0] font-mono">{carritoCount}</span>
                    </div>
                    <div className="flex justify-between items-baseline mt-0.5">
                      <span className="text-[10px] text-[#94a3b8]">Total estimado</span>
                      <span className="text-lg font-bold text-[#e2e8f0] font-mono">${totalGeneral.toLocaleString()}</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerarPedido}
                    disabled={carritoLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] border-none rounded-lg text-sm font-semibold text-white cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    {carritoLoading ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
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
                    className="w-full py-2 bg-transparent border border-white/5 rounded-lg text-[10px] font-medium text-[#64748b] cursor-pointer flex items-center justify-center gap-1.5 hover:text-red-500 hover:border-red-500/30 transition-colors"
                  >
                    <Trash2 size={12} /> Vaciar carrito
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL CREAR/EDITAR PRODUCTO */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowProductModal(false)} />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative bg-[#1a1d27] border border-white/10 rounded-xl w-full max-w-[680px] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4.5 py-3 border-b border-white/5 flex-shrink-0">
                <h3 className="text-sm font-bold text-[#e2e8f0]">{editingProduct ? "Editar producto" : "Nuevo producto"}</h3>
                <div className="flex gap-2">
                  <button onClick={() => setShowProductModal(false)} className="px-3 py-1 bg-[#252836] border border-white/10 rounded-md text-[11px] text-[#94a3b8] cursor-pointer">
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveProduct}
                    disabled={saving}
                    className="px-3 py-1 bg-[#4f8ef7] border-none rounded-md text-[11px] font-medium text-white cursor-pointer disabled:opacity-60 flex items-center gap-1"
                  >
                    <Save size={12} /> {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4.5 grid grid-cols-2 gap-4">
                {/* Columna izquierda */}
                <div className="flex flex-col gap-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] text-[#94a3b8] mb-0.5">Código *</label>
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
                        className="w-full bg-[#252836] border border-white/10 rounded-md px-2 py-1 text-xs text-[#e2e8f0] outline-none disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[#94a3b8] mb-0.5">Nombre *</label>
                      <input
                        type="text"
                        value={productForm.nombre}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            nombre: e.target.value,
                          })
                        }
                        className="w-full bg-[#252836] border border-white/10 rounded-md px-2 py-1 text-xs text-[#e2e8f0] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] text-[#94a3b8] mb-0.5">Categoría</label>
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
                        className="w-full bg-[#252836] border border-white/10 rounded-md px-2 py-1 text-xs text-[#e2e8f0] outline-none placeholder:text-[#64748b]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[#94a3b8] mb-0.5">Proveedor</label>
                      <select
                        value={productForm.proveedor_id}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            proveedor_id: e.target.value,
                          })
                        }
                        className="w-full bg-[#252836] border border-white/10 rounded-md px-2 py-1 text-xs text-[#e2e8f0] outline-none"
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

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] text-[#94a3b8] mb-0.5">Stock</label>
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
                        className="w-full bg-[#252836] border border-white/10 rounded-md px-2 py-1 text-xs text-[#e2e8f0] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[#94a3b8] mb-0.5">Costo</label>
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
                        className="w-full bg-[#252836] border border-white/10 rounded-md px-2 py-1 text-xs text-[#e2e8f0] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[#94a3b8] mb-0.5">Precio *</label>
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
                        className="w-full bg-[#252836] border border-white/10 rounded-md px-2 py-1 text-xs text-[#e2e8f0] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Columna derecha */}
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] text-[#94a3b8]">Imagen del producto</label>
                  <div className="flex gap-1.5">
                    {[
                      { key: "upload", icon: Upload, label: "Subir" },
                      { key: "existing", icon: FolderOpen, label: "Carpeta" },
                    ].map(({ key, icon: Icon, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setImageSource(key)}
                        className={`flex-1 py-1 rounded-md text-[9px] border flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                          imageSource === key ? "bg-blue-500/15 border-blue-500/30 text-[#4f8ef7]" : "bg-transparent border-white/5 text-[#94a3b8]"
                        }`}
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
                          imagenUrl: e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : "",
                        })
                      }
                      className="w-full text-[10px] bg-[#252836] border border-white/10 rounded-md px-2 py-1 text-[#94a3b8]"
                    />
                  ) : (
                    <div className="flex flex-col gap-1">
                      <p className="text-[9px] text-[#64748b]">
                        Categoría: <span className="text-[#e2e8f0]">{productForm.categoria || "(sin categoría)"}</span>
                      </p>
                      {productForm.categoria ? (
                        hasImagesForCategory ? (
                          <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto p-1 bg-black/20 rounded-md border border-white/5">
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
                                className={`cursor-pointer rounded-md overflow-hidden transition-all ${selectedExistingImage === img.path ? "ring-1 ring-[#4f8ef7]" : ""}`}
                              >
                                <img src={img.path} alt={img.name} className="w-full h-14 object-cover" />
                                <p className="text-[7px] text-[#64748b] text-center py-0.5 truncate">{img.name}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-[#64748b] bg-black/20 rounded-md p-2 text-center border border-white/5">No hay imágenes en esta carpeta</p>
                        )
                      ) : (
                        <p className="text-[10px] text-[#f59e0b] bg-yellow-500/5 rounded-md p-2 text-center border border-yellow-500/15">Ingresa una categoría primero</p>
                      )}
                    </div>
                  )}

                  {(productForm.imagenUrl || selectedExistingImage) && (
                    <div>
                      <p className="text-[9px] text-[#64748b] mb-0.5">Vista previa</p>
                      <img src={imageSource === "upload" ? productForm.imagenUrl : selectedExistingImage} alt="preview" className="h-16 w-16 object-cover rounded-md border border-white/5" />
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

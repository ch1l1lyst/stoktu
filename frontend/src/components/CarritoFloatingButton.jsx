import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCarrito } from "../context/CarritoContext";
import {
  ShoppingCart,
  X,
  Minus,
  Plus as PlusIcon,
  Trash2,
  Package,
  ChevronRight,
  Sparkles,
} from "lucide-react";

// ========== CARGA AUTOMÁTICA DE IMÁGENES POR CARPETA (misma lógica que Inventario) ==========
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

// ========== TOAST ==========
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles =
    type === "success"
      ? "bg-emerald-950 text-emerald-300 border-emerald-700/60"
      : "bg-red-950 text-red-300 border-red-700/60";

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.96 }}
      className={`fixed top-6 right-6 z-[60] ${styles} backdrop-blur-sm px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm border`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="hover:opacity-60 transition ml-1">
        <X size={14} />
      </button>
    </motion.div>
  );
};

// ========== ITEM DEL CARRITO (CON IMAGEN POR CATEGORÍA) ==========
const CartItem = ({ item, onUpdate, onRemove }) => {
  const [imgError, setImgError] = useState(false);

  // Determinar la imagen según el producto
  const getProductImage = () => {
    // Si el producto tiene una imagen guardada directamente y no hubo error al cargarla
    if (item.imagen && !imgError) {
      // Si es una ruta/URL completa, retornarla tal cual
      if (
        typeof item.imagen === "string" &&
        (item.imagen.includes("/") || item.imagen.startsWith("http"))
      ) {
        return item.imagen;
      }
      // Si es solo un nombre de archivo o identificador, intentamos buscarla en los assets
      const allImagesFlat = [
        ...imagesByCategory.desengrasantes,
        ...imagesByCategory.sanitizantes,
        ...imagesByCategory.otros,
      ];
      const lowerImagen = String(item.imagen).toLowerCase();
      const matchByName = allImagesFlat.find(
        (img) =>
          img.name.toLowerCase() === lowerImagen ||
          img.name.toLowerCase().includes(lowerImagen),
      );
      if (matchByName) return matchByName.path;
      // Si no la encontramos, devolvemos el valor original (puede ser una URL válida del servidor)
      return item.imagen;
    }

    // Si no hay imagen explícita, intentamos usar la categoría para elegir una
    const category = (item.categoria || "").toLowerCase();
    const images = imagesByCategory[category] || [];

    // Si hay imágenes en la categoría, intentar emparejar por código o nombre
    if (images.length > 0) {
      const key = ((item.codigo || "") + " " + (item.nombre || ""))
        .toLowerCase()
        .replace(/\s+/g, "");
      const found = images.find((img) => {
        const name = (img.name || "").toLowerCase().replace(/\s+/g, "");
        return name.includes(key) || key.includes(name);
      });
      if (found) return found.path;
      // fallback: primera imagen de la categoría
      return images[0]?.path || null;
    }

    // Último recurso: buscar en todas las categorías por nombre/código
    const allImages = [
      ...imagesByCategory.desengrasantes,
      ...imagesByCategory.sanitizantes,
      ...imagesByCategory.otros,
    ];
    const searchKey = ((item.codigo || "") + " " + (item.nombre || ""))
      .toLowerCase()
      .replace(/\s+/g, "");
    const anyMatch = allImages.find((img) => {
      const name = (img.name || "").toLowerCase().replace(/\s+/g, "");
      return name.includes(searchKey) || searchKey.includes(name);
    });
    if (anyMatch) return anyMatch.path;

    return null;
  };

  const imageSrc = getProductImage();
  const hasImage = imageSrc && !imgError;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="group flex items-center gap-2.5 bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700/50 hover:border-gray-600/80 rounded-xl px-2.5 py-1.5 transition-all duration-200"
    >
      {/* Imagen miniatura (36x36) */}
      <div className="flex-none w-9 h-9 rounded-lg bg-gray-900/60 border border-gray-700/50 overflow-hidden flex items-center justify-center">
        {hasImage ? (
          <img
            src={imageSrc}
            alt={item.nombre}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <Package size={16} className="text-gray-500" />
        )}
      </div>

      {/* Nombre y código */}
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-white text-xs font-medium truncate leading-tight">
          {item.nombre}
        </span>
        <span className="text-gray-500 text-[10px]">{item.codigo}</span>
      </div>

      {/* Controles en fila */}
      <div className="flex items-center gap-1.5 flex-none">
        {/* Botones de cantidad */}
        <div className="flex items-center gap-1 bg-gray-900/70 rounded-lg px-1 py-0.5 border border-gray-700/50">
          <button
            onClick={() => onUpdate(item.codigo, item.cantidad - 1)}
            className="w-5 h-5 rounded bg-gray-700/60 hover:bg-gray-600 flex items-center justify-center transition"
          >
            <Minus size={9} className="text-gray-300" />
          </button>
          <span className="text-white text-xs font-mono w-5 text-center">
            {item.cantidad}
          </span>
          <button
            onClick={() => onUpdate(item.codigo, item.cantidad + 1)}
            className="w-5 h-5 rounded bg-gray-700/60 hover:bg-gray-600 flex items-center justify-center transition"
          >
            <PlusIcon size={9} className="text-gray-300" />
          </button>
        </div>

        {/* Subtotal */}
        <span className="text-white text-xs font-mono font-medium min-w-[40px] text-right">
          ${(item.precio * item.cantidad).toLocaleString()}
        </span>

        {/* Eliminar */}
        <button
          onClick={() => onRemove(item.codigo)}
          className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition"
          title="Eliminar"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  );
};

// ========== COMPONENTE PRINCIPAL ==========
const CarritoFloatingButton = () => {
  const {
    items,
    totalItems,
    totalGeneral,
    eliminarDelCarrito,
    actualizarCantidad,
    vaciarCarrito,
    generarPedido,
    loading,
  } = useCarrito();

  const [showModal, setShowModal] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [confirmVaciar, setConfirmVaciar] = useState(false);

  const handleGenerarPedido = async () => {
    try {
      await generarPedido();
      setMensaje("✅ Pedido generado correctamente");
      setShowModal(false);
    } catch (err) {
      setErrorMsg(err.message || "Error al generar el pedido");
    }
  };

  const handleVaciar = () => {
    if (confirmVaciar) {
      vaciarCarrito();
      setConfirmVaciar(false);
    } else {
      setConfirmVaciar(true);
      setTimeout(() => setConfirmVaciar(false), 3000);
    }
  };

  return (
    <>
      <AnimatePresence>
        {mensaje && (
          <Toast
            message={mensaje}
            type="success"
            onClose={() => setMensaje(null)}
          />
        )}
        {errorMsg && (
          <Toast
            message={errorMsg}
            type="error"
            onClose={() => setErrorMsg(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Botón flotante ── */}
      <motion.button
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl px-4 py-3.5 shadow-2xl shadow-blue-900/50 flex items-center gap-2.5 border border-blue-400/20 transition-all"
        title="Carrito de reposiciones"
      >
        <ShoppingCart size={20} />
        <AnimatePresence mode="wait">
          {totalItems > 0 ? (
            <motion.span
              key="count"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="text-sm font-bold"
            >
              {totalItems} ítem{totalItems !== 1 ? "s" : ""}
            </motion.span>
          ) : (
            <motion.span
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-blue-200"
            >
              Carrito
            </motion.span>
          )}
        </AnimatePresence>
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-gray-900">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </motion.button>

      {/* ── Drawer ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
              onClick={() => setShowModal(false)}
            />

            {/* Panel compacto */}
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="relative w-full max-w-sm bg-gray-900 border-l border-gray-700/80 h-full flex flex-col shadow-2xl"
            >
              {/* ── Header ── */}
              <div className="flex-none px-4 pt-4 pb-3 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-900/40 border border-blue-700/30 flex items-center justify-center">
                      <ShoppingCart size={16} className="text-blue-300" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white leading-tight">
                        Carrito
                      </h2>
                      <p className="text-[10px] text-gray-500">
                        {totalItems === 0
                          ? "Sin productos"
                          : `${totalItems} producto${totalItems !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1.5 hover:bg-gray-800 rounded-xl transition text-gray-500 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* ── Lista de items ── */}
              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
                <AnimatePresence>
                  {items.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-full py-12 text-center"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-3">
                        <ShoppingCart size={24} className="text-gray-600" />
                      </div>
                      <p className="text-gray-400 text-sm font-medium">
                        Carrito vacío
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">
                        Agrega productos desde el inventario
                      </p>
                    </motion.div>
                  ) : (
                    items.map((item) => (
                      <CartItem
                        key={item.codigo}
                        item={item}
                        onUpdate={actualizarCantidad}
                        onRemove={eliminarDelCarrito}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* ── Footer con botones en línea ── */}
              {items.length > 0 && (
                <div className="flex-none border-t border-gray-800 px-3 pt-2 pb-3 space-y-2">
                  {/* Total */}
                  <div className="bg-gray-800/50 rounded-xl px-3 py-1.5 border border-gray-700/50 flex items-center justify-between text-xs">
                    <span className="text-gray-400">Total</span>
                    <span className="text-white font-bold font-mono">
                      ${totalGeneral.toLocaleString()}
                    </span>
                  </div>

                  {/* Botones en fila horizontal */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGenerarPedido}
                      disabled={loading}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-xl transition text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : (
                        <>
                          <Sparkles size={14} />
                          Generar
                        </>
                      )}
                    </motion.button>
                    <button
                      onClick={handleVaciar}
                      className={`flex-1 px-3 py-2 rounded-xl transition text-sm font-medium flex items-center justify-center gap-2 border ${
                        confirmVaciar
                          ? "bg-red-900/40 border-red-700/60 text-red-300 hover:bg-red-900/60"
                          : "bg-transparent border-gray-700/50 text-gray-500 hover:text-red-400 hover:border-red-700/40 hover:bg-red-900/10"
                      }`}
                    >
                      <Trash2 size={14} />
                      {confirmVaciar ? "¿Confirmar?" : "Vaciar"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CarritoFloatingButton;

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../api/axiosConfig";

// ========== CARGA AUTOMÁTICA DE IMÁGENES POR CARPETA (para resolver imágenes en localStorage) ==========
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

const findImageFor = (item) => {
  if (!item) return null;
  const allImages = [
    ...imagesByCategory.desengrasantes,
    ...imagesByCategory.sanitizantes,
    ...imagesByCategory.otros,
  ];

  // Try matching if item.imagen is a filename
  if (item.imagen && typeof item.imagen === "string") {
    const lower = item.imagen.toLowerCase();
    const byName = allImages.find(
      (img) =>
        img.name.toLowerCase() === lower ||
        img.name.toLowerCase().includes(lower),
    );
    if (byName) return byName.path;
  }

  // Try by category + codigo/nombre
  const category = (item.categoria || "").toLowerCase();
  const imagesCat = imagesByCategory[category] || [];
  const key = ((item.codigo || "") + " " + (item.nombre || ""))
    .toLowerCase()
    .replace(/\s+/g, "");
  if (imagesCat.length > 0) {
    const found = imagesCat.find((img) => {
      const name = (img.name || "").toLowerCase().replace(/\s+/g, "");
      return name.includes(key) || key.includes(name);
    });
    if (found) return found.path;
    return imagesCat[0]?.path || null;
  }

  // Fallback global search
  const anyMatch = allImages.find((img) => {
    const name = (img.name || "").toLowerCase().replace(/\s+/g, "");
    return name.includes(key) || key.includes(name);
  });
  if (anyMatch) return anyMatch.path;

  return null;
};

const CarritoContext = createContext();

export const useCarrito = () => useContext(CarritoContext);

export const CarritoProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const stored = localStorage.getItem("carritoReposiciones");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Enriquecer items antiguos intentando resolver imagenes desde assets
        const enriched = parsed.map((it) => ({
          ...it,
          imagen: it.imagen || findImageFor(it) || null,
          categoria: it.categoria || "",
        }));
        setItems(enriched);
      } catch (e) {
        console.error("Error al cargar carrito del localStorage", e);
      }
    }
  }, []);

  // Guardar en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem("carritoReposiciones", JSON.stringify(items));
  }, [items]);

  const agregarAlCarrito = useCallback((producto, cantidad) => {
    if (!cantidad || cantidad < 1) return false;
    setItems((prev) => {
      const existing = prev.find((i) => i.codigo === producto.codigo);
      if (existing) {
        return prev.map((i) =>
          i.codigo === producto.codigo
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i,
        );
      } else {
        const imagenResolved =
          producto.imagen || findImageFor(producto) || null;
        return [
          ...prev,
          {
            codigo: producto.codigo,
            nombre: producto.nombre,
            cantidad: cantidad,
            precio: producto.precio,
            proveedor: producto.proveedor || "",
            proveedor_id: producto.proveedor_id || "",
            imagen: imagenResolved,
            categoria: producto.categoria || "",
          },
        ];
      }
    });
    return true;
  }, []);

  const eliminarDelCarrito = useCallback((codigo) => {
    setItems((prev) => prev.filter((i) => i.codigo !== codigo));
  }, []);

  const actualizarCantidad = useCallback((codigo, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setItems((prev) =>
      prev.map((i) =>
        i.codigo === codigo ? { ...i, cantidad: nuevaCantidad } : i,
      ),
    );
  }, []);

  const vaciarCarrito = useCallback(() => {
    setItems([]);
  }, []);

  const generarPedido = useCallback(async () => {
    if (items.length === 0) throw new Error("Carrito vacío");
    setLoading(true);
    try {
      const payload = {
        items: items.map((item) => ({
          producto_codigo: item.codigo,
          cantidad: item.cantidad,
        })),
      };
      await api.post("/reposiciones/desde-carrito", payload);
      vaciarCarrito();
      return { success: true, message: "Pedido generado correctamente" };
    } catch (error) {
      console.error(error);
      throw new Error(
        error.response?.data?.message || "Error al generar el pedido",
      );
    } finally {
      setLoading(false);
    }
  }, [items, vaciarCarrito]);

  const totalItems = items.length;
  const totalCantidad = items.reduce((sum, i) => sum + i.cantidad, 0);
  const totalGeneral = items.reduce((sum, i) => sum + i.cantidad * i.precio, 0);

  return (
    <CarritoContext.Provider
      value={{
        items,
        loading,
        totalItems,
        totalCantidad,
        totalGeneral,
        agregarAlCarrito,
        eliminarDelCarrito,
        actualizarCantidad,
        vaciarCarrito,
        generarPedido,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};

export default CarritoProvider;

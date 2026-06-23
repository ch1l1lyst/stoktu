import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axiosConfig";
import {
  Package,
  RefreshCw,
  X,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Building2,
  Search,
  Eye,
  Calendar,
  Save,
  Edit3,
  MinusCircle,
  AlertCircle,
} from "lucide-react";

// ========== TOAST ==========
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "#10b981" : "#ef4444";
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
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

// ========== BADGE DE ESTADO ==========
const StatusBadge = ({ estado }) => {
  const config = {
    recibido: { bg: "#10b981", icon: CheckCircle, label: "Completado" },
    pendiente: { bg: "#f59e0b", icon: Clock, label: "Pendiente" },
    cancelado: { bg: "#ef4444", icon: XCircle, label: "Cancelado" },
    parcial: { bg: "#4f8ef7", icon: Clock, label: "Parcial" },
  };
  const key = estado || "pendiente";
  const s = config[key] || config.pendiente;
  const Icon = s.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: s.bg + "20",
        color: s.bg,
        padding: "2px 8px",
        borderRadius: 12,
        fontSize: 10,
        fontWeight: 600,
      }}
    >
      <Icon size={12} />
      {s.label}
    </span>
  );
};

// ========== ESTILOS REUTILIZABLES ==========
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

// ========== COMPONENTE PRINCIPAL ==========
const Reposiciones = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ---------- PAGINACIÓN LOCAL ----------
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(8); // igual que antes

  // Filtros
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
  });
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroProveedor, setFiltroProveedor] = useState("");
  const [filtroProducto, setFiltroProducto] = useState("");
  const [ordenFecha, setOrdenFecha] = useState("desc");

  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [proveedoresList, setProveedoresList] = useState([]);
  const [productosList, setProductosList] = useState([]);

  // ========== API ==========
  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const params = {};
      if (month) params.month = month;
      if (search) params.search = search;

      const res = await api.get("/pedidos", { params });
      // La respuesta es un array plano (sin paginación)
      setPedidos(res.data);
      // Extraer opciones para filtros
      const proveedores = new Set();
      const productos = new Set();
      res.data.forEach((pedido) => {
        if (pedido.proveedor) proveedores.add(pedido.proveedor);
        pedido.lineas?.forEach((linea) => {
          if (linea.producto_nombre) productos.add(linea.producto_nombre);
        });
      });
      setProveedoresList([...proveedores]);
      setProductosList([...productos]);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  }, [month, search]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  // ========== FILTRADO LOCAL Y ORDEN ==========
  const pedidosFiltrados = useMemo(() => {
    let resultado = pedidos.filter((pedido) => {
      const matchEstado =
        filtroEstado === "" ||
        (filtroEstado === "pendiente" && pedido.estado === "pendiente") ||
        (filtroEstado === "recibido" && pedido.estado === "recibido") ||
        (filtroEstado === "cancelado" && pedido.estado === "cancelado") ||
        (filtroEstado === "parcial" && pedido.estado === "parcial");
      const matchProveedor = filtroProveedor
        ? pedido.proveedor === filtroProveedor
        : true;
      const matchProducto = filtroProducto
        ? pedido.lineas?.some((l) => l.producto_nombre === filtroProducto)
        : true;
      const matchBusqueda =
        search === "" ||
        pedido.pedido_id.toLowerCase().includes(search.toLowerCase()) ||
        (pedido.proveedor &&
          pedido.proveedor.toLowerCase().includes(search.toLowerCase())) ||
        pedido.lineas?.some((l) =>
          l.producto_nombre?.toLowerCase().includes(search.toLowerCase()),
        );
      return matchEstado && matchProveedor && matchProducto && matchBusqueda;
    });

    resultado.sort((a, b) => {
      const dateA = new Date(a.fecha_pedido);
      const dateB = new Date(b.fecha_pedido);
      return ordenFecha === "desc" ? dateB - dateA : dateA - dateB;
    });
    return resultado;
  }, [
    pedidos,
    filtroEstado,
    filtroProveedor,
    filtroProducto,
    search,
    ordenFecha,
  ]);

  // ========== PAGINACIÓN LOCAL ==========
  const totalPaginas = Math.ceil(pedidosFiltrados.length / itemsPorPagina);
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const pedidosPagina = pedidosFiltrados.slice(inicio, inicio + itemsPorPagina);

  // Resetear página al cambiar filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroEstado, filtroProveedor, filtroProducto, search, ordenFecha]);

  // ========== PANEL LATERAL (sin cambios) ==========
  const abrirPanel = (pedido) => {
    const hayPendiente = pedido.lineas?.some(
      (l) =>
        l.estado !== "cancelado" &&
        l.cantidad_solicitada - l.cantidad_recibida > 0,
    );
    const soloLectura = !hayPendiente;

    const copia = {
      ...pedido,
      soloLectura,
      lineas: pedido.lineas.map((l) => ({
        ...l,
        _recibir: l.cantidad_recibida || 0,
        _cancelar: l.estado === "cancelado",
        _motivo: l.observaciones || "",
        _modificado: false,
      })),
    };
    setPedidoEditando(copia);
    setPanelAbierto(true);
  };

  const handleCantidadChange = (index, value) => {
    if (pedidoEditando?.soloLectura) return;
    setPedidoEditando((prev) => {
      const nuevasLineas = [...prev.lineas];
      nuevasLineas[index]._recibir = Math.min(
        Math.max(0, parseInt(value) || 0),
        nuevasLineas[index].cantidad_solicitada,
      );
      nuevasLineas[index]._modificado = true;
      return { ...prev, lineas: nuevasLineas };
    });
  };

  const handleCancelarToggle = (index) => {
    if (pedidoEditando?.soloLectura) return;
    setPedidoEditando((prev) => {
      const nuevasLineas = [...prev.lineas];
      const nuevaCancelacion = !nuevasLineas[index]._cancelar;
      if (nuevaCancelacion && (nuevasLineas[index]._recibir || 0) > 0)
        return prev;
      nuevasLineas[index]._cancelar = nuevaCancelacion;
      nuevasLineas[index]._modificado = true;
      if (nuevaCancelacion && !nuevasLineas[index]._motivo) {
        nuevasLineas[index]._motivo = "Cancelado por usuario";
      }
      return { ...prev, lineas: nuevasLineas };
    });
  };

  const handleMotivoChange = (index, value) => {
    if (pedidoEditando?.soloLectura) return;
    setPedidoEditando((prev) => {
      const nuevasLineas = [...prev.lineas];
      nuevasLineas[index]._motivo = value;
      nuevasLineas[index]._modificado = true;
      return { ...prev, lineas: nuevasLineas };
    });
  };

  const guardarPedido = async () => {
    if (!pedidoEditando || pedidoEditando.soloLectura) return;

    for (const linea of pedidoEditando.lineas) {
      if (!linea._modificado || linea._cancelar) continue;
      const recibir = Number(linea._recibir) || 0;
      if (recibir < 0 || recibir > linea.cantidad_solicitada) {
        setErrorMsg(
          `Cantidad inválida para ${linea.producto_nombre || "producto"}: debe estar entre 0 y ${linea.cantidad_solicitada}`,
        );
        return;
      }
    }

    setGuardando(true);
    try {
      for (const linea of pedidoEditando.lineas) {
        if (!linea._modificado) continue;
        if (linea._cancelar) {
          await api.post(`/linea/${linea.id}/cancelar`, {
            motivo: linea._motivo || "Cancelado por usuario",
          });
        } else {
          const nuevaCantidad = Number(linea._recibir) || 0;
          const actualCantidad = linea.cantidad_recibida || 0;
          if (nuevaCantidad !== actualCantidad) {
            await api.post(`/linea/${linea.id}/recibir`, {
              cantidad_recibida: nuevaCantidad,
            });
          }
        }
      }
      setSuccessMsg(
        `✅ Pedido #${pedidoEditando.pedido_id.substring(0, 8)} guardado`,
      );
      setPanelAbierto(false);
      await fetchPedidos();
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al guardar cambios",
      );
    } finally {
      setGuardando(false);
    }
  };

  // ========== RENDER ==========
  if (loading) {
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
  }

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
        gap: 10,
        fontFamily: "system-ui, sans-serif",
        overflow: "hidden",
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

      {/* HEADER (sin cambios) */}
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
              Reposiciones
            </p>
            <p style={{ fontSize: 9, color: "#64748b" }}>
              {pedidosFiltrados.length} registros
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Filtro mes */}
          <div
            style={{
              background: "#252836",
              border: "0.5px solid rgba(255,255,255,0.1)",
              borderRadius: 7,
              padding: "4px 10px",
              fontSize: 11,
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Calendar size={12} />
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#94a3b8",
                fontSize: 11,
                cursor: "pointer",
                width: 130,
              }}
            />
          </div>

          {/* Búsqueda */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchPedidos();
            }}
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#e2e8f0",
                fontSize: 11,
                width: 100,
              }}
            />
            <button
              type="submit"
              style={{
                background: "transparent",
                border: "none",
                color: "#4f8ef7",
                cursor: "pointer",
                padding: "2px 4px",
                fontSize: 11,
              }}
            >
              Buscar
            </button>
          </form>

          {/* Filtros adicionales (selects) */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
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
            <option value="">Estado</option>
            <option value="pendiente">Pendiente</option>
            <option value="recibido">Completado</option>
            <option value="cancelado">Cancelado</option>
            <option value="parcial">Parcial</option>
          </select>

          <select
            value={filtroProveedor}
            onChange={(e) => setFiltroProveedor(e.target.value)}
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
              maxWidth: 120,
            }}
          >
            <option value="">Proveedor</option>
            {proveedoresList.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={filtroProducto}
            onChange={(e) => setFiltroProducto(e.target.value)}
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
              maxWidth: 120,
            }}
          >
            <option value="">Producto</option>
            {productosList.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setFiltroEstado("");
              setFiltroProveedor("");
              setFiltroProducto("");
              setSearch("");
              setMonth(
                `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
              );
            }}
            style={{
              background: "#252836",
              border: "0.5px solid rgba(255,255,255,0.1)",
              borderRadius: 7,
              padding: "4px 8px",
              fontSize: 11,
              color: "#94a3b8",
              cursor: "pointer",
              height: 28,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <X size={12} /> Limpiar
          </button>

          <button
            onClick={() =>
              setOrdenFecha(ordenFecha === "desc" ? "asc" : "desc")
            }
            style={{
              background: "#252836",
              border: "0.5px solid rgba(255,255,255,0.1)",
              borderRadius: 7,
              padding: "4px 8px",
              fontSize: 11,
              color: "#94a3b8",
              cursor: "pointer",
              height: 28,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Calendar size={12} />
            {ordenFecha === "desc" ? "↓" : "↑"}
          </button>

          <button
            onClick={() => fetchPedidos()}
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
        </div>
      </div>

      {/* TABLA */}
      <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 11,
            color: "#e2e8f0",
          }}
        >
          <thead
            style={{
              position: "sticky",
              top: 0,
              background: "#1a1d27",
              zIndex: 10,
            }}
          >
            <tr>
              <th style={thStyle}>Pedido ID</th>
              <th style={thStyle}>Proveedor</th>
              <th style={thStyle}>Fecha</th>
              <th style={thStyle}>Productos</th>
              <th style={thStyle}>Solicitado</th>
              <th style={thStyle}>Recibido</th>
              <th style={thStyle}>Pendiente</th>
              <th style={thStyle}>Estado</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {pedidosPagina.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{ textAlign: "center", padding: 30, color: "#64748b" }}
                >
                  No hay pedidos que coincidan
                </td>
              </tr>
            ) : (
              pedidosPagina.map((pedido) => {
                const pendienteTotal =
                  pedido.total_solicitado - pedido.total_recibido;
                const hayPendiente = pendienteTotal > 0;
                const soloLectura = !hayPendiente;

                let rowBg = "transparent";
                if (pedido.estado === "cancelado")
                  rowBg = "rgba(239,68,68,0.08)";
                else if (pedido.total_recibido > 0)
                  rowBg = "rgba(16,185,129,0.06)";
                else if (hayPendiente) rowBg = "rgba(245,158,11,0.06)";

                return (
                  <tr
                    key={pedido.pedido_id}
                    style={{
                      borderBottom: "0.5px solid rgba(255,255,255,0.05)",
                      background: rowBg,
                    }}
                  >
                    <td style={tdStyle}>
                      <span style={{ fontFamily: "monospace", fontSize: 10 }}>
                        {pedido.pedido_id.substring(0, 8)}…
                      </span>
                    </td>
                    <td style={tdStyle}>{pedido.proveedor || "N/A"}</td>
                    <td style={tdStyle}>
                      {new Date(pedido.fecha_pedido).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}>{pedido.total_productos}</td>
                    <td style={tdStyle}>{pedido.total_solicitado}</td>
                    <td style={tdStyle}>{pedido.total_recibido}</td>
                    <td style={tdStyle}>
                      {pendienteTotal > 5 ? (
                        <span style={{ color: "#ef4444", fontWeight: "bold" }}>
                          {pendienteTotal}
                          <AlertCircle
                            size={12}
                            style={{ marginLeft: 4, verticalAlign: "middle" }}
                          />
                        </span>
                      ) : (
                        pendienteTotal
                      )}
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge estado={pedido.estado} />
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <button
                        onClick={() => abrirPanel(pedido)}
                        style={{
                          background: soloLectura
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(79,142,247,0.15)",
                          border: "none",
                          borderRadius: 6,
                          padding: "4px 8px",
                          color: soloLectura ? "#64748b" : "#4f8ef7",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 10,
                          transition: "background 0.2s",
                        }}
                        title={soloLectura ? "Ver detalles" : "Editar pedido"}
                      >
                        {soloLectura ? <Eye size={12} /> : <Edit3 size={12} />}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ========== PAGINACIÓN CON ESTILO DE VENTAS (pero local) ========== */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 6,
          borderTop: "0.5px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 10, color: "#64748b" }}>
          Mostrando {pedidosPagina.length} de {pedidosFiltrados.length}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {/* Botón Anterior */}
          <button
            onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
            style={{
              padding: "4px 10px",
              borderRadius: 4,
              background: "#252836",
              border: "0.5px solid rgba(255,255,255,0.1)",
              color: "#94a3b8",
              fontSize: 11,
              cursor: paginaActual === 1 ? "default" : "pointer",
              opacity: paginaActual === 1 ? 0.4 : 1,
            }}
          >
            <ChevronLeft size={14} />
          </button>

          {/* Generar botones de página con rango (igual que Ventas) */}
          {(() => {
            const total = totalPaginas;
            const current = paginaActual;
            const range = [];
            const delta = 2;
            const left = current - delta;
            const right = current + delta;

            if (total <= 1) return null;

            range.push(1);
            if (left > 2) range.push("...");
            for (
              let i = Math.max(2, left);
              i <= Math.min(total - 1, right);
              i++
            ) {
              if (i !== 1 && i !== total) range.push(i);
            }
            if (right < total - 1) range.push("...");
            if (total > 1) range.push(total);

            return range.map((item, idx) => {
              if (item === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    style={{
                      padding: "4px 6px",
                      color: "#64748b",
                      fontSize: 11,
                    }}
                  >
                    …
                  </span>
                );
              }
              const page = Number(item);
              return (
                <button
                  key={page}
                  onClick={() => setPaginaActual(page)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 4,
                    background: page === current ? "#4f8ef7" : "#252836",
                    border: "0.5px solid rgba(255,255,255,0.1)",
                    color: page === current ? "#fff" : "#94a3b8",
                    fontSize: 11,
                    cursor: "pointer",
                    fontWeight: page === current ? 600 : 400,
                  }}
                >
                  {page}
                </button>
              );
            });
          })()}

          {/* Botón Siguiente */}
          <button
            onClick={() =>
              setPaginaActual((p) => Math.min(totalPaginas, p + 1))
            }
            disabled={paginaActual === totalPaginas}
            style={{
              padding: "4px 10px",
              borderRadius: 4,
              background: "#252836",
              border: "0.5px solid rgba(255,255,255,0.1)",
              color: "#94a3b8",
              fontSize: 11,
              cursor: paginaActual === totalPaginas ? "default" : "pointer",
              opacity: paginaActual === totalPaginas ? 0.4 : 1,
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* PANEL LATERAL (sin cambios, se mantiene igual) */}
      <AnimatePresence>
        {panelAbierto && pedidoEditando && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPanelAbierto(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                zIndex: 40,
                backdropFilter: "blur(2px)",
              }}
            />

            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{
                position: "fixed",
                top: 12,
                right: 12,
                bottom: 12,
                width: 340,
                background: "#1a1d27",
                borderRadius: 12,
                border: "0.5px solid rgba(255,255,255,0.1)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Cabecera */}
              <div
                style={{
                  padding: "12px 14px",
                  borderBottom: "0.5px solid rgba(255,255,255,0.08)",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      {pedidoEditando.soloLectura ? (
                        <Eye size={13} color="#64748b" />
                      ) : (
                        <Edit3 size={13} color="#4f8ef7" />
                      )}
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#e2e8f0",
                        }}
                      >
                        Pedido #{pedidoEditando.pedido_id.substring(0, 8)}…
                      </span>
                      <StatusBadge estado={pedidoEditando.estado} />
                    </div>
                    <div
                      style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}
                    >
                      <Building2
                        size={10}
                        style={{ display: "inline", marginRight: 4 }}
                      />
                      {pedidoEditando.proveedor || "N/A"} ·{" "}
                      <Calendar
                        size={10}
                        style={{ display: "inline", marginRight: 4 }}
                      />
                      {new Date(
                        pedidoEditando.fecha_pedido,
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => setPanelAbierto(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#64748b",
                      cursor: "pointer",
                      padding: 4,
                      borderRadius: 4,
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Resumen */}
                <div
                  style={{
                    marginTop: 8,
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 4,
                  }}
                >
                  {[
                    { label: "Prods", value: pedidoEditando.total_productos },
                    {
                      label: "Solicit.",
                      value: pedidoEditando.total_solicitado,
                    },
                    { label: "Recibido", value: pedidoEditando.total_recibido },
                    {
                      label: "Pendiente",
                      value:
                        pedidoEditando.total_solicitado -
                        pedidoEditando.total_recibido,
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      style={{
                        background: "#252836",
                        borderRadius: 6,
                        padding: "4px 0",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#e2e8f0",
                        }}
                      >
                        {value}
                      </div>
                      <div style={{ fontSize: 8, color: "#64748b" }}>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                {pedidoEditando.soloLectura && (
                  <div
                    style={{
                      marginTop: 6,
                      padding: "4px 8px",
                      background: "#252836",
                      borderRadius: 6,
                      fontSize: 10,
                      color: "#64748b",
                      textAlign: "center",
                    }}
                  >
                    <Eye
                      size={12}
                      style={{ verticalAlign: "middle", marginRight: 4 }}
                    />
                    Solo lectura — sin líneas pendientes
                  </div>
                )}
              </div>

              {/* Lista de líneas */}
              <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px" }}>
                {pedidoEditando.lineas.map((linea, index) => {
                  const pendiente =
                    linea.cantidad_solicitada - (linea._recibir || 0);
                  const esCancelada = linea._cancelar;
                  const modificada = linea._modificado;
                  const tieneRecibido = (linea._recibir || 0) > 0;
                  const pendienteReal =
                    linea.cantidad_solicitada - (linea.cantidad_recibida || 0);
                  const esEditable =
                    !esCancelada &&
                    !pedidoEditando.soloLectura &&
                    linea.estado !== "cancelado" &&
                    pendienteReal > 0;
                  const mostrarCancelar = esEditable && !tieneRecibido;

                  let bgColor = "rgba(37,40,54,0.5)";
                  let borderColor = "rgba(255,255,255,0.05)";
                  if (esCancelada) {
                    bgColor = "rgba(239,68,68,0.12)";
                    borderColor = "rgba(239,68,68,0.3)";
                  } else if (pendiente === 0 && tieneRecibido) {
                    bgColor = "rgba(16,185,129,0.08)";
                    borderColor = "rgba(16,185,129,0.3)";
                  } else if (tieneRecibido && pendiente > 0) {
                    bgColor = "rgba(245,158,11,0.08)";
                    borderColor = "rgba(245,158,11,0.3)";
                  }

                  return (
                    <div
                      key={linea.id}
                      style={{
                        background: bgColor,
                        border: `0.5px solid ${borderColor}`,
                        borderRadius: 6,
                        padding: "8px 10px",
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              color: "#e2e8f0",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {linea.producto_nombre || "Producto"}
                          </div>
                          <div style={{ fontSize: 9, color: "#64748b" }}>
                            SKU: {linea.producto_codigo || "N/A"}
                          </div>
                        </div>
                        {esEditable ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <input
                              type="number"
                              value={linea._recibir}
                              onChange={(e) =>
                                handleCantidadChange(index, e.target.value)
                              }
                              min="0"
                              max={linea.cantidad_solicitada}
                              style={{
                                width: 44,
                                background: "#1a1d27",
                                border: "0.5px solid rgba(255,255,255,0.1)",
                                borderRadius: 4,
                                padding: "2px 4px",
                                fontSize: 10,
                                color: "#e2e8f0",
                                textAlign: "center",
                                outline: "none",
                              }}
                            />
                            <span style={{ fontSize: 9, color: "#64748b" }}>
                              /{linea.cantidad_solicitada}
                            </span>
                            {mostrarCancelar && (
                              <button
                                onClick={() => handleCancelarToggle(index)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "#64748b",
                                  cursor: "pointer",
                                  padding: 2,
                                }}
                                title="Cancelar línea"
                              >
                                <MinusCircle size={13} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div style={{ fontSize: 9, color: "#64748b" }}>
                            {esCancelada ? "🔒 Cancelado" : "🔒 Completo"}
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div
                        style={{
                          marginTop: 4,
                          display: "flex",
                          gap: 8,
                          fontSize: 9,
                          color: "#64748b",
                          flexWrap: "wrap",
                        }}
                      >
                        <span>
                          Sol:{" "}
                          <span
                            style={{
                              color: "#e2e8f0",
                              fontFamily: "monospace",
                            }}
                          >
                            {linea.cantidad_solicitada}
                          </span>
                        </span>
                        <span>
                          Rec:{" "}
                          <span
                            style={{
                              color: "#e2e8f0",
                              fontFamily: "monospace",
                            }}
                          >
                            {linea._recibir || 0}
                          </span>
                        </span>
                        {esCancelada && (
                          <span style={{ color: "#ef4444" }}>
                            <XCircle
                              size={10}
                              style={{ verticalAlign: "middle" }}
                            />{" "}
                            Cancelada
                          </span>
                        )}
                        {!esCancelada && pendiente === 0 && tieneRecibido && (
                          <span style={{ color: "#10b981" }}>
                            <CheckCircle
                              size={10}
                              style={{ verticalAlign: "middle" }}
                            />{" "}
                            Completa
                          </span>
                        )}
                        {!esCancelada && pendiente > 0 && tieneRecibido && (
                          <span style={{ color: "#f59e0b" }}>
                            <Clock
                              size={10}
                              style={{ verticalAlign: "middle" }}
                            />{" "}
                            {pendiente} pend.
                          </span>
                        )}
                        {modificada && esEditable && (
                          <span
                            style={{ color: "#4f8ef7", marginLeft: "auto" }}
                          >
                            <Edit3
                              size={9}
                              style={{ verticalAlign: "middle" }}
                            />{" "}
                            mod.
                          </span>
                        )}
                      </div>

                      {esEditable && esCancelada && (
                        <input
                          type="text"
                          placeholder="Motivo (opcional)"
                          value={linea._motivo}
                          onChange={(e) =>
                            handleMotivoChange(index, e.target.value)
                          }
                          style={{
                            marginTop: 4,
                            width: "100%",
                            background: "#1a1d27",
                            border: "0.5px solid rgba(255,255,255,0.1)",
                            borderRadius: 4,
                            padding: "2px 6px",
                            fontSize: 9,
                            color: "#e2e8f0",
                            outline: "none",
                          }}
                        />
                      )}
                      {esCancelada && linea._motivo && !esEditable && (
                        <div
                          style={{
                            marginTop: 2,
                            fontSize: 9,
                            color: "#64748b",
                          }}
                        >
                          Motivo: {linea._motivo}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Botones */}
              <div
                style={{
                  padding: "10px 14px",
                  borderTop: "0.5px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                {!pedidoEditando.soloLectura ? (
                  <>
                    <button
                      onClick={guardarPedido}
                      disabled={guardando}
                      style={{
                        flex: 1,
                        background: "#4f8ef7",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 12px",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "#fff",
                        cursor: guardando ? "default" : "pointer",
                        opacity: guardando ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      {guardando ? (
                        "Guardando..."
                      ) : (
                        <>
                          <Save size={14} /> Guardar
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setPanelAbierto(false)}
                      style={{
                        background: "#252836",
                        border: "0.5px solid rgba(255,255,255,0.1)",
                        borderRadius: 6,
                        padding: "6px 12px",
                        fontSize: 11,
                        color: "#94a3b8",
                        cursor: "pointer",
                      }}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setPanelAbierto(false)}
                    style={{
                      width: "100%",
                      background: "#252836",
                      border: "0.5px solid rgba(255,255,255,0.1)",
                      borderRadius: 6,
                      padding: "6px 12px",
                      fontSize: 11,
                      color: "#94a3b8",
                      cursor: "pointer",
                    }}
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reposiciones;

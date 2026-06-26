import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axiosConfig";
import { Package, RefreshCw, X, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Building2, Search, Eye, Calendar, Save, Edit3, MinusCircle, AlertCircle } from "lucide-react";

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
      className="fixed top-20 right-4 z-[9999] bg-[#252836] rounded-xl px-4 py-2.5 flex items-center gap-2.5 shadow-2xl text-[#e2e8f0] text-xs max-w-xs backdrop-blur-sm"
      style={{ border: `1px solid ${bgColor}40` }}
    >
      <span style={{ color: bgColor }}>{type === "success" ? "✅" : "❌"}</span>
      <span>{message}</span>
      <button onClick={onClose} className="bg-transparent border-none text-[#64748b] cursor-pointer p-0.5">
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
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: s.bg + "20", color: s.bg }}>
      <Icon size={12} />
      {s.label}
    </span>
  );
};

// ========== COMPONENTE PRINCIPAL ==========
const Reposiciones = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(13);

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
      setPedidos(res.data);

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
      const matchProveedor = filtroProveedor ? pedido.proveedor === filtroProveedor : true;
      const matchProducto = filtroProducto ? pedido.lineas?.some((l) => l.producto_nombre === filtroProducto) : true;
      const matchBusqueda =
        search === "" ||
        pedido.pedido_id.toLowerCase().includes(search.toLowerCase()) ||
        (pedido.proveedor && pedido.proveedor.toLowerCase().includes(search.toLowerCase())) ||
        pedido.lineas?.some((l) => l.producto_nombre?.toLowerCase().includes(search.toLowerCase()));
      return matchEstado && matchProveedor && matchProducto && matchBusqueda;
    });

    resultado.sort((a, b) => {
      const dateA = new Date(a.fecha_pedido);
      const dateB = new Date(b.fecha_pedido);
      return ordenFecha === "desc" ? dateB - dateA : dateA - dateB;
    });
    return resultado;
  }, [pedidos, filtroEstado, filtroProveedor, filtroProducto, search, ordenFecha]);

  // ========== PAGINACIÓN LOCAL ==========
  const totalPaginas = Math.ceil(pedidosFiltrados.length / itemsPorPagina);
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const pedidosPagina = pedidosFiltrados.slice(inicio, inicio + itemsPorPagina);

  useEffect(() => {
    setPaginaActual(1);
  }, [filtroEstado, filtroProveedor, filtroProducto, search, ordenFecha]);

  // ========== PANEL LATERAL ==========
  const abrirPanel = (pedido) => {
    const hayPendiente = pedido.lineas?.some((l) => l.estado !== "cancelado" && l.cantidad_solicitada - l.cantidad_recibida > 0);
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
      nuevasLineas[index]._recibir = Math.min(Math.max(0, parseInt(value) || 0), nuevasLineas[index].cantidad_solicitada);
      nuevasLineas[index]._modificado = true;
      return { ...prev, lineas: nuevasLineas };
    });
  };

  const handleCancelarToggle = (index) => {
    if (pedidoEditando?.soloLectura) return;
    setPedidoEditando((prev) => {
      const nuevasLineas = [...prev.lineas];
      const nuevaCancelacion = !nuevasLineas[index]._cancelar;
      if (nuevaCancelacion && (nuevasLineas[index]._recibir || 0) > 0) return prev;
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
        setErrorMsg(`Cantidad inválida para ${linea.producto_nombre || "producto"}: debe estar entre 0 y ${linea.cantidad_solicitada}`);
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
      setSuccessMsg(`✅ Pedido #${pedidoEditando.pedido_id.substring(0, 8)} guardado`);
      setPanelAbierto(false);
      await fetchPedidos();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || err.response?.data?.message || "Error al guardar cambios");
    } finally {
      setGuardando(false);
    }
  };

  // ========== RENDER ==========
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-48px)]">
        <div className="w-10 h-10 rounded-full border-4 border-transparent border-t-[#4f8ef7] animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#1a1d27] rounded-xl p-3 w-full h-[calc(100vh-48px)] flex flex-col gap-2.5 font-sans overflow-hidden">
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
            <p className="text-sm font-medium text-[#e2e8f0] leading-tight">Reposiciones</p>
            <p className="text-[9px] text-[#64748b]">{pedidosFiltrados.length} registros</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtro mes */}
          <div className="bg-[#252836] border border-white/10 rounded-md px-2.5 py-1 text-xs text-[#94a3b8] flex items-center gap-1">
            <Calendar size={12} />
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="bg-transparent border-none outline-none text-[#94a3b8] text-xs cursor-pointer w-32" />
          </div>

          {/* Búsqueda */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchPedidos();
            }}
            className="bg-[#252836] border border-white/10 rounded-md px-2 py-1 flex items-center gap-1"
          >
            <Search size={13} color="#64748b" />
            <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-[#e2e8f0] text-xs w-24" />
            <button type="submit" className="bg-transparent border-none text-[#4f8ef7] cursor-pointer px-1 py-0.5 text-xs">
              Buscar
            </button>
          </form>

          {/* Filtros adicionales */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-[#252836] border border-white/10 rounded-md px-2 py-1 text-xs text-[#94a3b8] outline-none cursor-pointer h-7"
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
            className="bg-[#252836] border border-white/10 rounded-md px-2 py-1 text-xs text-[#94a3b8] outline-none cursor-pointer h-7 max-w-[120px]"
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
            className="bg-[#252836] border border-white/10 rounded-md px-2 py-1 text-xs text-[#94a3b8] outline-none cursor-pointer h-7 max-w-[120px]"
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
              setMonth(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`);
            }}
            className="bg-[#252836] border border-white/10 rounded-md px-2 py-1 text-xs text-[#94a3b8] cursor-pointer h-7 flex items-center gap-1"
          >
            <X size={12} /> Limpiar
          </button>

          <button
            onClick={() => setOrdenFecha(ordenFecha === "desc" ? "asc" : "desc")}
            className="bg-[#252836] border border-white/10 rounded-md px-2 py-1 text-xs text-[#94a3b8] cursor-pointer h-7 flex items-center gap-1"
          >
            <Calendar size={12} />
            {ordenFecha === "desc" ? "↓" : "↑"}
          </button>

          <button onClick={() => fetchPedidos()} className="bg-[#252836] border border-white/10 rounded-md w-7 h-7 flex items-center justify-center cursor-pointer text-[#94a3b8]">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full border-collapse text-xs text-[#e2e8f0]">
          <thead className="sticky top-0 bg-[#1a1d27] z-10">
            <tr>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">Pedido ID</th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">Proveedor</th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">Fecha</th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">Productos</th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">Solicitado</th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">Recibido</th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">Pendiente</th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">Estado</th>
              <th className="text-center px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">Acción</th>
            </tr>
          </thead>
          <tbody>
            {pedidosPagina.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-[#64748b]">
                  No hay pedidos que coincidan
                </td>
              </tr>
            ) : (
              pedidosPagina.map((pedido) => {
                const pendienteTotal = pedido.total_solicitado - pedido.total_recibido;
                const hayPendiente = pendienteTotal > 0;
                const soloLectura = !hayPendiente;

                let rowBg = "transparent";
                if (pedido.estado === "cancelado") rowBg = "bg-red-500/10";
                else if (pedido.total_recibido > 0) rowBg = "bg-emerald-500/10";
                else if (hayPendiente) rowBg = "bg-amber-500/10";

                return (
                  <tr key={pedido.pedido_id} className={`border-b border-white/5 ${rowBg}`}>
                    <td className="px-2 py-1.5 align-middle text-[11px]">
                      <span className="font-mono text-[10px]">{pedido.pedido_id.substring(0, 8)}…</span>
                    </td>
                    <td className="px-2 py-1.5 align-middle text-[11px]">{pedido.proveedor || "N/A"}</td>
                    <td className="px-2 py-1.5 align-middle text-[11px]">{new Date(pedido.fecha_pedido).toLocaleDateString()}</td>
                    <td className="px-2 py-1.5 align-middle text-[11px]">{pedido.total_productos}</td>
                    <td className="px-2 py-1.5 align-middle text-[11px]">{pedido.total_solicitado}</td>
                    <td className="px-2 py-1.5 align-middle text-[11px]">{pedido.total_recibido}</td>
                    <td className="px-2 py-1.5 align-middle text-[11px]">
                      {pendienteTotal > 5 ? (
                        <span className="text-red-400 font-bold">
                          {pendienteTotal}
                          <AlertCircle size={12} className="inline ml-1 align-middle" />
                        </span>
                      ) : (
                        pendienteTotal
                      )}
                    </td>
                    <td className="px-2 py-1.5 align-middle text-[11px]">
                      <StatusBadge estado={pedido.estado} />
                    </td>
                    <td className="px-2 py-1.5 align-middle text-center">
                      <button
                        onClick={() => abrirPanel(pedido)}
                        className={`rounded px-2 py-1 text-[10px] inline-flex items-center gap-1 cursor-pointer transition-colors ${
                          soloLectura ? "bg-white/5 text-[#64748b]" : "bg-[#4f8ef7]/15 text-[#4f8ef7] hover:bg-[#4f8ef7]/25"
                        } border-none`}
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

      {/* PAGINACIÓN */}
      <div className="flex items-center justify-between pt-1.5 border-t border-white/10 flex-shrink-0">
        <span className="text-[10px] text-[#64748b]">
          Mostrando {pedidosPagina.length} de {pedidosFiltrados.length}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
            className="px-2.5 py-1 rounded bg-[#252836] border border-white/10 text-[#94a3b8] text-[11px] disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>

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
            for (let i = Math.max(2, left); i <= Math.min(total - 1, right); i++) {
              if (i !== 1 && i !== total) range.push(i);
            }
            if (right < total - 1) range.push("...");
            if (total > 1) range.push(total);

            return range.map((item, idx) => {
              if (item === "...") {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1.5 py-1 text-[#64748b] text-[11px]">
                    …
                  </span>
                );
              }
              const page = Number(item);
              return (
                <button
                  key={page}
                  onClick={() => setPaginaActual(page)}
                  className={`px-2.5 py-1 rounded border border-white/10 text-[11px] ${page === current ? "bg-[#4f8ef7] text-white font-semibold" : "bg-[#252836] text-[#94a3b8]"}`}
                >
                  {page}
                </button>
              );
            });
          })()}

          <button
            onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual === totalPaginas}
            className="px-2.5 py-1 rounded bg-[#252836] border border-white/10 text-[#94a3b8] text-[11px] disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* PANEL LATERAL */}
      <AnimatePresence>
        {panelAbierto && pedidoEditando && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPanelAbierto(false)} className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" />

            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-3 right-3 bottom-3 w-[340px] bg-[#1a1d27] rounded-xl border border-white/10 shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Cabecera */}
              <div className="px-3.5 py-3 border-b border-white/10 flex-shrink-0">
                <div className="flex justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      {pedidoEditando.soloLectura ? <Eye size={13} color="#64748b" /> : <Edit3 size={13} color="#4f8ef7" />}
                      <span className="text-[13px] font-medium text-[#e2e8f0]">Pedido #{pedidoEditando.pedido_id.substring(0, 8)}…</span>
                      <StatusBadge estado={pedidoEditando.estado} />
                    </div>
                    <div className="text-[10px] text-[#64748b] mt-0.5">
                      <Building2 size={10} className="inline mr-1" />
                      {pedidoEditando.proveedor || "N/A"} · <Calendar size={10} className="inline mr-1" />
                      {new Date(pedidoEditando.fecha_pedido).toLocaleDateString()}
                    </div>
                  </div>
                  <button onClick={() => setPanelAbierto(false)} className="bg-transparent border-none text-[#64748b] cursor-pointer p-1 rounded">
                    <X size={14} />
                  </button>
                </div>

                {/* Resumen */}
                <div className="mt-2 grid grid-cols-4 gap-1">
                  {[
                    { label: "Prods", value: pedidoEditando.total_productos },
                    {
                      label: "Solicit.",
                      value: pedidoEditando.total_solicitado,
                    },
                    { label: "Recibido", value: pedidoEditando.total_recibido },
                    {
                      label: "Pendiente",
                      value: pedidoEditando.total_solicitado - pedidoEditando.total_recibido,
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-[#252836] rounded-md py-1 text-center">
                      <div className="text-[13px] font-semibold text-[#e2e8f0]">{value}</div>
                      <div className="text-[8px] text-[#64748b]">{label}</div>
                    </div>
                  ))}
                </div>

                {pedidoEditando.soloLectura && (
                  <div className="mt-1.5 px-2 py-1 bg-[#252836] rounded-md text-[10px] text-[#64748b] text-center">
                    <Eye size={12} className="inline mr-1 align-middle" />
                    Solo lectura — sin líneas pendientes
                  </div>
                )}
              </div>

              {/* Lista de líneas */}
              <div className="flex-1 overflow-y-auto px-3.5 py-2.5">
                {pedidoEditando.lineas.map((linea, index) => {
                  const pendiente = linea.cantidad_solicitada - (linea._recibir || 0);
                  const esCancelada = linea._cancelar;
                  const modificada = linea._modificado;
                  const tieneRecibido = (linea._recibir || 0) > 0;
                  const pendienteReal = linea.cantidad_solicitada - (linea.cantidad_recibida || 0);
                  const esEditable = !esCancelada && !pedidoEditando.soloLectura && linea.estado !== "cancelado" && pendienteReal > 0;
                  const mostrarCancelar = esEditable && !tieneRecibido;

                  let bgColor = "bg-[#252836]/50";
                  let borderColor = "border-white/5";
                  if (esCancelada) {
                    bgColor = "bg-red-500/15";
                    borderColor = "border-red-500/30";
                  } else if (pendiente === 0 && tieneRecibido) {
                    bgColor = "bg-emerald-500/10";
                    borderColor = "border-emerald-500/30";
                  } else if (tieneRecibido && pendiente > 0) {
                    bgColor = "bg-amber-500/10";
                    borderColor = "border-amber-500/30";
                  }

                  return (
                    <div key={linea.id} className={`${bgColor} border ${borderColor} rounded-md p-2 mb-1.5`}>
                      <div className="flex justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-medium text-[#e2e8f0] truncate">{linea.producto_nombre || "Producto"}</div>
                          <div className="text-[9px] text-[#64748b]">SKU: {linea.producto_codigo || "N/A"}</div>
                        </div>
                        {esEditable ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={linea._recibir}
                              onChange={(e) => handleCantidadChange(index, e.target.value)}
                              min="0"
                              max={linea.cantidad_solicitada}
                              className="w-11 bg-[#1a1d27] border border-white/10 rounded px-1 py-0.5 text-[10px] text-[#e2e8f0] text-center outline-none"
                            />
                            <span className="text-[9px] text-[#64748b]">/{linea.cantidad_solicitada}</span>
                            {mostrarCancelar && (
                              <button onClick={() => handleCancelarToggle(index)} className="bg-transparent border-none text-[#64748b] cursor-pointer p-0.5" title="Cancelar línea">
                                <MinusCircle size={13} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="text-[9px] text-[#64748b]">{esCancelada ? "🔒 Cancelado" : "🔒 Completo"}</div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="mt-1 flex gap-2 text-[9px] text-[#64748b] flex-wrap">
                        <span>
                          Sol: <span className="text-[#e2e8f0] font-mono">{linea.cantidad_solicitada}</span>
                        </span>
                        <span>
                          Rec: <span className="text-[#e2e8f0] font-mono">{linea._recibir || 0}</span>
                        </span>
                        {esCancelada && (
                          <span className="text-red-400">
                            <XCircle size={10} className="inline align-middle" /> Cancelada
                          </span>
                        )}
                        {!esCancelada && pendiente === 0 && tieneRecibido && (
                          <span className="text-emerald-400">
                            <CheckCircle size={10} className="inline align-middle" /> Completa
                          </span>
                        )}
                        {!esCancelada && pendiente > 0 && tieneRecibido && (
                          <span className="text-amber-400">
                            <Clock size={10} className="inline align-middle" /> {pendiente} pend.
                          </span>
                        )}
                        {modificada && esEditable && (
                          <span className="text-[#4f8ef7] ml-auto">
                            <Edit3 size={9} className="inline align-middle" /> mod.
                          </span>
                        )}
                      </div>

                      {esEditable && esCancelada && (
                        <input
                          type="text"
                          placeholder="Motivo (opcional)"
                          value={linea._motivo}
                          onChange={(e) => handleMotivoChange(index, e.target.value)}
                          className="mt-1 w-full bg-[#1a1d27] border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-[#e2e8f0] outline-none"
                        />
                      )}
                      {esCancelada && linea._motivo && !esEditable && <div className="mt-0.5 text-[9px] text-[#64748b]">Motivo: {linea._motivo}</div>}
                    </div>
                  );
                })}
              </div>

              {/* Botones */}
              <div className="px-3.5 py-2.5 border-t border-white/10 flex gap-2 flex-shrink-0">
                {!pedidoEditando.soloLectura ? (
                  <>
                    <button
                      onClick={guardarPedido}
                      disabled={guardando}
                      className="flex-1 bg-[#4f8ef7] border-none rounded-md px-3 py-1.5 text-xs font-medium text-white cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                    >
                      {guardando ? (
                        "Guardando..."
                      ) : (
                        <>
                          <Save size={14} /> Guardar
                        </>
                      )}
                    </button>
                    <button onClick={() => setPanelAbierto(false)} className="bg-[#252836] border border-white/10 rounded-md px-3 py-1.5 text-xs text-[#94a3b8] cursor-pointer">
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button onClick={() => setPanelAbierto(false)} className="w-full bg-[#252836] border border-white/10 rounded-md px-3 py-1.5 text-xs text-[#94a3b8] cursor-pointer">
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

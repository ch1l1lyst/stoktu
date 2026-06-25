import { useState, useEffect } from "react";
import {
  Calendar,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  User,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import api from "../../api/axiosConfig";

const fmt = (v) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(
    v ?? 0,
  );

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    links: [],
  });
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchVentas(1);
  }, [month, search]);

  const fetchVentas = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = { page };
      if (month) params.month = month;
      if (search) params.search = search;
      const res = await api.get("/ventas", { params });
      setVentas(res.data.data);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        per_page: res.data.per_page,
        total: res.data.total,
        links: res.data.links,
      });
    } catch (err) {
      console.error(err);
      setError("Error al cargar las ventas");
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (url) => {
    if (!url) return;
    try {
      const urlObj = new URL(url, window.location.origin);
      const pageParam = urlObj.searchParams.get("page");
      if (pageParam) fetchVentas(parseInt(pageParam));
    } catch (e) {
      const match = url.match(/page=(\d+)/);
      if (match) fetchVentas(parseInt(match[1]));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVentas(1);
  };

  const EstadoBadge = ({ estado }) => {
    const styles = {
      completado: { bg: "#10b981", icon: CheckCircle, label: "Completado" },
      cancelado: { bg: "#ef4444", icon: XCircle, label: "Cancelado" },
      pendiente: { bg: "#f59e0b", icon: Clock, label: "Pendiente" },
    };
    const s = styles[estado] || styles.pendiente;
    const Icon = s.icon;
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
        style={{ background: s.bg + "20", color: s.bg }}
      >
        <Icon size={12} />
        {s.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-48px)]">
        <div className="w-10 h-10 rounded-full border-4 border-transparent border-t-[#4f8ef7] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-48px)]">
        <div className="bg-red-500/10 border border-[#ef4444] rounded-xl p-6 text-center text-[#ef4444]">
          <AlertTriangle size={32} className="mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1d27] rounded-xl p-3 w-full h-[calc(100vh-48px)] flex flex-col gap-2.5 font-sans overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-1.5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7.5 h-7.5 bg-[#4f5cf7] rounded-lg flex items-center justify-center">
            <Package size={15} color="#fff" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#e2e8f0] leading-tight">
              Ventas
            </p>
            <p className="text-[9px] text-[#64748b]">
              {pagination.total} registros
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtro mes */}
          <div className="bg-[#252836] border border-white/10 rounded-md px-2.5 py-1 text-xs text-[#94a3b8] flex items-center gap-1">
            <Calendar size={12} />
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent border-none outline-none text-[#94a3b8] text-xs cursor-pointer w-32"
            />
          </div>

          {/* Búsqueda */}
          <form
            onSubmit={handleSearch}
            className="bg-[#252836] border border-white/10 rounded-md px-2 py-1 flex items-center gap-1"
          >
            <Search size={13} color="#64748b" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-[#e2e8f0] text-xs w-28"
            />
          </form>

          <button
            onClick={() => fetchVentas(1)}
            className="bg-[#252836] border border-white/10 rounded-md w-7 h-7 flex items-center justify-center cursor-pointer text-[#94a3b8]"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full border-collapse text-xs text-[#e2e8f0]">
          <thead className="sticky top-0 bg-[#1a1d27] z-10">
            <tr>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">
                # Pedido
              </th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">
                Producto
              </th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">
                Cant.
              </th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">
                Precio
              </th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">
                Total
              </th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">
                Cliente
              </th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">
                Sector
              </th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">
                Vendedor
              </th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">
                Estado
              </th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody>
            {ventas.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-[#64748b]">
                  No hay ventas registradas
                </td>
              </tr>
            ) : (
              ventas.map((v) => (
                <tr key={v.id} className="border-b border-white/5">
                  <td className="px-2 py-1.5 align-middle text-[11px]">
                    {v.numero_pedido || "—"}
                  </td>
                  <td className="px-2 py-1.5 align-middle text-[11px]">
                    <span className="text-[10px] text-[#94a3b8]">
                      {v.producto_codigo}
                    </span>
                    <br />
                    <span className="text-[10px] font-medium">
                      {v.producto?.nombre || "Sin producto"}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 align-middle text-[11px]">
                    {v.cantidad}
                  </td>
                  <td className="px-2 py-1.5 align-middle text-[11px]">
                    {fmt(v.precio_unitario)}
                  </td>
                  <td className="px-2 py-1.5 align-middle text-[11px]">
                    {fmt(v.cantidad * v.precio_unitario)}
                  </td>
                  <td className="px-2 py-1.5 align-middle text-[11px]">
                    <span className="flex items-center gap-1">
                      <User size={10} color="#64748b" />
                      {v.cliente || "—"}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 align-middle text-[11px]">
                    <span className="flex items-center gap-1">
                      <MapPin size={10} color="#64748b" />
                      {v.sector || "—"}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 align-middle text-[11px]">
                    {v.vendedor_nombre || "—"}
                  </td>
                  <td className="px-2 py-1.5 align-middle text-[11px]">
                    <EstadoBadge estado={v.estado_pedido} />
                  </td>
                  <td className="px-2 py-1.5 align-middle text-[11px]">
                    {new Date(v.fecha).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      <div className="flex items-center justify-between pt-1.5 border-t border-white/10 flex-shrink-0">
        <span className="text-[10px] text-[#64748b]">
          Mostrando {ventas.length} de {pagination.total}
        </span>
        <div className="flex gap-1">
          {/* Anterior */}
          <button
            onClick={() => {
              const prev = pagination.links?.find(
                (l) => l.label === "&laquo; Anterior",
              );
              goToPage(prev?.url);
            }}
            disabled={
              !pagination.links?.find((l) => l.label === "&laquo; Anterior")
                ?.url
            }
            className="px-2.5 py-1 rounded bg-[#252836] border border-white/10 text-[#94a3b8] text-[11px] disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>

          {(() => {
            const total = pagination.last_page;
            const current = pagination.current_page;
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
                    className="px-1.5 py-1 text-[#64748b] text-[11px]"
                  >
                    …
                  </span>
                );
              }
              const page = Number(item);
              const link = pagination.links?.find(
                (l) => parseInt(l.label) === page,
              );
              return (
                <button
                  key={page}
                  onClick={() => goToPage(link?.url)}
                  className={`px-2.5 py-1 rounded border border-white/10 text-[11px] ${page === current ? "bg-[#4f8ef7] text-white font-semibold" : "bg-[#252836] text-[#94a3b8]"}`}
                >
                  {page}
                </button>
              );
            });
          })()}

          {/* Siguiente */}
          <button
            onClick={() => {
              const next = pagination.links?.find(
                (l) => l.label === "Siguiente &raquo;",
              );
              goToPage(next?.url);
            }}
            disabled={
              !pagination.links?.find((l) => l.label === "Siguiente &raquo;")
                ?.url
            }
            className="px-2.5 py-1 rounded bg-[#252836] border border-white/10 text-[#94a3b8] text-[11px] disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ventas;

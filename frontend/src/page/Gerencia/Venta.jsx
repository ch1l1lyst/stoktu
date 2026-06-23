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

  // Cargar ventas al cambiar mes, búsqueda o página
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

  // Estado badge
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

  if (error) {
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
      {/* HEADER */}
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
              Ventas
            </p>
            <p style={{ fontSize: 9, color: "#64748b" }}>
              {pagination.total} registros
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
            onSubmit={handleSearch}
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
                width: 120,
              }}
            />
          </form>

          <button
            onClick={() => fetchVentas(1)}
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
              <th style={thStyle}># Pedido</th>
              <th style={thStyle}>Producto</th>
              <th style={thStyle}>Cant.</th>
              <th style={thStyle}>Precio</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Cliente</th>
              <th style={thStyle}>Sector</th>
              <th style={thStyle}>Vendedor</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {ventas.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  style={{ textAlign: "center", padding: 30, color: "#64748b" }}
                >
                  No hay ventas registradas
                </td>
              </tr>
            ) : (
              ventas.map((v) => (
                <tr
                  key={v.id}
                  style={{ borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}
                >
                  <td style={tdStyle}>{v.numero_pedido || "—"}</td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>
                      {v.producto_codigo}
                    </span>
                    <br />
                    <span style={{ fontSize: 10, fontWeight: 500 }}>
                      {v.producto?.nombre || "Sin producto"}
                    </span>
                  </td>
                  <td style={tdStyle}>{v.cantidad}</td>
                  <td style={tdStyle}>{fmt(v.precio_unitario)}</td>
                  <td style={tdStyle}>{fmt(v.cantidad * v.precio_unitario)}</td>
                  <td style={tdStyle}>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 3 }}
                    >
                      <User size={10} color="#64748b" />
                      {v.cliente || "—"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 3 }}
                    >
                      <MapPin size={10} color="#64748b" />
                      {v.sector || "—"}
                    </span>
                  </td>
                  <td style={tdStyle}>{v.vendedor_nombre || "—"}</td>
                  <td style={tdStyle}>
                    <EstadoBadge estado={v.estado_pedido} />
                  </td>
                  <td style={tdStyle}>
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

      {/* ========== PAGINACIÓN CON RANGO (igual que Reposiciones) ========== */}
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
          Mostrando {ventas.length} de {pagination.total}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {/* Botón Anterior */}
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
            style={{
              padding: "4px 10px",
              borderRadius: 4,
              background: "#252836",
              border: "0.5px solid rgba(255,255,255,0.1)",
              color: "#94a3b8",
              fontSize: 11,
              cursor: pagination.links?.find(
                (l) => l.label === "&laquo; Anterior",
              )?.url
                ? "pointer"
                : "default",
              opacity: pagination.links?.find(
                (l) => l.label === "&laquo; Anterior",
              )?.url
                ? 1
                : 0.4,
            }}
          >
            <ChevronLeft size={14} />
          </button>

          {/* Generar rango de páginas (igual que en Reposiciones) */}
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
              // Buscar el link correspondiente para esta página
              const link = pagination.links?.find(
                (l) => parseInt(l.label) === page,
              );
              return (
                <button
                  key={page}
                  onClick={() => goToPage(link?.url)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 4,
                    background: page === current ? "#4f8ef7" : "#252836",
                    border: "0.5px solid rgba(255,255,255,0.1)",
                    color: page === current ? "#fff" : "#94a3b8",
                    fontSize: 11,
                    cursor: link?.url ? "pointer" : "default",
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
            style={{
              padding: "4px 10px",
              borderRadius: 4,
              background: "#252836",
              border: "0.5px solid rgba(255,255,255,0.1)",
              color: "#94a3b8",
              fontSize: 11,
              cursor: pagination.links?.find(
                (l) => l.label === "Siguiente &raquo;",
              )?.url
                ? "pointer"
                : "default",
              opacity: pagination.links?.find(
                (l) => l.label === "Siguiente &raquo;",
              )?.url
                ? 1
                : 0.4,
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Estilos reutilizables
const thStyle = {
  textAlign: "left",
  padding: "6px 8px",
  fontWeight: 600,
  color: "#94a3b8",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "0.5px solid rgba(255,255,255,0.08)",
};

const tdStyle = {
  padding: "6px 8px",
  verticalAlign: "middle",
  fontSize: 11,
};

export default Ventas;

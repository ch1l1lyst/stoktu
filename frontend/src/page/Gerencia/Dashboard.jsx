import { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Package,
  AlertTriangle,
  Wallet,
  Zap,
  Calendar,
  RefreshCw,
  MapPin,
} from "lucide-react";
import api from "../../api/axiosConfig";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// ─── PLUGIN: etiquetas grandes dentro del pastel ──────────────────────
const pieLabelPlugin = {
  id: "pieLabel",
  afterDraw(chart) {
    const { ctx, data, chartArea } = chart;
    const dataset = data.datasets[0];
    if (!dataset) return;
    const total = dataset.data.reduce((a, b) => a + b, 0);
    if (total === 0) return;
    const meta = chart.getDatasetMeta(0);
    const arcs = meta.data;
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;
    const innerRadius = chart._metasets[0]?.data[0]?.innerRadius || 0;
    const outerRadius = chart._metasets[0]?.data[0]?.outerRadius || 0;
    const labelRadius = (innerRadius + outerRadius) / 2;
    arcs.forEach((arc, index) => {
      const rawValue = dataset.data[index];
      if (typeof rawValue !== "number" || isNaN(rawValue) || rawValue === 0)
        return;
      const label = rawValue.toString();
      const startAngle = arc.startAngle;
      const endAngle = arc.endAngle;
      const midAngle = (startAngle + endAngle) / 2;
      const x = centerX + Math.cos(midAngle) * labelRadius;
      const y = centerY + Math.sin(midAngle) * labelRadius;
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 18px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 8;
      ctx.fillText(label, x, y);
      ctx.restore();
    });
  },
};

ChartJS.register(pieLabelPlugin);

// ─── PLUGIN: etiquetas de valor a la derecha de las barras ────────────
const barLabelPlugin = {
  id: "barLabel",
  afterDraw(chart) {
    const { ctx, data, chartArea } = chart;
    const dataset = data.datasets[0];
    if (!dataset) return;
    const meta = chart.getDatasetMeta(0);
    const bars = meta.data;
    bars.forEach((bar, index) => {
      const value = dataset.data[index];
      if (value === 0) return;
      const x = bar.x + bar.width + 6;
      const y = bar.y + bar.height / 2;
      ctx.save();
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.font = "bold 10px sans-serif";
      ctx.fillStyle = "#e5e7eb";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 4;
      ctx.fillText(`$${value.toFixed(2)}`, x, y);
      ctx.restore();
    });
  },
};

ChartJS.register(barLabelPlugin);

// ─── Paleta ──────────────────────────────────────────────────────────────
const PIE_COLORS = [
  "#4f8ef7",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#9b59f7",
  "#ec4899",
];
const SEC_COLORS = ["#f59e0b", "#4f8ef7", "#10b981", "#9b59f7", "#ef4444"];
const GRID_COLOR = "rgba(255,255,255,0.05)";
const TICK_COLOR = "#64748b";

const fmt = (v) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(
    v ?? 0,
  );

// ─── MetricCard ──────────────────────────────────────────────────────────
const ACCENT = {
  blue: "#4f8ef7",
  emerald: "#10b981",
  purple: "#9b59f7",
  cyan: "#06b6d4",
  red: "#ef4444",
  amber: "#f59e0b",
};

function MetricCard({ label, value, icon: Icon, color }) {
  const ac = ACCENT[color];
  return (
    <div
      style={{
        background: "#252836",
        borderRadius: 8,
        padding: "14px 16px",
        borderLeft: `4px solid ${ac}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#94a3b8",
            textTransform: "uppercase",
          }}
        >
          {label}
        </p>
        <p style={{ fontSize: 18, fontWeight: 600, color: "#f1f5f9" }}>
          {value}
        </p>
      </div>
      <Icon size={22} color={ac} style={{ opacity: 0.7, flexShrink: 0 }} />
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────
function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const cardRef = useRef(null);
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    fetchData();
  }, [month]);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/dashboard?month=${month}`);
      setData(res.data);
    } catch (e) {
      console.error(e);
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }

  // ── calcular posición del tooltip ──────────────────────────────────────
  const updateTooltipPosition = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  };

  const handleMouseEnter = () => {
    updateTooltipPosition();
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
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

  if (error || !data) {
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
          <p>{error || "Datos no disponibles"}</p>
        </div>
      </div>
    );
  }

  const {
    indicadores = {},
    grafico_pastel = [],
    ventas_diarias = [],
    sectores_ventas = [],
    productos_sin_stock = [],
    productos_bajo_stock = [],
  } = data;

  const totalCritico = productos_sin_stock.length + productos_bajo_stock.length;
  const productosCriticos = [
    ...productos_sin_stock.map((p) => ({ ...p, tipo: "Sin stock" })),
    ...productos_bajo_stock.map((p) => ({ ...p, tipo: "Bajo stock" })),
  ];

  // ── Datos gráficos ────────────────────────────────────────────────────
  const lineData = {
    labels: ventas_diarias.map((d) => {
      const date = new Date(d.fecha);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
      });
    }),
    datasets: [
      {
        label: "Ventas ($)",
        data: ventas_diarias.map((d) => d.ventas),
        borderColor: "#4f8ef7",
        backgroundColor: "rgba(79,142,247,0.10)",
        fill: true,
        tension: 0.4,
        pointRadius: 2.5,
        pointBackgroundColor: "#4f8ef7",
        pointBorderColor: "#252836",
        pointBorderWidth: 1.5,
      },
    ],
  };

  const lineOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        ticks: { color: TICK_COLOR, font: { size: 8 }, maxTicksLimit: 8 },
        grid: { color: GRID_COLOR },
      },
      y: {
        ticks: {
          color: TICK_COLOR,
          font: { size: 8 },
          callback: (v) => `$${v}`,
        },
        grid: { color: GRID_COLOR },
      },
    },
  };

  const barData = {
    labels: sectores_ventas.map((s) => s.sector || "Sin sector"),
    datasets: [
      {
        data: sectores_ventas.map((s) => parseFloat(s.total_ventas) || 0),
        backgroundColor: SEC_COLORS.slice(0, sectores_ventas.length),
        borderRadius: 3,
        borderWidth: 0,
      },
    ],
  };

  const barOpts = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (c) => ` $${c.raw.toLocaleString()}` } },
    },
    scales: {
      x: {
        ticks: {
          color: TICK_COLOR,
          font: { size: 8 },
          callback: (v) => `$${v}`,
        },
        grid: { color: GRID_COLOR },
      },
      y: {
        ticks: { color: "#94a3b8", font: { size: 9 } },
        grid: { display: false },
      },
    },
  };

  const pieData = {
    labels: grafico_pastel.map((i) => i.name),
    datasets: [
      {
        data: grafico_pastel.map((i) => Number(i.value) || 0),
        backgroundColor: PIE_COLORS.slice(0, grafico_pastel.length),
        borderWidth: 2,
        borderColor: "#252836",
      },
    ],
  };

  const pieOpts = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#94a3b8",
          font: { size: 11, weight: "bold" },
          padding: 8,
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 10,
        },
      },
      tooltip: { enabled: false },
    },
  };

  // ──────────────────────────────────────────────────────────────────────
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
            <Zap size={15} color="#fff" />
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
              Dashboard
            </p>
            <p style={{ fontSize: 9, color: "#64748b" }}>Panel de control</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
              }}
            />
          </div>
          <button
            onClick={fetchData}
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

      {/* ─── MÉTRICAS (5) ────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <MetricCard
          label="Ventas"
          value={fmt(indicadores.total_ventas)}
          icon={DollarSign}
          color="blue"
        />
        <MetricCard
          label="Pedidos"
          value={indicadores.pedidos_completados ?? 0}
          icon={ShoppingBag}
          color="emerald"
        />
        <MetricCard
          label="Ganancia"
          value={fmt(indicadores.ganancia_bruta)}
          icon={TrendingUp}
          color="purple"
        />
        <MetricCard
          label="Inventario"
          value={fmt(indicadores.valor_inventario)}
          icon={Wallet}
          color="amber"
        />

        {/* ─── TARJETA STOCK CRÍTICO CON TOOLTIP FIJO ─── */}
        <div
          ref={cardRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ position: "relative" }}
        >
          <div
            style={{
              background: "#252836",
              borderRadius: 8,
              padding: "14px 16px",
              borderLeft: `4px solid ${totalCritico > 0 ? "#ef4444" : "#10b981"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              cursor: "help",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                }}
              >
                Stock crítico
              </p>
              <p style={{ fontSize: 18, fontWeight: 600, color: "#f1f5f9" }}>
                {totalCritico}
              </p>
            </div>
            <AlertTriangle
              size={22}
              color={totalCritico > 0 ? "#ef4444" : "#10b981"}
              style={{ opacity: 0.7 }}
            />
          </div>

          {/* ─── TOOLTIP FIJO ─── */}
          {showTooltip && (
            <div
              style={{
                position: "fixed",
                zIndex: 9999,
                top: tooltipPosition.top,
                left: Math.min(tooltipPosition.left, window.innerWidth - 300),
                width: 280,
                maxHeight: 200,
                overflowY: "auto",
                background: "#1e293b",
                borderRadius: 8,
                padding: "10px 12px",
                boxShadow: "0 15px 40px rgba(0,0,0,0.7)",
                border: "0.5px solid rgba(255,255,255,0.1)",
                pointerEvents: "none",
              }}
            >
              {productosCriticos.length === 0 ? (
                <p
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    textAlign: "center",
                  }}
                >
                  ✅ No hay productos críticos
                </p>
              ) : (
                <div>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#94a3b8",
                      marginBottom: 6,
                    }}
                  >
                    Productos con alerta:
                  </p>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    {/* Mostrar solo los primeros 4 productos */}
                    {productosCriticos.slice(0, 4).map((p) => (
                      <li
                        key={p.codigo}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                          color: "#e2e8f0",
                          borderBottom: "0.5px solid rgba(255,255,255,0.05)",
                          paddingBottom: 4,
                        }}
                      >
                        <span>
                          <span
                            style={{
                              display: "inline-block",
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              marginRight: 6,
                              background:
                                p.tipo === "Sin stock" ? "#ef4444" : "#f59e0b",
                            }}
                          />
                          {p.nombre}
                        </span>
                        <span style={{ color: "#94a3b8", fontSize: 10 }}>
                          {p.tipo === "Sin stock" ? "0" : p.stock_actual}
                        </span>
                      </li>
                    ))}
                    {/* Mensaje de "más productos" si hay más de 4 */}
                    {productosCriticos.length > 4 && (
                      <li
                        style={{
                          fontSize: 11,
                          color: "#94a3b8",
                          textAlign: "center",
                          paddingTop: 4,
                          borderTop: "0.5px solid rgba(255,255,255,0.05)",
                          marginTop: 2,
                        }}
                      >
                        + {productosCriticos.length - 4} productos más
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── GRÁFICOS EN 3 COLUMNAS ────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Pastel Categorías */}
        <div
          style={{
            background: "#252836",
            borderRadius: 10,
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: "#94a3b8",
              marginBottom: 4,
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexShrink: 0,
            }}
          >
            <Package size={13} color="#4f8ef7" /> Categorías
          </p>
          <div style={{ flex: 1, position: "relative", minHeight: 100 }}>
            {grafico_pastel.length === 0 ? (
              <p
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                Sin datos
              </p>
            ) : (
              <Doughnut data={pieData} options={pieOpts} />
            )}
          </div>
        </div>

        {/* Barras Sectores */}
        <div
          style={{
            background: "#252836",
            borderRadius: 10,
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: "#94a3b8",
              marginBottom: 4,
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexShrink: 0,
            }}
          >
            <MapPin size={13} color="#f59e0b" /> Sectores
          </p>
          <div style={{ flex: 1, position: "relative", minHeight: 80 }}>
            {sectores_ventas.length === 0 ? (
              <p
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                Sin datos
              </p>
            ) : (
              <Bar data={barData} options={barOpts} />
            )}
          </div>
        </div>

        {/* Líneas Ventas Diarias */}
        <div
          style={{
            background: "#252836",
            borderRadius: 10,
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: "#94a3b8",
              marginBottom: 4,
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexShrink: 0,
            }}
          >
            <TrendingUp size={13} color="#10b981" /> Ventas diarias
          </p>
          <div style={{ flex: 1, position: "relative", minHeight: 80 }}>
            {ventas_diarias.length === 0 ? (
              <p
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                Sin datos
              </p>
            ) : (
              <Line data={lineData} options={lineOpts} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

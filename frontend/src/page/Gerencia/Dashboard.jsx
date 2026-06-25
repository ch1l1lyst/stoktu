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
      const midAngle = (arc.startAngle + arc.endAngle) / 2;
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
    const { ctx, data } = chart;
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

const ACCENT = {
  blue: "#4f8ef7",
  emerald: "#10b981",
  purple: "#9b59f7",
  cyan: "#06b6d4",
  red: "#ef4444",
  amber: "#f59e0b",
};

// ─── MetricCard (con Tailwind) ──────────────────────────────────────────
function MetricCard({ label, value, icon: Icon, color }) {
  const ac = ACCENT[color];
  return (
    <div
      className="bg-[#252836] rounded-lg p-3 flex items-center justify-between shadow-md"
      style={{ borderLeft: `4px solid ${ac}` }}
    >
      <div>
        <p className="text-[11px] font-semibold text-[#94a3b8] uppercase">
          {label}
        </p>
        <p className="text-lg font-semibold text-[#f1f5f9]">{value}</p>
      </div>
      <Icon size={22} color={ac} className="opacity-70 flex-shrink-0" />
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

  const updateTooltipPosition = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setTooltipPosition({ top: rect.bottom + 8, left: rect.left });
    }
  };
  const handleMouseEnter = () => {
    updateTooltipPosition();
    setShowTooltip(true);
  };
  const handleMouseLeave = () => setShowTooltip(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-48px)]">
        <div className="w-10 h-10 rounded-full border-4 border-transparent border-t-[#4f8ef7] animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-48px)]">
        <div className="bg-red-500/10 border border-[#ef4444] rounded-xl p-6 text-center text-[#ef4444]">
          <AlertTriangle size={32} className="mx-auto mb-2" />
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
    labels: ventas_diarias.map((d) =>
      new Date(d.fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
      }),
    ),
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

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#1a1d27] rounded-xl p-3 w-full h-[calc(100vh-48px)] flex flex-col gap-2.5 font-sans overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-1.5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7.5 h-7.5 bg-[#4f5cf7] rounded-lg flex items-center justify-center">
            <Zap size={15} color="#fff" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#e2e8f0] leading-tight">
              Dashboard
            </p>
            <p className="text-[9px] text-[#64748b]">Panel de control</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#252836] border border-white/10 rounded-md px-2.5 py-1 text-xs text-[#94a3b8] flex items-center gap-1">
            <Calendar size={12} />
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent border-none outline-none text-[#94a3b8] text-xs cursor-pointer"
            />
          </div>
          <button
            onClick={fetchData}
            className="bg-[#252836] border border-white/10 rounded-md w-7 h-7 flex items-center justify-center cursor-pointer text-[#94a3b8]"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-5 gap-2.5 flex-shrink-0">
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

        {/* Stock crítico con tooltip */}
        <div
          ref={cardRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative"
        >
          <div
            className="bg-[#252836] rounded-lg p-3 flex items-center justify-between shadow-md cursor-help"
            style={{
              borderLeft: `4px solid ${totalCritico > 0 ? "#ef4444" : "#10b981"}`,
            }}
          >
            <div>
              <p className="text-[11px] font-semibold text-[#94a3b8] uppercase">
                Stock crítico
              </p>
              <p className="text-lg font-semibold text-[#f1f5f9]">
                {totalCritico}
              </p>
            </div>
            <AlertTriangle
              size={22}
              color={totalCritico > 0 ? "#ef4444" : "#10b981"}
              className="opacity-70"
            />
          </div>

          {showTooltip && (
            <div
              className="fixed z-[9999] w-72 max-h-48 overflow-y-auto bg-[#1e293b] rounded-lg p-2.5 shadow-2xl border border-white/10 pointer-events-none"
              style={{
                top: tooltipPosition.top,
                left: Math.min(tooltipPosition.left, window.innerWidth - 300),
              }}
            >
              {productosCriticos.length === 0 ? (
                <p className="text-xs text-[#94a3b8] text-center">
                  ✅ No hay productos críticos
                </p>
              ) : (
                <>
                  <p className="text-[11px] font-semibold text-[#94a3b8] mb-1.5">
                    Productos con alerta:
                  </p>
                  <ul className="list-none p-0 m-0 flex flex-col gap-1">
                    {productosCriticos.slice(0, 4).map((p) => (
                      <li
                        key={p.codigo}
                        className="flex justify-between text-xs text-[#e2e8f0] border-b border-white/5 pb-1"
                      >
                        <span>
                          <span
                            className="inline-block w-2 h-2 rounded-full mr-1.5"
                            style={{
                              background:
                                p.tipo === "Sin stock" ? "#ef4444" : "#f59e0b",
                            }}
                          />
                          {p.nombre}
                        </span>
                        <span className="text-[#94a3b8] text-[10px]">
                          {p.tipo === "Sin stock" ? "0" : p.stock_actual}
                        </span>
                      </li>
                    ))}
                    {productosCriticos.length > 4 && (
                      <li className="text-[11px] text-[#94a3b8] text-center pt-1 border-t border-white/5 mt-0.5">
                        + {productosCriticos.length - 4} productos más
                      </li>
                    )}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-3 gap-2.5 flex-1 min-h-0">
        {/* Pastel */}
        <div className="bg-[#252836] rounded-lg p-2.5 flex flex-col min-h-0 overflow-hidden">
          <p className="text-[10px] font-medium text-[#94a3b8] mb-1 flex items-center gap-1 flex-shrink-0">
            <Package size={13} color="#4f8ef7" /> Categorías
          </p>
          <div className="flex-1 relative min-h-[100px]">
            {grafico_pastel.length === 0 ? (
              <p className="text-[11px] text-[#64748b] text-center mt-2.5">
                Sin datos
              </p>
            ) : (
              <Doughnut data={pieData} options={pieOpts} />
            )}
          </div>
        </div>

        {/* Barras */}
        <div className="bg-[#252836] rounded-lg p-2.5 flex flex-col min-h-0">
          <p className="text-[10px] font-medium text-[#94a3b8] mb-1 flex items-center gap-1 flex-shrink-0">
            <MapPin size={13} color="#f59e0b" /> Sectores
          </p>
          <div className="flex-1 relative min-h-[80px]">
            {sectores_ventas.length === 0 ? (
              <p className="text-[11px] text-[#64748b] text-center mt-2.5">
                Sin datos
              </p>
            ) : (
              <Bar data={barData} options={barOpts} />
            )}
          </div>
        </div>

        {/* Líneas */}
        <div className="bg-[#252836] rounded-lg p-2.5 flex flex-col min-h-0">
          <p className="text-[10px] font-medium text-[#94a3b8] mb-1 flex items-center gap-1 flex-shrink-0">
            <TrendingUp size={13} color="#10b981" /> Ventas diarias
          </p>
          <div className="flex-1 relative min-h-[80px]">
            {ventas_diarias.length === 0 ? (
              <p className="text-[11px] text-[#64748b] text-center mt-2.5">
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

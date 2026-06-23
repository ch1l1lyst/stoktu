import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Save,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../api/axiosConfig";

// ========== ESTILOS REUTILIZABLES (igual que Ventas) ==========
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

// ========== COMPONENTE PRINCIPAL ==========
const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Paginación local
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal de creación/edición
  const [showModal, setShowModal] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    telefono: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);

  // Modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [proveedorAccion, setProveedorAccion] = useState(null);
  const [accionTipo, setAccionTipo] = useState(""); // "desactivar" | "reactivar"

  // ========== API ==========
  const fetchProveedores = async (incluirInactivos = true) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/proveedores", {
        params: { incluir_inactivos: incluirInactivos },
      });
      setProveedores(res.data);
    } catch (err) {
      console.error(err);
      setError("Error al cargar los proveedores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores(true);
  }, []);

  // ========== HANDLERS ==========
  const openCreateModal = () => {
    setEditingProveedor(null);
    setFormData({ id: "", nombre: "", telefono: "", email: "" });
    setShowModal(true);
  };

  const openEditModal = (proveedor) => {
    setEditingProveedor(proveedor);
    setFormData({
      id: proveedor.id,
      nombre: proveedor.nombre,
      telefono: proveedor.telefono || "",
      email: proveedor.email || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.id || !formData.nombre) {
      setErrorMsg("ID y Nombre son obligatorios");
      return;
    }
    setSaving(true);
    try {
      if (editingProveedor) {
        await api.put(`/proveedores/${editingProveedor.id}`, {
          nombre: formData.nombre,
          telefono: formData.telefono,
          email: formData.email,
        });
        setSuccessMsg("Proveedor actualizado correctamente");
      } else {
        await api.post("/proveedores", formData);
        setSuccessMsg("Proveedor creado correctamente");
      }
      setShowModal(false);
      fetchProveedores(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Error al guardar";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const confirmDesactivar = (proveedor) => {
    setProveedorAccion(proveedor);
    setAccionTipo("desactivar");
    setShowConfirmModal(true);
  };

  const confirmReactivar = (proveedor) => {
    setProveedorAccion(proveedor);
    setAccionTipo("reactivar");
    setShowConfirmModal(true);
  };

  const handleToggleEstado = async () => {
    if (!proveedorAccion) return;
    try {
      if (accionTipo === "desactivar") {
        await api.delete(`/proveedores/${proveedorAccion.id}`);
        setSuccessMsg(`Proveedor ${proveedorAccion.nombre} desactivado`);
      } else {
        await api.post(`/proveedores/${proveedorAccion.id}/restore`);
        setSuccessMsg(`Proveedor ${proveedorAccion.nombre} reactivado`);
      }
      setShowConfirmModal(false);
      setProveedorAccion(null);
      fetchProveedores(true);
    } catch (err) {
      setErrorMsg("Error al cambiar el estado del proveedor");
    }
  };

  // ========== FILTRADO Y PAGINACIÓN ==========
  const filteredProveedores = useMemo(() => {
    if (!searchTerm) return proveedores;
    const term = searchTerm.toLowerCase();
    return proveedores.filter(
      (p) =>
        p.id.toLowerCase().includes(term) ||
        p.nombre.toLowerCase().includes(term) ||
        (p.email && p.email.toLowerCase().includes(term)) ||
        (p.telefono && p.telefono.includes(term)),
    );
  }, [proveedores, searchTerm]);

  const totalPages = Math.ceil(filteredProveedores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProveedores = filteredProveedores.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
            <Building2 size={15} color="#fff" />
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
              Proveedores
            </p>
            <p style={{ fontSize: 9, color: "#64748b" }}>
              {proveedores.length} registros
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Búsqueda */}
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
                width: 120,
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

          <button
            onClick={() => fetchProveedores(true)}
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
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Teléfono</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Estado</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProveedores.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: "center", padding: 30, color: "#64748b" }}
                >
                  No se encontraron proveedores
                </td>
              </tr>
            ) : (
              paginatedProveedores.map((prov) => {
                const isActive = prov.deleted_at === null;
                return (
                  <tr
                    key={prov.id}
                    style={{
                      borderBottom: "0.5px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <td style={tdStyle}>
                      <span style={{ fontFamily: "monospace", fontSize: 10 }}>
                        {prov.id}
                      </span>
                    </td>
                    <td style={tdStyle}>{prov.nombre}</td>
                    <td style={tdStyle}>{prov.telefono || "—"}</td>
                    <td style={tdStyle}>{prov.email || "—"}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: 10,
                          fontWeight: 600,
                          background: isActive
                            ? "rgba(16,185,129,0.2)"
                            : "rgba(239,68,68,0.2)",
                          color: isActive ? "#10b981" : "#ef4444",
                        }}
                      >
                        {isActive ? (
                          <>
                            <CheckCircle size={10} /> Activo
                          </>
                        ) : (
                          <>
                            <XCircle size={10} /> Inactivo
                          </>
                        )}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 4,
                        }}
                      >
                        <button
                          onClick={() => openEditModal(prov)}
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "none",
                            borderRadius: 6,
                            padding: "4px 6px",
                            color: "#94a3b8",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Editar"
                        >
                          <Edit size={12} />
                        </button>
                        {isActive ? (
                          <button
                            onClick={() => confirmDesactivar(prov)}
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              border: "none",
                              borderRadius: 6,
                              padding: "4px 6px",
                              color: "#94a3b8",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title="Desactivar"
                          >
                            <Trash2 size={12} />
                          </button>
                        ) : (
                          <button
                            onClick={() => confirmReactivar(prov)}
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              border: "none",
                              borderRadius: 6,
                              padding: "4px 6px",
                              color: "#94a3b8",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title="Reactivar"
                          >
                            <RefreshCw size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN (estilo Ventas) */}
      {totalPages > 1 && (
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
            Mostrando {paginatedProveedores.length} de{" "}
            {filteredProveedores.length}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 4,
                  background: num === currentPage ? "#4f8ef7" : "#252836",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  color: num === currentPage ? "#fff" : "#94a3b8",
                  fontSize: 11,
                  cursor: "pointer",
                  fontWeight: num === currentPage ? 600 : 400,
                }}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: "4px 10px",
                borderRadius: 4,
                background: "#252836",
                border: "0.5px solid rgba(255,255,255,0.1)",
                color: "#94a3b8",
                fontSize: 11,
                cursor: currentPage === totalPages ? "default" : "pointer",
                opacity: currentPage === totalPages ? 0.4 : 1,
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* MODAL CREAR/EDITAR */}
      <AnimatePresence>
        {showModal && (
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
              onClick={() => setShowModal(false)}
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
                maxWidth: 420,
                padding: 20,
                boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#e2e8f0",
                  }}
                >
                  {editingProveedor ? "Editar proveedor" : "Nuevo proveedor"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 10,
                      color: "#94a3b8",
                      marginBottom: 4,
                    }}
                  >
                    ID *
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) =>
                      setFormData({ ...formData, id: e.target.value })
                    }
                    disabled={!!editingProveedor}
                    style={{
                      width: "100%",
                      background: "#252836",
                      border: "0.5px solid rgba(255,255,255,0.1)",
                      borderRadius: 7,
                      padding: "6px 10px",
                      fontSize: 12,
                      color: "#e2e8f0",
                      outline: "none",
                      ...(editingProveedor ? { opacity: 0.5 } : {}),
                    }}
                    placeholder="Ej: PROV-001"
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 10,
                      color: "#94a3b8",
                      marginBottom: 4,
                    }}
                  >
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    style={{
                      width: "100%",
                      background: "#252836",
                      border: "0.5px solid rgba(255,255,255,0.1)",
                      borderRadius: 7,
                      padding: "6px 10px",
                      fontSize: 12,
                      color: "#e2e8f0",
                      outline: "none",
                    }}
                    placeholder="Nombre del proveedor"
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 10,
                      color: "#94a3b8",
                      marginBottom: 4,
                    }}
                  >
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    style={{
                      width: "100%",
                      background: "#252836",
                      border: "0.5px solid rgba(255,255,255,0.1)",
                      borderRadius: 7,
                      padding: "6px 10px",
                      fontSize: 12,
                      color: "#e2e8f0",
                      outline: "none",
                    }}
                    placeholder="+593 99 999 9999"
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 10,
                      color: "#94a3b8",
                      marginBottom: 4,
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    style={{
                      width: "100%",
                      background: "#252836",
                      border: "0.5px solid rgba(255,255,255,0.1)",
                      borderRadius: 7,
                      padding: "6px 10px",
                      fontSize: 12,
                      color: "#e2e8f0",
                      outline: "none",
                    }}
                    placeholder="proveedor@empresa.com"
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 18,
                }}
              >
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    background: "#252836",
                    border: "0.5px solid rgba(255,255,255,0.1)",
                    borderRadius: 7,
                    padding: "6px 12px",
                    fontSize: 12,
                    color: "#94a3b8",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    flex: 1,
                    background: "#4f8ef7",
                    border: "none",
                    borderRadius: 7,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#fff",
                    cursor: saving ? "default" : "pointer",
                    opacity: saving ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  {saving ? (
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        border: "2px solid #fff",
                        borderTopColor: "transparent",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                  ) : (
                    <>
                      <Save size={14} /> Guardar
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL CONFIRMACIÓN */}
      <AnimatePresence>
        {showConfirmModal && proveedorAccion && (
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
              onClick={() => setShowConfirmModal(false)}
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
                maxWidth: 400,
                padding: 20,
                boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background:
                      accionTipo === "desactivar"
                        ? "rgba(239,68,68,0.15)"
                        : "rgba(16,185,129,0.15)",
                    border:
                      accionTipo === "desactivar"
                        ? "0.5px solid rgba(239,68,68,0.3)"
                        : "0.5px solid rgba(16,185,129,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {accionTipo === "desactivar" ? (
                    <AlertTriangle size={18} color="#ef4444" />
                  ) : (
                    <RefreshCw size={18} color="#10b981" />
                  )}
                </div>
                <div>
                  <h4
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#e2e8f0",
                    }}
                  >
                    {accionTipo === "desactivar"
                      ? "Desactivar proveedor"
                      : "Reactivar proveedor"}
                  </h4>
                  <p style={{ fontSize: 11, color: "#94a3b8" }}>
                    Esta acción cambiará el estado
                  </p>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 18 }}>
                {accionTipo === "desactivar"
                  ? `¿Desactivar "${proveedorAccion.nombre}"?`
                  : `¿Reactivar "${proveedorAccion.nombre}"?`}
              </p>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  style={{
                    flex: 1,
                    background: "#252836",
                    border: "0.5px solid rgba(255,255,255,0.1)",
                    borderRadius: 7,
                    padding: "6px 12px",
                    fontSize: 12,
                    color: "#94a3b8",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleToggleEstado}
                  style={{
                    flex: 1,
                    background:
                      accionTipo === "desactivar" ? "#ef4444" : "#10b981",
                    border: "none",
                    borderRadius: 7,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  {accionTipo === "desactivar" ? "Desactivar" : "Reactivar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Proveedores;

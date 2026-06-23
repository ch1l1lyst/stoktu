import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
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
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../../api/axiosConfig";

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
const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Paginación local
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal de creación/edición
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rol: "personal",
  });
  const [saving, setSaving] = useState(false);

  // Modal de cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [passwordData, setPasswordData] = useState({
    password: "",
    password_confirmation: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [usuarioAccion, setUsuarioAccion] = useState(null);
  const [accionTipo, setAccionTipo] = useState(""); // "desactivar" | "reactivar"

  // Mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);

  // ========== API ==========
  const fetchUsuarios = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { incluir_inactivos: true };
      if (filtroRol) params.rol = filtroRol;
      const res = await api.get("/users", { params });
      setUsuarios(res.data);
    } catch (err) {
      console.error(err);
      setError("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroRol]);

  // ========== HANDLERS ==========
  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", rol: "personal" });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      rol: user.rol,
    });
    setShowModal(true);
  };

  const openPasswordModal = (user) => {
    setPasswordUser(user);
    setPasswordData({ password: "", password_confirmation: "" });
    setShowPasswordModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      setErrorMsg("Nombre y email son obligatorios");
      return;
    }
    if (!editingUser && !formData.password) {
      setErrorMsg("Contraseña es obligatoria para nuevos usuarios");
      return;
    }
    setSaving(true);
    try {
      if (editingUser) {
        const payload = {
          name: formData.name,
          email: formData.email,
          rol: formData.rol,
        };
        await api.put(`/users/${editingUser.id}`, payload);
        setSuccessMsg("Usuario actualizado correctamente");
      } else {
        await api.post("/users", formData);
        setSuccessMsg("Usuario creado correctamente");
      }
      setShowModal(false);
      fetchUsuarios();
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

  const handleChangePassword = async () => {
    if (!passwordData.password || passwordData.password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (passwordData.password !== passwordData.password_confirmation) {
      setErrorMsg("Las contraseñas no coinciden");
      return;
    }
    setChangingPassword(true);
    try {
      await api.post(`/users/${passwordUser.id}/password`, {
        password: passwordData.password,
        password_confirmation: passwordData.password_confirmation,
      });
      setSuccessMsg("Contraseña actualizada correctamente");
      setShowPasswordModal(false);
      setPasswordUser(null);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Error al cambiar contraseña";
      setErrorMsg(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const confirmDesactivar = (user) => {
    setUsuarioAccion(user);
    setAccionTipo("desactivar");
    setShowConfirmModal(true);
  };

  const confirmReactivar = (user) => {
    setUsuarioAccion(user);
    setAccionTipo("reactivar");
    setShowConfirmModal(true);
  };

  const handleToggleEstado = async () => {
    if (!usuarioAccion) return;
    try {
      if (accionTipo === "desactivar") {
        await api.delete(`/users/${usuarioAccion.id}`);
        setSuccessMsg(`Usuario ${usuarioAccion.name} desactivado`);
      } else {
        await api.post(`/users/${usuarioAccion.id}/restore`);
        setSuccessMsg(`Usuario ${usuarioAccion.name} reactivado`);
      }
      setShowConfirmModal(false);
      setUsuarioAccion(null);
      fetchUsuarios();
    } catch (err) {
      setErrorMsg("Error al cambiar el estado del usuario");
    }
  };

  // ========== FILTRADO LOCAL ==========
  const filteredUsuarios = useMemo(() => {
    if (!searchTerm) return usuarios;
    const term = searchTerm.toLowerCase();
    return usuarios.filter(
      (u) =>
        u.id.toString().includes(term) ||
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term),
    );
  }, [usuarios, searchTerm]);

  // ========== PAGINACIÓN ==========
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsuarios = filteredUsuarios.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filtroRol]);

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
            <Users size={15} color="#fff" />
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
              Usuarios
            </p>
            <p style={{ fontSize: 9, color: "#64748b" }}>
              {usuarios.length} registros
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Filtro por rol */}
          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
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
            <option value="">Todos los roles</option>
            <option value="personal">Personal</option>
            <option value="gerencia">Gerencia</option>
          </select>

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
            onClick={fetchUsuarios}
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
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Rol</th>
              <th style={thStyle}>Estado</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsuarios.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: "center", padding: 30, color: "#64748b" }}
                >
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              paginatedUsuarios.map((user) => {
                const isActive = user.deleted_at === null;
                return (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: "0.5px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <td style={tdStyle}>
                      <span style={{ fontFamily: "monospace", fontSize: 10 }}>
                        {user.id}
                      </span>
                    </td>
                    <td style={tdStyle}>{user.name}</td>
                    <td style={tdStyle}>{user.email}</td>
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
                          background:
                            user.rol === "gerencia"
                              ? "rgba(79,142,247,0.2)"
                              : "rgba(255,255,255,0.08)",
                          color:
                            user.rol === "gerencia" ? "#4f8ef7" : "#94a3b8",
                        }}
                      >
                        {user.rol === "gerencia"
                          ? "👑 Gerencia"
                          : "👤 Personal"}
                      </span>
                    </td>
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
                          onClick={() => openEditModal(user)}
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
                        <button
                          onClick={() => openPasswordModal(user)}
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
                          title="Cambiar contraseña"
                        >
                          <Key size={12} />
                        </button>
                        {isActive ? (
                          <button
                            onClick={() => confirmDesactivar(user)}
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
                            onClick={() => confirmReactivar(user)}
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

      {/* PAGINACIÓN */}
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
            Mostrando {paginatedUsuarios.length} de {filteredUsuarios.length}
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

      {/* ── MODAL CREAR/EDITAR ── */}
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
                maxWidth: 440,
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
                  {editingUser ? "Editar usuario" : "Nuevo usuario"}
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
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
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
                    placeholder="Nombre completo"
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
                    Email *
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
                    placeholder="usuario@empresa.com"
                  />
                </div>
                {!editingUser && (
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 10,
                        color: "#94a3b8",
                        marginBottom: 4,
                      }}
                    >
                      Contraseña *
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        background: "#252836",
                        border: "0.5px solid rgba(255,255,255,0.1)",
                        borderRadius: 7,
                        paddingRight: 8,
                      }}
                    >
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        style={{
                          flex: 1,
                          background: "transparent",
                          border: "none",
                          padding: "6px 10px",
                          fontSize: 12,
                          color: "#e2e8f0",
                          outline: "none",
                        }}
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#64748b",
                          cursor: "pointer",
                          padding: 4,
                        }}
                      >
                        {showPassword ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 10,
                      color: "#94a3b8",
                      marginBottom: 4,
                    }}
                  >
                    Rol *
                  </label>
                  <select
                    value={formData.rol}
                    onChange={(e) =>
                      setFormData({ ...formData, rol: e.target.value })
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
                      cursor: "pointer",
                    }}
                  >
                    <option value="personal">Personal</option>
                    <option value="gerencia">Gerencia</option>
                  </select>
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

      {/* ── MODAL CAMBIAR CONTRASEÑA ── */}
      <AnimatePresence>
        {showPasswordModal && passwordUser && (
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
              onClick={() => setShowPasswordModal(false)}
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
                  marginBottom: 12,
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#e2e8f0",
                  }}
                >
                  Cambiar contraseña
                </h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
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

              <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>
                Usuario:{" "}
                <span style={{ color: "#e2e8f0" }}>{passwordUser.name}</span>
              </p>

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
                    Nueva contraseña *
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={passwordData.password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        password: e.target.value,
                      })
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
                    placeholder="Mínimo 6 caracteres"
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
                    Confirmar contraseña *
                  </label>
                  <input
                    type="password"
                    value={passwordData.password_confirmation}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        password_confirmation: e.target.value,
                      })
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
                    placeholder="Repite la contraseña"
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
                  onClick={() => setShowPasswordModal(false)}
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
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  style={{
                    flex: 1,
                    background: "#f59e0b",
                    border: "none",
                    borderRadius: 7,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#1a1d27",
                    cursor: changingPassword ? "default" : "pointer",
                    opacity: changingPassword ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  {changingPassword ? (
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        border: "2px solid #1a1d27",
                        borderTopColor: "transparent",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                  ) : (
                    <>
                      <Key size={14} /> Cambiar
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL CONFIRMACIÓN ── */}
      <AnimatePresence>
        {showConfirmModal && usuarioAccion && (
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
                      ? "Desactivar usuario"
                      : "Reactivar usuario"}
                  </h4>
                  <p style={{ fontSize: 11, color: "#94a3b8" }}>
                    Esta acción cambiará el estado
                  </p>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 18 }}>
                {accionTipo === "desactivar"
                  ? `¿Desactivar "${usuarioAccion.name}"?`
                  : `¿Reactivar "${usuarioAccion.name}"?`}
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

export default Usuarios;

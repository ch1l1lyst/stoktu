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
      className="fixed top-20 right-4 z-[9999] bg-[#252836] rounded-xl p-2.5 flex items-center gap-2.5 shadow-2xl max-w-xs text-[#e2e8f0] text-xs backdrop-blur-sm border"
      style={{ borderColor: `${bgColor}40` }}
    >
      <span style={{ color: bgColor }}>{type === "success" ? "✅" : "❌"}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="bg-transparent border-none text-[#64748b] cursor-pointer p-0.5"
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
      <div className="flex items-center justify-between pb-1.5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7.5 h-7.5 bg-[#4f5cf7] rounded-lg flex items-center justify-center">
            <Users size={15} color="#fff" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#e2e8f0] leading-tight">
              Usuarios
            </p>
            <p className="text-[9px] text-[#64748b]">
              {usuarios.length} registros
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtro por rol */}
          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className="bg-[#252836] border border-white/10 rounded-md px-2 py-1 text-xs text-[#94a3b8] outline-none cursor-pointer h-7"
          >
            <option value="">Todos los roles</option>
            <option value="personal">Personal</option>
            <option value="gerencia">Gerencia</option>
          </select>

          {/* Búsqueda */}
          <div className="bg-[#252836] border border-white/10 rounded-md px-2 py-1 flex items-center gap-1">
            <Search size={13} color="#64748b" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-[#e2e8f0] text-xs w-24"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="bg-transparent border-none text-[#64748b] cursor-pointer p-0.5"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <button
            onClick={fetchUsuarios}
            className="bg-[#252836] border border-white/10 rounded-md w-7 h-7 flex items-center justify-center cursor-pointer text-[#94a3b8]"
          >
            <RefreshCw size={13} />
          </button>

          <button
            onClick={openCreateModal}
            className="bg-[#4f8ef7] border-none rounded-md px-3 py-1 text-xs font-medium text-white cursor-pointer flex items-center gap-1 h-7"
          >
            <Plus size={13} /> Nuevo
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full border-collapse text-xs text-[#e2e8f0]">
          <thead className="sticky top-0 bg-[#1a1d27] z-10">
            <tr>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">
                ID
              </th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">
                Nombre
              </th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">
                Email
              </th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">
                Rol
              </th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">
                Estado
              </th>
              <th className="text-center px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsuarios.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-[#64748b]">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              paginatedUsuarios.map((user) => {
                const isActive = user.deleted_at === null;
                return (
                  <tr key={user.id} className="border-b border-white/5">
                    <td className="px-2 py-1.5 align-middle text-[10px] font-mono">
                      {user.id}
                    </td>
                    <td className="px-2 py-1.5 align-middle text-xs">
                      {user.name}
                    </td>
                    <td className="px-2 py-1.5 align-middle text-xs">
                      {user.email}
                    </td>
                    <td className="px-2 py-1.5 align-middle">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          user.rol === "gerencia"
                            ? "bg-blue-500/20 text-[#4f8ef7]"
                            : "bg-white/10 text-[#94a3b8]"
                        }`}
                      >
                        {user.rol === "gerencia"
                          ? "👑 Gerencia"
                          : "👤 Personal"}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 align-middle">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isActive
                            ? "bg-emerald-500/20 text-[#10b981]"
                            : "bg-red-500/20 text-[#ef4444]"
                        }`}
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
                    <td className="px-2 py-1.5 align-middle text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => openEditModal(user)}
                          className="bg-white/5 border-none rounded-md p-1 text-[#94a3b8] cursor-pointer inline-flex items-center justify-center"
                          title="Editar"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => openPasswordModal(user)}
                          className="bg-white/5 border-none rounded-md p-1 text-[#94a3b8] cursor-pointer inline-flex items-center justify-center"
                          title="Cambiar contraseña"
                        >
                          <Key size={12} />
                        </button>
                        {isActive ? (
                          <button
                            onClick={() => confirmDesactivar(user)}
                            className="bg-white/5 border-none rounded-md p-1 text-[#94a3b8] cursor-pointer inline-flex items-center justify-center"
                            title="Desactivar"
                          >
                            <Trash2 size={12} />
                          </button>
                        ) : (
                          <button
                            onClick={() => confirmReactivar(user)}
                            className="bg-white/5 border-none rounded-md p-1 text-[#94a3b8] cursor-pointer inline-flex items-center justify-center"
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
        <div className="flex items-center justify-between pt-1.5 border-t border-white/10 flex-shrink-0">
          <span className="text-[10px] text-[#64748b]">
            Mostrando {paginatedUsuarios.length} de {filteredUsuarios.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1 px-2.5 rounded bg-[#252836] border border-white/10 text-[#94a3b8] text-xs ${
                currentPage === 1
                  ? "opacity-40 cursor-default"
                  : "cursor-pointer"
              }`}
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`px-2.5 py-1 rounded border border-white/10 text-xs font-medium ${
                  num === currentPage
                    ? "bg-[#4f8ef7] text-white"
                    : "bg-[#252836] text-[#94a3b8]"
                } cursor-pointer`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-1 px-2.5 rounded bg-[#252836] border border-white/10 text-[#94a3b8] text-xs ${
                currentPage === totalPages
                  ? "opacity-40 cursor-default"
                  : "cursor-pointer"
              }`}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL CREAR/EDITAR ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              className="relative bg-[#1a1d27] border border-white/10 rounded-xl w-full max-w-md p-5 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-[#e2e8f0]">
                  {editingUser ? "Editar usuario" : "Nuevo usuario"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-transparent border-none text-[#64748b] cursor-pointer p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] text-[#94a3b8] mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-[#252836] border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-[#e2e8f0] outline-none"
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#94a3b8] mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-[#252836] border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-[#e2e8f0] outline-none"
                    placeholder="usuario@empresa.com"
                  />
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-[10px] text-[#94a3b8] mb-1">
                      Contraseña *
                    </label>
                    <div className="flex items-center bg-[#252836] border border-white/10 rounded-md pr-2">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="flex-1 bg-transparent border-none px-2.5 py-1.5 text-xs text-[#e2e8f0] outline-none"
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="bg-transparent border-none text-[#64748b] cursor-pointer p-1"
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
                  <label className="block text-[10px] text-[#94a3b8] mb-1">
                    Rol *
                  </label>
                  <select
                    value={formData.rol}
                    onChange={(e) =>
                      setFormData({ ...formData, rol: e.target.value })
                    }
                    className="w-full bg-[#252836] border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-[#e2e8f0] outline-none cursor-pointer"
                  >
                    <option value="personal">Personal</option>
                    <option value="gerencia">Gerencia</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-[#252836] border border-white/10 rounded-md py-1.5 text-xs text-[#94a3b8] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex-1 bg-[#4f8ef7] border-none rounded-md py-1.5 text-xs font-medium text-white flex items-center justify-center gap-1.5 ${
                    saving ? "opacity-60 cursor-default" : "cursor-pointer"
                  }`}
                >
                  {saving ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowPasswordModal(false)}
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              className="relative bg-[#1a1d27] border border-white/10 rounded-xl w-full max-w-sm p-5 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-[#e2e8f0]">
                  Cambiar contraseña
                </h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="bg-transparent border-none text-[#64748b] cursor-pointer p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-[#94a3b8] mb-3.5">
                Usuario:{" "}
                <span className="text-[#e2e8f0]">{passwordUser.name}</span>
              </p>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] text-[#94a3b8] mb-1">
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
                    className="w-full bg-[#252836] border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-[#e2e8f0] outline-none"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#94a3b8] mb-1">
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
                    className="w-full bg-[#252836] border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-[#e2e8f0] outline-none"
                    placeholder="Repite la contraseña"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 mt-4">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-[#252836] border border-white/10 rounded-md py-1.5 text-xs text-[#94a3b8] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className={`flex-1 bg-[#f59e0b] border-none rounded-md py-1.5 text-xs font-medium text-[#1a1d27] flex items-center justify-center gap-1.5 ${
                    changingPassword
                      ? "opacity-60 cursor-default"
                      : "cursor-pointer"
                  }`}
                >
                  {changingPassword ? (
                    <span className="w-4 h-4 rounded-full border-2 border-[#1a1d27] border-t-transparent animate-spin" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowConfirmModal(false)}
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              className="relative bg-[#1a1d27] border border-white/10 rounded-xl w-full max-w-sm p-5 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                    accionTipo === "desactivar"
                      ? "bg-red-500/15 border-red-500/30"
                      : "bg-emerald-500/15 border-emerald-500/30"
                  }`}
                >
                  {accionTipo === "desactivar" ? (
                    <AlertTriangle size={18} color="#ef4444" />
                  ) : (
                    <RefreshCw size={18} color="#10b981" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#e2e8f0]">
                    {accionTipo === "desactivar"
                      ? "Desactivar usuario"
                      : "Reactivar usuario"}
                  </h4>
                  <p className="text-[11px] text-[#94a3b8]">
                    Esta acción cambiará el estado
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#e2e8f0] mb-4">
                {accionTipo === "desactivar"
                  ? `¿Desactivar "${usuarioAccion.name}"?`
                  : `¿Reactivar "${usuarioAccion.name}"?`}
              </p>

              <div className="flex gap-2.5">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-[#252836] border border-white/10 rounded-md py-1.5 text-xs text-[#94a3b8] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleToggleEstado}
                  className={`flex-1 rounded-md py-1.5 text-xs font-medium text-white cursor-pointer ${
                    accionTipo === "desactivar"
                      ? "bg-[#ef4444]"
                      : "bg-[#10b981]"
                  }`}
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

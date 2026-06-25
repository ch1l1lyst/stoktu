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
const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showModal, setShowModal] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    telefono: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [proveedorAccion, setProveedorAccion] = useState(null);
  const [accionTipo, setAccionTipo] = useState("");

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
            <Building2 size={15} color="#fff" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#e2e8f0] leading-tight">
              Proveedores
            </p>
            <p className="text-[9px] text-[#64748b]">
              {proveedores.length} registros
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Búsqueda */}
          <div className="bg-[#252836] border border-white/10 rounded-md px-2 py-1 flex items-center gap-1">
            <Search size={13} color="#64748b" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-[#e2e8f0] text-xs w-28"
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
            onClick={() => fetchProveedores(true)}
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
                Teléfono
              </th>
              <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">
                Email
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
            {paginatedProveedores.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-[#64748b]">
                  No se encontraron proveedores
                </td>
              </tr>
            ) : (
              paginatedProveedores.map((prov) => {
                const isActive = prov.deleted_at === null;
                return (
                  <tr key={prov.id} className="border-b border-white/5">
                    <td className="px-2 py-1.5 align-middle text-[11px]">
                      <span className="font-mono text-[10px]">{prov.id}</span>
                    </td>
                    <td className="px-2 py-1.5 align-middle text-[11px]">
                      {prov.nombre}
                    </td>
                    <td className="px-2 py-1.5 align-middle text-[11px]">
                      {prov.telefono || "—"}
                    </td>
                    <td className="px-2 py-1.5 align-middle text-[11px]">
                      {prov.email || "—"}
                    </td>
                    <td className="px-2 py-1.5 align-middle text-[11px]">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
                      >
                        {isActive ? (
                          <CheckCircle size={10} />
                        ) : (
                          <XCircle size={10} />
                        )}
                        {isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 align-middle text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => openEditModal(prov)}
                          className="bg-white/5 border-none rounded px-1.5 py-1 text-[#94a3b8] cursor-pointer inline-flex items-center justify-center"
                          title="Editar"
                        >
                          <Edit size={12} />
                        </button>
                        {isActive ? (
                          <button
                            onClick={() => confirmDesactivar(prov)}
                            className="bg-white/5 border-none rounded px-1.5 py-1 text-[#94a3b8] cursor-pointer inline-flex items-center justify-center"
                            title="Desactivar"
                          >
                            <Trash2 size={12} />
                          </button>
                        ) : (
                          <button
                            onClick={() => confirmReactivar(prov)}
                            className="bg-white/5 border-none rounded px-1.5 py-1 text-[#94a3b8] cursor-pointer inline-flex items-center justify-center"
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
            Mostrando {paginatedProveedores.length} de{" "}
            {filteredProveedores.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded bg-[#252836] border border-white/10 text-[#94a3b8] text-[11px] disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`px-2.5 py-1 rounded border border-white/10 text-[11px] ${num === currentPage ? "bg-[#4f8ef7] text-white font-semibold" : "bg-[#252836] text-[#94a3b8]"}`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded bg-[#252836] border border-white/10 text-[#94a3b8] text-[11px] disabled:opacity-40"
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
              className="relative bg-[#1a1d27] border border-white/10 rounded-xl w-full max-w-[420px] p-5 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-[#e2e8f0]">
                  {editingProveedor ? "Editar proveedor" : "Nuevo proveedor"}
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
                    ID *
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) =>
                      setFormData({ ...formData, id: e.target.value })
                    }
                    disabled={!!editingProveedor}
                    className={`w-full bg-[#252836] border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-[#e2e8f0] outline-none ${editingProveedor ? "opacity-50" : ""}`}
                    placeholder="Ej: PROV-001"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#94a3b8] mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="w-full bg-[#252836] border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-[#e2e8f0] outline-none"
                    placeholder="Nombre del proveedor"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#94a3b8] mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    className="w-full bg-[#252836] border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-[#e2e8f0] outline-none"
                    placeholder="+593 99 999 9999"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#94a3b8] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-[#252836] border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-[#e2e8f0] outline-none"
                    placeholder="proveedor@empresa.com"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-[#252836] border border-white/10 rounded-md px-3 py-1.5 text-xs text-[#94a3b8] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex-1 bg-[#4f8ef7] border-none rounded-md px-3 py-1.5 text-xs font-medium text-white cursor-pointer flex items-center justify-center gap-1.5 ${saving ? "opacity-60" : ""}`}
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

      {/* ── MODAL CONFIRMACIÓN ── */}
      <AnimatePresence>
        {showConfirmModal && proveedorAccion && (
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
              className="relative bg-[#1a1d27] border border-white/10 rounded-xl w-full max-w-[400px] p-5 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${accionTipo === "desactivar" ? "bg-red-500/15 border-red-500/30" : "bg-emerald-500/15 border-emerald-500/30"} border`}
                >
                  {accionTipo === "desactivar" ? (
                    <AlertTriangle size={18} color="#ef4444" />
                  ) : (
                    <RefreshCw size={18} color="#10b981" />
                  )}
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-[#e2e8f0]">
                    {accionTipo === "desactivar"
                      ? "Desactivar proveedor"
                      : "Reactivar proveedor"}
                  </h4>
                  <p className="text-[11px] text-[#94a3b8]">
                    Esta acción cambiará el estado
                  </p>
                </div>
              </div>

              <p className="text-[13px] text-[#e2e8f0] mb-4">
                {accionTipo === "desactivar"
                  ? `¿Desactivar "${proveedorAccion.nombre}"?`
                  : `¿Reactivar "${proveedorAccion.nombre}"?`}
              </p>

              <div className="flex gap-2.5">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-[#252836] border border-white/10 rounded-md px-3 py-1.5 text-xs text-[#94a3b8] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleToggleEstado}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium text-white cursor-pointer ${accionTipo === "desactivar" ? "bg-[#ef4444]" : "bg-[#10b981]"}`}
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

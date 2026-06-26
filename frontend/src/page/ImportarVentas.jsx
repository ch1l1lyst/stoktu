import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileUp, AlertCircle, CheckCircle, XCircle, History, RefreshCw, X, AlertTriangle, Trash2 } from "lucide-react";
import api from "../api/axiosConfig";

const ImportarVentas = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importaciones, setImportaciones] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const fileInputRef = useRef(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // Nuevos estados para modales de error y éxito
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchImportaciones();
  }, []);

  const fetchImportaciones = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get("/importaciones");
      setImportaciones(res.data);
    } catch (err) {
      console.error("Error cargando historial", err);
      setImportaciones([]);
      // Mostrar error en modal
      setErrorMessage("Error al cargar el historial de importaciones");
      setShowErrorModal(true);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && (selected.type === "text/csv" || selected.name.endsWith(".txt"))) {
      setFile(selected);
      setPreview(null);
      setImportResult(null);
      setShowDuplicateModal(false);
      setDuplicateInfo(null);
    } else {
      // Reemplazar alert por modal
      setErrorMessage("Solo archivos CSV o TXT");
      setShowErrorModal(true);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleValidate = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("archivo", file);
    try {
      const res = await api.post("/ventas/import/validate", formData);
      setPreview(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Error en validación";
      console.error("Error detallado:", err.response?.data);
      // Mostrar error en modal
      setErrorMessage(msg);
      setShowErrorModal(true);
    } finally {
      setUploading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("archivo", file);
    try {
      const res = await api.post("/ventas/import", formData);
      setImportResult(res.data);
      // Mostrar éxito
      setSuccessMessage(res.data.message || "Importación completada exitosamente");
      setShowSuccessModal(true);
      resetForm();
      fetchImportaciones();
    } catch (err) {
      const errorData = err.response?.data;
      if (err.response?.status === 409 || errorData?.message?.includes("ya fue importado anteriormente") || errorData?.error?.includes("ya fue importado")) {
        setDuplicateInfo({
          mensaje: errorData.message || errorData.error || "Archivo duplicado",
          importacion_id: errorData.importacion_id,
          fecha: errorData.fecha,
        });
        setShowDuplicateModal(true);
      } else {
        const msg = errorData?.message || errorData?.error || "Error en importación";
        console.error("Error detallado:", err.response?.data);
        setErrorMessage(msg);
        setShowErrorModal(true);
      }
    } finally {
      setUploading(false);
    }
  };

  const openDeleteModal = (importacion) => {
    setDeleteTarget(importacion);
    setShowDeleteModal(true);
  };

  const handleDeleteImportacion = async () => {
    if (!deleteTarget) return;

    setDeletingId(deleteTarget.id);
    try {
      const res = await api.delete(`/importaciones/${deleteTarget.id}`);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      // Mostrar éxito al eliminar
      setSuccessMessage("Importación eliminada correctamente");
      setShowSuccessModal(true);
      fetchImportaciones();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "No se pudo eliminar la importación";
      console.error("Error al eliminar importación", err.response?.data);
      setErrorMessage(msg);
      setShowErrorModal(true);
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setImportResult(null);
    setShowDuplicateModal(false);
    setDuplicateInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Componente Modal reutilizable (opcional, pero lo pongo inline para mantener coherencia)

  return (
    <div className="bg-[#1a1d27] rounded-xl p-3 w-full h-[calc(100vh-48px)] flex flex-col gap-3.5 font-sans overflow-hidden text-[#e2e8f0]">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-1.5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7.5 h-7.5 bg-[#4f5cf7] rounded-lg flex items-center justify-center">
            <Upload size={15} color="#fff" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#e2e8f0] leading-tight">Importar Ventas</p>
            <p className="text-[9px] text-[#64748b]">Sube CSV o TXT</p>
          </div>
        </div>
        <button onClick={fetchImportaciones} className="bg-[#252836] border border-white/10 rounded-md w-7 h-7 flex items-center justify-center cursor-pointer text-[#94a3b8]">
          <RefreshCw size={13} />
        </button>
      </div>

      {/* CONTENIDO SCROLLABLE */}
      <div className="flex-1 overflow-auto min-h-0 flex flex-col gap-3">
        {/* Área de subida */}
        <div className="bg-[#252836] rounded-xl border border-white/10 p-5">
          <div className="flex flex-col items-center gap-3">
            <label className="w-full max-w-[400px] h-[120px] border-2 border-dashed border-white/15 rounded-lg cursor-pointer flex flex-col items-center justify-center transition-colors hover:bg-white/5">
              <Upload size={32} color="#64748b" className="mb-1.5" />
              <p className="text-xs text-[#94a3b8]">Seleccionar archivo CSV o TXT</p>
              <input type="file" accept=".csv,.txt" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
            </label>

            {file && (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                <FileUp size={14} color="#94a3b8" />
                <span className="text-xs text-[#e2e8f0]">{file.name}</span>
                <button onClick={resetForm} className="bg-transparent border-none text-[#ef4444] cursor-pointer p-0.5">
                  <X size={14} />
                </button>
              </div>
            )}

            {file && !preview && !importResult && (
              <button
                onClick={handleValidate}
                disabled={uploading}
                className="bg-[#4f8ef7] border-none rounded-md px-4 py-1.5 text-xs font-medium text-white cursor-pointer disabled:opacity-60 transition-colors hover:bg-[#3b7ad9]"
              >
                {uploading ? "Validando..." : "Validar"}
              </button>
            )}
          </div>
        </div>

        {/* Prevalidación */}
        {preview?.dry_run && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#252836] rounded-xl border border-white/10 p-3.5">
            <div className="flex gap-2.5">
              {preview.error_count > 0 ? <AlertCircle size={20} color="#f59e0b" /> : <CheckCircle size={20} color="#10b981" />}
              <div className="flex-1">
                <h3 className="text-[13px] font-semibold text-[#e2e8f0]">Validación</h3>
                <p className="text-xs text-[#94a3b8] my-0.5">{preview.message}</p>
                <div className="flex gap-4 mt-1.5 text-xs">
                  <span className="text-[#10b981]">✅ Válidas: {preview.valid_count}</span>
                  <span className="text-[#ef4444]">❌ Errores: {preview.error_count}</span>
                  <span className="text-[#94a3b8]">📄 Total: {preview.total_filas}</span>
                </div>
              </div>
            </div>

            {preview.errors?.length > 0 && (
              <div className="mt-2.5 max-h-[120px] overflow-auto bg-black/30 p-2 rounded text-[11px] text-red-300">
                {preview.errors.map((err, i) => (
                  <div key={i}>
                    Línea {err.linea}: {err.errores.join(", ")}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2.5 mt-3">
              <button onClick={resetForm} className="bg-[#252836] border border-white/10 rounded px-3.5 py-1 text-[11px] text-[#94a3b8] cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleImport} disabled={uploading} className="bg-[#f59e0b] border-none rounded px-3.5 py-1 text-[11px] font-medium text-[#1a1d27] cursor-pointer disabled:opacity-60">
                {uploading ? "Importando..." : preview.error_count > 0 ? "Importar válidas" : "Importar todas"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Resultado final */}
        {importResult && !importResult.dry_run && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#252836] rounded-xl border border-white/10 p-3.5">
            <div className="flex gap-2.5">
              {importResult.success_count > 0 ? <CheckCircle size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />}
              <div>
                <h3 className="text-[13px] font-semibold text-[#e2e8f0]">Importación completada</h3>
                <p className="text-xs text-[#94a3b8] my-0.5">{importResult.message}</p>
                <button onClick={resetForm} className="mt-1.5 bg-[#4f8ef7] border-none rounded px-3.5 py-1 text-[11px] text-white cursor-pointer">
                  Nueva importación
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Historial */}
        <div className="bg-[#252836] rounded-xl border border-white/10 overflow-hidden flex-shrink-0">
          <div className="px-3.5 py-2 border-b border-white/10 flex items-center gap-2">
            <History size={16} color="#4f8ef7" />
            <h2 className="text-[13px] font-medium text-[#e2e8f0]">Historial de importaciones</h2>
          </div>

          {loadingHistory ? (
            <div className="flex justify-center py-6">
              <div className="w-7 h-7 rounded-full border-2 border-transparent border-t-[#4f8ef7] animate-spin" />
            </div>
          ) : importaciones.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#64748b]">Sin importaciones aún</div>
          ) : (
            <div className="overflow-auto max-h-[260px]">
              <table className="w-full border-collapse text-xs text-[#e2e8f0]">
                <thead className="sticky top-0 bg-[#1a1d27] z-10">
                  <tr>
                    <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">Archivo</th>
                    <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">Usuario</th>
                    <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">Fecha import.</th>
                    <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">Filas</th>
                    <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">Insertadas</th>
                    <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">Errores</th>
                    <th className="text-left px-2 py-1.5 font-semibold text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-white/10 whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {importaciones.map((imp) => (
                    <tr key={imp.id} className="border-b border-white/5">
                      <td className="px-2 py-1.5 align-middle text-[11px]">{imp.nombre_archivo}</td>
                      <td className="px-2 py-1.5 align-middle text-[11px]">{imp.user?.name || "Anónimo"}</td>
                      <td className="px-2 py-1.5 align-middle text-[10px] text-[#94a3b8]">{new Date(imp.fecha_importacion || imp.created_at).toLocaleDateString("es-ES")}</td>
                      <td className="px-2 py-1.5 align-middle text-[11px]">{imp.total_filas}</td>
                      <td className="px-2 py-1.5 align-middle text-[11px] text-[#10b981]">{imp.insertadas}</td>
                      <td className="px-2 py-1.5 align-middle text-[11px] text-[#ef4444]">{imp.errores}</td>
                      <td className="px-2 py-1.5 align-middle">
                        <button
                          onClick={() => openDeleteModal(imp)}
                          disabled={deletingId === imp.id}
                          className="flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-medium text-red-300 disabled:opacity-60"
                        >
                          <Trash2 size={12} />
                          {deletingId === imp.id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODALES */}

      {/* Modal de Eliminar (ya existente) */}
      <AnimatePresence>
        {showDeleteModal && deleteTarget && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteTarget(null);
              }}
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              className="relative bg-[#1a1d27] border border-white/10 rounded-xl w-full max-w-[420px] p-5 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                  <Trash2 size={18} color="#f87171" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-[#e2e8f0]">Eliminar importación</h4>
                  <p className="text-[11px] text-[#94a3b8]">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <p className="text-[13px] text-[#e2e8f0] mb-2">
                ¿Deseas eliminar el archivo <span className="font-semibold text-[#f87171]">{deleteTarget.nombre_archivo}</span>?
              </p>
              <p className="text-[11px] text-[#64748b] mb-4">Se eliminarán también las ventas asociadas a esa importación y se devolverá el stock correspondiente.</p>

              <div className="flex gap-2.5 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteTarget(null);
                  }}
                  className="bg-[#252836] border border-white/10 rounded px-4 py-1.5 text-xs text-[#94a3b8] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteImportacion}
                  disabled={deletingId === deleteTarget?.id}
                  className="bg-red-600 border-none rounded px-4 py-1.5 text-xs font-medium text-white cursor-pointer disabled:opacity-60"
                >
                  {deletingId === deleteTarget?.id ? "Eliminando..." : "Sí, eliminar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Duplicado (ya existente) */}
      <AnimatePresence>
        {showDuplicateModal && duplicateInfo && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => {
                setShowDuplicateModal(false);
                setDuplicateInfo(null);
              }}
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              className="relative bg-[#1a1d27] border border-white/10 rounded-xl w-full max-w-[420px] p-5 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                  <AlertTriangle size={18} color="#f59e0b" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-[#e2e8f0]">Archivo duplicado</h4>
                  <p className="text-[11px] text-[#94a3b8]">Este archivo ya fue importado anteriormente</p>
                </div>
              </div>

              <p className="text-[13px] text-[#e2e8f0] mb-2">{duplicateInfo.mensaje}</p>
              {duplicateInfo.fecha && <p className="text-[11px] text-[#64748b] mb-4">📅 Importado el: {new Date(duplicateInfo.fecha).toLocaleString()}</p>}

              <div className="flex gap-2.5 justify-end">
                <button
                  onClick={() => {
                    setShowDuplicateModal(false);
                    setDuplicateInfo(null);
                  }}
                  className="bg-[#252836] border border-white/10 rounded px-4 py-1.5 text-xs text-[#94a3b8] cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowDuplicateModal(false);
                    setDuplicateInfo(null);
                    resetForm();
                  }}
                  className="bg-[#4f8ef7] border-none rounded px-4 py-1.5 text-xs font-medium text-white cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Error */}
      <AnimatePresence>
        {showErrorModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowErrorModal(false)} />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              className="relative bg-[#1a1d27] border border-white/10 rounded-xl w-full max-w-[420px] p-5 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                  <XCircle size={18} color="#f87171" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-[#e2e8f0]">Error</h4>
                  <p className="text-[11px] text-[#94a3b8]">Ha ocurrido un problema</p>
                </div>
              </div>

              <p className="text-[13px] text-[#e2e8f0] mb-4">{errorMessage}</p>

              <div className="flex justify-end">
                <button onClick={() => setShowErrorModal(false)} className="bg-[#4f8ef7] border-none rounded px-4 py-1.5 text-xs font-medium text-white cursor-pointer">
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Éxito */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)} />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              className="relative bg-[#1a1d27] border border-white/10 rounded-xl w-full max-w-[420px] p-5 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                  <CheckCircle size={18} color="#4ade80" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-[#e2e8f0]">Éxito</h4>
                  <p className="text-[11px] text-[#94a3b8]">Operación completada</p>
                </div>
              </div>

              <p className="text-[13px] text-[#e2e8f0] mb-4">{successMessage}</p>

              <div className="flex justify-end">
                <button onClick={() => setShowSuccessModal(false)} className="bg-[#10b981] border-none rounded px-4 py-1.5 text-xs font-medium text-white cursor-pointer">
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImportarVentas;

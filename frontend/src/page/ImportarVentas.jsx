import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  History,
  RefreshCw,
  X,
  AlertTriangle,
} from "lucide-react";
import api from "../api/axiosConfig";

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

const ImportarVentas = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importaciones, setImportaciones] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const fileInputRef = useRef(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null); // <-- NUEVO ESTADO

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
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (
      selected &&
      (selected.type === "text/csv" || selected.name.endsWith(".txt"))
    ) {
      setFile(selected);
      setPreview(null);
      setImportResult(null);
      setShowDuplicateModal(false);
      setDuplicateInfo(null);
    } else {
      alert("Solo archivos CSV o TXT");
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
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Error en validación";
      alert(msg);
      console.error("Error detallado:", err.response?.data);
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
      resetForm();
      fetchImportaciones();
    } catch (err) {
      const errorData = err.response?.data;
      // Verificar si es error de duplicado (status 409 o mensaje específico)
      if (
        err.response?.status === 409 ||
        errorData?.message?.includes("ya fue importado anteriormente") ||
        errorData?.error?.includes("ya fue importado")
      ) {
        setDuplicateInfo({
          mensaje: errorData.message || errorData.error || "Archivo duplicado",
          importacion_id: errorData.importacion_id,
          fecha: errorData.fecha,
        });
        setShowDuplicateModal(true);
      } else {
        const msg =
          errorData?.message || errorData?.error || "Error en importación";
        alert(msg);
      }
      console.error("Error detallado:", err.response?.data);
    } finally {
      setUploading(false);
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
        gap: 14,
        fontFamily: "system-ui, sans-serif",
        overflow: "hidden",
        color: "#e2e8f0",
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
            <Upload size={15} color="#fff" />
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
              Importar Ventas
            </p>
            <p style={{ fontSize: 9, color: "#64748b" }}>Sube CSV o TXT</p>
          </div>
        </div>

        <button
          onClick={fetchImportaciones}
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

      {/* CONTENIDO SCROLLABLE */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Área de subida */}
        <div
          style={{
            background: "#252836",
            borderRadius: 12,
            border: "0.5px solid rgba(255,255,255,0.08)",
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <label
              style={{
                width: "100%",
                maxWidth: 400,
                height: 120,
                border: "2px dashed rgba(255,255,255,0.15)",
                borderRadius: 10,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
                background: "transparent",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.04)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <Upload size={32} color="#64748b" style={{ marginBottom: 6 }} />
              <p style={{ fontSize: 12, color: "#94a3b8" }}>
                Seleccionar archivo CSV o TXT
              </p>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: "none" }}
              />
            </label>

            {file && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,255,255,0.06)",
                  padding: "4px 12px 4px 8px",
                  borderRadius: 20,
                }}
              >
                <FileUp size={14} color="#94a3b8" />
                <span style={{ fontSize: 12, color: "#e2e8f0" }}>
                  {file.name}
                </span>
                <button
                  onClick={resetForm}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    padding: 2,
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {file && !preview && !importResult && (
              <button
                onClick={handleValidate}
                disabled={uploading}
                style={{
                  background: "#4f8ef7",
                  border: "none",
                  borderRadius: 7,
                  padding: "6px 18px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#fff",
                  cursor: uploading ? "default" : "pointer",
                  opacity: uploading ? 0.6 : 1,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  !uploading && (e.currentTarget.style.background = "#3b7ad9")
                }
                onMouseLeave={(e) =>
                  !uploading && (e.currentTarget.style.background = "#4f8ef7")
                }
              >
                {uploading ? "Validando..." : "Validar"}
              </button>
            )}
          </div>
        </div>

        {/* Prevalidación */}
        {preview?.dry_run && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "#252836",
              borderRadius: 12,
              border: "0.5px solid rgba(255,255,255,0.08)",
              padding: "14px 18px",
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              {preview.error_count > 0 ? (
                <AlertCircle size={20} color="#f59e0b" />
              ) : (
                <CheckCircle size={20} color="#10b981" />
              )}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
                  Validación
                </h3>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0" }}>
                  {preview.message}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    marginTop: 6,
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "#10b981" }}>
                    ✅ Válidas: {preview.valid_count}
                  </span>
                  <span style={{ color: "#ef4444" }}>
                    ❌ Errores: {preview.error_count}
                  </span>
                  <span style={{ color: "#94a3b8" }}>
                    📄 Total: {preview.total_filas}
                  </span>
                </div>
              </div>
            </div>

            {preview.errors?.length > 0 && (
              <div
                style={{
                  marginTop: 10,
                  maxHeight: 120,
                  overflow: "auto",
                  background: "rgba(0,0,0,0.3)",
                  padding: 8,
                  borderRadius: 6,
                  fontSize: 11,
                  color: "#fca5a5",
                }}
              >
                {preview.errors.map((err, i) => (
                  <div key={i}>
                    Línea {err.linea}: {err.errores.join(", ")}
                  </div>
                ))}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 12,
              }}
            >
              <button
                onClick={resetForm}
                style={{
                  background: "#252836",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  padding: "4px 14px",
                  fontSize: 11,
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={uploading}
                style={{
                  background: "#f59e0b",
                  border: "none",
                  borderRadius: 6,
                  padding: "4px 14px",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#1a1d27",
                  cursor: uploading ? "default" : "pointer",
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                {uploading
                  ? "Importando..."
                  : preview.error_count > 0
                    ? "Importar válidas"
                    : "Importar todas"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Resultado final */}
        {importResult && !importResult.dry_run && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "#252836",
              borderRadius: 12,
              border: "0.5px solid rgba(255,255,255,0.08)",
              padding: "14px 18px",
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              {importResult.success_count > 0 ? (
                <CheckCircle size={20} color="#10b981" />
              ) : (
                <XCircle size={20} color="#ef4444" />
              )}
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
                  Importación completada
                </h3>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0" }}>
                  {importResult.message}
                </p>
                <button
                  onClick={resetForm}
                  style={{
                    marginTop: 6,
                    background: "#4f8ef7",
                    border: "none",
                    borderRadius: 6,
                    padding: "4px 14px",
                    fontSize: 11,
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Nueva importación
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Historial */}
        <div
          style={{
            background: "#252836",
            borderRadius: 12,
            border: "0.5px solid rgba(255,255,255,0.08)",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: "8px 14px",
              borderBottom: "0.5px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <History size={16} color="#4f8ef7" />
            <h2 style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>
              Historial de importaciones
            </h2>
          </div>

          {loadingHistory ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "24px 0",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "2px solid transparent",
                  borderTop: "2px solid #4f8ef7",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : importaciones.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0",
                fontSize: 12,
                color: "#64748b",
              }}
            >
              Sin importaciones aún
            </div>
          ) : (
            <div style={{ overflow: "auto", maxHeight: 260 }}>
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
                    zIndex: 2,
                  }}
                >
                  <tr>
                    <th style={thStyle}>Archivo</th>
                    <th style={thStyle}>Usuario</th>
                    <th style={thStyle}>Fecha</th>
                    <th style={thStyle}>Filas</th>
                    <th style={thStyle}>Insertadas</th>
                    <th style={thStyle}>Errores</th>
                  </tr>
                </thead>
                <tbody>
                  {importaciones.map((imp) => (
                    <tr
                      key={imp.id}
                      style={{
                        borderBottom: "0.5px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <td style={tdStyle}>{imp.nombre_archivo}</td>
                      <td style={tdStyle}>{imp.user?.name || "Anónimo"}</td>
                      <td
                        style={{ ...tdStyle, color: "#94a3b8", fontSize: 10 }}
                      >
                        {new Date(imp.created_at).toLocaleString()}
                      </td>
                      <td style={tdStyle}>{imp.total_filas}</td>
                      <td style={{ ...tdStyle, color: "#10b981" }}>
                        {imp.insertadas}
                      </td>
                      <td style={{ ...tdStyle, color: "#ef4444" }}>
                        {imp.errores}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========== MODAL DE DUPLICADO ========== */}
      <AnimatePresence>
        {showDuplicateModal && duplicateInfo && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
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
              onClick={() => {
                setShowDuplicateModal(false);
                setDuplicateInfo(null);
              }}
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
                    background: "rgba(245,158,11,0.15)",
                    border: "0.5px solid rgba(245,158,11,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AlertTriangle size={18} color="#f59e0b" />
                </div>
                <div>
                  <h4
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#e2e8f0",
                    }}
                  >
                    Archivo duplicado
                  </h4>
                  <p style={{ fontSize: 11, color: "#94a3b8" }}>
                    Este archivo ya fue importado anteriormente
                  </p>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "#e2e8f0", marginBottom: 8 }}>
                {duplicateInfo.mensaje}
              </p>
              {duplicateInfo.fecha && (
                <p
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    marginBottom: 16,
                  }}
                >
                  📅 Importado el:{" "}
                  {new Date(duplicateInfo.fecha).toLocaleString()}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => {
                    setShowDuplicateModal(false);
                    setDuplicateInfo(null);
                  }}
                  style={{
                    background: "#252836",
                    border: "0.5px solid rgba(255,255,255,0.1)",
                    borderRadius: 7,
                    padding: "6px 16px",
                    fontSize: 12,
                    color: "#94a3b8",
                    cursor: "pointer",
                  }}
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowDuplicateModal(false);
                    setDuplicateInfo(null);
                    resetForm();
                  }}
                  style={{
                    background: "#4f8ef7",
                    border: "none",
                    borderRadius: 7,
                    padding: "6px 16px",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Entendido
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

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import bgImage from "../assets/bgLogin.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userData = await login(email, password); // Si falla, lanza error
      // Si llegamos aquí, login exitoso
      if (userData.user.rol === "gerencia") {
        navigate("/dashboard");
      } else if (userData.user.rol === "personal") {
        navigate("/inventario");
      }
    } catch (err) {
      // El error viene del backend (401, etc.)
      const mensaje = err.response?.data?.message || "Credenciales incorrectas";
      setError(mensaje);
    } finally {
      setLoading(false); // Esto se ejecuta siempre, con o sin error
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-6 relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay oscuro para reducir el brillo del fondo */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Contenedor principal - tamaño ajustado y responsive */}
      <div className="relative z-10 w-full max-w-5xl rounded-2xl md:rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
        {/* ================= COLUMNA IZQUIERDA (solo en md+) ================= */}
        <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-950/75"></div>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(15,23,42,0.65))",
              clipPath: "polygon(0 0, 58% 0, 85% 100%, 0 100%)",
            }}
          />
          <div className="relative z-10 flex flex-col justify-between w-full px-6 py-8 lg:px-10 lg:py-10">
            <div className="flex-1 flex flex-col justify-center">
              {/* Logo cubo */}
              <div className="flex justify-center mb-5">
                <div className="w-20 h-20 lg:w-24 lg:h-24">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    fill="none"
                  >
                    <defs>
                      <linearGradient id="cube" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#38BDF8" />
                        <stop offset="100%" stopColor="#2563EB" />
                      </linearGradient>
                    </defs>
                    <path d="M50 8 L80 25 L50 42 L20 25 Z" fill="url(#cube)" />
                    <path d="M20 25 L50 42 L50 80 L20 62 Z" fill="#1D4ED8" />
                    <path d="M80 25 L50 42 L50 80 L80 62 Z" fill="#0EA5E9" />
                    <path
                      d="M58 63 L72 50 L72 60 L85 60"
                      stroke="#38BDF8"
                      strokeWidth="6"
                      fill="none"
                    />
                    <path d="M85 60 L78 53" stroke="#38BDF8" strokeWidth="6" />
                    <path d="M85 60 L78 67" stroke="#38BDF8" strokeWidth="6" />
                  </svg>
                </div>
              </div>
              <h1 className="text-center text-4xl lg:text-5xl font-black tracking-tight text-white">
                STOK<span className="text-sky-400">TU</span>
              </h1>
              <p className="text-center text-gray-300 text-lg lg:text-xl mt-3 leading-relaxed">
                Sistema de Inventario
                <br />y Gestión Comercial
              </p>
              <div className="max-w-sm mx-auto w-full mt-6">
                <div className="h-px bg-blue-500/30"></div>
                <div className="text-center py-3 text-lg lg:text-xl">
                  <span className="text-gray-300">Empresa:</span>
                  <span className="text-sky-400 font-semibold ml-3">
                    PRODID
                  </span>
                </div>
                <div className="h-px bg-blue-500/30"></div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="w-9 h-9 rounded-xl border border-sky-500 flex items-center justify-center text-sky-400 font-bold text-base">
                CH
              </div>
            </div>
          </div>
        </div>

        {/* ================= COLUMNA DERECHA (formulario) ================= */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 md:p-8">
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Iniciar Sesión
              </h2>
              <p className="text-gray-500 mt-1">Bienvenido a STOKTU</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-12"
                    placeholder="Ingresa tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-xl transition shadow-md disabled:opacity-70"
              >
                {loading ? "Validando..." : "Ingresar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

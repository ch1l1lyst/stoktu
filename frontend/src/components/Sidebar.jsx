import { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Upload,
  Receipt,
  LogOut,
  History,
  Building2, // ← nuevo
  Users, // ← nuevo
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const Sidebar = ({ isExpanded, setIsExpanded }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Links según rol con íconos específicos
  const getLinks = () => {
    if (user?.rol === "gerencia") {
      return [
        { path: "/dashboard", title: "Dashboard", icon: LayoutDashboard },
        { path: "/inventario", title: "Inventario", icon: Package },
        { path: "/importarventas", title: "Importar Ventas", icon: Upload },
        { path: "/ventas", title: "Ventas", icon: Receipt },
        { path: "/reposiciones", title: "Reposiciones", icon: History },
        { path: "/proveedores", title: "Proveedores", icon: Building2 },
        { path: "/users", title: "Usuarios", icon: Users },
      ];
    } else if (user?.rol === "personal") {
      return [
        { path: "/inventario", title: "Inventario", icon: Package },
        { path: "/importarventas", title: "Importar Ventas", icon: Upload },
        { path: "/proveedores", title: "Proveedores", icon: Building2 },
        { path: "/reposiciones", title: "Reposiciones", icon: History },
      ];
    }
    return [];
  };

  const links = getLinks();
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Animaciones (definidas de forma clara)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };
  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  if (!user) {
    return (
      <div className="fixed left-0 top-0 h-screen w-16 bg-gray-900/70 animate-pulse" />
    );
  }

  return (
    <div className="fixed left-0 top-0 h-screen z-50">
      {/* Botón hamburguesa con animación */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`absolute top-4 z-50 w-10 h-10 bg-gray-900 rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors ${
          isExpanded ? "left-[13rem]" : "left-3"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <span
          className={`w-5 h-0.5 bg-white mb-1 transition-all duration-300 ${isExpanded ? "rotate-45 translate-y-1.5" : ""}`}
        />
        <span
          className={`w-5 h-0.5 bg-white transition-all duration-300 ${isExpanded ? "opacity-0" : ""}`}
        />
        <span
          className={`w-5 h-0.5 bg-white mt-1 transition-all duration-300 ${isExpanded ? "-rotate-45 -translate-y-1.5" : ""}`}
        />
      </motion.button>

      {/* Sidebar principal */}
      <motion.div
        initial={false}
        animate={{ width: isExpanded ? 200 : 64 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-[90vh] mt-15 rounded-r-3xl flex flex-col items-center justify-between py-6 shadow-2xl shadow-black/50 backdrop-blur-sm border-r border-gray-700/30 bg-gray-900/70 overflow-visible"
      >
        {/* Título según rol (solo expandido) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-center mb-4 px-4"
            >
              <h3 className="text-white font-bold text-sm">
                {user.rol === "gerencia" ? "Gerencia" : "Personal"}
              </h3>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menú de navegación */}
        <nav className="flex-1 flex flex-col items-center justify-center w-full">
          <motion.ul
            variants={containerVariants}
            initial="visible"
            animate="visible"
            className="flex flex-col items-center space-y-4 w-full px-2"
          >
            {links.map((link) => (
              <motion.li
                key={link.path}
                variants={itemVariants}
                className="w-full flex justify-center"
              >
                <NavLink
                  to={link.path}
                  className={({ isActive }) => `
                    flex items-center relative group
                    ${isExpanded ? "pl-3 pr-8" : "justify-center px-3"}
                    py-3 rounded-lg transition-all duration-300
                    ${isActive ? "bg-blue-500/20 text-white border border-blue-500/30" : "text-gray-400 hover:bg-white/10 hover:text-white"}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {/* Línea activa (expandido) */}
                      {isActive && isExpanded && (
                        <motion.div
                          layoutId="activeLine"
                          className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"
                          transition={{ duration: 0.2 }}
                        />
                      )}
                      {/* Indicador activo (colapsado) */}
                      {isActive && !isExpanded && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full"
                        />
                      )}
                      {/* Icono con hover scale */}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`transition-all duration-300 ${isActive ? "text-white" : "text-gray-500 group-hover:text-white"} ${isExpanded ? "mr-3" : ""}`}
                      >
                        <link.icon size={20} />
                      </motion.div>
                      {/* Texto del enlace (animado) */}
                      <motion.span
                        initial={false}
                        animate={{
                          opacity: isExpanded ? 1 : 0,
                          maxWidth: isExpanded ? 120 : 0,
                          marginLeft: isExpanded ? 8 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                        className="font-medium text-sm whitespace-nowrap overflow-hidden"
                      >
                        {link.title}
                      </motion.span>
                      {/* Tooltip para modo colapsado */}
                      {!isExpanded && (
                        <div className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-50">
                          {link.title}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              </motion.li>
            ))}
          </motion.ul>
        </nav>

        {/* Perfil y Logout */}
        <div
          className={`flex justify-center items-center transition-all duration-300 ${isExpanded ? "w-full px-5" : "w-auto"}`}
        >
          <div
            className={`flex items-center rounded-2xl transition-all duration-300 ${isExpanded ? "hover:bg-gray-800/50 p-2" : "ml-2"}`}
          >
            {/* Avatar con iniciales */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-gray-600 bg-blue-600 flex items-center justify-center"
            >
              <span className="text-white font-bold">{initials}</span>
            </motion.div>

            {/* Info y logout (solo expandido) */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3 flex items-center space-x-3"
                >
                  <div>
                    <h4 className="text-white text-sm font-medium truncate max-w-[100px]">
                      {user.name}
                    </h4>
                    <p className="text-gray-400 text-xs capitalize">
                      {user.rol}
                    </p>
                  </div>
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "rgba(220, 38, 38, 0.3)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="p-1.5 hover:bg-red-900/30 rounded-lg transition-all duration-300"
                    title="Cerrar sesión"
                  >
                    <LogOut size={16} className="text-red-400" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Sidebar;

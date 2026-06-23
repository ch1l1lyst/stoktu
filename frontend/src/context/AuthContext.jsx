import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Función que se activa sola al cargar la app o recargar página
  const checkAuth = async () => {
    try {
      const res = await api.get("/user"); // 👈 AQUÍ SE USA EL API
      setUser(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null);
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth(); // Se ejecuta cuando el componente AuthProvider se monta
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/login", { email, password }); // 👈 AQUÍ SE USA EL API
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    await api.post("/logout"); // 👈 AQUÍ SE USA EL API
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// src/components/PrivateRoute.jsx
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="p-4">Cargando...</div>; // Mientras verifica
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.rol))
    return <Navigate to="/" replace />;

  return children ? children : <Outlet />;
};

export default PrivateRoute;

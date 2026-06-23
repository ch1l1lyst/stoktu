import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./page/Gerencia/Dashboard";
import ImportarVentas from "./page/ImportarVentas";
import Layout from "./layouts/Layout";
import Login from "./page/Login";
import "./app.css";
import Inventario from "./page/Inventario";
import CarritoProvider from "./context/CarritoContext";
import Reposiciones from "./page/Reposiciones";
import Ventas from "./page/Gerencia/Venta";
import Proveedores from "./page/Proveedores";
import Users from "./page/Gerencia/Users";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CarritoProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Rutas para personal y gerencia */}
            <Route
              element={<PrivateRoute allowedRoles={["personal", "gerencia"]} />}
            >
              <Route element={<Layout />}>
                <Route path="/importarventas" element={<ImportarVentas />} />
                <Route path="/inventario" element={<Inventario />} />
                <Route path="/reposiciones" element={<Reposiciones />} />
                <Route path="/proveedores" element={<Proveedores />} />
              </Route>
            </Route>

            {/* Rutas solo para gerencia */}
            <Route element={<PrivateRoute allowedRoles={["gerencia"]} />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/ventas" element={<Ventas />} />
                <Route path="/users" element={<Users />} />
              </Route>
            </Route>
          </Routes>
        </CarritoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

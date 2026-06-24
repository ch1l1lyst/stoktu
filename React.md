¡Perfecto, bro! Ahora le damos el **mismo tratamiento al frontend** que le dimos al backend: orden jerárquico, explicación de cada paso, para que sepas exactamente qué hacer y por qué.

---

## 🎓 **FRONTEND (REACT + VITE) – CONEXIÓN CON LARAVEL SANCTUM**

Vamos a construir el frontend **paso a paso**, entendiendo el propósito de cada archivo y cómo se conecta todo.

---

### 📌 **PASO 1: CONFIGURAR AXIOS (EL CLIENTE HTTP)**

**Archivo:** `src/api/axiosConfig.js`

Axios es el que va a hablar con Laravel. Lo configuramos una sola vez y lo reutilizamos en toda la app.

**¿Por qué?** Para centralizar la URL base y las opciones de autenticación (`withCredentials`). Así, si cambia la URL de la API, solo lo modificas aquí.

```js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // desde .env
  withCredentials: true, // permite enviar cookies de sesión
});

export default api;
```

---

### 📌 **PASO 2: CREAR EL CONTEXTO DE AUTENTICACIÓN (EL ESTADO GLOBAL DEL USUARIO)**

**Archivo:** `src/contexts/AuthContext.jsx`

Aquí vive toda la lógica de autenticación:

- **Usuario autenticado** (`user`).
- **Login** (envía credenciales al backend y guarda el usuario).
- **Logout** (cierra sesión y limpia el estado).
- **Verificación de sesión** (al cargar la app, pregunta al backend si hay un usuario logueado).

```jsx
import { createContext, useState, useEffect } from "react";
import api from "../api/axiosConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar sesión al iniciar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/user");
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/login", { email, password });
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    await api.post("/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

### 📌 **PASO 3: VERIFICAR SESIÓN AL INICIAR LA APP**

Cuando React arranca, el `AuthProvider` se encarga de consultar al backend si el usuario ya tiene una cookie de sesión. Si la tiene, guarda el usuario; si no, lo deja en `null`.

Esto permite que al hacer **refresh** de la página, el usuario no pierda su sesión.

---

### 📌 **PASO 4: ENVOLVER LA APP CON EL AUTH PROVIDER**

**Archivo:** `src/main.jsx`

Para que cualquier componente pueda acceder al usuario autenticado, envolvemos toda la aplicación con `<AuthProvider>`.

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);
```

---

### 📌 **PASO 5: CREAR EL COMPONENTE DE PROTECCIÓN DE RUTAS (EL GUARDIÁN)**

**Archivo:** `src/components/PrivateRoute.jsx`

Este componente es el **guardaespaldas** de tus rutas privadas. Solo permite el acceso si hay un usuario autenticado. Si no, redirige al login.

```jsx
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default PrivateRoute;
```

**Nota:** Este componente **no hace login, no consulta APIs, solo decide si deja pasar o no**. Es una capa de seguridad en el frontend.

---

### 📌 **PASO 6: CONFIGURAR REACT ROUTER (LAS RUTAS DE LA APP)**

**Archivo:** `src/App.jsx`

Aquí defines todas las rutas de tu aplicación. Las rutas protegidas se envuelven en `<PrivateRoute>`.

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductosPage from "./pages/ProductosPage";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/productos"
          element={
            <PrivateRoute>
              <ProductosPage />
            </PrivateRoute>
          }
        />
        {/* Ruta por defecto: redirige al login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

### 📌 **PASO 7: CREAR LA PÁGINA DE LOGIN**

**Archivo:** `src/pages/LoginPage.jsx`

Captura las credenciales, llama al `login` del contexto y redirige según el rol del usuario (personal o gerencia).

```jsx
import { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await login(email, password);
      // Redirige según rol
      if (userData.user.rol === "gerencia") {
        navigate("/dashboard");
      } else {
        navigate("/productos");
      }
    } catch (error) {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
      />
      <button type="submit">Ingresar</button>
    </form>
  );
};
```

---

### 📌 **PASO 8: CREAR SERVICIOS PARA CONSUMIR LA API**

**Archivo:** `src/services/productoService.js`

Los servicios son funciones que usan Axios para hacer peticiones a endpoints específicos. Así organizas mejor el código.

```js
import api from "../api/axiosConfig";

export const getProductos = async () => {
  const res = await api.get("/productos");
  return res.data;
};

export const createProducto = async (data) => {
  const res = await api.post("/productos", data);
  return res.data;
};
```

---

### 📌 **PASO 9: CREAR PÁGINAS PROTEGIDAS**

**Archivo:** `src/pages/DashboardPage.jsx`, `src/pages/ProductosPage.jsx`

Estas páginas se muestran solo si el usuario está autenticado. Pueden consumir los servicios para mostrar datos.

---

### 📌 **PASO 10: CONTEXTO DEL CARRITO (SI LO NECESITAS)**

Si tu aplicación tiene un carrito de compras que debe estar visible en toda la app, creas un **`CarritoContext`** similar al de autenticación y lo envuelves junto con `AuthProvider` en `main.jsx`.

```jsx
// CarritoContext.jsx
import { createContext, useState } from "react";

export const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);

  const agregar = (producto) => setCarrito([...carrito, producto]);
  const vaciar = () => setCarrito([]);

  return (
    <CarritoContext.Provider value={{ carrito, agregar, vaciar }}>
      {children}
    </CarritoContext.Provider>
  );
};
```

Luego en `main.jsx`:

```jsx
<AuthProvider>
  <CarritoProvider>
    <App />
  </CarritoProvider>
</AuthProvider>
```

Así el carrito está disponible en toda la app.

---

### 📌 **PASO 11: CORS (SI EL FRONTEND ESTÁ EN OTRO PUERTO)**

Si React corre en `http://localhost:5173` y Laravel en `http://localhost:8000`, necesitas configurar CORS en el backend.

**Archivo:** `config/cors.php`

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'supports_credentials' => true, // importante para cookies
'allowed_origins' => ['http://localhost:5173'],
```

**`.env` (backend):**

```env
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
```

---

## 🧠 **RESUMEN DEL ORDEN DE CREACIÓN (FRONTEND)**

| Orden | Archivo              | Responsabilidad                                                     |
| ----- | -------------------- | ------------------------------------------------------------------- |
| 1     | `axiosConfig.js`     | Cliente HTTP centralizado.                                          |
| 2     | `AuthContext.jsx`    | Estado global del usuario (login, logout, sesión).                  |
| 3     | `PrivateRoute.jsx`   | Guardián de rutas: si no estás autenticado, te manda al login.      |
| 4     | `App.jsx`            | Configuración de rutas con React Router.                            |
| 5     | `main.jsx`           | Envolver la app con `AuthProvider` (y `CarritoProvider` si aplica). |
| 6     | `LoginPage.jsx`      | Página de inicio de sesión.                                         |
| 7     | Servicios (opcional) | Organizar peticiones a la API.                                      |
| 8     | Páginas protegidas   | Dashboard, Productos, etc.                                          |

---

## 💬 **FRASE CLAVE**

> **`PrivateRoute`** es el guardia del frontend: si no estás autenticado, no pasas.
> \*\*Ademas cuando lo ponemos a correr en nuestro docker ya no pasa a hacer localhost, pasa a hacer backend
> osea http://backend

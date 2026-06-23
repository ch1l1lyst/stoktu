import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Upload,
  Truck,
  Users,
  LogOut,
} from "lucide-react";

// Menú para GERENCIA (ana@stoktu.com)
export const gerenciaLinks = [
  { id: 1, title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: 2, title: "Productos", icon: Package, path: "/productos" },
  { id: 3, title: "Ventas", icon: ShoppingCart, path: "/ventas" },
  { id: 4, title: "Proveedores", icon: Truck, path: "/proveedores" },
  { id: 5, title: "Usuarios", icon: Users, path: "/usuarios" },
];

// Menú para PERSONAL (carlos@stoktu.com)
export const personalLinks = [
  { id: 1, title: "Productos", icon: Package, path: "/productos" },
  { id: 2, title: "Importar Ventas", icon: Upload, path: "/importar-ventas" },
  { id: 3, title: "Proveedores", icon: Truck, path: "/proveedores" },
];

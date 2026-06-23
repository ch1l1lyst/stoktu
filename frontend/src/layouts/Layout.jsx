import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import CarritoFloatingButton from "../components/CarritoFloatingButton";

const Layout = () => {
  const [isExpanded, setIsExpanded] = useState(false); // Estado elevado

  // Ancho del sidebar según estado: 192px si expandido, 56px si contraído
  const sidebarWidth = isExpanded ? 192 : 56;

  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <main
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <div className="p-6">
          <Outlet />
          <CarritoFloatingButton />
        </div>
      </main>
    </div>
  );
};

export default Layout;

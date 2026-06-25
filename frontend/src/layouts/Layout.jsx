import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import CarritoFloatingButton from "../components/CarritoFloatingButton";

const Layout = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const sidebarWidth = isExpanded ? 192 : 56;

  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <main
        className="transition-all duration-300 ease-in-out p-6"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <Outlet />
        <CarritoFloatingButton />
      </main>
    </div>
  );
};

export default Layout;

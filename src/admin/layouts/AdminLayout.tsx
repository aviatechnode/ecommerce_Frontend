import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";
import { useState } from "react";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* SIDEBAR - Fixed width */}
      <div 
        className="h-full transition-all duration-300 shrink-0"
        style={{ width: sidebarCollapsed ? "5rem" : "16rem" }}
      >
        <AdminSidebar onCollapse={setSidebarCollapsed} />
      </div>

      {/* MAIN CONTENT - Takes remaining space */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP NAV */}
        <AdminNavbar />

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
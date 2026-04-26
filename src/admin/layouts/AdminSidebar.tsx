import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAdminStore } from "../store/adminStore";

export default function AdminSidebar() {
  const location = useLocation();

  const sidebar = useAdminStore((state) => state.sidebar);
  const fetchSidebar = useAdminStore((state) => state.fetchSidebar);
  const loading = useAdminStore((state) => state.loading);

  useEffect(() => {
    fetchSidebar();
  }, [fetchSidebar]);

  return (
    <aside className="w-64 h-screen bg-green-700 text-white p-4 overflow-y-auto border-r border-green-500/30">
      
      <h1 className="text-xl font-bold mb-6">Admin</h1>

      {/* ✅ LOADING */}
      {loading && (
        <p className="text-green-200 text-sm animate-pulse">
          Loading menu...
        </p>
      )}

      {/* ❌ EMPTY STATE */}
      {!loading && sidebar.length === 0 && (
        <p className="text-red-200 text-sm">
          No menu доступ (check permissions or role)
        </p>
      )}

      {/* ✅ SIDEBAR */}
      {!loading &&
        sidebar.map((section) => (
          <div key={section.title} className="mb-6">
            
            <h2 className="text-green-200 text-xs mb-2 uppercase tracking-wide">
              {section.title}
            </h2>

            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block px-3 py-2 rounded transition-colors ${
                      isActive
                        ? "bg-green-900 text-white"
                        : "text-green-100 hover:bg-green-800 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

          </div>
        ))}
    </aside>
  );
}
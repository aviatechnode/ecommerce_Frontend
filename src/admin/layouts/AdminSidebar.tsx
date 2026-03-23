import { adminSidebar } from "../config/adminSidebar";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/AuthStore";

export default function AdminSidebar() {
  const { hasPermission } = useAuthStore();
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white p-4">
      <h1 className="text-xl font-bold mb-6">Admin</h1>

      {adminSidebar.map((section) => {
        const visibleItems = section.items.filter(
          (item) =>
            !item.permission || hasPermission(item.permission)
        );

        if (visibleItems.length === 0) return null;

        return (
          <div key={section.title} className="mb-6">
            <h2 className="text-gray-400 text-sm mb-2 uppercase">
              {section.title}
            </h2>

            <div className="space-y-1">
              {visibleItems.map((item) => {
                const isActive =
                  location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block px-3 py-2 rounded ${
                      isActive
                        ? "bg-blue-600"
                        : "hover:bg-gray-800"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
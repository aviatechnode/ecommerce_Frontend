import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, ChevronRight, LayoutDashboard, Gift, ShoppingBag, Users, Settings, ChevronLeft } from "lucide-react";
import { useGetSidebarQuery } from "../../services/adminApi";

interface AdminSidebarProps {
  onCollapse?: (collapsed: boolean) => void;
}

const getSectionIcon = (title: string) => {
  const icons: Record<string, React.ReactNode> = {
    "Main": <LayoutDashboard size={18} className="text-white/60 group-hover:text-white transition-colors" />,
    "Marketing": <Gift size={18} className="text-white/60 group-hover:text-white transition-colors" />,
    "Catalog": <ShoppingBag size={18} className="text-white/60 group-hover:text-white transition-colors" />,
    "Customers": <Users size={18} className="text-white/60 group-hover:text-white transition-colors" />,
    "Settings": <Settings size={18} className="text-white/60 group-hover:text-white transition-colors" />,
  };
  return icons[title] || <Menu size={18} className="text-white/60 group-hover:text-white transition-colors" />;
};

export default function AdminSidebar({ onCollapse }: AdminSidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: sidebar = [], isLoading, isError, refetch } = useGetSidebarQuery();

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Notify parent when collapse state changes
  useEffect(() => {
    onCollapse?.(collapsed);
  }, [collapsed, onCollapse]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const sidebarContent = (
    <div 
      className={`flex h-full flex-col bg-linear-to-b from-gray-900 to-gray-800 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-r from-green-500 to-green-600">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
              Admin Panel
            </span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-r from-green-500 to-green-600">
            <span className="text-sm font-bold text-white">A</span>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-2 h-4 w-20 rounded bg-white/10"></div>
                <div className="space-y-2">
                  <div className="h-8 rounded bg-white/5"></div>
                  <div className="h-8 rounded bg-white/5"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-lg bg-red-500/10 p-4 text-center">
            <p className="text-sm text-red-300">Failed to load menu</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-xs text-red-300 underline hover:text-red-200"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && sidebar.length === 0 && (
          <div className="rounded-lg bg-yellow-500/10 p-4 text-center">
            <p className="text-sm text-yellow-300">No menu available</p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          sidebar.map((section) => (
            <div key={section.title} className="mb-6">
              {!collapsed && (
                <div className="mb-2 flex items-center gap-2 px-3">
                  <div className="text-white/60">
                    {getSectionIcon(section.title)}
                  </div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    {section.title}
                  </h2>
                </div>
              )}
              {collapsed && (
                <div className="mb-2 flex justify-center">
                  <div className="h-px w-8 bg-white/20"></div>
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    location.pathname.startsWith(`${item.path}/`);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                        ${
                          isActive
                            ? "bg-linear-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-900/30"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        }
                        ${collapsed ? "justify-center" : ""}
                      `}
                      title={collapsed ? item.label : undefined}
                    >
                      {/* Icon placeholder - you can add specific icons per item here */}
                      {!collapsed && (
                        <>
                          <div className="w-5 h-5 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white/70 transition-colors" />
                          </div>
                          <span>{item.label}</span>
                        </>
                      )}
                      {collapsed && (
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white/70 transition-colors" />
                          <span className="text-xs font-bold">
                            {item.label.charAt(0)}
                          </span>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 p-4">
        {!collapsed ? (
          <div className="rounded-lg bg-white/5 p-3 hover:bg-white/10 transition-colors cursor-pointer group">
            <p className="text-xs text-white/50 group-hover:text-white/70 transition-colors">Need help?</p>
            <p className="text-xs text-white/70 group-hover:text-white transition-colors">Contact support</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer group">
              <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">?</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-linear-to-r from-green-600 to-green-700 p-3 text-white shadow-lg lg:hidden hover:scale-105 transition-transform"
      >
        <Menu size={24} />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block h-full">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-50 h-full animate-in slide-in-from-left duration-300">
            <div className="relative h-full">
              {sidebarContent}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-2 top-2 rounded-lg p-2 text-white/70 hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
import { useState, useRef, useEffect } from "react";
import {
  LogOut,
  User,
  ChevronDown,
  Shield,
  Bell,
  Settings,
  HelpCircle,
  Sun,
  Moon,
} from "lucide-react";
import { useAuthStore } from "../../store/AuthStore";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetSidebarQuery } from "../../services/adminApi";

export default function AdminNavbar() {
  const { user, signout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Fetch sidebar data so navbar title always matches
   * the currently active sidebar menu item
   */
  const { data: sidebarData } = useGetSidebarQuery();

  /**
   * Supports both:
   * 1. []
   * 2. { data: [] }
   */
  const sidebar = sidebarData || [];

  /**
   * Normalize current route path
   */
  const currentPath = location.pathname.replace(/\/+$/, "");

  /**
   * Flatten sidebar items
   */
  const allSidebarItems = sidebar.flatMap(
    (section: any) => section?.items || []
  );

  /**
   * IMPORTANT:
   * Sort by path length DESC so the most specific route wins.
   *
   * Example:
   * /admin/products/create
   * should match Products
   * instead of Overview (/admin)
   */
  const currentPageTitle =
    allSidebarItems
      .sort(
        (a: any, b: any) =>
          (b?.path?.length || 0) - (a?.path?.length || 0)
      )
      .find((item: any) => {
        const itemPath = item?.path?.replace(/\/+$/, "");

        return (
          currentPath === itemPath ||
          currentPath.startsWith(`${itemPath}/`)
        );
      })
      ?.label || "Dashboard";

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);

    if (!darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "A";

  const roleLabel =
    user?.isSuperAdmin
      ? "Super Admin"
      : user?.roleName || "Admin";

  /**
   * Generate avatar gradient from user email
   */
  const avatarGradient = user?.email
    ? `linear-gradient(
        135deg,
        #${user.email.charCodeAt(0).toString(16).slice(0, 6)},
        #${
          user.email.charCodeAt(1).toString(16).slice(0, 6) || "22c55e"
        }
      )`
    : "linear-gradient(135deg, #22c55e, #16a34a)";

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* LEFT - Breadcrumb / Page title */}
        <div className="flex items-center gap-3">
          <div className="hidden h-8 w-px bg-gray-200 dark:bg-gray-700 lg:block"></div>

          <div className="hidden lg:block">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Admin Dashboard
            </p>

            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {currentPageTitle} <span>Management</span>
            </p>
          </div>
        </div>

        {/* RIGHT - Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <button className="relative rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
            <Bell size={18} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"></span>
          </button>

          {/* Help */}
          <button className="hidden rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 sm:block">
            <HelpCircle size={18} />
          </button>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

          {/* User Dropdown */}
          <div
            className="relative"
            ref={dropdownRef}
          >
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-gray-100 dark:hover:bg-gray-800 lg:px-3"
            >
              {/* Avatar */}
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-green-950 shadow-md transition-all group-hover:scale-105"
                style={{ background: avatarGradient }}
              >
                {initials}
              </div>

              {/* User Info */}
              <div className="hidden text-left lg:block">
                <p className="text-sm font-semibold leading-tight text-gray-900 dark:text-white">
                  {user?.name || "Admin User"}
                </p>

                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Shield size={10} />
                  <span>{roleLabel}</span>
                </div>
              </div>

              <ChevronDown
                size={16}
                className={`text-gray-500 transition-transform duration-200 dark:text-gray-400 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {open && (
              <div className="absolute right-0 mt-2 w-64 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                  {/* User Info Section */}
                  <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Signed in as
                    </p>

                    <p className="mt-0.5 truncate text-sm font-medium text-gray-900 dark:text-white">
                      {user?.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate("/admin/profile");
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <User
                        size={16}
                        className="text-gray-400"
                      />
                      Profile Settings
                    </button>

                    <button
                      onClick={() => {
                        navigate("/admin/settings");
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <Settings
                        size={16}
                        className="text-gray-400"
                      />
                      System Settings
                    </button>

                    <div className="my-1 h-px bg-gray-100 dark:bg-gray-700"></div>

                    <button
                      onClick={handleLogout}
                      disabled={loading}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                    >
                      <LogOut size={16} />

                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></span>
                          Logging out...
                        </span>
                      ) : (
                        "Logout"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
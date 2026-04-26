import { useState, useRef, useEffect } from "react";
import { LogOut, User, ChevronDown, Shield } from "lucide-react";
import { useAuthStore } from "../../store/AuthStore";
import { useNavigate } from "react-router-dom";

export default function AdminNavbar() {
  const { user, signout } = useAuthStore();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signout();
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials =
    user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "A";

  const roleLabel = user?.isSuperAdmin
    ? "Super Admin"
    : user?.roleName || "Admin";

  return (
    <header className="h-16 bg-linear-to-r from-green-600 to-green-600 text-white flex items-center justify-between px-6 shadow-md border-b border-white/10">
      
      {/* LEFT */}
      <h1 className="text-lg font-semibold tracking-wide">
        Admin Dashboard
      </h1>

      {/* RIGHT */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition px-3 py-2 rounded-xl"
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-white text-green-600 flex items-center justify-center text-sm font-bold">
            {initials}
          </div>

          {/* Name + Role */}
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium leading-none">
              {user?.name || "Admin"}
            </p>

            <div className="flex items-center gap-1 text-xs opacity-80">
              <Shield size={12} />
              <span>{roleLabel}</span>
            </div>
          </div>

          <ChevronDown size={16} className="opacity-80" />
        </button>

        {/* DROPDOWN */}
        {open && (
          <div className="absolute right-0 mt-2 w-52 bg-white text-gray-800 rounded-xl shadow-lg overflow-hidden">
            
            <div className="px-4 py-3 border-b text-xs text-gray-500">
              Signed in as
              <p className="font-medium text-gray-800 truncate">
                {user?.email}
              </p>
            </div>

            <button
              onClick={() => {
                navigate("/admin/profile");
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <User size={16} />
              Profile
            </button>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-50 text-red-600"
            >
              <LogOut size={16} />
              {loading ? "Logging out..." : "Logout"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
import { useState, useRef, useEffect, memo } from "react";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Car,
  Heart,
  ChevronDown,
  Cpu,
  Disc,
  Zap,
  Filter,
} from "lucide-react";
import { useAuthStore } from "../../store/AuthStore";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const catRef = useRef<HTMLDivElement>(null);
  const accRef = useRef<HTMLDivElement>(null);

  const { user, signout } = useAuthStore();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
      if (accRef.current && !accRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const categories = [
    { title: "Engine Parts", icon: <Cpu size={16} />, items: ["Pistons", "Spark Plugs", "Oil Pumps"] },
    { title: "Suspension", icon: <Disc size={16} />, items: ["Shock Absorbers", "Control Arms"] },
    { title: "Electrical", icon: <Zap size={16} />, items: ["Batteries", "Sensors"] },
    { title: "Filters", icon: <Filter size={16} />, items: ["Oil Filters", "Air Filters"] },
  ];

  // 🔥 Dynamic account options (NO UI CHANGE)
  const accountOptions = user
    ? ["Profile", "Orders", "Settings", "Logout"]
    : ["Sign In", "Create Account"];

  // 🔥 Handle click actions
  const handleAccountClick = (opt: string) => {
    if (opt === "Logout") {
      signout();
      setAccountOpen(false);
    }

    if (opt === "Sign In") {
      // TODO: navigate("/login")
      console.log("Go to login");
    }

    if (opt === "Create Account") {
      // TODO: navigate("/signup")
      console.log("Go to signup");
    }
  };

  return (
    <nav className="w-full sticky top-0 z-50">

      {/* ================= TOP BAR ================= */}
      <div className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-16 gap-4">

            {/* LOGO */}
            <div className="flex items-center gap-2 min-w-fit">
              <img
                src="/mograce_auto_parts_cropped.avif"
                width={36}
                height={36}
                className="object-contain"
                alt="logo"
              />
              <span className="font-bold hidden md:block">MOgrace Auto Parts</span>
            </div>

            {/* SEARCH */}
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-xl flex items-center bg-white rounded-xl px-4 py-2 text-black">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search parts..."
                  className="outline-none px-3 w-full text-sm bg-transparent"
                />
              </div>
            </div>

            {/* DESKTOP ACTIONS */}
            <div className="hidden md:flex items-center gap-5 min-w-fit">
              <Car size={20} className="cursor-pointer" />
              <Heart size={20} className="cursor-pointer" />
              
              {/* ACCOUNT */}
              <div className="relative" ref={accRef}>
                <button
                  className="flex items-center gap-1"
                  onClick={() => setAccountOpen(!accountOpen)}
                >
                  <User size={20} />
                  <ChevronDown size={14} />
                </button>

                <div
                  className={`absolute right-0 mt-2 w-40 bg-white text-black shadow-lg rounded-md overflow-hidden transition ${
                    accountOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  {accountOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleAccountClick(opt)}
                      className="px-4 py-2 hover:bg-green-100 cursor-pointer"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <ShoppingCart size={22} className="cursor-pointer" />
            </div>

            {/* MOBILE MENU BUTTON */}
            <div className="md:hidden ml-auto">
              <button onClick={() => setOpen(!open)}>
                {open ? <X /> : <Menu />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ================= SECOND BAR ================= */}
      <div className="bg-green-700 text-white border-t border-green-500/30">
        <div className="max-w-7xl mx-auto px-4 relative" ref={catRef}>
          <div className="flex items-center h-12">

            <button
              onClick={() => setCatOpen(!catOpen)}
              className="flex items-center gap-2 bg-green-800 px-4 py-2 rounded-lg hover:bg-green-900 transition"
            >
              <Menu size={18} />
              <span>Categories</span>
              <ChevronDown size={16} />
            </button>

            <div className="hidden md:flex items-center gap-6 ml-6 text-sm">
              <span className="hover:text-gray-200 cursor-pointer">Deals</span>
              <span className="hover:text-gray-200 cursor-pointer">New</span>
              <span className="hover:text-gray-200 cursor-pointer">Brands</span>
            </div>

          </div>

          {/* MEGA MENU */}
          <div
            className={`absolute left-0 top-12 w-full bg-white text-black shadow-xl transition ${
              catOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
              {categories.map((cat, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 font-semibold mb-2">
                    {cat.icon} {cat.title}
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    {cat.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="hover:text-green-600 cursor-pointer"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div
        className={`md:hidden bg-green-600 text-white transition-max-h duration-300 overflow-hidden ${
          open ? "max-h-125" : "max-h-0"
        }`}
      >
        <div className="px-4 py-3 flex flex-col gap-3">

          <span className="hover:text-gray-200 cursor-pointer">Deals</span>
          <span className="hover:text-gray-200 cursor-pointer">New</span>
          <span className="hover:text-gray-200 cursor-pointer">Brands</span>

          <div className="flex items-center gap-4 pt-2 border-t border-green-500/30">
            <Car size={20} className="cursor-pointer" />
            <Heart size={20} className="cursor-pointer" />

            <div className="relative flex-1" ref={accRef}>
              <button
                className="flex items-center gap-1 w-full justify-between"
                onClick={() => setAccountOpen(!accountOpen)}
              >
                <User size={20} /> Account <ChevronDown size={14} />
              </button>

              {accountOpen && (
                <div className="absolute left-0 top-full mt-1 w-full bg-white text-black shadow-lg rounded-md overflow-hidden z-999">
                  {accountOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleAccountClick(opt)}
                      className="px-4 py-2 hover:bg-green-100 cursor-pointer"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <ShoppingCart size={22} className="cursor-pointer" />
          </div>
        </div>
      </div>

    </nav>
  );
};

export default memo(Navbar);
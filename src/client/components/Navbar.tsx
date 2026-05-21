import { useState, useRef, useEffect, memo, useMemo } from "react";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Car,
  Heart,
  ChevronDown,
  LogOut,
  Package,
  Settings,
  Info,
  Mail,
  LogIn,
  UserPlus,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { transformCategoriesToNavbar } from "../helpers/category-helper";

import {
  useMeQuery,
  useSignoutMutation,
} from "../../services/authApi";

import { useCartCount } from "../../admin/store/useCartCount";
import { useWishlistCount } from "../../admin/store/useWishlistCount";

// ✅ RTK Query hook for categories
import { useGetCategoriesQuery } from "../../services/categoryApi";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const catRef = useRef<HTMLDivElement>(null);
  const accRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const { data: meData } = useMeQuery();
  const user = meData;
  const [signout] = useSignoutMutation();

  // ✅ Replace Redux slice with RTK Query
  const { data: categories = [] } = useGetCategoriesQuery();

  const navbarCategories = useMemo(() => {
    return transformCategoriesToNavbar(categories);
  }, [categories]);

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

  const rawCartCount = useCartCount();
  const rawWishlistCount = useWishlistCount();
  
  // ✅ Ensure default value is zero across board
  const cartCount = rawCartCount ?? 0;
  const wishListCount = rawWishlistCount ?? 0;

  const handleAccountClick = async (action: string) => {
    setAccountOpen(false);
    switch (action) {
      case "signin":
      case "signup":
        navigate("/auth");
        break;
      case "profile":
        navigate("/profile");
        break;
      case "orders":
        navigate("/orders");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "logout":
        await signout().unwrap();
        navigate("/auth");
        break;
    }
  };

  const handleLogoClick = () => navigate("/");
  const handleIconNavigation = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <nav className="w-full sticky top-0 z-50 font-sans">
      {/* ================= MAIN NAVBAR - GLASS MODERN ================= */}
      <div className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* LOGO */}
            <div
              onClick={handleLogoClick}
              className="flex items-center gap-2 cursor-pointer group shrink-0"
            >
              <img
                src="/mograce_auto_parts_cropped.avif"
                width={36}
                height={36}
                alt="logo"
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-bold text-gray-800 hidden md:block tracking-tight">
                MOgrace Auto Parts
              </span>
            </div>

            {/* SEARCH BAR */}
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search for parts, brands, or categories..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* DESKTOP ICONS - Cart moved left next to Wishlist */}
            <div className="hidden md:flex items-center gap-5">
              <Car
                size={20}
                onClick={() => handleIconNavigation("/")}
                className="cursor-pointer text-gray-600 hover:text-emerald-600 transition-all hover:scale-110"
              />

              <div
                className="relative cursor-pointer text-gray-600 hover:text-emerald-600 transition-all hover:scale-110"
                onClick={() => handleIconNavigation("/wishlist")}
              >
                <Heart size={20} />
                {/* ✅ Unified counter color (amber-500) and always visible with default zero */}
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-1.5 rounded-full shadow-md min-w-[18px] text-center leading-tight">
                  {wishListCount}
                </span>
              </div>

              {/* CART - Now placed right after wishlist, before account */}
              <div
                className="relative cursor-pointer text-gray-600 hover:text-emerald-600 transition-all hover:scale-110"
                onClick={() => handleIconNavigation("/cart")}
              >
                <ShoppingCart size={22} />
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-1.5 rounded-full shadow-md min-w-[18px] text-center leading-tight">
                  {cartCount}
                </span>
              </div>

              {/* ACCOUNT DROPDOWN - FIXED Z-INDEX */}
              <div className="relative" ref={accRef}>
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  <User size={20} />
                  <span className="text-sm">
                    {user?.name?.split(" ")[0] ?? "Account"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      accountOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown with higher z-index */}
                <div
                  className={`absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-200 z-[100] ${
                    accountOpen
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}
                >
                  {user ? (
                    <>
                      <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-white border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <button
                        onClick={() => handleAccountClick("profile")}
                        className="w-full px-4 py-2.5 hover:bg-gray-50 flex gap-2 items-center text-sm"
                      >
                        <User size={16} /> Profile
                      </button>
                      <button
                        onClick={() => handleAccountClick("orders")}
                        className="w-full px-4 py-2.5 hover:bg-gray-50 flex gap-2 items-center text-sm"
                      >
                        <Package size={16} /> Orders
                      </button>
                      <button
                        onClick={() => handleAccountClick("settings")}
                        className="w-full px-4 py-2.5 hover:bg-gray-50 flex gap-2 items-center text-sm"
                      >
                        <Settings size={16} /> Settings
                      </button>
                      <button
                        onClick={() => handleAccountClick("logout")}
                        className="w-full px-4 py-2.5 text-rose-600 hover:bg-rose-50 flex gap-2 items-center text-sm border-t border-gray-100"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAccountClick("signin")}
                        className="w-full px-4 py-3 hover:bg-gray-50 flex gap-2 items-center text-sm font-medium"
                      >
                        <LogIn size={16} /> Sign In
                      </button>
                      <button
                        onClick={() => handleAccountClick("signup")}
                        className="w-full px-4 py-3 hover:bg-gray-50 flex gap-2 items-center text-sm font-medium border-t border-gray-100"
                      >
                        <UserPlus size={16} /> Create Account
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* MOBILE BUTTON */}
            <div className="md:hidden">
              <button
                onClick={() => setOpen(!open)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CATEGORIES BAR - LOWER Z-INDEX ================= */}
      <div className="bg-white border-b border-gray-100 shadow-sm relative z-40" ref={catRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-12">
            <button
              onClick={() => setCatOpen(!catOpen)}
              className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors"
            >
              <Menu size={18} />
              <span className="text-sm font-medium">Categories</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  catOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
              <button
                onClick={() => navigate("/about")}
                className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
              >
                <Info size={16} /> About
              </button>
              <button
                onClick={() => navigate("/feedback")}
                className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
              >
                <Mail size={16} /> Contact Us
              </button>
            </div>
            <div className="w-20 invisible md:visible"></div>
          </div>

          {/* MEGA MENU - also ensure it's above other content but below account dropdown if needed */}
          <div
            className={`absolute left-0 top-full w-full bg-white/95 backdrop-blur-md shadow-2xl rounded-b-2xl border-t border-gray-100 transition-all duration-300 origin-top z-50 ${
              catOpen
                ? "opacity-100 scale-y-100"
                : "opacity-0 scale-y-0 pointer-events-none"
            }`}
          >
            <div className="max-w-7xl mx-auto p-6">
              <div className="max-h-[70vh] overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-4 gap-6">
                {navbarCategories.map((cat, i) => (
                  <div key={i} className="group">
                    <div className="flex items-center gap-2 font-semibold mb-2 text-emerald-700 border-b border-emerald-100 pb-1">
                      {cat.icon} {cat.title}
                    </div>
                    <div className="flex flex-col gap-1.5 text-sm text-gray-600">
                      {cat.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="hover:text-emerald-600 cursor-pointer transition-colors w-fit"
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
      </div>

      {/* ================= MODERN MOBILE MENU ================= */}
      <div
        className={`md:hidden fixed top-[calc(4rem+48px)] left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl rounded-b-2xl transition-all duration-300 z-[60] ${
          open ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="p-5 flex flex-col gap-5">
          {/* Icons row - Unified counter colors for both cart and wishlist */}
          <div className="flex justify-around pb-3 border-b border-gray-100">
            <Car
              size={24}
              className="text-gray-600 hover:text-emerald-600 cursor-pointer transition"
              onClick={() => handleIconNavigation("/")}
            />
            {/* Wishlist with badge on mobile - unified amber-500 color */}
            <div className="relative">
              <Heart
                size={24}
                className="text-gray-600 hover:text-emerald-600 cursor-pointer transition"
                onClick={() => handleIconNavigation("/wishlist")}
              />
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-1.5 rounded-full shadow-md min-w-[18px] text-center leading-tight">
                {wishListCount}
              </span>
            </div>
            {/* Cart with badge on mobile - unified amber-500 color */}
            <div className="relative">
              <ShoppingCart
                size={24}
                className="text-gray-600 hover:text-emerald-600 cursor-pointer transition"
                onClick={() => handleIconNavigation("/cart")}
              />
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-1.5 rounded-full shadow-md min-w-[18px] text-center leading-tight">
                {cartCount}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleIconNavigation("/about")}
              className="flex items-center gap-3 py-2 text-gray-700 hover:text-emerald-600 transition"
            >
              <Info size={18} /> About
            </button>
            <button
              onClick={() => handleIconNavigation("/feedback")}
              className="flex items-center gap-3 py-2 text-gray-700 hover:text-emerald-600 transition"
            >
              <Mail size={18} /> Contact Us
            </button>
          </div>

          {/* Account Section */}
          <div className="border-t border-gray-100 pt-4">
            {user ? (
              <>
                <div className="mb-3 pb-2 border-b border-gray-100">
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleAccountClick("profile")}
                    className="flex items-center gap-3 py-2 text-gray-700"
                  >
                    <User size={16} /> Profile
                  </button>
                  <button
                    onClick={() => handleAccountClick("orders")}
                    className="flex items-center gap-3 py-2 text-gray-700"
                  >
                    <Package size={16} /> Orders
                  </button>
                  <button
                    onClick={() => handleAccountClick("settings")}
                    className="flex items-center gap-3 py-2 text-gray-700"
                  >
                    <Settings size={16} /> Settings
                  </button>
                  <button
                    onClick={() => handleAccountClick("logout")}
                    className="flex items-center gap-3 py-2 text-rose-600"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleAccountClick("signin")}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <LogIn size={18} /> Sign In
                </button>
                <button
                  onClick={() => handleAccountClick("signup")}
                  className="w-full border border-emerald-600 text-emerald-600 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all"
                >
                  <UserPlus size={18} /> Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default memo(Navbar);
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
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../admin/store/store";

import { transformCategoriesToNavbar } from "../helpers/category-helper";
import { fetchCategories } from "../../admin/state-management/categorySlice";



import {
  useMeQuery,
  useSignoutMutation,
} from "../../services/authApi";

import { useCartCount } from "../../admin/store/useCartCount";
import { useWishlistCount } from "../../admin/store/useWishlistCount";



const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const catRef = useRef<HTMLDivElement>(null);
  const accRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  /* ================= RTK QUERY AUTH ================= */
  const { data: meData } = useMeQuery();
  const user = meData;

  const [signout] = useSignoutMutation();

  /* ================= CATEGORIES ================= */
  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const navbarCategories = useMemo(() => {
    return transformCategoriesToNavbar(categories);
  }, [categories]);

  /* ================= OUTSIDE CLICK ================= */
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

   /* ================= CART================= */
  const cartCount = useCartCount();
 
  /* ================= WISHLIST================= */
  const wishListCount = useWishlistCount()

  /* ================= HANDLERS ================= */
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
        await signout().unwrap(); // ✅ RTK mutation
        navigate("/auth");
        break;
    }
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleIconNavigation = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <nav className="w-full sticky top-0 z-50">
      {/* ================= TOP BAR ================= */}
      <div className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-16 gap-4">

            {/* LOGO */}
            <div
              onClick={handleLogoClick}
              className="flex items-center gap-2 min-w-fit cursor-pointer"
            >
              <img
                src="/mograce_auto_parts_cropped.avif"
                width={36}
                height={36}
                alt="logo"
              />
              <span className="font-bold hidden md:block">
                MOgrace Auto Parts
              </span>
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

            {/* ICONS */}
            <div className="hidden md:flex items-center gap-5 min-w-fit">

              <Car
                size={20}
                onClick={() => handleIconNavigation("/")}
                className="cursor-pointer"
              />

              <div
                className="relative cursor-pointer"
                onClick={() => handleIconNavigation("/wishlist")}
              >
                <Heart size={20} />
                {wishListCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
                    {wishListCount}
                  </span>
                )}
              </div>

              {/* ACCOUNT */}
              <div className="relative" ref={accRef}>
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-2"
                >
                  <User size={20} />
                  <span className="text-sm hidden md:block">
                    {user?.name?.split(" ")[0] ?? "Account"}
                  </span>
                  <ChevronDown size={14} />
                </button>

                <div
                  className={`absolute right-0 mt-3 w-56 bg-white text-black shadow-xl rounded-lg transition ${
                    accountOpen
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>

                      <button onClick={() => handleAccountClick("profile")} className="w-full px-4 py-2 hover:bg-gray-100 flex gap-2">
                        <User size={16} /> Profile
                      </button>

                      <button onClick={() => handleAccountClick("orders")} className="w-full px-4 py-2 hover:bg-gray-100 flex gap-2">
                        <Package size={16} /> Orders
                      </button>

                      <button onClick={() => handleAccountClick("settings")} className="w-full px-4 py-2 hover:bg-gray-100 flex gap-2">
                        <Settings size={16} /> Settings
                      </button>

                      <button
                        onClick={() => handleAccountClick("logout")}
                        className="w-full px-4 py-2 text-red-600 hover:bg-red-50 flex gap-2"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleAccountClick("signin")} className="w-full px-4 py-2 hover:bg-gray-100">
                        Sign In
                      </button>
                      <button onClick={() => handleAccountClick("signup")} className="w-full px-4 py-2 hover:bg-gray-100">
                        Create Account
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* CART */}
              <div
                className="relative cursor-pointer"
                onClick={() => handleIconNavigation("/cart")}
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
            </div>

            {/* MOBILE MENU */}
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
              className="flex items-center gap-2 bg-green-800 px-4 py-2 rounded-lg hover:bg-green-900"
            >
              <Menu size={18} />
              <span>Categories</span>
              <ChevronDown size={16} />
            </button>
          </div>

          {/* ================= MEGA MENU ================= */}
          <div
            className={`absolute left-0 top-12 w-full bg-white text-black shadow-xl transition ${
              catOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="max-w-7xl mx-auto p-6">
              {/* SCROLLABLE AREA */}
              <div className="max-h-[70vh] overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-4 gap-6">
                {navbarCategories.map((cat, i) => (
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
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div
        className={`md:hidden bg-green-600 text-white transition-max-h duration-300 overflow-hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="px-4 py-3 flex flex-col gap-3">
          <span>Deals</span>
          <span>New</span>
          <span>Brands</span>
        </div>

        <div className="px-4 py-3 border-t border-green-500/30 flex flex-col gap-4">
          {/* Mobile Icons with Navigation */}
          <div className="flex gap-4">
            <Car
              size={20}
              className="cursor-pointer hover:opacity-80"
              onClick={() => handleIconNavigation("/")}
            />
            <Heart
              size={20}
              className="cursor-pointer hover:opacity-80"
              onClick={() => handleIconNavigation("/wishlist")}
            />
            <ShoppingCart
              size={22}
              className="cursor-pointer hover:opacity-80"
              onClick={() => handleIconNavigation("/cart")}
            />
          </div>

          <div className="flex flex-col gap-2">
            {user ? (
              <>
                <p className="text-sm font-semibold">{user.name}</p>
                <button onClick={() => handleAccountClick("profile")}>
                  Profile
                </button>
                <button onClick={() => handleAccountClick("orders")}>
                  Orders
                </button>
                <button onClick={() => handleAccountClick("settings")}>
                  Settings
                </button>
                <button
                  onClick={() => handleAccountClick("logout")}
                  className="text-red-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => handleAccountClick("signin")}>
                  Sign In
                </button>
                <button onClick={() => handleAccountClick("signup")}>
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default memo(Navbar);
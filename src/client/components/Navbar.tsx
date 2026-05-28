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
  Sparkles,
  TrendingUp,
  Truck,
  Clock,
  History,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { transformCategoriesToNavbar } from "../helpers/category-helper";

import {
  useMeQuery,
  useSignoutMutation,
} from "../../services/authApi";

import { useCartCount } from "../../admin/store/useCartCount";
import { useWishlistCount } from "../../admin/store/useWishlistCount";

import { useGetCategoriesQuery } from "../../services/categoryApi";
import { useGetProductsQuery } from "../../services/productApi";

// ============================================================
// SEARCH BAR COMPONENT (with Mobile Responsiveness)
// ============================================================
const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: allProducts = [] } = useGetProductsQuery();

  // Detect mobile screen for responsive adjustments
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("searchHistory");
    if (stored) {
      try {
        setSearchHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse search history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory.slice(0, 10)));
  }, [searchHistory]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    if (!debouncedTerm.trim()) return [];
    const term = debouncedTerm.toLowerCase();
    return allProducts
      .filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          (product.slug && product.slug.toLowerCase().includes(term))
      )
      .slice(0, 8);
  }, [debouncedTerm, allProducts]);

  const addToHistory = (term: string) => {
    if (!term.trim()) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item !== term);
      return [term, ...filtered].slice(0, 10);
    });
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      addToHistory(searchTerm.trim());
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowDropdown(false);
      setSearchTerm("");
    }
  };

  const handleSuggestionClick = (suggestion: string, isProduct = false) => {
    addToHistory(suggestion);
    if (isProduct) {
      const product = allProducts.find((p) => p.name === suggestion);
      if (product) {
        navigate(`/product/${product.id}`);
      } else {
        navigate(`/search?q=${encodeURIComponent(suggestion)}`);
      }
    } else {
      navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    }
    setShowDropdown(false);
    setSearchTerm("");
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-emerald-100 text-emerald-800 rounded-sm px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Responsive placeholder text
  const getPlaceholder = () => {
    if (isMobile) return "Search parts, brands...";
    return "Search for parts, brands, or categories...";
  };

  return (
    <div className="flex-1 max-w-2xl mx-2 md:mx-4 relative">
      <div className="relative group transition-all duration-300">
        <Search
          className={`absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-300 cursor-pointer ${
            showDropdown ? "text-emerald-500" : "text-gray-400"
          }`}
          onClick={handleSearch}
        />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={getPlaceholder()}
          className="w-full bg-gray-50/80 border-2 rounded-2xl py-2.5 pl-8 md:pl-11 pr-3 md:pr-4 text-base md:text-sm outline-none transition-all duration-300
            border-gray-100 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 
            hover:border-gray-200 hover:bg-white/90 backdrop-blur-sm"
          style={{ fontSize: "16px" }} // Prevents zoom on iOS
        />
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 z-50 overflow-hidden transition-all duration-200"
        >
          <div className="max-h-80 md:max-h-96 overflow-y-auto custom-scrollbar">
            {searchTerm.trim() ? (
              suggestions.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={12} /> Products
                  </div>
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSuggestionClick(product.name, true)}
                      className="w-full px-4 py-3 md:py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors group"
                    >
                      <Package size={14} className="text-gray-400 group-hover:text-emerald-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 break-words line-clamp-2">
                        {highlightMatch(product.name, searchTerm)}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  No products found for "{searchTerm}"
                </div>
              )
            ) : (
              <>
                {searchHistory.length > 0 ? (
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Clock size={12} /> Recent Searches
                      </span>
                      <button
                        onClick={clearHistory}
                        className="text-xs text-rose-500 hover:text-rose-600 transition-colors py-1 px-2 rounded-full active:bg-rose-50"
                      >
                        Clear
                      </button>
                    </div>
                    {searchHistory.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(term, false)}
                        className="w-full px-4 py-3 md:py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors group"
                      >
                        <History size={14} className="text-gray-400 group-hover:text-emerald-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 break-words">{term}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    Your recent searches will appear here
                  </div>
                )}
                <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-400 flex items-center justify-between flex-wrap gap-2">
                  <span>🔍 Try "brake pads", "oil filter"</span>
                  <TrendingUp size={12} className="text-amber-500 flex-shrink-0" />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// MAIN NAVBAR COMPONENT
// ============================================================
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const catRef = useRef<HTMLDivElement>(null);
  const accRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const { data: meData, isLoading: userLoading } = useMeQuery();
  const user = meData;
  const [signout] = useSignoutMutation();

  const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery();

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

  const cartCount = rawCartCount ?? 0;
  const wishListCount = rawWishlistCount ?? 0;

  const handleAccountClick = async (action: string) => {
    setAccountOpen(false);
    setOpen(false);
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

  const CategoriesSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i}>
          <div className="flex items-center gap-2 mb-2 pb-1">
            <div className="w-5 h-5 bg-linear-to-r from-gray-200 to-gray-100 rounded-lg"></div>
            <div className="h-5 bg-linear-to-r from-gray-200 to-gray-100 rounded w-24"></div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-20"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-28"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-24"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const UserNameSkeleton = () => (
    <div className="h-4 w-16 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse"></div>
  );

  return (
    <nav className="w-full sticky top-0 z-50 font-sans">
      <div className="bg-white/98 backdrop-blur-xl border-b border-white/20 relative z-50 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-2 md:gap-4">
            <div
              onClick={handleLogoClick}
              className="flex items-center gap-2 md:gap-3 cursor-pointer group shrink-0"
            >
              <div className="relative">
                <img
                  src="/mograce_auto_parts_cropped.avif"
                  width={32}
                  height={32}
                  className="md:w-[38px] md:h-[38px] w-8 h-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                  alt="logo"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-400/20 to-amber-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <span className="font-bold text-gray-800 hidden sm:block tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent text-sm md:text-base">
                MOgrace Auto Parts
              </span>
            </div>

            <SearchBar />

            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-4 px-2 py-1 rounded-full bg-gray-50/50 backdrop-blur-sm">
                <Car
                  size={20}
                  onClick={() => handleIconNavigation("/")}
                  className="cursor-pointer text-gray-600 hover:text-emerald-600 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                />

                <div
                  className="relative cursor-pointer text-gray-600 hover:text-emerald-600 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                  onClick={() => handleIconNavigation("/wishlist")}
                >
                  <Heart size={20} />
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] px-1.5 rounded-full shadow-md min-w-[18px] text-center leading-tight font-medium">
                    {wishListCount}
                  </span>
                </div>

                <div
                  className="relative cursor-pointer text-gray-600 hover:text-emerald-600 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                  onClick={() => handleIconNavigation("/cart")}
                >
                  <ShoppingCart size={22} />
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] px-1.5 rounded-full shadow-md min-w-[18px] text-center leading-tight font-medium">
                    {cartCount}
                  </span>
                </div>
              </div>

              <div className="relative ml-2" ref={accRef}>
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-all duration-300 px-3 py-1.5 rounded-full hover:bg-emerald-50/50"
                >
                  <User size={20} />
                  <span className="text-sm font-medium">
                    {userLoading ? (
                      <UserNameSkeleton />
                    ) : (
                      user?.name?.split(" ")[0] ?? "Account"
                    )}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-all duration-300 ${accountOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <div
                  className={`absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 transition-all duration-300 z-100 ${
                    accountOpen
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-3 pointer-events-none"
                  }`}
                >
                  <div className="max-h-[80vh] overflow-y-auto custom-scrollbar rounded-2xl">
                    {user ? (
                      <>
                        <div className="px-4 py-4 bg-gradient-to-r from-emerald-50/50 to-white/50 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            <Sparkles size={14} className="text-emerald-500" /> Welcome back!
                          </p>
                          <p className="text-base font-bold text-gray-800 mt-1">{user.name}</p>
                          <p className="text-xs text-gray-500 break-all mt-0.5">{user.email}</p>
                        </div>
                        {[
                          { icon: User, label: "Profile", action: "profile" },
                          { icon: Package, label: "Orders", action: "orders" },
                          { icon: Settings, label: "Settings", action: "settings" },
                        ].map((item) => (
                          <button
                            key={item.action}
                            onClick={() => handleAccountClick(item.action)}
                            className="w-full px-4 py-3 hover:bg-gray-50 flex gap-3 items-center text-sm transition-colors group"
                          >
                            <item.icon size={16} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                            <span className="group-hover:text-emerald-600">{item.label}</span>
                          </button>
                        ))}
                        <button
                          onClick={() => handleAccountClick("logout")}
                          className="w-full px-4 py-3 text-rose-600 hover:bg-rose-50 flex gap-3 items-center text-sm border-t border-gray-100 transition-colors group"
                        >
                          <LogOut size={16} className="group-hover:scale-110 transition-transform" /> Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAccountClick("signin")}
                          className="w-full px-4 py-3.5 hover:bg-gray-50 flex gap-3 items-center text-sm font-medium transition-colors group"
                        >
                          <LogIn size={16} className="text-gray-400 group-hover:text-emerald-500" /> Sign In
                        </button>
                        <button
                          onClick={() => handleAccountClick("signup")}
                          className="w-full px-4 py-3.5 hover:bg-gray-50 flex gap-3 items-center text-sm font-medium border-t border-gray-100 transition-colors group"
                        >
                          <UserPlus size={16} className="text-gray-400 group-hover:text-emerald-500" /> Create Account
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setOpen(!open)}
                className="p-2 rounded-full hover:bg-gray-100 transition duration-300"
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-0 relative z-45">
        <div className="absolute inset-0 shadow-[0_12px_20px_-10px_rgba(0,0,0,0.08),0_4px_12px_-6px_rgba(0,0,0,0.02)] pointer-events-none"></div>
      </div>

      <div className="bg-white/98 backdrop-blur-sm relative z-40 border-b border-gray-100/80" ref={catRef}>
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="flex items-center justify-between h-12">
            <button
              onClick={() => setCatOpen(!catOpen)}
              className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-all duration-300 group relative px-2 md:px-3 py-1.5 rounded-full hover:bg-emerald-50/50"
            >
              <Menu size={18} className="transition-transform duration-300 group-hover:rotate-180" />
              <span className="text-xs md:text-sm font-medium">Shop by Category</span>
              <ChevronDown
                size={14}
                className={`transition-all duration-300 ${catOpen ? "rotate-180" : ""}`}
              />
              {catOpen && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full"></div>
              )}
            </button>

            <div className="hidden md:flex items-center gap-1 text-sm text-gray-600">
              <button
                onClick={() => navigate("/about")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-emerald-50/50 hover:text-emerald-600 transition-all duration-300 group"
              >
                <Info size={16} className="transition-transform group-hover:scale-110" />
                <span>About</span>
              </button>
              <button
                onClick={() => navigate("/feedback")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-emerald-50/50 hover:text-emerald-600 transition-all duration-300 group"
              >
                <Mail size={16} className="transition-transform group-hover:scale-110" />
                <span>Contact Us</span>
              </button>
              <button
                onClick={() => navigate("/deals")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 hover:from-amber-100 hover:to-orange-100 transition-all duration-300 group ml-2"
              >
                <TrendingUp size={16} className="transition-transform group-hover:scale-110" />
                <span className="font-medium">Hot Deals</span>
              </button>
              <button
                onClick={() => navigate("/shipping")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-emerald-50/50 hover:text-emerald-600 transition-all duration-300 group"
              >
                <Truck size={16} className="transition-transform group-hover:scale-110" />
                <span>Shipping</span>
              </button>
            </div>
            <div className="w-16 md:w-20 invisible md:visible"></div>
          </div>

          <div
            className={`absolute left-0 top-full w-full bg-white/98 backdrop-blur-xl shadow-2xl rounded-b-2xl border-t border-gray-100/50 transition-all duration-400 origin-top z-50 overflow-hidden ${
              catOpen
                ? "opacity-100 scale-y-100"
                : "opacity-0 scale-y-0 pointer-events-none"
            }`}
          >
            <div className="max-w-7xl mx-auto p-4 md:p-6">
              <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                {categoriesLoading ? (
                  <CategoriesSkeleton />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8">
                    {navbarCategories.map((cat, i) => (
                      <div key={i} className="group">
                        <div className="flex items-center gap-2 font-semibold mb-3 text-gray-700 border-l-3 border-emerald-500 pl-2 hover:border-l-4 transition-all">
                          <span className="text-emerald-600 group-hover:scale-110 transition-transform">{cat.icon}</span>
                          <span className="text-sm md:text-base group-hover:text-emerald-600 transition-colors">{cat.title}</span>
                        </div>
                        <div className="flex flex-col gap-2 text-xs md:text-sm">
                          {cat.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="text-gray-500 hover:text-emerald-600 cursor-pointer transition-all duration-200 w-fit relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-500 after:transition-all hover:after:w-full after:duration-300 pb-0.5"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden fixed top-28 left-0 right-0 bg-white/98 backdrop-blur-xl shadow-2xl rounded-b-2xl transition-all duration-400 z-60 border-b border-gray-100 ${
          open ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar">
          <div className="p-5 flex flex-col gap-5">
            <div className="flex justify-around pb-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white rounded-xl p-2">
              <Car
                size={24}
                className="text-gray-600 hover:text-emerald-600 cursor-pointer transition-all duration-300 hover:scale-110"
                onClick={() => handleIconNavigation("/")}
              />
              <div className="relative">
                <Heart
                  size={24}
                  className="text-gray-600 hover:text-emerald-600 cursor-pointer transition-all duration-300 hover:scale-110"
                  onClick={() => handleIconNavigation("/wishlist")}
                />
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] px-1.5 rounded-full shadow-md min-w-[18px] text-center leading-tight">
                  {wishListCount}
                </span>
              </div>
              <div className="relative">
                <ShoppingCart
                  size={24}
                  className="text-gray-600 hover:text-emerald-600 cursor-pointer transition-all duration-300 hover:scale-110"
                  onClick={() => handleIconNavigation("/cart")}
                />
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] px-1.5 rounded-full shadow-md min-w-[18px] text-center leading-tight">
                  {cartCount}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleIconNavigation("/about")}
                className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:text-emerald-600 transition-all duration-300 rounded-xl hover:bg-emerald-50/50"
              >
                <Info size={18} /> About Us
              </button>
              <button
                onClick={() => handleIconNavigation("/feedback")}
                className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:text-emerald-600 transition-all duration-300 rounded-xl hover:bg-emerald-50/50"
              >
                <Mail size={18} /> Contact Us
              </button>
              <button
                onClick={() => handleIconNavigation("/deals")}
                className="flex items-center gap-3 py-3 px-4 text-amber-700 bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-xl"
              >
                <TrendingUp size={18} /> Hot Deals
              </button>
            </div>

            <div className="border-t border-gray-100 pt-4">
              {userLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-32"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-48"></div>
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-100 rounded-xl"></div>
                    <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-100 rounded-xl"></div>
                  </div>
                </div>
              ) : user ? (
                <>
                  <div className="mb-3 pb-3 border-b border-gray-100 bg-gradient-to-r from-emerald-50/30 to-white rounded-xl p-3">
                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                      <Sparkles size={14} className="text-emerald-500" /> Welcome!
                    </p>
                    <p className="font-medium text-gray-800 mt-1 break-words">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 break-all">{user.email}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {[
                      { icon: User, label: "Profile", action: "profile" },
                      { icon: Package, label: "Orders", action: "orders" },
                      { icon: Settings, label: "Settings", action: "settings" },
                    ].map((item) => (
                      <button
                        key={item.action}
                        onClick={() => handleAccountClick(item.action)}
                        className="flex items-center gap-3 py-2.5 px-3 text-gray-700 hover:text-emerald-600 transition-all duration-300 rounded-lg hover:bg-gray-50"
                      >
                        <item.icon size={16} /> {item.label}
                      </button>
                    ))}
                    <button
                      onClick={() => handleAccountClick("logout")}
                      className="flex items-center gap-3 py-2.5 px-3 text-rose-600 hover:bg-rose-50 transition-all duration-300 rounded-lg mt-2"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleAccountClick("signin")}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    <LogIn size={18} /> Sign In
                  </button>
                  <button
                    onClick={() => handleAccountClick("signup")}
                    className="w-full border-2 border-emerald-600 text-emerald-600 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all duration-300"
                  >
                    <UserPlus size={18} /> Create Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default memo(Navbar);
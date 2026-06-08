import { useState, useRef, useEffect, memo, useMemo } from "react";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
  ChevronDown,
  LogOut,
  Package,
  Settings,
  LogIn,
  UserPlus,
  Sparkles,
  Clock,
  History,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { transformCategoriesToNavbar } from "../helpers/category-helper";

import {
  useMeQuery,
  useSignoutMutation,
  authApi,
} from "../../services/authApi";

import { useCartCount } from "../../admin/store/useCartCount";
import { useWishlistCount } from "../../admin/store/useWishlistCount";

import { useGetCategoriesQuery } from "../../services/categoryApi";
import { useGetProductsQuery } from "../../services/productApi";

// ============================================================
// SEARCH BAR COMPONENT (Enhanced Mobile Responsiveness)
// ============================================================
const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: allProducts = [] } = useGetProductsQuery();

  // Detect screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
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
    localStorage.setItem(
      "searchHistory",
      JSON.stringify(searchHistory.slice(0, 10))
    );
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

  const getProductImage = (product: any): string | null => {
    if (
      product.medias &&
      Array.isArray(product.medias) &&
      product.medias.length > 0
    ) {
      const imageMedia =
        product.medias.find((media: any) => media.type === "IMAGE") ||
        product.medias[0];
      if (imageMedia && imageMedia.url) {
        return imageMedia.url;
      }
    }
    if (product.thumbnail) return product.thumbnail;
    if (product.image) return product.image;
    if (product.images && product.images.length > 0) return product.images[0];
    if (product.featuredImage) return product.featuredImage;
    return null;
  };

  const suggestions = useMemo(() => {
    if (!debouncedTerm.trim()) return [];
    const term = debouncedTerm.toLowerCase();
    return allProducts
      .filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          (product.slug && product.slug.toLowerCase().includes(term))
      )
      .slice(0, isMobile ? 5 : 8);
  }, [debouncedTerm, allProducts, isMobile]);

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
    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-emerald-100 text-emerald-800 rounded-sm px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const getPlaceholder = () => {
    if (isMobile) return "Search parts...";
    if (isTablet) return "Search by part number or name...";
    return "Enter the part number or name to search...";
  };

  return (
    <div className="flex-1 max-w-2xl mx-2 md:mx-4 relative">
      <div className="flex items-stretch">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={getPlaceholder()}
          className="grow bg-emerald-50 border border-gray-200 py-2.5 px-3 text-sm md:text-base outline-none focus:ring-2 focus:ring-emerald-400/50 focus:bg-white transition-all duration-200"
          style={{ fontSize: "16px" }}
        />
        <button
          onClick={handleSearch}
          className="bg-red-700 hover:bg-red-600 cursor-pointer text-white px-3 md:px-4 transition-colors flex items-center justify-center"
          aria-label="Search"
        >
          <Search size={isMobile ? 16 : 18} />
          <span className="hidden sm:inline mx-2">SEARCH</span>
        </button>
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden"
        >
          <div className="max-h-80 md:max-h-96 overflow-y-auto custom-scrollbar">
            {searchTerm.trim() ? (
              suggestions.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={12} /> Products ({suggestions.length})
                  </div>
                  {suggestions.map((product) => {
                    const productImage = getProductImage(product);
                    return (
                      <button
                        key={product.id}
                        onClick={() =>
                          handleSuggestionClick(product.name, true)
                        }
                        className="w-full px-4 py-3 md:py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors duration-150"
                      >
                        <div className="shrink-0 w-10 h-10 md:w-9 md:h-9 bg-gray-100 rounded-lg overflow-hidden">
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.style.display = "none";
                                const nextSibling = img
                                  .nextSibling as HTMLElement;
                                if (nextSibling) {
                                  nextSibling.classList.remove("hidden");
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full flex items-center justify-center ${
                              productImage ? "hidden" : ""
                            }`}
                          >
                            <Package size={16} className="text-gray-400" />
                          </div>
                        </div>
                        <span className="text-sm text-gray-700 wrap-break-word line-clamp-2 flex-1">
                          {highlightMatch(product.name, searchTerm)}
                        </span>
                      </button>
                    );
                  })}
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
                        className="text-xs text-rose-500 hover:text-rose-600 py-1 px-2 rounded-full"
                      >
                        Clear
                      </button>
                    </div>
                    {searchHistory.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(term, false)}
                        className="w-full px-4 py-3 md:py-2.5 text-left hover:bg-gray-50 flex items-center gap-3"
                      >
                        <History
                          size={14}
                          className="text-gray-400 shrink-0"
                        />
                        <span className="text-sm text-gray-700 wrap-break-word">
                          {term}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    Your recent searches will appear here
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// MAIN NAVBAR COMPONENT (Enhanced Responsiveness)
// ============================================================
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [catSidebarOpen, setCatSidebarOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  const accRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: meData, isLoading: userLoading } = useMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const user = meData?.user;
  const [signout] = useSignoutMutation();

  const { data: categories = [], isLoading: categoriesLoading } =
    useGetCategoriesQuery();

  const navbarCategories = useMemo(() => {
    return transformCategoriesToNavbar(categories);
  }, [categories]);

  const isAdmin = useMemo(() => {
    return user?.roleName === "ADMIN" || user?.roleName === "SUPER_ADMIN";
  }, [user]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar when clicking outside (backdrop) - handled by backdrop onClick
  // Also close account dropdown on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
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
      case "admin": {
        const ok = window.confirm("Go to Admin Panel?");
        if (ok) navigate("/admin");
        break;
      }
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
        // Navigate to profile page with settings tab active
        navigate("/profile?tab=settings");
        break;
      case "logout":
        try {
          await signout().unwrap();
          dispatch(authApi.util.resetApiState());
          navigate("/auth");
        } catch (error) {
          console.error("Logout failed:", error);
        }
        break;
      default:
        break;
    }
  };

  const handleLogoClick = () => navigate("/");
  const handleIconNavigation = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const CategoriesSkeleton = () => (
    <div className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i}>
          <div className="flex items-center gap-2 mb-2 pb-1">
            <div className="w-5 h-5 bg-gray-200 rounded-lg"></div>
            <div className="h-5 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-28"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const UserNameSkeleton = () => (
    <div className="h-4 w-16 bg-gray-200 rounded"></div>
  );

  // Take first 8 categories for the navigation bar (or fewer if less exist)
  const topCategories = navbarCategories.slice(0, 8);

  return (
    <nav className={`w-full sticky top-0 z-50 font-sans transition-all duration-300 ${
      isScrolled ? "shadow-lg" : ""
    }`}>
      {/* Top bar with centered logo */}
      <div className="w-full bg-emerald-800 py-3">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex justify-center items-center">
            <div
              onClick={handleLogoClick}
              className="flex items-center gap-3 cursor-pointer"
            >
              <img
                src="/logou.png"
                width={44}
                height={44}
                className="w-11 h-11 md:w-12 md:h-12"
                alt="logo"
              />
              <span className="font-inter font-extrabold text-white text-xl md:text-2xl tracking-tight">
                MOGRACE AUTOPARTS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation bar with search, category button and icons */}
      <div className="bg-emerald-800 relative z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 gap-2 md:gap-4">
            {/* Shop by Category Button - opens left sidebar */}
            <button
              onClick={() => setCatSidebarOpen(true)}
              className="flex items-center gap-2 text-white bg-emerald-900 hover:text-emerald-100 cursor-pointer px-2 md:px-3 py-1.5 transition-all"
            >
              <Menu size={18} />
              <span className="text-xs md:text-sm font-medium">
                Shop by Category
              </span>
              <ChevronDown size={14} />
            </button>

            {/* Search Bar - Hidden on mobile (shown below) */}
            {screenSize !== 'mobile' && (
              <div className="flex-1 flex justify-center">
                <SearchBar />
              </div>
            )}

            {/* Action Icons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Desktop Icons */}
              {screenSize === 'desktop' && (
                <div className="flex items-center gap-3">
                  <div
                    className="relative cursor-pointer text-white hover:text-emerald-100 transition-colors p-1"
                    onClick={() => handleIconNavigation("/wishlist")}
                  >
                    <Heart size={20} />
                    {wishListCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] px-1.5 rounded-full shadow-md min-w-4.5 text-center leading-tight font-medium">
                        {wishListCount > 99 ? '99+' : wishListCount}
                      </span>
                    )}
                  </div>

                  <div
                    className="relative cursor-pointer text-white hover:text-emerald-100 transition-colors p-1"
                    onClick={() => handleIconNavigation("/cart")}
                  >
                    <ShoppingCart size={22} />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] px-1.5 rounded-full shadow-md min-w-4.5 text-center leading-tight font-medium">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Account Dropdown - Tablet and Desktop */}
              {screenSize !== 'mobile' && (
                <div className="relative ml-2" ref={accRef}>
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="flex items-center gap-2 text-white bg-emerald-900 hover:text-emerald-100 cursor-pointer px-2 md:px-3 py-1.5 transition-all"
                  >
                    <User size={20} />
                    {screenSize === 'desktop' && (
                      <>
                        <span className="text-sm font-medium">
                          {userLoading ? (
                            <UserNameSkeleton />
                          ) : (
                            user?.name?.split(" ")[0] ?? "Account"
                          )}
                        </span>
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 ${
                            accountOpen ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}
                  </button>

                  <div
                    className={`absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl ring-1 ring-black/5 z-50 transition-all duration-200 origin-top-right ${
                      accountOpen
                        ? "opacity-100 visible scale-100"
                        : "opacity-0 invisible scale-95"
                    }`}
                  >
                    <div className="max-h-[80vh] overflow-y-auto custom-scrollbar rounded-lg divide-y divide-gray-100">
                      {user ? (
                        <>
                          <div className="px-4 py-4 bg-gray-50/50">
                            <p className="text-sm font-semibold text-gray-800">
                              Welcome back!
                            </p>
                            <p className="text-base font-bold text-gray-800 mt-1">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 break-all mt-0.5">
                              {user.email}
                            </p>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => handleAccountClick("admin")}
                              className="w-full px-4 py-3 hover:bg-emerald-50 flex gap-3 items-center text-sm font-medium text-emerald-700 transition-colors"
                            >
                              <Shield size={16} className="text-emerald-600" />
                              Admin Panel
                            </button>
                          )}
                          {[
                            { icon: User, label: "Profile", action: "profile" },
                            {
                              icon: Settings,
                              label: "Settings",
                              action: "settings",
                            },
                          ].map((item) => (
                            <button
                              key={item.action}
                              onClick={() => handleAccountClick(item.action)}
                              className="w-full px-4 py-3 hover:bg-gray-50 flex gap-3 items-center text-sm transition-colors"
                            >
                              <item.icon size={16} className="text-gray-400" />
                              <span>{item.label}</span>
                            </button>
                          ))}
                          <button
                            onClick={() => handleAccountClick("logout")}
                            className="w-full px-4 py-3 text-rose-600 hover:bg-rose-50 flex gap-3 items-center text-sm transition-colors"
                          >
                            <LogOut size={16} /> Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAccountClick("signin")}
                            className="w-full px-4 py-3.5 hover:bg-gray-50 flex gap-3 items-center text-sm font-medium transition-colors"
                          >
                            <LogIn size={16} className="text-gray-400" /> Sign In
                          </button>
                          <button
                            onClick={() => handleAccountClick("signup")}
                            className="w-full px-4 py-3.5 hover:bg-gray-50 flex gap-3 items-center text-sm font-medium transition-colors"
                          >
                            <UserPlus size={16} className="text-gray-400" /> Create
                            Account
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Menu Button */}
              {screenSize === 'mobile' && (
                <button
                  onClick={() => setOpen(!open)}
                  className="p-2 rounded-full hover:bg-emerald-700 transition-colors text-white"
                  aria-label={open ? "Close menu" : "Open menu"}
                >
                  {open ? <X size={22} /> : <Menu size={22} />}
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          {screenSize === 'mobile' && !open && (
            <div className="pb-3 pt-1">
              <SearchBar />
            </div>
          )}
        </div>
      </div>

      {/* Category Navigation Bar - shows top 8 categories with icons (hidden on mobile) */}
      {screenSize !== 'mobile' && topCategories.length > 0 && (
        <div className="bg-emerald-800 border-t border-emerald-700 relative z-30">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between gap-4 h-14 text-white">
              {topCategories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => navigate(`/category/${encodeURIComponent(category.title)}`)}
                  className="flex items-center gap-3 px-3 py-2 flex-1 justify-center transition-colors"
                >
                  <span className="[&>svg]:w-5 [&>svg]:h-5">
                    {category.icon}
                  </span>
                  <span className="text-[1] font-medium truncate">
                    {category.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Sidebar - slides from left, full height */}
      <div
        className={`fixed inset-0 z-100 transition-all duration-300 ${
          catSidebarOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            catSidebarOpen ? "opacity-50" : "opacity-0"
          }`}
          onClick={() => setCatSidebarOpen(false)}
        />
        
        {/* Sidebar */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl transition-transform duration-300 transform ${
            catSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } flex flex-col`}
        >
          {/* Sidebar Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-emerald-800">
            <div className="flex items-center gap-2">
              <img
                src="/logou.png"
                width={32}
                height={32}
                className="w-8 h-8"
                alt="logo"
              />
              <span className="font-semibold text-white text-sm">
                Shop by Category
              </span>
            </div>
            <button
              onClick={() => setCatSidebarOpen(false)}
              className="p-2 rounded-full hover:bg-emerald-700 transition-colors text-white"
            >
              <X size={22} />
            </button>
          </div>

          {/* Sidebar Content - scrollable categories */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {categoriesLoading ? (
              <CategoriesSkeleton />
            ) : (
              <div className="space-y-6">
                {navbarCategories.map((cat, i) => (
                  <div key={i} className="group">
                    <div className="flex items-center gap-2 font-semibold mb-3 text-gray-700">
                      <span className="text-emerald-600">{cat.icon}</span>
                      <span className="text-sm md:text-base">{cat.title}</span>
                    </div>
                    <div className="flex flex-col gap-2 ml-6 text-sm text-gray-600">
                      {cat.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="hover:text-emerald-600 cursor-pointer transition-colors"
                          onClick={() => {
                            setCatSidebarOpen(false);
                            navigate(`/category/${encodeURIComponent(item)}`);
                          }}
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

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          open ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            open ? "opacity-50" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        
        {/* Drawer */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl transition-transform duration-300 transform ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-emerald-800">
              <div className="flex items-center gap-2">
                <img
                  src="/logou.png"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                  alt="logo"
                />
                <span className="font-semibold text-white text-sm">
                  MOgrace Autoparts
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-emerald-700 transition-colors text-white"
              >
                <X size={22} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-5 flex flex-col gap-5">
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 pb-4 border-b border-gray-100">
                  <div
                    className="relative bg-gray-50 rounded-xl p-3 text-center cursor-pointer hover:bg-emerald-50 transition-colors"
                    onClick={() => handleIconNavigation("/wishlist")}
                  >
                    <Heart size={20} className="mx-auto text-gray-600" />
                    <span className="text-xs mt-1 block">Wishlist</span>
                    {wishListCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] px-1.5 rounded-full">
                        {wishListCount}
                      </span>
                    )}
                  </div>
                  <div
                    className="relative bg-gray-50 rounded-xl p-3 text-center cursor-pointer hover:bg-emerald-50 transition-colors"
                    onClick={() => handleIconNavigation("/cart")}
                  >
                    <ShoppingCart size={20} className="mx-auto text-gray-600" />
                    <span className="text-xs mt-1 block">Cart</span>
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] px-1.5 rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Category Links are intentionally omitted on mobile to comply with requirement */}
                {/* "Shop by Category" button remains for accessing full category sidebar */}
                <div className="pt-2 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setOpen(false);
                      setCatSidebarOpen(true);
                    }}
                    className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:text-emerald-600 rounded-xl hover:bg-gray-50 transition-colors w-full"
                  >
                    <Menu size={18} /> All Categories
                  </button>
                </div>

                {/* Account Section */}
                <div className="pt-4 border-t border-gray-100">
                  {userLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                      <div className="flex flex-col gap-2 mt-4">
                        <div className="h-10 bg-gray-200 rounded-xl"></div>
                        <div className="h-10 bg-gray-200 rounded-xl"></div>
                      </div>
                    </div>
                  ) : user ? (
                    <>
                      <div className="mb-3 pb-3 bg-gray-50 rounded-xl p-3">
                        <p className="font-semibold text-gray-800">Welcome!</p>
                        <p className="font-medium text-gray-800 mt-1 wrap-break-word">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 break-all">
                          {user.email}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {isAdmin && (
                          <button
                            onClick={() => handleAccountClick("admin")}
                            className="flex items-center gap-3 py-2.5 px-3 text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium transition-colors"
                          >
                            <Shield size={16} className="text-emerald-700" /> Admin
                            Panel
                          </button>
                        )}
                        {[
                          { icon: User, label: "Profile", action: "profile" },
                          { icon: Package, label: "Orders", action: "orders" },
                          {
                            icon: Settings,
                            label: "Settings",
                            action: "settings",
                          },
                        ].map((item) => (
                          <button
                            key={item.action}
                            onClick={() => handleAccountClick(item.action)}
                            className="flex items-center gap-3 py-2.5 px-3 text-gray-700 hover:text-emerald-600 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <item.icon size={16} /> {item.label}
                          </button>
                        ))}
                        <button
                          onClick={() => handleAccountClick("logout")}
                          className="flex items-center gap-3 py-2.5 px-3 text-rose-600 hover:bg-rose-50 rounded-lg mt-2 transition-colors"
                        >
                          <LogOut size={16} /> Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => handleAccountClick("signin")}
                        className="w-full bg-emerald-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-700 transition-colors"
                      >
                        <LogIn size={18} /> Sign In
                      </button>
                      <button
                        onClick={() => handleAccountClick("signup")}
                        className="w-full border-2 border-emerald-600 text-emerald-600 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors"
                      >
                        <UserPlus size={18} /> Create Account
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default memo(Navbar);
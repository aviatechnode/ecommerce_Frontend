import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Send,
  ChevronRight,
  Shield,
  Truck,
  RefreshCw,
  Headphones,
  Heart,
  ShoppingBag,
} from "lucide-react";

const Footer = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
      // TODO: Integrate with actual newsletter API
      console.log("Newsletter subscription:", email);
    }
  };

  return (
    <footer className="bg-white/95 backdrop-blur-xl border-t border-gray-100 mt-auto font-sans">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        {/* Top Section: Logo + Newsletter */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-10 border-b border-gray-100">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => handleNavigation("/")}>
            <img
              src="/mograce_auto_parts_cropped.avif"
              width={42}
              height={42}
              alt="MOgrace Auto Parts"
              className="transition-transform duration-300 group-hover:scale-105"
            />
            <div>
              <span className="font-bold text-xl text-gray-800 tracking-tight block">
                MOgrace Auto Parts
              </span>
              <span className="text-xs text-gray-500">Premium Auto Parts Since 2020</span>
            </div>
          </div>

          <div className="w-full lg:w-auto">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email for offers & updates"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  subscribed
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {subscribed ? (
                  <>Subscribed! ✓</>
                ) : (
                  <>
                    Subscribe <Send size={14} />
                  </>
                )}
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-emerald-600 mt-2 animate-fade-in text-center sm:text-left">
                Thanks for subscribing! Check your inbox.
              </p>
            )}
          </div>
        </div>

        {/* Middle Section: 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Column 1: Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <ShoppingBag size={18} className="text-emerald-600" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleNavigation("/")}
                  className="text-gray-600 hover:text-emerald-600 transition flex items-center gap-1 group"
                >
                  <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/shop")}
                  className="text-gray-600 hover:text-emerald-600 transition flex items-center gap-1 group"
                >
                  <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Shop All Parts
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/wishlist")}
                  className="text-gray-600 hover:text-emerald-600 transition flex items-center gap-1 group"
                >
                  <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Wishlist
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/cart")}
                  className="text-gray-600 hover:text-emerald-600 transition flex items-center gap-1 group"
                >
                  <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Cart
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Customer Care */}
          <div>
            <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <Headphones size={18} className="text-emerald-600" />
              Customer Care
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleNavigation("/about")}
                  className="text-gray-600 hover:text-emerald-600 transition flex items-center gap-1 group"
                >
                  <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/contact")}
                  className="text-gray-600 hover:text-emerald-600 transition flex items-center gap-1 group"
                >
                  <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/faq")}
                  className="text-gray-600 hover:text-emerald-600 transition flex items-center gap-1 group"
                >
                  <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/returns")}
                  className="text-gray-600 hover:text-emerald-600 transition flex items-center gap-1 group"
                >
                  <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Returns & Refunds
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/shipping")}
                  className="text-gray-600 hover:text-emerald-600 transition flex items-center gap-1 group"
                >
                  <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Shipping Info
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <Shield size={18} className="text-emerald-600" />
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleNavigation("/privacy")}
                  className="text-gray-600 hover:text-emerald-600 transition flex items-center gap-1 group"
                >
                  <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/terms")}
                  className="text-gray-600 hover:text-emerald-600 transition flex items-center gap-1 group"
                >
                  <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/warranty")}
                  className="text-gray-600 hover:text-emerald-600 transition flex items-center gap-1 group"
                >
                  <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Warranty Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-emerald-600" />
              Get in Touch
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-600">
                <MapPin size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-sm">463 Oron Road, Uyo, Nigeria</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <Phone size={16} className="text-emerald-600 shrink-0" />
                <a href="tel:+2341234567890" className="text-sm hover:text-emerald-600 transition">
                  +234 8169803228
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <Mail size={16} className="text-emerald-600 shrink-0" />
                <a href="mailto:support@mograce.com" className="text-sm hover:text-emerald-600 transition">
                  support@mograce.com
                </a>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Follow Us</h4>
              <div className="flex gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 hover:bg-emerald-100 rounded-full transition-all hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook size={18} className="text-gray-700 hover:text-emerald-600" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 hover:bg-emerald-100 rounded-full transition-all hover:scale-110"
                  aria-label="Twitter"
                >
                  <Twitter size={18} className="text-gray-700 hover:text-emerald-600" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 hover:bg-emerald-100 rounded-full transition-all hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram size={18} className="text-gray-700 hover:text-emerald-600" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 hover:bg-emerald-100 rounded-full transition-all hover:scale-110"
                  aria-label="YouTube"
                >
                  <Youtube size={18} className="text-gray-700 hover:text-emerald-600" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges Row */}
        <div className="flex flex-wrap justify-center gap-6 py-6 border-t border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Truck size={18} className="text-emerald-600" />
            <span>Free Shipping Over ₦50,000</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <RefreshCw size={18} className="text-emerald-600" />
            <span>30-Day Easy Returns</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Shield size={18} className="text-emerald-600" />
            <span>Secure Payments</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Heart size={18} className="text-emerald-600" />
            <span>100% Authentic Parts</span>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Methods */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 text-sm text-gray-500 border-t border-gray-100">
          <p>
            &copy; {new Date().getFullYear()} MOgrace Auto Parts. All rights reserved.
          </p>
          <div className="flex gap-2">
  {/* Visa Logo - Now using a reliable SVG CDN */}
  <img
    src="https://dl.svgcdn.com/svg/logos/visa.svg"
    alt="Visa"
    className="h-6 w-auto opacity-80 hover:opacity-100 transition"
  />
  {/* Mastercard Logo - Keep as is or update for consistency */}
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png"
    alt="Mastercard"
    className="h-6 w-auto opacity-80 hover:opacity-100 transition"
  />
  {/* PayPal Logo - Keep as is */}
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1280px-PayPal.svg.png"
    alt="PayPal"
    className="h-6 w-auto opacity-80 hover:opacity-100 transition"
  />
  {/* American Express Logo - Now using a direct Wikimedia Commons SVG */}
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg"
    alt="American Express"
    className="h-6 w-auto opacity-80 hover:opacity-100 transition"
  />
</div>
        </div>
      </div>

      {/* Add custom animation for fade-in */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </footer>
  );
};

export default memo(Footer);
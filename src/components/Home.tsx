import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../admin/state-management/productSlice";
import type { RootState, AppDispatch } from "../admin/store/store";
import ProductCard from "../client/components/ProductCard";
import { Search } from "lucide-react";

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState("");

  const { products, loading } = useSelector(
    (state: RootState) => state.adminProducts
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-lg">
        Loading products...
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* HERO */}
      <div className="bg-green-600 text-white py-20 text-center px-4">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Find the Right Auto Parts
        </h1>

        <p className="text-sm md:text-lg opacity-90 mb-8">
          Quality parts for every vehicle at unbeatable prices
        </p>

        {/* SEARCH BAR */}
        <div className="max-w-2xl mx-auto relative">
          <input
            type="text"
            placeholder="Search for parts, brands, or vehicles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-md"
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold mb-6">Latest Products</h2>

        {filteredProducts.length === 0 ? (
          <div className="text-gray-500">No products found</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  brand?: { name: string };
  medias: { url: string }[];
  variants: {
    price: string;
  }[];
}

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/api/products");
        setProducts(data.products);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
      <div className="bg-green-600 text-white py-16 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Find the Right Auto Parts
        </h1>
        <p className="text-sm md:text-lg opacity-90">
          Quality parts for every vehicle at unbeatable prices
        </p>
      </div>

      {/* PRODUCTS */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold mb-6">Latest Products</h2>

        {products.length === 0 ? (
          <div className="text-gray-500">No products found</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const image = product.medias?.[0]?.url;
              const price = product.variants?.[0]?.price;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {/* IMAGE */}
                  <div className="h-40 bg-gray-100 rounded-t-xl overflow-hidden">
                    {image ? (
                      <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      {product.brand?.name}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-bold text-green-600">
                        ₦{price}
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("Add to wishlist");
                          }}
                          className="p-2 rounded-full hover:bg-gray-100"
                        >
                          <Heart size={16} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("Add to cart");
                          }}
                          className="p-2 rounded-full hover:bg-gray-100"
                        >
                          <ShoppingCart size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

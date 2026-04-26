import { useEffect, useState } from "react";
import { api } from "../../api/axios";

/* =========================================================
TYPES
========================================================= */
type Product = {
  id: string;
  name: string;
  description?: string;
  medias?: { url: string }[];
};

type Option = {
  id: string;
  name: string;
};

/* =========================================================
COMPONENT
========================================================= */
const AdminProducts = () => {
  /* ================= STATE ================= */
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [warehouses, setWarehouses] = useState<Option[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    brandId: "",
    categoryId: "",
    warehouseId: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);


  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        const [pRes, bRes, cRes, wRes] = await Promise.all([
          api.get("/products"),
          api.get("/brands"),
          api.get("/categories"),
          api.get("/warehouses"),
        ]);

        setProducts(pRes.data.products || []);
        setBrands(bRes.data.brands || []);
        setCategories(cRes.data.categories || []);
        setWarehouses(wRes.data.warehouses || []);
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  /* ================= INPUT ================= */
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= IMAGE ================= */
  const handleFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    setImages((prev) => [...prev, ...arr]);
    setPreviewUrls((prev) => [
      ...prev,
      ...arr.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const handleRemove = (i: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setPreviewUrls((prev) => prev.filter((_, idx) => idx !== i));
  };

  /* ================= CREATE ================= */
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.price ||
      !form.brandId ||
      !form.categoryId ||
      !form.warehouseId
    ) {
      alert("Fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();

      Object.entries(form).forEach(([k, v]) => fd.append(k, v));

      fd.append("variantName", "Default");
      fd.append("sku", "SKU-" + Date.now());

      images.forEach((img) => fd.append("images", img));

      const res = await api.post("/products", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProducts((prev) => [res.data.product, ...prev]);

      /* RESET */
      setForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        brandId: "",
        categoryId: "",
        warehouseId: "",
      });

      setImages([]);
      setPreviewUrls([]);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete product?")) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  /* =========================================================
  UI
  ========================================================= */
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Admin Products</h1>

      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Loading...</p>}

      {/* ================= FORM ================= */}
      <form onSubmit={handleSubmit} className="space-y-3 border p-5 rounded">

        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border p-2 w-full" />
        <textarea name="description" value={form.description} onChange={handleChange} className="border p-2 w-full" />
        <input name="price" type="number" value={form.price} onChange={handleChange} className="border p-2 w-full" />
        <input name="stock" type="number" value={form.stock} onChange={handleChange} className="border p-2 w-full" />

        <select name="brandId" value={form.brandId} onChange={handleChange} className="border p-2 w-full">
          <option value="">Select Brand</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select name="categoryId" value={form.categoryId} onChange={handleChange} className="border p-2 w-full">
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select name="warehouseId" value={form.warehouseId} onChange={handleChange} className="border p-2 w-full">
          <option value="">Select Warehouse</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>

        {/* IMAGE UPLOAD */}
        <input
          type="file"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div className="flex gap-2 flex-wrap">
          {previewUrls.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} className="h-20 w-20 object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-0 right-0 bg-red-500 text-white px-1"
              >
                x
              </button>
            </div>
          ))}
        </div>

        <button className="bg-black text-white px-4 py-2">
          {loading ? "Processing..." : "Create Product"}
        </button>
      </form>

      {/* ================= LIST ================= */}
      <div className="grid grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="border p-4 rounded">

            {p.medias?.[0]?.url && (
              <img
                src={p.medias[0].url}
                className="h-32 w-full object-cover"
              />
            )}

            <h3 className="font-bold">{p.name}</h3>
            <p className="text-sm">{p.description}</p>

            <button
              onClick={() => handleDelete(p.id)}
              className="bg-red-500 text-white px-2 py-1 mt-2"
            >
              Delete
            </button>

          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
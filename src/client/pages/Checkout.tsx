import { useState } from "react";
import { useSelector } from "react-redux";

export default function CheckoutPage() {
  const cart = useSelector((state: any) => state.cart);

  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    phone: "",
  });

  const subtotal = cart?.totals?.subtotal || 0;
  const shipping = cart?.shipping || 0;
  const discount = cart?.discount || 0;
  const total = subtotal + shipping - discount;

  const applyCoupon = async () => {
    setLoading(true);
    try {
      await fetch("/api/coupon/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon }),
      });
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async () => {
    setLoading(true);
    try {
      await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          couponCode: coupon,
          address,
        }),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold text-green-700 mb-4">Shipping Address</h2>

            <div className="grid gap-3">
              <input
                className="border p-3 rounded-lg"
                placeholder="Street"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
              />
              <input
                className="border p-3 rounded-lg"
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />
              <input
                className="border p-3 rounded-lg"
                placeholder="State"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
              />
              <input
                className="border p-3 rounded-lg"
                placeholder="Phone"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold text-green-700 mb-4">Cart Items</h2>

            <div className="space-y-3">
              {cart?.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{item.variant?.product?.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-green-700">
                    ₦{item.unitPrice * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white p-6 rounded-2xl shadow h-fit">
          <h2 className="text-xl font-bold text-green-700 mb-4">Order Summary</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₦{subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>₦{shipping}</span>
            </div>

            <div className="flex justify-between text-red-600">
              <span>Discount</span>
              <span>-₦{discount}</span>
            </div>

            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-green-700">₦{total}</span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              className="border p-2 rounded-lg w-full"
              placeholder="Coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />
            <button
              onClick={applyCoupon}
              className="bg-green-600 text-white px-4 rounded-lg"
            >
              Apply
            </button>
          </div>

          <button
            onClick={placeOrder}
            disabled={loading}
            className="mt-6 w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
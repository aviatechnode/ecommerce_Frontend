// src/pages/Cart.tsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // ← add this
import type { RootState, AppDispatch } from "../../admin/store/store";
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../admin/state-management/cartSlice";

const Cart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate(); // ← add this

  const { cart, totals, shipping, grandTotal, loading } = useSelector(
    (state: RootState) => state.cart
  );

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleDecrease = async (item: any) => {
    if (item.quantity <= 1) {
      await dispatch(removeCartItem(item.id)).unwrap();
      return;
    }

    await dispatch(
      updateCartItem({
        id: item.id,
        quantity: item.quantity - 1,
      })
    ).unwrap();
  };

  const handleIncrease = async (item: any) => {
    await dispatch(
      updateCartItem({
        id: item.id,
        quantity: item.quantity + 1,
      })
    ).unwrap();
  };

  const handleRemove = async (id: string) => {
    await dispatch(removeCartItem(id)).unwrap();
  };

  const handleClearCart = async () => {
    await dispatch(clearCart()).unwrap();
  };

  // Add this handler
  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (loading) {
    return <div className="p-10">Loading cart...</div>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="p-10 text-center text-gray-500">
        Your cart is empty
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

        {/* ITEMS */}
        <div className="md:col-span-2 space-y-4">
          {cart.items.map((item: any) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-lg shadow flex gap-4"
            >
              <img
                src={item.variant.product.medias?.[0]?.url}
                alt={item.variant.product.name}
                className="w-24 h-24 object-cover rounded"
              />

              <div className="flex-1">
                <h3 className="font-semibold">
                  {item.variant.product.name}
                </h3>

                <p className="text-sm text-gray-500">
                  ₦{Number(item.unitPrice).toLocaleString()}
                </p>

                {/* QUANTITY */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleDecrease(item)}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    -
                  </button>

                  <span className="min-w-7.5 text-center">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleIncrease(item)}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>

                {/* REMOVE */}
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="text-red-500 text-sm mt-3 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* SUMMARY */}
        <div className="bg-white p-5 rounded-lg shadow h-fit">
          <h2 className="font-bold text-lg mb-4">
            Order Summary
          </h2>

          <div className="flex justify-between text-sm mb-2">
            <span>Subtotal</span>
            <span>
              ₦{Number(totals.subtotal).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-sm mb-2">
            <span>Shipping</span>
            <span>
              ₦{Number(shipping).toLocaleString()}
            </span>
          </div>

          <div className="border-t my-3" />

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>
              ₦{Number(grandTotal).toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCheckout} // ← updated
            className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
          >
            Checkout
          </button>

          <button
            type="button"
            onClick={handleClearCart}
            className="w-full mt-2 text-red-500 text-sm hover:text-red-700"
          >
            Clear Cart
          </button>
        </div>

      </div>
    </div>
  );
};

export default Cart;
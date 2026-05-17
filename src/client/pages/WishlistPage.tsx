// src/pages/Wishlist.tsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  useGetWishlistQuery,
  useRemoveWishlistItemMutation,
  useClearWishlistMutation,
} from "../../services/wishlistApi";

import type {
  WishlistItem,
} from "../../services/wishlistApi";

//////////////////////////////////////////////////////////
// CONFIRMATION MODAL
//////////////////////////////////////////////////////////

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        p-4
        backdrop-blur-sm
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-xl
          bg-white
          p-6
          shadow-xl
        "
      >
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          {title}
        </h3>

        <p className="mb-6 text-gray-600">
          {message}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="
              rounded-lg
              border
              border-gray-300
              px-4
              py-2
              text-gray-700
              transition-colors
              hover:bg-gray-50
            "
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="
              rounded-lg
              bg-red-600
              px-4
              py-2
              text-white
              transition-colors
              hover:bg-red-700
            "
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

//////////////////////////////////////////////////////////
// LOADING SKELETON
//////////////////////////////////////////////////////////

const WishlistSkeleton = () => (
  <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
      </div>

      <div
        className="
          grid
          grid-cols-1
          gap-6
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
        "
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl bg-white p-4 shadow-sm"
          >
            <div className="h-40 animate-pulse rounded-lg bg-gray-200" />

            <div className="mt-3 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200" />

              <div className="mt-4 flex justify-between">
                <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

//////////////////////////////////////////////////////////
// MAIN COMPONENT
//////////////////////////////////////////////////////////

export default function WishlistPage() {
  const navigate = useNavigate();

  //////////////////////////////////////////////////////////
  // RTK QUERY
  //////////////////////////////////////////////////////////

  const {
    data: wishlist,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetWishlistQuery();

  const [removeWishlistItem] =
    useRemoveWishlistItemMutation();

  const [clearWishlist] =
    useClearWishlistMutation();

  //////////////////////////////////////////////////////////
  // LOCAL UI STATE
  //////////////////////////////////////////////////////////

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [showClearConfirm, setShowClearConfirm] =
    useState(false);

  const [removeItemId, setRemoveItemId] =
    useState<string | null>(null);

  //////////////////////////////////////////////////////////
  // DATA
  //////////////////////////////////////////////////////////

  const items: WishlistItem[] =
    wishlist?.items || [];

  //////////////////////////////////////////////////////////
  // HELPERS
  //////////////////////////////////////////////////////////

  const getProductImage = (
    product: WishlistItem["product"]
  ): string | null => {
    if (
      product.medias &&
      product.medias.length > 0
    ) {
      return product.medias[0].url;
    }

    return null;
  };

  //////////////////////////////////////////////////////////
  // ACTIONS
  //////////////////////////////////////////////////////////

  const handleRemove = async (id: string) => {
  setActionLoading(`remove_${id}`);

  try {
    await removeWishlistItem({
      wishlistItemId: id,
    }).unwrap();
  } catch (err) {
    console.error(
      "Failed to remove wishlist item:",
      err
    );
  } finally {
    setActionLoading(null);
    setRemoveItemId(null);
  }
};
  const handleClear = async () => {
    setActionLoading("clear");

    try {
      await clearWishlist().unwrap();
    } catch (err) {
      console.error(
        "Failed to clear wishlist:",
        err
      );
    } finally {
      setActionLoading(null);
      setShowClearConfirm(false);
    }
  };

  //////////////////////////////////////////////////////////
  // LOADING
  //////////////////////////////////////////////////////////

  if (isLoading && !wishlist) {
    return <WishlistSkeleton />;
  }

  //////////////////////////////////////////////////////////
  // ERROR
  //////////////////////////////////////////////////////////

  if (error) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-gray-50
          p-4
        "
      >
        <div
          className="
            w-full
            max-w-md
            rounded-xl
            bg-white
            p-6
            text-center
            shadow-lg
          "
        >
          <div
            className="
              mx-auto
              mb-4
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-red-100
            "
          >
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Failed to load wishlist
          </h2>

          <p className="mb-6 text-gray-500">
            Something went wrong while loading your wishlist.
          </p>

          <button
            onClick={() => refetch()}
            className="
              rounded-lg
              bg-green-600
              px-4
              py-2
              text-white
              transition-colors
              hover:bg-green-700
            "
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  //////////////////////////////////////////////////////////
  // EMPTY STATE
  //////////////////////////////////////////////////////////

  if (items.length === 0 && !isFetching) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-gray-50
          p-4
        "
      >
        <div
          className="
            w-full
            max-w-md
            rounded-2xl
            bg-white
            p-8
            text-center
            shadow-xl
          "
        >
          <div
            className="
              mx-auto
              mb-4
              flex
              h-24
              w-24
              items-center
              justify-center
              rounded-full
              bg-pink-50
            "
          >
            <svg
              className="h-12 w-12 text-pink-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Your wishlist is empty
          </h2>

          <p className="mb-6 text-gray-500">
            Save your favorite items here and come back to
            them anytime.
          </p>

          <Link
            to="/shop"
            className="
              inline-flex
              items-center
              justify-center
              rounded-xl
              bg-green-600
              px-6
              py-3
              font-medium
              text-white
              transition-colors
              hover:bg-green-700
            "
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  //////////////////////////////////////////////////////////
  // RENDER
  //////////////////////////////////////////////////////////

  return (
    <>
      <ConfirmModal
        isOpen={!!removeItemId}
        onClose={() => setRemoveItemId(null)}
        onConfirm={() =>
          removeItemId &&
          handleRemove(removeItemId)
        }
        title="Remove Item"
        message="Are you sure you want to remove this item from your wishlist?"
      />

      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() =>
          setShowClearConfirm(false)
        }
        onConfirm={handleClear}
        title="Clear Wishlist"
        message="Are you sure you want to remove all items from your wishlist? This action cannot be undone."
      />

      <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <h1
              className="
                flex
                items-center
                gap-2
                text-2xl
                font-bold
                text-gray-900
                md:text-3xl
              "
            >
              <svg
                className="h-7 w-7 text-pink-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>

              My Wishlist

              <span className="ml-2 text-sm font-normal text-gray-500">
                ({items.length})
              </span>
            </h1>

            {items.length > 0 && (
              <button
                onClick={() =>
                  setShowClearConfirm(true)
                }
                disabled={
                  actionLoading === "clear"
                }
                className="
                  flex
                  items-center
                  gap-1
                  text-sm
                  text-red-500
                  transition-colors
                  hover:text-red-700
                  disabled:opacity-50
                "
              >
                Clear All
              </button>
            )}
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-6
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
            "
          >
            {items.map((item) => {
              const product = item.product;
              const imageUrl =
                getProductImage(product);

              const isRemoving =
                actionLoading ===
                `remove_${item.id}`;

              return (
                <div
                  key={item.id}
                  className="
                    group
                    overflow-hidden
                    rounded-xl
                    bg-white
                    shadow-sm
                    transition-all
                    duration-200
                    hover:shadow-md
                  "
                >
                  <div
                    onClick={() =>
                      navigate(
                        `/product/${product.id}`
                      )
                    }
                    className="
                      aspect-square
                      cursor-pointer
                      overflow-hidden
                      bg-gray-100
                    "
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="
                          h-full
                          w-full
                          object-cover
                          transition-transform
                          duration-300
                          group-hover:scale-105
                        "
                      />
                    ) : (
                      <div
                        className="
                          flex
                          h-full
                          w-full
                          items-center
                          justify-center
                          text-gray-400
                        "
                      >
                        <svg
                          className="h-12 w-12"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3
                      onClick={() =>
                        navigate(
                          `/product/${product.id}`
                        )
                      }
                      className="
                        line-clamp-2
                        cursor-pointer
                        font-medium
                        text-gray-900
                        transition-colors
                        hover:text-green-600
                      "
                    >
                      {product.name}
                    </h3>

                    {product.price && (
                      <p
                        className="
                          mt-1
                          font-semibold
                          text-green-600
                        "
                      >
                        ₦
                        {Number(
                          product.price
                        ).toLocaleString()}
                      </p>
                    )}

                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        justify-between
                      "
                    >
                      <button
                        onClick={() =>
                          navigate(
                            `/product/${product.id}`
                          )
                        }
                        className="
                          rounded-lg
                          bg-green-600
                          px-3
                          py-1.5
                          text-sm
                          text-white
                          transition-colors
                          hover:bg-green-700
                        "
                      >
                        Quick View
                      </button>

                      <button
                        onClick={() =>
                          setRemoveItemId(
                            item.id
                          )
                        }
                        disabled={isRemoving}
                        className="
                          p-1
                          text-red-500
                          transition-colors
                          hover:text-red-700
                          disabled:opacity-50
                        "
                      >
                        {isRemoving ? (
                          <div
                            className="
                              h-5
                              w-5
                              animate-spin
                              rounded-full
                              border-2
                              border-red-500
                              border-t-transparent
                            "
                          />
                        ) : (
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
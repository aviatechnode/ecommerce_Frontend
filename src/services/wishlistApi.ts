import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../api/axiosBaseQuery";

    //////////////////////////////////////////////////////////
    // TYPES
    //////////////////////////////////////////////////////////

    export interface Product {
    id: string;
    name: string;
    price?: number;
    medias?: { url: string }[];
    }

    export interface WishlistItem {
    id: string; // wishlistItem.id
    productId: string; // product.id
    product: Product;
    }

    export interface Wishlist {
    id: string;
    items: WishlistItem[];
    }

    export interface GetWishlistResponse {
    wishlist: Wishlist;
    }

    //////////////////////////////////////////////////////////
    // WISHLIST API
    //////////////////////////////////////////////////////////

    export const wishlistApi = createApi({
    reducerPath: "wishlistApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["Wishlist"],

    endpoints: (builder) => ({
    //////////////////////////////////////////////////////////
    // GET WISHLIST
    //////////////////////////////////////////////////////////

    getWishlist: builder.query<Wishlist, void>({
    query: () => ({
        url: "/api/wishlist",
        method: "GET",
    }),

    transformResponse: (response: GetWishlistResponse): Wishlist => {
        return response?.wishlist ?? { id: "", items: [] };
    },

    providesTags: ["Wishlist"],
    }),
    //////////////////////////////////////////////////////////
    // ADD TO WISHLIST
    //////////////////////////////////////////////////////////

    addToWishlist: builder.mutation<
      WishlistItem,
      { productId: string }
    >({
      query: (arg) => ({
        url: "/api/wishlist",
        method: "POST",
        data: arg,
      }),

      async onQueryStarted(
        arg,
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          wishlistApi.util.updateQueryData(
            "getWishlist",
            undefined,
            (draft) => {
              if (!draft?.items) return;

              const exists = draft.items.find(
                (item) =>
                  item.productId === arg.productId
              );

              if (!exists) {
                draft.items.push({
                  id: `temp-${Date.now()}`,
                  productId: arg.productId,
                  product: {} as Product,
                });
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },

      invalidatesTags: ["Wishlist"],
    }),

    //////////////////////////////////////////////////////////
    // REMOVE ITEM
    //
    // IMPORTANT:
    // Backend delete should support BOTH:
    //
    // - wishlistItem.id
    // - productId
    //
    // This prevents frontend/backend mismatch
    //////////////////////////////////////////////////////////

    removeWishlistItem: builder.mutation<
      any,
      {
        wishlistItemId?: string;
        productId?: string;
      }
    >({
      query: ({
        wishlistItemId,
        productId,
      }) => ({
        /*
          Prefer wishlistItem.id
          fallback to productId
        */
        url: `/api/wishlist/${
          wishlistItemId || productId
        }`,
        method: "DELETE",
      }),

      async onQueryStarted(
        arg,
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          wishlistApi.util.updateQueryData(
            "getWishlist",
            undefined,
            (draft) => {
              if (!draft?.items) return;

              draft.items = draft.items.filter(
                (item) =>
                  item.id !== arg.wishlistItemId &&
                  item.productId !== arg.productId
              );
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },

      invalidatesTags: ["Wishlist"],
    }),

    //////////////////////////////////////////////////////////
    // CLEAR WISHLIST
    //////////////////////////////////////////////////////////

    clearWishlist: builder.mutation<any, void>({
      query: () => ({
        url: "/api/wishlist",
        method: "DELETE",
      }),

      async onQueryStarted(
        _,
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          wishlistApi.util.updateQueryData(
            "getWishlist",
            undefined,
            (draft) => {
              if (!draft) return;

              draft.items = [];
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },

      invalidatesTags: ["Wishlist"],
    }),

    //////////////////////////////////////////////////////////
    // TOGGLE WISHLIST
    //////////////////////////////////////////////////////////

    toggleWishlist: builder.mutation<
      any,
      { productId: string }
    >({
      query: (arg) => ({
        url: "/api/wishlist/toggle",
        method: "POST",
        data: arg,
      }),

      async onQueryStarted(
        arg,
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          wishlistApi.util.updateQueryData(
            "getWishlist",
            undefined,
            (draft) => {
              if (!draft?.items) return;

              const existing = draft.items.find(
                (item) =>
                  item.productId === arg.productId
              );

              /*
                Toggle uses productId because
                it is product-based logic
              */
              if (existing) {
                draft.items = draft.items.filter(
                  (item) =>
                    item.productId !== arg.productId
                );
              } else {
                draft.items.push({
                  id: `temp-${Date.now()}`,
                  productId: arg.productId,
                  product: {} as Product,
                });
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },

      invalidatesTags: ["Wishlist"],
    }),
  }),
});

//////////////////////////////////////////////////////////
// SELECTORS (FIXED - RTK QUERY SAFE)
//////////////////////////////////////////////////////////

export const selectWishlistResult =
  wishlistApi.endpoints.getWishlist.select();

export const selectWishlistCount = (state: any) => {
  const result = selectWishlistResult(state);
  return result?.data?.items?.length ?? 0;
};

//////////////////////////////////////////////////////////
// HOOKS
//////////////////////////////////////////////////////////

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveWishlistItemMutation,
  useClearWishlistMutation,
  useToggleWishlistMutation,
} = wishlistApi;
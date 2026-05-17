import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../api/axiosBaseQuery";


//////////////////////////////////////////////////////////
// HELPERS (CLIENT SIDE CART ENGINE)
//////////////////////////////////////////////////////////

function recalcCart(draft: any) {
  if (!draft?.cart?.items) return;

  let subtotal = 0;
  let totalItems = 0;

  for (const item of draft.cart.items) {
    subtotal += Number(item.unitPrice || 0) * item.quantity;
    totalItems += item.quantity;
  }

  draft.totals = {
    subtotal,
    totalItems,
  };

  draft.grandTotal = subtotal + Number(draft.shipping || 0);
}

//////////////////////////////////////////////////////////
// CART API
//////////////////////////////////////////////////////////

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Cart"],

  endpoints: (builder) => ({

    //////////////////////////////////////////////////////////
    // GET CART (FIXED: void arg)
    //////////////////////////////////////////////////////////
    getCart: builder.query<any, void>({
      query: () => ({
        url: "/api/cart",
        method: "GET",
      }),
      providesTags: ["Cart"],
    }),

    //////////////////////////////////////////////////////////
    // ADD TO CART (OPTIMISTIC)
    //////////////////////////////////////////////////////////
    addToCart: builder.mutation<
      any,
      { variantId: string; quantity: number; unitPrice?: number }
    >({
      query: (arg) => ({
        url: "/api/cart/add",
        method: "POST",
        data: arg,
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          cartApi.util.updateQueryData("getCart", undefined, (draft: any) => {
            if (!draft?.cart) return;

            const item = draft.cart.items.find(
              (i: any) => i.variantId === arg.variantId
            );

            if (item) {
              item.quantity += arg.quantity;
            } else {
              draft.cart.items.push({
                id: `temp-${Date.now()}`,
                cartId: draft.cart.id,
                variantId: arg.variantId,
                quantity: arg.quantity,
                unitPrice: arg.unitPrice ?? 0,
                variant: undefined,
              });
            }

            recalcCart(draft);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },

      invalidatesTags: ["Cart"],
    }),

    //////////////////////////////////////////////////////////
    // UPDATE ITEM
    //////////////////////////////////////////////////////////
    updateCartItem: builder.mutation<
      any,
      { id: string; quantity: number }
    >({
      query: (arg) => ({
        url: `/api/cart/item/${arg.id}`,
        method: "PUT",
        data: { quantity: arg.quantity },
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          cartApi.util.updateQueryData("getCart", undefined, (draft: any) => {
            const item = draft?.cart?.items?.find(
              (i: any) => i.id === arg.id
            );

            if (!item) return;

            const oldQty = item.quantity;
            item.quantity = arg.quantity;

            item._diff = arg.quantity - oldQty;

            recalcCart(draft);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },

      invalidatesTags: ["Cart"],
    }),

    //////////////////////////////////////////////////////////
    // REMOVE ITEM
    //////////////////////////////////////////////////////////
    removeCartItem: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/cart/item/${id}`,
        method: "DELETE",
      }),

      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          cartApi.util.updateQueryData("getCart", undefined, (draft: any) => {
            if (!draft?.cart) return;

            draft.cart.items = draft.cart.items.filter(
              (item: any) => item.id !== id
            );

            recalcCart(draft);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },

      invalidatesTags: ["Cart"],
    }),

    //////////////////////////////////////////////////////////
    // CLEAR CART (FIXED: void arg)
    //////////////////////////////////////////////////////////
    clearCart: builder.mutation<any, void>({
      query: () => ({
        url: "/api/cart/clear",
        method: "DELETE",
      }),

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          cartApi.util.updateQueryData("getCart", undefined, (draft: any) => {
            if (!draft?.cart) return;

            draft.cart.items = [];
            draft.totals = { subtotal: 0, totalItems: 0 };
            draft.grandTotal = 0;
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },

      invalidatesTags: ["Cart"],
    }),
  }),
});

//////////////////////////////////////////////////////////
// HOOKS
//////////////////////////////////////////////////////////

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = cartApi;
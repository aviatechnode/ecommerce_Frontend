import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../api/axiosBaseQuery";

//////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;

  variant?: {
    id: string;
    weight?: number | string | null;

    product?: {
      id: string;
      name: string;
      medias?: {
        id?: string;
        url: string;
      }[];
    };
  };
}

export interface CartResponse {
  cart: {
    id: string;
    userId: string;
    items: CartItem[];

    deliveryStateId?: string | null;
    deliveryLgaId?: string | null;
    shippingZoneId?: string | null;
  } | null;

  totals: {
    subtotal: number;
    totalItems: number;
  };

  shipping?: {
    shippingMethod?: string;
    deliveryFee?: number;
    estimatedDays?: number;
    courier?: any;
    pickupStation?: any;
    shippingRate?: any;
    zone?: any;
    weight?: number;
    error?: string;
  } | null;

  grandTotal: number;
}

//////////////////////////////////////////////////////////
// HELPERS
//////////////////////////////////////////////////////////

function recalcCart(draft: CartResponse) {
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

  draft.grandTotal =
    subtotal + Number(draft.shipping?.deliveryFee || 0);
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
    // GET CART
    //////////////////////////////////////////////////////////
    getCart: builder.query<
      CartResponse,
      {
        stateId?: string;
        lgaId?: string;
        shippingMethod?: string;
        pickupStationId?: string;
      } | void
    >({
      query: (params) => ({
        url: "/api/cart",
        method: "GET",
        params,
      }),

      providesTags: ["Cart"],
    }),

    //////////////////////////////////////////////////////////
    // ADD TO CART
    //////////////////////////////////////////////////////////
    addToCart: builder.mutation<
      any,
      {
        variantId: string;
        quantity: number;
      }
    >({
      query: (data) => ({
        url: "/api/cart/add",
        method: "POST",
        data,
      }),

      async onQueryStarted(
        arg,
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          cartApi.util.updateQueryData(
            "getCart",
            undefined,
            (draft) => {
              if (!draft?.cart) return;

              const existingItem =
                draft.cart.items.find(
                  (item) =>
                    item.variantId === arg.variantId
                );

              if (existingItem) {
                existingItem.quantity += arg.quantity;
              } else {
                draft.cart.items.push({
                  id: `temp-${Date.now()}`,
                  cartId: draft.cart.id,
                  variantId: arg.variantId,
                  quantity: arg.quantity,
                  unitPrice: 0,
                });
              }

              recalcCart(draft);
            }
          )
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
      {
        id: string;
        quantity: number;
      }
    >({
      query: ({ id, quantity }) => ({
        url: `/api/cart/item/${id}`,
        method: "PUT",
        data: { quantity },
      }),

      async onQueryStarted(
        arg,
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          cartApi.util.updateQueryData(
            "getCart",
            undefined,
            (draft) => {
              const item =
                draft?.cart?.items?.find(
                  (i) => i.id === arg.id
                );

              if (!item) return;

              item.quantity = arg.quantity;

              recalcCart(draft);
            }
          )
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
    removeCartItem: builder.mutation<
      any,
      {
        variantId: string;
      }
    >({
      query: (data) => ({
        url: "/api/cart/item",
        method: "DELETE",
        data,
      }),

      async onQueryStarted(
        arg,
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          cartApi.util.updateQueryData(
            "getCart",
            undefined,
            (draft) => {
              if (!draft?.cart) return;

              draft.cart.items =
                draft.cart.items.filter(
                  (item) =>
                    item.variantId !== arg.variantId
                );

              recalcCart(draft);
            }
          )
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
    // CLEAR CART
    //////////////////////////////////////////////////////////
    clearCart: builder.mutation<any, void>({
      query: () => ({
        url: "/api/cart/clear",
        method: "DELETE",
        data: {},
      }),

      async onQueryStarted(
        _,
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          cartApi.util.updateQueryData(
            "getCart",
            undefined,
            (draft) => {
              if (!draft?.cart) return;

              draft.cart.items = [];

              draft.totals = {
                subtotal: 0,
                totalItems: 0,
              };

              draft.shipping = null;

              draft.grandTotal = 0;
            }
          )
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
    // UPDATE DELIVERY
    //////////////////////////////////////////////////////////
    updateCartDelivery: builder.mutation<
      any,
      {
        deliveryStateId?: string;
        deliveryLgaId?: string;
        shippingZoneId?: string;
      }
    >({
      query: (data) => ({
        url: "/api/cart/delivery",
        method: "PATCH",
        data,
      }),

      async onQueryStarted(
        arg,
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          cartApi.util.updateQueryData(
            "getCart",
            undefined,
            (draft) => {
              if (!draft?.cart) return;

              if (
                arg.deliveryStateId !== undefined
              ) {
                draft.cart.deliveryStateId =
                  arg.deliveryStateId;
              }

              if (
                arg.deliveryLgaId !== undefined
              ) {
                draft.cart.deliveryLgaId =
                  arg.deliveryLgaId;
              }

              if (
                arg.shippingZoneId !== undefined
              ) {
                draft.cart.shippingZoneId =
                  arg.shippingZoneId;
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

      invalidatesTags: ["Cart"],
    }),

    //////////////////////////////////////////////////////////
    // CALCULATE SHIPPING
    //////////////////////////////////////////////////////////
    calculateCartShipping: builder.mutation<
      {
        shippingMethod: string;
        deliveryFee: number;
        estimatedDays: number;
        courier?: any;
        pickupStation?: any;
        shippingRate?: any;
        zone?: any;
        weight?: number;
      },
      {
        deliveryStateId: string;
        deliveryLgaId: string;
      }
    >({
      query: (data) => ({
        url: "/api/cart/shipping/calculate",
        method: "POST",
        data,
      }),
    }),

    //////////////////////////////////////////////////////////
    // MERGE CART
    //////////////////////////////////////////////////////////
    mergeCart: builder.mutation<
      any,
      {
        items: Array<{
          variantId: string;
          quantity: number;
        }>;
      }
    >({
      query: (data) => ({
        url: "/api/cart/merge",
        method: "POST",
        data,
      }),

      invalidatesTags: ["Cart"],
    }),
  }),
});

//////////////////////////////////////////////////////////
// EXPORT HOOKS
//////////////////////////////////////////////////////////

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useUpdateCartDeliveryMutation,
  useCalculateCartShippingMutation,
  useMergeCartMutation,
} = cartApi;
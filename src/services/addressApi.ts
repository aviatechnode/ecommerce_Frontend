import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../api/axiosBaseQuery";

//////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////

export interface State {
  id: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface LGA {
  id: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  stateId: string;
}

export interface Address {
  id: string;
  userId: string;

  name: string;
  phone: string;

  stateId: string;
  lgaId: string;
  city: string;

  area?: string | null;
  street: string;
  landmark?: string | null;
  fullAddress: string;

  isDefault: boolean;

  state?: State;
  lga?: LGA;
}

export interface CreateAddressPayload {
  name: string;
  phone: string;
  stateId: string;
  lgaId: string;
  city: string;
  area?: string | null;
  street: string;
  landmark?: string | null;
  fullAddress: string;
  isDefault?: boolean;
}

export interface UpdateAddressPayload {
  id: string;
  name?: string;
  phone?: string;
  stateId?: string;
  lgaId?: string;
  city?: string;
  area?: string | null;
  street?: string;
  landmark?: string | null;
  isDefault?: boolean;
}

interface AddressResponse {
  message: string;
  address: Address;
}

interface AddressesResponse {
  addresses: Address[];
}

//////////////////////////////////////////////////////////
// API
//////////////////////////////////////////////////////////

export const addressApi = createApi({
  reducerPath: "addressApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Address"],

  endpoints: (builder) => ({
    //////////////////////////////////////////////////////////
    // CREATE ADDRESS
    //////////////////////////////////////////////////////////

    createAddress: builder.mutation<
      AddressResponse,
      CreateAddressPayload
    >({
      query: (data) => ({
        url: "/api/address",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Address"],
    }),

    //////////////////////////////////////////////////////////
    // GET MY ADDRESSES
    //////////////////////////////////////////////////////////

    getMyAddresses: builder.query<
      AddressesResponse,
      void
    >({
      query: () => ({
        url: "/api/address",
        method: "GET",
      }),
      providesTags: ["Address"],
    }),

    //////////////////////////////////////////////////////////
    // GET SINGLE ADDRESS
    //////////////////////////////////////////////////////////

    getAddress: builder.query<
      { address: Address },
      string
    >({
      query: (id) => ({
        url: `/api/address/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "Address", id },
      ],
    }),

    //////////////////////////////////////////////////////////
    // UPDATE ADDRESS
    //////////////////////////////////////////////////////////

    updateAddress: builder.mutation<
      AddressResponse,
      UpdateAddressPayload
    >({
      query: ({ id, ...data }) => ({
        url: `/api/address/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (
        _result,
        _error,
        { id }
      ) => [
        { type: "Address", id },
        "Address",
      ],
    }),

    //////////////////////////////////////////////////////////
    // DELETE ADDRESS
    //////////////////////////////////////////////////////////

    deleteAddress: builder.mutation<
      { message: string },
      string
    >({
      query: (id) => ({
        url: `/api/address/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Address"],
    }),

    //////////////////////////////////////////////////////////
    // SET DEFAULT ADDRESS
    //////////////////////////////////////////////////////////

    setDefaultAddress: builder.mutation<
      { message: string },
      string
    >({
      query: (id) => ({
        url: `/api/address/${id}/default`,
        method: "PATCH",
      }),
      invalidatesTags: ["Address"],
    }),
  }),
});

//////////////////////////////////////////////////////////
// EXPORT HOOKS
//////////////////////////////////////////////////////////

export const {
  useCreateAddressMutation,
  useGetMyAddressesQuery,
  useGetAddressQuery,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} = addressApi;
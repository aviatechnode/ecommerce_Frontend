import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../api/axiosBaseQuery";

//////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////

export interface ReviewUser {
  id: string;
  name: string;
}

export interface Review {
  id: string;

  userId: string;
  productId: string;

  rating: number;

  title: string | null;
  comment: string | null;

  verifiedPurchase: boolean;
  isApproved: boolean;

  createdAt: string;
  updatedAt: string;

  user: ReviewUser;
}

//////////////////////////////////////////////////////////
// API RESPONSES
//////////////////////////////////////////////////////////

export interface ReviewsResponse {
  reviews: Review[];
}

export interface ReviewResponse {
  message: string;
  review: Review;
}

export interface RatingSummaryResponse {
  averageRating: number;
  totalReviews: number;
}

export interface DeleteReviewResponse {
  message: string;
}

//////////////////////////////////////////////////////////
// PAYLOADS
//////////////////////////////////////////////////////////

export interface CreateReviewPayload {
  productId: string;

  title?: string;

  rating: number;

  comment: string;
}

export interface UpdateReviewPayload {
  id: string;

  productId: string;

  data: {
    title?: string;

    rating?: number;

    comment?: string;
  };
}

export interface DeleteReviewPayload {
  id: string;

  productId: string;
}

//////////////////////////////////////////////////////////
// REVIEW API
//////////////////////////////////////////////////////////

export const reviewApi = createApi({
  reducerPath: "reviewApi",

  baseQuery: axiosBaseQuery(),

  tagTypes: ["Reviews", "ReviewSummary"],

  endpoints: (builder) => ({
    //////////////////////////////////////////////////////////
    // GET REVIEWS
    //////////////////////////////////////////////////////////

    getReviews: builder.query<Review[], string>({
      query: (productId) => ({
        url: `/api/reviews/product/${productId}`,

        method: "GET",
      }),

      transformResponse: (
        response: ReviewsResponse
      ) => response.reviews ?? [],

      providesTags: (_result, _error, productId) => [
        {
          type: "Reviews",

          id: productId,
        },
      ],
    }),

    //////////////////////////////////////////////////////////
    // GET RATING SUMMARY
    //////////////////////////////////////////////////////////

    getRatingSummary: builder.query<
      RatingSummaryResponse,
      string
    >({
      query: (productId) => ({
        url: `/api/reviews/product/${productId}/summary`,

        method: "GET",
      }),

      transformResponse: (
        response: RatingSummaryResponse
      ) => response,

      providesTags: (_result, _error, productId) => [
        {
          type: "ReviewSummary",

          id: productId,
        },
      ],
    }),

    //////////////////////////////////////////////////////////
    // CREATE REVIEW
    //////////////////////////////////////////////////////////

    createReview: builder.mutation<
      Review,
      CreateReviewPayload
    >({
      query: (data) => ({
        url: "/api/reviews",

        method: "POST",

        data,
      }),

      transformResponse: (
        response: ReviewResponse
      ) => response.review,

      invalidatesTags: (_result, _error, arg) => [
        {
          type: "Reviews",

          id: arg.productId,
        },

        {
          type: "ReviewSummary",

          id: arg.productId,
        },
      ],
    }),

    //////////////////////////////////////////////////////////
    // UPDATE REVIEW
    //////////////////////////////////////////////////////////

    updateReview: builder.mutation<
      Review,
      UpdateReviewPayload
    >({
      query: ({ id, data }) => ({
        url: `/api/reviews/${id}`,

        method: "PUT",

        data,
      }),

      transformResponse: (
        response: ReviewResponse
      ) => response.review,

      invalidatesTags: (_result, _error, arg) => [
        {
          type: "Reviews",

          id: arg.productId,
        },

        {
          type: "ReviewSummary",

          id: arg.productId,
        },
      ],
    }),

    //////////////////////////////////////////////////////////
    // DELETE REVIEW
    //////////////////////////////////////////////////////////

    deleteReview: builder.mutation<
      DeleteReviewResponse,
      DeleteReviewPayload
    >({
      query: ({ id }) => ({
        url: `/api/reviews/${id}`,

        method: "DELETE",
      }),

      invalidatesTags: (_result, _error, arg) => [
        {
          type: "Reviews",

          id: arg.productId,
        },

        {
          type: "ReviewSummary",

          id: arg.productId,
        },
      ],
    }),
  }),
});

//////////////////////////////////////////////////////////
// HOOKS
//////////////////////////////////////////////////////////

export const {
  useGetReviewsQuery,
  useGetRatingSummaryQuery,

  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;
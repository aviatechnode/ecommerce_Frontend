import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../api/axiosBaseQuery";

//////////////////////////////////////////////////////////
// TYPES (MATCHING BACKEND + PRISMA SAFETY)
//////////////////////////////////////////////////////////

export interface FeedbackPayload {
  userName?: string | null;
  email: string;
  phoneNumber?: string | null;
  productName: string;
  productNumber?: string | null;
  usageDuration?: string | null;
  buyAgain?: string | null;
  buyingExperience?: number;
  concern?: string | null;
  ratings: {
    criteria: string;
    score: number;
  }[];
}

//////////////////////////////////////////////////////////
// API
//////////////////////////////////////////////////////////

export const feedbackApi = createApi({
  reducerPath: "feedbackApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Feedback"],

  endpoints: (builder) => ({
    createFeedback: builder.mutation<any, FeedbackPayload>({
      query: (body) => ({
        url: "/api/feedback",
        method: "POST",
        data: {
          // normalize undefined → null (VERY IMPORTANT for Prisma + exactOptionalPropertyTypes)
          userName: body.userName ?? null,
          email: body.email,
          phoneNumber: body.phoneNumber ?? null,
          productName: body.productName,
          productNumber: body.productNumber ?? null,
          usageDuration: body.usageDuration ?? null,
          buyAgain: body.buyAgain ?? null,
          buyingExperience: body.buyingExperience ?? 0,
          concern: body.concern ?? null,
          ratings: body.ratings,
        },
      }),
      invalidatesTags: ["Feedback"],
    }),
  }),
});

//////////////////////////////////////////////////////////
// HOOKS
//////////////////////////////////////////////////////////

export const { useCreateFeedbackMutation } = feedbackApi;
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../api/axiosBaseQuery";

import type {
  ConversationResponse,
  MessagesResponse,
  MessageResponse,
  CreateConversationPayload,
  CreateFitmentConversationPayload,
  SendMessagePayload,
  EditMessagePayload,
  DeleteMessagePayload,
  AssignConversationPayload,
  ChangeConversationPriorityPayload,
  ChangeConversationStatusPayload,
  AddParticipantPayload,
  RemoveParticipantPayload,
  MuteParticipantPayload,
  AddTagPayload,
  RemoveTagPayload,
} from "../types/chat.types"

type GetMessagesArgs = {
  conversationId: string;
  limit?: number;
  cursor?: string | null;
};

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: axiosBaseQuery(),

  tagTypes: [
    "Conversation",
    "Message",
    "Participant",
    "Tag",
  ],

  endpoints: (builder) => ({
    createConversation: builder.mutation<
      ConversationResponse,
      CreateConversationPayload
    >({
      query: (body) => ({
        url: "/api/chat/conversations",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Conversation"],
    }),

    createFitmentConversation: builder.mutation<
      ConversationResponse,
      CreateFitmentConversationPayload
    >({
      query: (body) => ({
        url: "/api/chat/conversations/fitment",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Conversation"],
    }),

    getConversation: builder.query<
      ConversationResponse,
      string
    >({
      query: (conversationId) => ({
        url: `/api/chat/conversations/${conversationId}`,
      }),
      providesTags: (_, __, id) => [
        { type: "Conversation", id },
      ],
    }),

    getMessages: builder.query<
      MessagesResponse,
      GetMessagesArgs
    >({
      query: ({ conversationId, limit, cursor }) => ({
        url: `/api/chat/conversations/${conversationId}/messages`,
        params: {
          limit,
          cursor,
        },
      }),
      providesTags: ["Message"],
    }),

    sendMessage: builder.mutation<
      MessageResponse,
      SendMessagePayload
    >({
      query: (body) => ({
        url: "/api/chat/messages",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Message"],
    }),

    editMessage: builder.mutation<
      MessageResponse,
      EditMessagePayload
    >({
      query: (body) => ({
        url: "/api/chat/messages",
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Message"],
    }),

    deleteMessage: builder.mutation<
      { success: boolean },
      DeleteMessagePayload
    >({
      query: (body) => ({
        url: "/api/chat/messages",
        method: "DELETE",
        data: body,
      }),
      invalidatesTags: ["Message"],
    }),

    assignConversation: builder.mutation<
      ConversationResponse,
      AssignConversationPayload
    >({
      query: (body) => ({
        url: "/api/chat/conversations/assign",
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Conversation"],
    }),

    changeStatus: builder.mutation<
      ConversationResponse,
      ChangeConversationStatusPayload
    >({
      query: (body) => ({
        url: "/api/chat/conversations/status",
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Conversation"],
    }),

    changePriority: builder.mutation<
      ConversationResponse,
      ChangeConversationPriorityPayload
    >({
      query: (body) => ({
        url: "/api/chat/conversations/priority",
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Conversation"],
    }),

    addParticipant: builder.mutation<
      ConversationResponse,
      AddParticipantPayload
    >({
      query: (body) => ({
        url: "/api/chat/participants",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Participant"],
    }),

    removeParticipant: builder.mutation<
      ConversationResponse,
      RemoveParticipantPayload
    >({
      query: (body) => ({
        url: "/api/chat/participants",
        method: "DELETE",
        data: body,
      }),
      invalidatesTags: ["Participant"],
    }),

    muteParticipant: builder.mutation<
      ConversationResponse,
      MuteParticipantPayload
    >({
      query: (body) => ({
        url: "/api/chat/participants/mute",
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Participant"],
    }),

    addTag: builder.mutation<
      ConversationResponse,
      AddTagPayload
    >({
      query: (body) => ({
        url: "/api/chat/tags",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Tag"],
    }),

    removeTag: builder.mutation<
      ConversationResponse,
      RemoveTagPayload
    >({
      query: (body) => ({
        url: "/api/chat/tags",
        method: "DELETE",
        data: body,
      }),
      invalidatesTags: ["Tag"],
    }),
  }),
});

export const {
  // Conversations
  useCreateConversationMutation,
  useCreateFitmentConversationMutation,
  useGetConversationQuery,

  // Messages
  useGetMessagesQuery,
  useSendMessageMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,

  // Conversation management
  useAssignConversationMutation,
  useChangeStatusMutation,
  useChangePriorityMutation,

  // Participants
  useAddParticipantMutation,
  useRemoveParticipantMutation,
  useMuteParticipantMutation,

  // Tags
  useAddTagMutation,
  useRemoveTagMutation,
} = chatApi;
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useGetConversationQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
} from "../services/chatApi";

import { chatSocket } from "../lib/chat.socket";

import type {
  ChatUser,
  EditMessagePayload,
  Message,
  SendMessagePayload,
} from "../types/chat.types";

interface UseChatOptions {
  limit?: number;
  cursor?: string |null;
}

export const useChat = (
  conversationId: string,
  options?: UseChatOptions
) => {
  const limit = options?.limit;
  const cursor = options?.cursor ?? null;

  /*************************************************
   * Queries
   *************************************************/

  const conversationQuery =
    useGetConversationQuery(conversationId, {
      skip: !conversationId,
    });

  const messagesQuery =
    useGetMessagesQuery(
      {
        conversationId,
        limit,
        cursor,
      },
      {
        skip: !conversationId,
      }
    );

  /*************************************************
   * Mutations
   *************************************************/

  const [sendMutation, sendState] =
    useSendMessageMutation();

  const [editMutation, editState] =
    useEditMessageMutation();

  const [deleteMutation, deleteState] =
    useDeleteMessageMutation();

  /*************************************************
   * Local UI State
   *************************************************/

  const [replyingTo, setReplyingTo] =
    useState<Message | null>(null);

  const [editingMessage, setEditingMessage] =
    useState<Message | null>(null);

  const [typingUsers, setTypingUsers] =
    useState<ChatUser[]>([]);

  /*************************************************
   * Join / Leave Conversation
   *************************************************/

  useEffect(() => {
    if (!conversationId) return;

    chatSocket.joinConversation(
      conversationId
    );

    return () => {
      chatSocket.leaveConversation(
        conversationId
      );
    };
  }, [conversationId]);

  /*************************************************
   * Typing listeners
   *************************************************/

  useEffect(() => {
    const unsubscribe =
      chatSocket.onTyping(
        (payload, typing) => {
          if (
            payload.conversationId !==
            conversationId
          ) {
            return;
          }

          setTypingUsers((prev) => {
            if (typing) {
              if (
                prev.some(
                  (u) =>
                    u.id ===
                    payload.userId
                )
              ) {
                return prev;
              }

              return [
                ...prev,
                {
                  id: payload.userId,
                },
              ];
            }

            return prev.filter(
              (u) =>
                u.id !== payload.userId
            );
          });
        }
      );

    return unsubscribe;
  }, [conversationId]);

  /*************************************************
   * Actions
   *************************************************/

  const sendMessage = useCallback(
    async (
      payload: Omit<
        SendMessagePayload,
        "conversationId"
      >
    ) => {
      const result =
        await sendMutation({
          conversationId,
          ...payload,
        });

      setReplyingTo(null);

      return result;
    },
    [conversationId, sendMutation]
  );

  const editMessage = useCallback(
    async (
      payload: EditMessagePayload
    ) => {
      const result =
        await editMutation(payload);

      setEditingMessage(null);

      return result;
    },
    [editMutation]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      return deleteMutation({
        messageId,
      });
    },
    [deleteMutation]
  );

  const startTyping =
    useCallback(() => {
      chatSocket.startTyping(
        conversationId
      );
    }, [conversationId]);

  const stopTyping =
    useCallback(() => {
      chatSocket.stopTyping(
        conversationId
      );
    }, [conversationId]);

  const markRead = useCallback(
    (messageId: string) => {
      chatSocket.markRead(
        conversationId,
        messageId
      );
    },
    [conversationId]
  );

  /*************************************************
   * Derived State
   *************************************************/

  const conversation =
    conversationQuery.data?.data ??
    null;

  const messages =
    messagesQuery.data?.data ?? [];

  const isLoading =
    conversationQuery.isLoading ||
    messagesQuery.isLoading;

  const isFetching =
    conversationQuery.isFetching ||
    messagesQuery.isFetching;

  const isSending =
    sendState.isLoading;

  const isEditing =
    editState.isLoading;

  const isDeleting =
    deleteState.isLoading;

  const hasMessages =
    messages.length > 0;

  const latestMessage =
    useMemo(() => {
      if (!messages.length) {
        return null;
      }

      return messages[
        messages.length - 1
      ];
    }, [messages]);

  /*************************************************
   * Return
   *************************************************/

  return {
    conversation,

    messages,

    latestMessage,

    hasMessages,

    typingUsers,

    isLoading,

    isFetching,

    isSending,

    isEditing,

    isDeleting,

    replyingTo,

    setReplyingTo,

    editingMessage,

    setEditingMessage,

    sendMessage,

    editMessage,

    deleteMessage,

    startTyping,

    stopTyping,

    markRead,

    refetchConversation:
      conversationQuery.refetch,

    refetchMessages:
      messagesQuery.refetch,
  };
};
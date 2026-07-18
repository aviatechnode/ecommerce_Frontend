import { io, Socket } from "socket.io-client";

import { store } from "../admin/store/store";
import { chatApi } from "../services/chatApi";

import type {
  Message,
  TypingEvent,
  ReadReceiptEvent,
  StatusChangedEvent,
  PriorityChangedEvent,
} from "../types/chat.types";

type TypingListener = (
  payload: TypingEvent,
  typing: boolean
) => void;

class ChatSocket {
  private socket: Socket |null = null;

  private initialized = false;

  /**
   * Subscribers interested in typing events.
   */
  private typingListeners = new Set<TypingListener>();

  /**
   * Initialize socket once for the entire application.
   * Call this after the user logs in.
   */
  initialize(token?: string) {
    if (this.initialized) return;

    this.socket = io(import.meta.env.VITE_API_URL, {
      transports: ["websocket"],
      auth: {
        token,
      },
      autoConnect: true,
    });

    this.registerListeners();

    this.initialized = true;
  }

  /**
   * Disconnect when logging out.
   */
  destroy() {
    this.socket?.disconnect();
    this.socket = null;
    this.initialized = false;
    this.typingListeners.clear();
  }

  get connected() {
    return this.socket?.connected ?? false;
  }

  /**
   * Subscribe to typing events.
   */
  onTyping(listener: TypingListener) {
    this.typingListeners.add(listener);

    return () => {
      this.typingListeners.delete(listener);
    };
  }

  private emitTyping(
    payload: TypingEvent,
    typing: boolean
  ) {
    this.typingListeners.forEach((listener) =>
      listener(payload, typing)
    );
  }

  private registerListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Chat socket connected");
    });

    this.socket.on("disconnect", () => {
      console.log("Chat socket disconnected");
    });

    /**
     * NEW MESSAGE
     */
    this.socket.on(
      "message.created",
      (message: Message) => {
        store.dispatch(
          chatApi.util.updateQueryData(
            "getMessages",
            {
              conversationId:
                message.conversationId,
            },
            (draft) => {
              draft.data.push(message);
            }
          )
        );

        store.dispatch(
          chatApi.util.invalidateTags([
            {
              type: "Conversation",
              id: message.conversationId,
            },
          ])
        );
      }
    );

    /**
     * MESSAGE UPDATED
     */
    this.socket.on(
      "message.updated",
      (message: Message) => {
        store.dispatch(
          chatApi.util.updateQueryData(
            "getMessages",
            {
              conversationId:
                message.conversationId,
            },
            (draft) => {
              const index =
                draft.data.findIndex(
                  (m) => m.id === message.id
                );

              if (index !== -1) {
                draft.data[index] = message;
              }
            }
          )
        );
      }
    );

    /**
     * MESSAGE DELETED
     */
    this.socket.on(
      "message.deleted",
      ({
        conversationId,
        messageId,
      }: {
        conversationId: string;
        messageId: string;
      }) => {
        store.dispatch(
          chatApi.util.updateQueryData(
            "getMessages",
            {
              conversationId,
            },
            (draft) => {
              draft.data =
                draft.data.filter(
                  (m) => m.id !== messageId
                );
            }
          )
        );
      }
    );

    /**
     * READ RECEIPTS
     */
    this.socket.on(
      "message.read",
      (payload: ReadReceiptEvent) => {
        store.dispatch(
          chatApi.util.updateQueryData(
            "getMessages",
            {
              conversationId:
                payload.conversationId,
            },
            (draft) => {
              const message =
                draft.data.find(
                  (m) =>
                    m.id === payload.messageId
                );

              if (message) {
                message.deliveryStatus =
                  "READ";
                message.readAt =
                  new Date().toISOString();
              }
            }
          )
        );
      }
    );

    /**
     * TYPING
     */
    this.socket.on(
      "typing.start",
      (payload: TypingEvent) => {
        this.emitTyping(payload, true);
      }
    );

    this.socket.on(
      "typing.stop",
      (payload: TypingEvent) => {
        this.emitTyping(payload, false);
      }
    );

    /**
     * STATUS CHANGED
     */
    this.socket.on(
      "conversation.status",
      (payload: StatusChangedEvent) => {
        store.dispatch(
          chatApi.util.invalidateTags([
            {
              type: "Conversation",
              id: payload.conversationId,
            },
          ])
        );
      }
    );

    /**
     * PRIORITY CHANGED
     */
    this.socket.on(
      "conversation.priority",
      (payload: PriorityChangedEvent) => {
        store.dispatch(
          chatApi.util.invalidateTags([
            {
              type: "Conversation",
              id: payload.conversationId,
            },
          ])
        );
      }
    );
  }

  /**
   * Room management
   */
  joinConversation(conversationId: string) {
    this.socket?.emit(
      "conversation.join",
      {
        conversationId,
      }
    );
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit(
      "conversation.leave",
      {
        conversationId,
      }
    );
  }

  /**
   * Typing
   */
  startTyping(conversationId: string) {
    this.socket?.emit("typing.start", {
      conversationId,
    });
  }

  stopTyping(conversationId: string) {
    this.socket?.emit("typing.stop", {
      conversationId,
    });
  }

  /**
   * Read receipts
   */
  markRead(
    conversationId: string,
    messageId: string
  ) {
    this.socket?.emit("message.read", {
      conversationId,
      messageId,
    });
  }
}

export const chatSocket = new ChatSocket();
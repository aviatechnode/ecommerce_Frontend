import { create } from "zustand";
import { api } from "../api/axios";


export interface Message {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  createdAt: string;
}

interface ChatState {
  activeConversationId: string | null;
  messages: Record<string, Message[]>;

  setActiveConversation: (id: string) => void;

  fetchMessages: (conversationId: string) => Promise<void>;

  sendMessage: (conversationId: string, content: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: null,
  messages: {},

  setActiveConversation: (id) => {
    set({ activeConversationId: id });
  },

  fetchMessages: async (conversationId) => {
    const { data } = await api.get(
      `/api/chats/conversations/${conversationId}/messages`
    );

    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: data.messages,
      },
    }));
  },

  sendMessage: async (conversationId, content) => {
    await api.post(
      `/api/chats/conversations/${conversationId}/messages`,
      { content }
    );
  },
}));
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface TypingUsersState {
  [conversationId: string]: string[];
}

interface ChatRealtimeState {
  connected: boolean;

  activeConversationId: string | null;

  typingUsers: TypingUsersState;

  onlineUsers: string[];
}

const initialState: ChatRealtimeState = {
  connected: false,

  activeConversationId: null,

  typingUsers: {},

  onlineUsers: [],
};

const chatSlice = createSlice({
  name: "chat",

  initialState,

  reducers: {
    socketConnected(state) {
      state.connected = true;
    },

    socketDisconnected(state) {
      state.connected = false;

      // Connection lost
      state.typingUsers = {};

      state.onlineUsers = [];
    },

    setActiveConversation(
      state,
      action: PayloadAction<string | null>
    ) {
      state.activeConversationId =
        action.payload;
    },

    userStartedTyping(
      state,
      action: PayloadAction<{
        conversationId: string;
        userId: string;
      }>
    ) {
      const {
        conversationId,
        userId,
      } = action.payload;

      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }

      if (
        !state.typingUsers[
          conversationId
        ].includes(userId)
      ) {
        state.typingUsers[
          conversationId
        ].push(userId);
      }
    },

    userStoppedTyping(
      state,
      action: PayloadAction<{
        conversationId: string;
        userId: string;
      }>
    ) {
      const {
        conversationId,
        userId,
      } = action.payload;

      const users =
        state.typingUsers[conversationId];

      if (!users) return;

      state.typingUsers[conversationId] =
        users.filter(
          (id) => id !== userId
        );

      if (
        state.typingUsers[conversationId]
          .length === 0
      ) {
        delete state.typingUsers[
          conversationId
        ];
      }
    },

    clearConversationTyping(
      state,
      action: PayloadAction<string>
    ) {
      delete state.typingUsers[
        action.payload
      ];
    },

    setOnlineUsers(
      state,
      action: PayloadAction<string[]>
    ) {
      state.onlineUsers =
        action.payload;
    },
  },
});

export const {
  socketConnected,
  socketDisconnected,
  setActiveConversation,
  userStartedTyping,
  userStoppedTyping,
  clearConversationTyping,
  setOnlineUsers,
} = chatSlice.actions;

export default chatSlice.reducer;
import { useEffect } from "react";
import { chatSocket } from "../lib/chat.socket";
import { useChatStore } from "./chat.store";

export function useChatRealtime() {
  useEffect(() => {
    chatSocket.on("NEW_MESSAGE", (message: any) => {
      const convId = message.conversationId;

      useChatStore.setState((state) => ({
        messages: {
          ...state.messages,
          [convId]: [
            ...(state.messages[convId] || []),
            message,
          ],
        },
      }));
    });

    chatSocket.on("TYPING", (data: any) => {
      // optional UI hook
      console.log("typing:", data);
    });
  }, []);
}
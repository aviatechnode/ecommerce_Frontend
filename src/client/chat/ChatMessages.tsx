import { useEffect, useRef } from "react";

import type {
  ChatUser,
  Message,
} from "../../types/chat.types";

import { MessageBubble } from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

interface ChatMessagesProps {
  loading?: boolean;

  messages: Message[];

  typingUsers?: ChatUser[];

  onReply?: (
    message: Message
  ) => void;

  onEdit?: (
    message: Message
  ) => void;

  onDelete?: (
    messageId: string
  ) => void | Promise<unknown>;
}

export const ChatMessages = ({
  messages,
  loading = false,
  typingUsers = [],
  onReply,
  onEdit,
  onDelete,
}: ChatMessagesProps) => {
  const bottomRef =
    useRef<HTMLDivElement>(null);

  /**
   * Auto scroll to newest message.
   */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typingUsers]);

  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          padding: 16,
          overflowY: "auto",
        }}
      >
        Loading messages...
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
        }}
      >
        No messages yet.

        <TypingIndicator
          users={typingUsers}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      <TypingIndicator
        users={typingUsers}
      />

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
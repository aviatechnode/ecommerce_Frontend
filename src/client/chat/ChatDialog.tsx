import { useEffect } from "react";

import { useChat } from "../../hook/useChat";

import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import ChatInput from "./ChatInput";

interface ChatDialogProps {
  conversationId: string;
  open: boolean;
  onClose: () => void;
  className?: string;
}

export const ChatDialog = ({
  conversationId,
  open,
  onClose,
  className,
}: ChatDialogProps) => {
  const {
    conversation,
    messages,
    typingUsers,

    isLoading,
    isFetching,
    isSending,

    replyingTo,
    editingMessage,

    setReplyingTo,
    setEditingMessage,

    sendMessage,
    editMessage,
    deleteMessage,

    startTyping,
    stopTyping,
    markRead,
  } = useChat(conversationId);

  useEffect(() => {
    if (!messages.length) return;

    const latest = messages[messages.length - 1];

    if (latest.deliveryStatus !== "READ") {
      markRead(latest.id);
    }
  }, [messages, markRead]);

  if (!open) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        position: "fixed",
        bottom: 90,
        right: 24,
        width: 380,
        height: 600,
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,.18)",
        display: "flex",
        flexDirection: "column",
        zIndex: 999,
      }}
    >
      <ChatHeader
        conversation={conversation}
        loading={isLoading}
        onClose={onClose}
      />

      <ChatMessages
        loading={isLoading || isFetching}
        messages={messages}
        typingUsers={typingUsers}
        onReply={setReplyingTo}
        onEdit={setEditingMessage}
        onDelete={deleteMessage}
      />

      <ChatInput
        loading={isSending}
        replyingTo={replyingTo}
        editingMessage={editingMessage}
        onCancelReply={() => setReplyingTo(null)}
        onCancelEdit={() => setEditingMessage(null)}
        onTyping={startTyping}
        onStopTyping={stopTyping}
        onSend={sendMessage}
        onEdit={editMessage}
      />
    </div>
  );
};

export default ChatDialog;
import type { Message } from "../../types/chat.types";

import { MessageActions } from "./MessageActions";
import { MessageAttachments } from "./MessageAttachments";

interface MessageBubbleProps {
  message: Message;

  onReply?: (message: Message) => void;

  onEdit?: (message: Message) => void;

  onDelete?: (messageId: string) => void | Promise<unknown>;
}

export const MessageBubble = ({
  message,
  onReply,
  onEdit,
  onDelete,
}: MessageBubbleProps) => {
  const senderName =
    message.sender?.name ??
    message.sender?.email ??
    "Unknown";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 12,
        background: "#fff",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <strong>{senderName}</strong>

        <small
          style={{
            color: "#6b7280",
          }}
        >
          {new Date(message.createdAt).toLocaleString()}
        </small>
      </div>

      {/* Reply Preview */}
      {message.replyTo && (
        <div
          style={{
            padding: 8,
            background: "#f3f4f6",
            borderLeft: "3px solid #2563eb",
            borderRadius: 4,
            fontSize: 13,
            color: "#4b5563",
          }}
        >
          {message.replyTo.content}
        </div>
      )}

      {/* Message Body */}
      {message.content && (
        <div
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message.content}
        </div>
      )}

      {/* Attachments */}
      {message.attachments.length > 0 && (
        <MessageAttachments
          attachments={message.attachments}
        />
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            fontSize: 12,
            color: "#6b7280",
          }}
        >
          {message.isEdited && (
            <span>(edited)</span>
          )}

          <span>{message.deliveryStatus}</span>

          {message.isInternal && (
            <span
              style={{
                color: "#dc2626",
              }}
            >
              Internal
            </span>
          )}
        </div>

        <MessageActions
        message={message}
        onReply={onReply}
        onEdit={onEdit}
        onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default MessageBubble;
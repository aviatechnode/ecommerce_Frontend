import type { Message } from "../../types/chat.types";

interface MessageActionsProps {
  message: Message;

  onReply?: (message: Message) => void;

  onEdit?: (message: Message) => void;

  onDelete?: (messageId: string) => void;

  disabled?: boolean;
}

export const MessageActions = ({
  message,
  onReply,
  onEdit,
  onDelete,
  disabled = false,
}: MessageActionsProps) => {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        marginTop: 8,
        flexWrap: "wrap",
      }}
    >
      {onReply && (
        <button
          disabled={disabled}
          onClick={() => onReply(message)}
        >
          Reply
        </button>
      )}

      {onEdit && !message.deletedAt && (
        <button
          disabled={disabled}
          onClick={() => onEdit(message)}
        >
          Edit
        </button>
      )}

      {onDelete && !message.deletedAt && (
        <button
          disabled={disabled}
          onClick={() => {
            const confirmed = window.confirm(
              "Delete this message?"
            );

            if (confirmed) {
              onDelete(message.id);
            }
          }}
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default MessageActions;
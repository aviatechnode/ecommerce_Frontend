import type { Conversation } from "../../types/chat.types";

interface ChatHeaderProps {
  conversation: Conversation | null;

  loading?: boolean;

  onClose?: () => void;

  onAssign?: () => void;

  onChangeStatus?: () => void;

  onChangePriority?: () => void;
}

const statusColor: Record<string, string> = {
  OPEN: "#16a34a",
  PENDING: "#d97706",
  WAITING_FOR_CUSTOMER: "#2563eb",
  WAITING_FOR_SUPPORT: "#7c3aed",
  RESOLVED: "#059669",
  CLOSED: "#6b7280",
};

const priorityColor: Record<string, string> = {
  LOW: "#6b7280",
  NORMAL: "#2563eb",
  HIGH: "#ea580c",
  URGENT: "#dc2626",
};

export const ChatHeader = ({
  conversation,
  loading = false,
  onClose,
  onAssign,
  onChangeStatus,
  onChangePriority,
}: ChatHeaderProps) => {
  if (loading) {
    return (
      <header
        style={{
          padding: 16,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        Loading conversation...
      </header>
    );
  }

  if (!conversation) {
    return (
      <header
        style={{
          padding: 16,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        Conversation not found.
      </header>
    );
  }

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottom: "1px solid #e5e7eb",
        gap: 16,
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          {conversation.subject || "Conversation"}
        </h3>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              padding: "4px 8px",
              borderRadius: 999,
              background: statusColor[conversation.status],
              color: "#fff",
              fontSize: 12,
            }}
          >
            {conversation.status}
          </span>

          <span
            style={{
              padding: "4px 8px",
              borderRadius: 999,
              background: priorityColor[conversation.priority],
              color: "#fff",
              fontSize: 12,
            }}
          >
            {conversation.priority}
          </span>

          <span
            style={{
              padding: "4px 8px",
              borderRadius: 999,
              background: "#f3f4f6",
              fontSize: 12,
            }}
          >
            {conversation.channel}
          </span>

          {conversation.participants && (
            <span
              style={{
                padding: "4px 8px",
                borderRadius: 999,
                background: "#f3f4f6",
                fontSize: 12,
              }}
            >
              {conversation.participants.length} participant
              {conversation.participants.length !== 1 && "s"}
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
        }}
      >
        {onAssign && (
          <button onClick={onAssign}>
            Assign
          </button>
        )}

        {onChangeStatus && (
          <button onClick={onChangeStatus}>
            Status
          </button>
        )}

        {onChangePriority && (
          <button onClick={onChangePriority}>
            Priority
          </button>
        )}

        {onClose && (
          <button onClick={onClose}>
            ✕
          </button>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
import type { ChatUser } from "../../types/chat.types";

interface TypingIndicatorProps {
  users?: ChatUser[];
}

export const TypingIndicator = ({
  users = [],
}: TypingIndicatorProps) => {
  if (!users.length) {
    return null;
  }

  const names = users
    .map((user) => user.name || "Someone")
    .join(", ");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        fontSize: 13,
        color: "#6b7280",
      }}
    >
      <span>{names} typing</span>

      <span
        style={{
          display: "flex",
          gap: 3,
        }}
      >
        <span>•</span>
        <span>•</span>
        <span>•</span>
      </span>
    </div>
  );
};

export default TypingIndicator;
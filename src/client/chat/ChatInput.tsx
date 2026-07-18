import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

import type {
  EditMessagePayload,
  Message,
  SendMessagePayload,
} from "../../types/chat.types";

interface ChatInputProps {
  loading?: boolean;
  replyingTo?: Message | null;
  editingMessage?: Message | null;

  onCancelReply?: () => void;
  onCancelEdit?: () => void;

  onTyping?: () => void;
  onStopTyping?: () => void;

  onSend: (
    payload: Omit<
      SendMessagePayload,
      "conversationId" | "senderId"
    >
  ) => Promise<unknown> | void;

  onEdit: (
    payload: EditMessagePayload
  ) => Promise<unknown> | void;
}

export const ChatInput = ({
  loading = false,
  replyingTo,
  editingMessage,
  onCancelReply,
  onCancelEdit,
  onTyping,
  onStopTyping,
  onSend,
  onEdit,
}: ChatInputProps) => {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] =
    useState<File[]>([]);
  const [isInternal, setIsInternal] =
    useState(false);

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  const typingTimeout = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  useEffect(() => {
    if (!editingMessage) return;

    setContent(
      editingMessage.content ?? ""
    );

    textareaRef.current?.focus();
  }, [editingMessage]);

  useEffect(() => {
    return () => {
      if (typingTimeout.current) {
        clearTimeout(
          typingTimeout.current
        );
      }
    };
  }, []);

  const triggerTyping = () => {
    onTyping?.();

    if (typingTimeout.current) {
      clearTimeout(
        typingTimeout.current
      );
    }

    typingTimeout.current =
      setTimeout(() => {
        onStopTyping?.();
      }, 2000);
  };

  const handleContentChange = (
    e: ChangeEvent<HTMLTextAreaElement>
  ) => {
    setContent(e.target.value);
    triggerTyping();
  };

  const handleFiles = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;

    setAttachments(
      Array.from(e.target.files)
    );
  };

  const reset = () => {
    setContent("");
    setAttachments([]);
    setIsInternal(false);

    if (typingTimeout.current) {
      clearTimeout(
        typingTimeout.current
      );
    }

    onStopTyping?.();
  };

  const submit = async () => {
    if (
      !content.trim() &&
      attachments.length === 0
    ) {
      return;
    }

    if (editingMessage) {
      await onEdit({
        messageId: editingMessage.id,
        content,
      });

      reset();
      onCancelEdit?.();
      return;
    }

    await onSend({
      content,
      replyToId: replyingTo?.id,
      attachments,
      isInternal,
    });

    reset();
    onCancelReply?.();
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      void submit();
    }
  };

  return (
    <div
      style={{
        borderTop: "1px solid #e5e7eb",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {replyingTo && (
        <div
          style={{
            padding: 10,
            background: "#f3f4f6",
            borderLeft:
              "4px solid #2563eb",
            borderRadius: 6,
          }}
        >
          <strong>
            Replying to{" "}
            {replyingTo.sender?.name ??
              "Unknown"}
          </strong>

          <div
            style={{
              fontSize: 13,
              color: "#6b7280",
              marginTop: 4,
            }}
          >
            {replyingTo.content}
          </div>

          <button
            onClick={onCancelReply}
          >
            Cancel
          </button>
        </div>
      )}

      {editingMessage && (
        <div
          style={{
            padding: 10,
            background: "#fef3c7",
            borderLeft:
              "4px solid #f59e0b",
            borderRadius: 6,
          }}
        >
          Editing message

          <button
            onClick={onCancelEdit}
            style={{
              marginLeft: 12,
            }}
          >
            Cancel
          </button>
        </div>
      )}

      <textarea
        ref={textareaRef}
        rows={4}
        placeholder="Type a message..."
        value={content}
        onChange={
          handleContentChange
        }
        onKeyDown={
          handleKeyDown
        }
        disabled={loading}
        style={{
          resize: "vertical",
          padding: 12,
          borderRadius: 8,
          border:
            "1px solid #d1d5db",
          fontSize: 14,
        }}
      />

      {attachments.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {attachments.map((file) => (
            <div
              key={`${file.name}-${file.size}`}
              style={{
                padding:
                  "6px 10px",
                border:
                  "1px solid #ddd",
                borderRadius: 6,
                fontSize: 13,
              }}
            >
              {file.name}
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <input
            multiple
            type="file"
            onChange={
              handleFiles
            }
            disabled={
              loading
            }
          />

          <label>
            <input
              type="checkbox"
              checked={
                isInternal
              }
              onChange={(e) =>
                setIsInternal(
                  e.target.checked
                )
              }
            />{" "}
            Internal note
          </label>
        </div>

        <button
          disabled={loading}
          onClick={() =>
            void submit()
          }
        >
          {loading
            ? "Sending..."
            : editingMessage
            ? "Save"
            : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
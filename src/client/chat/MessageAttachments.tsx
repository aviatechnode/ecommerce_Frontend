import type { MessageAttachment } from "../../types/chat.types";

interface MessageAttachmentsProps {
  attachments?: MessageAttachment[];
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${
    sizes[i]
  }`;
};

const isImage = (mime?: string) =>
  mime?.startsWith("image/");

const isVideo = (mime?: string) =>
  mime?.startsWith("video/");

const isAudio = (mime?: string) =>
  mime?.startsWith("audio/");

export const MessageAttachments = ({
  attachments = [],
}: MessageAttachmentsProps) => {
  if (!attachments.length) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginTop: 8,
      }}
    >
      {attachments.map((attachment) => {
        if (isImage(attachment.mimeType)) {
          return (
            <img
              key={attachment.id}
              src={attachment.url}
              alt={attachment.filename}
              style={{
                maxWidth: 250,
                borderRadius: 8,
              }}
            />
          );
        }

        if (isVideo(attachment.mimeType)) {
          return (
            <video
              key={attachment.id}
              controls
              style={{
                maxWidth: 280,
                borderRadius: 8,
              }}
            >
              <source
                src={attachment.url}
                type={attachment.mimeType}
              />
            </video>
          );
        }

        if (isAudio(attachment.mimeType)) {
          return (
            <audio
              key={attachment.id}
              controls
            >
              <source
                src={attachment.url}
                type={attachment.mimeType}
              />
            </audio>
          );
        }

        return (
          <a
            key={attachment.id}
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              flexDirection: "column",
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 8,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <strong>{attachment.filename}</strong>

            <small>
              {formatBytes(attachment.size)}
            </small>
          </a>
        );
      })}
    </div>
  );
};

export default MessageAttachments;
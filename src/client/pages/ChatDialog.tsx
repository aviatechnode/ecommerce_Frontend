import { useEffect, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { api } from "../../api/axios";
import { chatSocket } from "../../lib/chat.socket";
import { formatRelativeTime } from "../../utils/date";

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  conversationId: string;
  content: string | null;
  senderId: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string | null;
  };
}

export function ChatDialog({ isOpen, onClose }: ChatDialogProps) {
  // ⚠️ assuming you already migrated auth elsewhere
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* =========================
     SCROLL TO BOTTOM
  ========================== */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =========================
     INIT CHAT
  ========================== */
  useEffect(() => {
    if (!isOpen || !user?.id) return;

    let mounted = true;

    const init = async () => {
      try {
        setLoading(true);

        const res = await api.get("/api/chats/conversations");

        let convo = res.data?.conversations?.[0];

        if (!convo) {
          const create = await api.post("/api/chats/conversations", {
            subject: "Support Chat",
            participants: [user.id],
          });

          convo = create.data?.conversation;
        }

        if (!mounted) return;

        setConversationId(convo.id);

        const msgs = await api.get(
          `/api/chats/conversations/${convo.id}/messages`
        );

        setMessages(msgs.data?.messages || []);
      } catch (err) {
        console.error("Chat init failed", err);
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [isOpen, user?.id]);

  /* =========================
     SOCKET LISTENERS
  ========================== */
  useEffect(() => {
    if (!conversationId) return;

    const handleMessage = (msg: Message) => {
      if (msg.conversationId !== conversationId) return;

      setMessages((prev) => {
        const exists = prev.some((m) => m.id === msg.id);
        if (exists) return prev;
        return [...prev, msg];
      });
    };

    const handleTyping = (data: any) => {
      if (data.conversationId !== conversationId) return;
      setTyping(!!data.isTyping);
    };

    chatSocket.on("NEW_MESSAGE", handleMessage);
    chatSocket.on("TYPING", handleTyping);

    return () => {
      chatSocket.off("NEW_MESSAGE", handleMessage);
      chatSocket.off("TYPING", handleTyping);
    };
  }, [conversationId]);

  /* =========================
     SEND MESSAGE
  ========================== */
  const sendMessage = async () => {
    if (!input.trim() || !conversationId || !user?.id) return;

    const text = input;
    setInput("");

    try {
      const res = await api.post(
        `/api/chats/conversations/${conversationId}/messages`,
        { content: text }
      );

      const message = res.data?.message;

      setMessages((prev) => [...prev, message]);

      chatSocket.send("MESSAGE", {
        conversationId,
        content: text,
        senderId: user.id,
      });
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  /* =========================
     TYPING EVENT
  ========================== */
  const handleTyping = (value: string) => {
    setInput(value);

    if (!conversationId || !user?.id) return;

    chatSocket.send("TYPING", {
      conversationId,
      isTyping: value.length > 0,
      senderId: user.id,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="w-[360px] h-[70vh] max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border">

        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 bg-green-600 text-white">
          <h2 className="text-sm font-semibold">Support Chat</h2>
          <button onClick={onClose}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 bg-gray-50 p-3 overflow-y-auto space-y-2">
          {loading && (
            <div className="text-xs text-gray-400 text-center">
              Loading chat...
            </div>
          )}

          {messages.map((msg) => {
            const isMe = msg.senderId === user?.id;

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                    isMe
                      ? "bg-green-600 text-white"
                      : "bg-white border text-gray-800"
                  }`}
                >
                  <div>{msg.content}</div>

                  <div className="text-[10px] opacity-60 mt-1">
                    {formatRelativeTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}

          {typing && (
            <div className="text-xs text-gray-400">
              Support is typing...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="p-3 border-t bg-white flex gap-2">
          <input
            value={input}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 text-sm px-3 py-2 border rounded-lg outline-none"
          />

          <button
            onClick={sendMessage}
            className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

import GlobalChatButton from "./GlobalChatButton";

interface FloatingActionsProps {
  conversationId?: string | null;
  unreadCount?: number;
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 500);
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }
      className="
        flex h-12 w-12 items-center justify-center
        rounded-full
        bg-green-600 text-white
        shadow-xl
        transition-all duration-300
        hover:scale-110
        hover:bg-green-700
        focus:outline-none
        focus:ring-2
        focus:ring-green-500
        focus:ring-offset-2
      "
      aria-label="Back to top"
    >
      <ArrowUp size={22} />
    </button>
  );
}

export default function FloatingActions({
  conversationId,
  unreadCount = 0,
}: FloatingActionsProps) {
  return (
    <div
      className="
        fixed
        bottom-6
        right-6
        z-50
        flex
        flex-col
        items-center
        gap-3
        rounded-2xl
        bg-white/10
        p-2
        backdrop-blur-md
      "
    >
      <GlobalChatButton
        conversationId={conversationId}
        unreadCount={unreadCount}
      />

      <BackToTop />
    </div>
  );
}
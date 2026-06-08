import { useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { ChatDialog } from './ChatDialog';

export function GlobalChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 p-3 bg-orange-500 text-white rounded-full cursor-pointer shadow-lg hover:bg-orange-600 z-50"
        aria-label="Open chat"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </button>

      <ChatDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
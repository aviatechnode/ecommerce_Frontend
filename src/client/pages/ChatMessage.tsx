import type { Message } from "../../types/chat.types";
import { CheckIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface Props {
  message: Message;
  isOwn: boolean;
}

export function ChatMessage({ message, isOwn }: Props) {
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const statusIcon = {
    sending: <ClockIcon className="h-3 w-3 text-gray-400 animate-pulse" />,
    sent: <CheckIcon className="h-3 w-3 text-gray-400" />,
    read: <CheckIcon className="h-3 w-3 text-blue-500" />,
    failed: <ExclamationCircleIcon className="h-3 w-3 text-red-500" />,
  }[message.status];

  return (
    <div className={`flex mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[80%] px-4 py-2 rounded-2xl text-sm
          ${isOwn ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'}
        `}
      >
        <div>{message.content}</div>
        <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${isOwn ? 'text-orange-100' : 'text-gray-500'}`}>
          <span>{time}</span>
          {isOwn && statusIcon}
        </div>
      </div>
    </div>
  );
}
export function ChatSkeleton() {
  return (
    <div className="flex-1 p-4 space-y-4 bg-gray-50 dark:bg-gray-900 animate-pulse">
      <div className="flex justify-start">
        <div className="w-3/4 h-10 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      </div>
      <div className="flex justify-end">
        <div className="w-1/2 h-10 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      </div>
      <div className="flex justify-start">
        <div className="w-2/3 h-10 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      </div>
      <div className="flex justify-end">
        <div className="w-3/4 h-10 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      </div>
      <div className="flex justify-start">
        <div className="w-1/2 h-10 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      </div>
    </div>
  );
}
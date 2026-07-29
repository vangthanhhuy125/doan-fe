'use client';

import { Bell, Loader2, Paperclip } from 'lucide-react';

interface NotificationsTabProps {
  loading: boolean;
  announcements: any[];
  onSelectNotif: (item: any) => void;
  formatDate: (d: string) => string;
}

export default function NotificationsTab({
  loading,
  announcements,
  onSelectNotif,
  formatDate,
}: NotificationsTabProps) {
  return (
    <div className="p-6 space-y-4">
      <h3 className="border-b pb-3 text-lg font-bold text-gray-800 flex items-center gap-2">
        <Bell size={20} className="text-[#0054a5]" /> Danh sách thông báo
      </h3>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#0054a5]" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          Chưa có thông báo nào.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {announcements.map((item) => (
            <div
              key={item._id}
              onClick={() => onSelectNotif(item)}
              className="flex cursor-pointer items-center justify-between p-4 rounded-xl transition-all hover:bg-blue-50/50 group"
            >
              <div className="flex items-center gap-3 pr-4">
                <div className="h-2 w-2 rounded-full bg-[#0054a5] shrink-0" />
                <p className="text-sm font-semibold text-gray-800 group-hover:text-[#0054a5] line-clamp-1">
                  {item.title}
                </p>
                {item.file && (
                  <Paperclip size={14} className="text-gray-400 shrink-0" />
                )}
              </div>
              <span className="text-xs text-gray-400 shrink-0 font-medium">
                {formatDate(item.posted_at || item.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
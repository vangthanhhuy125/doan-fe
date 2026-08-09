'use client';

import { Bell, Loader2, Paperclip } from 'lucide-react';

interface NotificationsTabProps {
  loading: boolean;
  announcements: any[];
  currentUserId: string;
  onSelectNotif: (item: any) => void;
  formatDate: (d: string) => string;
}

export default function NotificationsTab({
  loading,
  announcements,
  currentUserId,
  onSelectNotif,
  formatDate,
}: NotificationsTabProps) {
  return (
    <div className="p-6 space-y-4 text-black">
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
          {announcements.map((item) => {
            const notifId = item._id || item.id;
            const readByArr = Array.isArray(item.read_by) ? item.read_by : [];
            const isRead = readByArr.includes(currentUserId);

            return (
              <div
                key={notifId}
                onClick={() => onSelectNotif(item)}
                className={`flex cursor-pointer items-center justify-between p-4 rounded-xl transition-all group ${
                  isRead ? 'bg-gray-50/50 hover:bg-gray-100/60' : 'bg-blue-50/30 hover:bg-blue-50/80 font-bold'
                }`}
              >
                <div className="flex items-center gap-3 pr-4">
                  {/* CHẤM PHÂN BIỆT ĐÃ ĐỌC HOẶC CHƯA ĐỌC DỰA VÀO DATABASE */}
                  {isRead ? (
                    <div className="h-2 w-2 rounded-full bg-gray-300 shrink-0" />
                  ) : (
                    <div className="h-2.5 w-2.5 rounded-full bg-[#0054a5] shrink-0 shadow-sm" />
                  )}

                  <p className={`text-sm line-clamp-1 ${
                    isRead 
                      ? 'text-gray-500 font-normal group-hover:text-gray-800' 
                      : 'text-gray-900 font-black group-hover:text-[#0054a5]'
                  }`}>
                    {item.title}
                  </p>

                  {item.file && (
                    <Paperclip size={14} className="text-gray-400 shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-400 font-medium">
                    {formatDate(item.posted_at || item.createdAt)}
                  </span>
                  {isRead && (
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-200/70 px-2 py-0.5 rounded-full">
                      Đã đọc
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
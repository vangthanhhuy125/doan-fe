'use client';

import { Bell, X, Paperclip, Download, CheckCheck } from 'lucide-react';

interface AnnouncementModalProps {
  selectedNotif: any;
  onClose: () => void;
  formatDate: (d: string) => string;
  handleDownloadFile: (f: any) => void;
  onMarkAsRead?: (notifId: string) => void;
  isRead?: boolean;
}

export default function AnnouncementModal({
  selectedNotif,
  onClose,
  formatDate,
  handleDownloadFile,
  onMarkAsRead,
  isRead = false,
}: AnnouncementModalProps) {
  if (!selectedNotif) return null;

  const notifId = selectedNotif._id || selectedNotif.id;

  const handleMarkReadAndClose = () => {
    if (onMarkAsRead && notifId) {
      onMarkAsRead(notifId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-black">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in duration-300">
        <div className="bg-[#0054a5] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={20} />
            <h4 className="font-bold text-sm uppercase tracking-wider">Chi tiết thông báo</h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer border-none outline-none focus:outline-none bg-transparent text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-3 leading-snug">
            {selectedNotif.title}
          </h3>
          <p className="text-xs font-semibold text-gray-400">
            Ngày gửi: {formatDate(selectedNotif.posted_at || selectedNotif.createdAt)}
          </p>
          
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pt-2">
            {selectedNotif.content}
          </div>

          {selectedNotif.file && (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 truncate pr-2">
                <Paperclip size={16} className="text-[#0054a5]" />
                <span className="truncate">{selectedNotif.file.originalname}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDownloadFile(selectedNotif.file)}
                className="flex items-center gap-1 bg-[#0054a5] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer border-none outline-none focus:outline-none"
              >
                <Download size={14} /> Tải về
              </button>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 flex justify-end border-t border-gray-100">
          <button
            type="button"
            onClick={handleMarkReadAndClose}
            className={`px-6 py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none outline-none focus:outline-none focus:ring-0 flex items-center gap-2 shadow-sm ${
              isRead 
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                : 'bg-[#0054a5] hover:bg-blue-700 text-white shadow-blue-100'
            }`}
          >
            <CheckCheck size={16} />
            <span>{isRead ? 'Đã đọc (Đóng)' : 'Đánh dấu đã đọc'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
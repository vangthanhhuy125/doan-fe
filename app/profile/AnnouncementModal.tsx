'use client';

import { Bell, X, Paperclip, Download } from 'lucide-react';

interface AnnouncementModalProps {
  selectedNotif: any;
  onClose: () => void;
  formatDate: (d: string) => string;
  handleDownloadFile: (f: any) => void;
}

export default function AnnouncementModal({
  selectedNotif,
  onClose,
  formatDate,
  handleDownloadFile,
}: AnnouncementModalProps) {
  if (!selectedNotif) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in duration-300">
        <div className="bg-[#0054a5] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={20} />
            <h4 className="font-bold text-sm uppercase tracking-wider">Chi tiết thông báo</h4>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer border-none bg-transparent text-white"
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
                onClick={() => handleDownloadFile(selectedNotif.file)}
                className="flex items-center gap-1 bg-[#0054a5] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer border-none"
              >
                <Download size={14} /> Tải về
              </button>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 font-bold text-xs uppercase tracking-wider text-gray-700 rounded-xl transition-all cursor-pointer border-none"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
'use client';

import { Trash2, X } from 'lucide-react';

interface Props {
  title: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({ title, onClose, onConfirm }: Props) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-black">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-rose-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trash2 size={20} />
            <h4 className="font-bold text-sm uppercase tracking-wider">Xác nhận xóa phiếu khảo sát</h4>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors border-none bg-transparent text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-3 text-center">
          <p className="text-sm font-semibold text-gray-700">
            Bạn có chắc chắn muốn xóa phiếu khảo sát này không?
          </p>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-rose-700 text-sm">
            {title}
          </div>
          <p className="text-xs text-gray-400 italic">
            Lưu ý: Thao tác này không thể hoàn tác và toàn bộ kết quả khảo sát liên quan sẽ bị xóa vĩnh viễn.
          </p>
        </div>

        <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2 font-bold text-xs uppercase tracking-wider text-gray-500 hover:bg-gray-200 rounded-xl transition-all border-none bg-transparent cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border-none cursor-pointer shadow-lg shadow-rose-100"
          >
            Xóa phiếu
          </button>
        </div>
      </div>
    </div>
  );
}
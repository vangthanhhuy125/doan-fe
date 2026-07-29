'use client';

import { AlertTriangle } from 'lucide-react';

interface Props {
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({ onClose, onConfirm }: Props) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-red-100 text-black">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full mx-auto flex items-center justify-center">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-800">Xóa phiếu đăng ký?</h3>
            <p className="text-xs text-slate-500 leading-relaxed px-2">
              Bạn có chắc chắn muốn xóa phiếu này? Toàn bộ dữ liệu lượt đăng ký của sinh viên sẽ bị hủy.
            </p>
          </div>
        </div>
        <div className="flex p-4 gap-3 bg-slate-50">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-none bg-transparent font-bold text-slate-500 hover:bg-slate-200 rounded-2xl uppercase text-[11px] cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 border-none bg-red-600 text-white font-bold hover:bg-red-700 rounded-2xl uppercase text-[11px] shadow-lg cursor-pointer"
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
}
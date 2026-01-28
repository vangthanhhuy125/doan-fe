'use client';

import { Trash2, AlertTriangle } from "lucide-react";

interface Props {
  title: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmNoticeDelete({ title, onClose, onConfirm }: Props) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-red-100 animate-in zoom-in duration-300">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full mx-auto flex items-center justify-center shadow-inner">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Xác nhận xóa?</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed px-4">
              Bạn có chắc muốn xóa thông báo <span className="font-bold text-red-600">"{title}"</span>? 
            </p>
          </div>
        </div>
        <div className="flex p-4 gap-3 bg-slate-50">
          <button onClick={onClose} className="flex-1 py-3 px-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all uppercase text-[10px] tracking-widest">Hủy bỏ</button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 py-3 px-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
          >
            <Trash2 size={14} /> Xóa ngay
          </button>
        </div>
      </div>
    </div>
  );
}
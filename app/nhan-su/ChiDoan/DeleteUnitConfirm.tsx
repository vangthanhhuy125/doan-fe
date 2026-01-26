'use client';

import { Trash2, AlertCircle, X } from "lucide-react";

interface Props {
  unitName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteUnitConfirm({ unitName, onClose, onConfirm }: Props) {
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-red-50">
        <div className="p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full mx-auto flex items-center justify-center shadow-inner animate-bounce">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Xóa tập thể?</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed px-4">
              Má chắc chắn muốn xóa <span className="font-bold text-red-600">"{unitName}"</span> khỏi danh sách trực thuộc không?
            </p>
          </div>
        </div>
        <div className="flex p-6 gap-3 bg-slate-50">
          <button onClick={onClose} className="flex-1 py-3 px-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-200 transition-all uppercase text-[10px] tracking-widest">Hủy bỏ</button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 py-3 px-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
          >
            <Trash2 size={14} /> Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
}
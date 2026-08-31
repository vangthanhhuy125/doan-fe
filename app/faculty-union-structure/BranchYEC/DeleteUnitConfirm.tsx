'use client';

import { Trash2, AlertCircle } from "lucide-react";

interface Props {
  unitName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteUnitConfirm({ unitName, onClose, onConfirm }: Props) {
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200 text-black">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-rose-100">
        <div className="p-6 text-center space-y-3">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
            <AlertCircle size={28} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Xóa đơn vị này?</h3>
            <p className="text-xs text-slate-500 leading-relaxed px-2">
              Bạn có chắc chắn muốn xóa <br/>
              <span className="font-extrabold text-rose-600">"{unitName}"</span> khỏi danh sách trực thuộc?
            </p>
          </div>
        </div>

        <div className="flex p-4 gap-3 bg-slate-50 border-t border-slate-100">
          <button 
            type="button"
            onClick={onClose} 
            className="flex-1 py-2.5 px-4 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all uppercase text-xs tracking-wider border-none outline-none cursor-pointer"
          >
            Hủy
          </button>
          <button 
            type="button"
            onClick={() => { onConfirm(); onClose(); }} 
            className="flex-1 py-2.5 px-4 bg-rose-600 text-white rounded-xl font-bold shadow-md shadow-rose-200 hover:bg-rose-700 transition-all uppercase text-xs tracking-wider flex items-center justify-center gap-1.5 border-none outline-none cursor-pointer active:scale-95"
          >
            <Trash2 size={14} /> Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
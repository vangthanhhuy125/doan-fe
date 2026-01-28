'use client';

import { Trash2, X, AlertTriangle } from "lucide-react";

interface Props {
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subtitle?: string;
}

export default function ConfirmPartyDelete({ onClose, onConfirm, title, subtitle }: Props) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-red-100 animate-in zoom-in duration-300">
        <div className="p-8 text-center space-y-4 text-black">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
            <AlertTriangle size={40} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Xác nhận gỡ tên?</h3>
            <p className="text-sm text-slate-500 leading-relaxed px-2">
              Bạn có chắc chắn muốn gỡ đồng chí <br/>
              <span className="font-bold text-red-600">"{title}"</span> <br/>
              khỏi danh sách {subtitle}?
            </p>
          </div>
        </div>

        <div className="flex p-6 gap-3 bg-slate-50">
          <button 
            onClick={onClose}
            className="flex-1 py-4 px-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-200 transition-all uppercase text-[11px] tracking-widest border-none outline-none"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-4 px-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 border-none outline-none"
          >
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}
'use client';

import { X, Save, Award, Link as LinkIcon, Trash2, AlertCircle, Calendar } from "lucide-react";

export default function BangDiemModal({ mode, data, onClose, onConfirmDelete }: any) {
  if (mode === 'delete') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200 text-black">
        <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden border border-red-50">
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full mx-auto flex items-center justify-center shadow-inner">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Xóa hoạt động?</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed px-4">
                Bạn chắc chắn muốn xóa <span className="font-bold text-red-600">"{data?.name}"</span>?
              </p>
            </div>
          </div>
          <div className="flex p-6 gap-3 bg-slate-50">
            <button 
              onClick={onClose} 
              className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-400 hover:bg-slate-200 transition-all uppercase text-[10px] tracking-widest text-black [text-decoration:none] border-none outline-none"
            >
              Hủy
            </button>
            <button 
              onClick={() => { onConfirmDelete(data.id); onClose(); }}
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 [text-decoration:none] border-none outline-none"
            >
              <Trash2 size={14} /> Xác nhận xóa
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isView = mode === 'view';
  const isAdd = mode === 'add';
  
  const headerBg = isView ? "bg-emerald-600" : "bg-amber-500";
  const btnBg = isView ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-500 hover:bg-amber-600";
  const ringColor = isView ? "focus:ring-emerald-400" : "focus:ring-amber-400";
  const labelActiveColor = isView ? "text-emerald-600" : "text-amber-600";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200 text-black">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className={`${headerBg} p-6 flex items-center justify-between text-white shrink-0 transition-colors`}>
          <div className="flex items-center gap-3">
            <Award size={20} />
            <h3 className="font-bold uppercase tracking-widest text-xs [text-decoration:none]">
              {isView ? 'Chi tiết minh chứng' : isAdd ? 'Thêm minh chứng mới' : 'Cập nhật minh chứng'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <form className="p-8 space-y-6 overflow-y-auto" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1">
              <label className={`text-[10px] font-black uppercase ml-1 ${isView ? 'text-slate-400' : 'text-amber-600'}`}>Tên hoạt động thi đua</label>
              <input disabled={isView} defaultValue={data?.name} required className={`w-full p-3 bg-slate-50 rounded-xl border-none font-bold outline-none focus:ring-2 ${ringColor} disabled:ring-0`} />
            </div>
            <div className="col-span-1 space-y-1">
              <label className={`text-[10px] font-black uppercase ml-1 ${isView ? 'text-slate-400' : 'text-amber-600'}`}>Năm học</label>
              <div className="relative">
                <input disabled={isView} defaultValue={data?.namHoc} placeholder="2025-2026" required className={`w-full p-3 bg-slate-50 rounded-xl border-none font-bold outline-none focus:ring-2 ${ringColor} disabled:ring-0`} />
                <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={`text-[10px] font-black uppercase ml-1 ${isView ? 'text-slate-400' : 'text-amber-600'}`}>Kế hoạch triển khai</label>
              <input disabled={isView} defaultValue={data?.plan} placeholder="KH số... / KH-ĐK" className={`w-full p-3 bg-slate-50 rounded-xl border-none font-bold outline-none focus:ring-2 ${ringColor} disabled:ring-0`} />
            </div>
            <div className="space-y-1">
              <label className={`text-[10px] font-black uppercase ml-1 ${isView ? 'text-slate-400' : 'text-amber-600'}`}>Minh chứng (Link bài đăng)</label>
              <div className="relative">
                <input disabled={isView} defaultValue={data?.evidence} className={`w-full p-3 bg-slate-50 rounded-xl border-none font-bold outline-none pr-10 focus:ring-2 ${ringColor} disabled:ring-0 text-blue-600`} />
                <LinkIcon size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isView ? 'text-slate-400' : 'text-amber-400'}`} />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-[10px] font-black uppercase ml-1 ${labelActiveColor}`}>Nội dung thi đua / Ghi chú</label>
            <textarea disabled={isView} rows={4} defaultValue={data?.content} className={`w-full p-4 bg-slate-50 rounded-xl border-none font-medium outline-none focus:ring-2 ${ringColor} disabled:ring-0`} />
          </div>

          {!isView && (
            <div className="pt-4 flex gap-3 border-t">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest text-black [text-decoration:none] border-none outline-none"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className={`flex-1 py-3 ${btnBg} text-white rounded-xl font-bold shadow-lg transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 [text-decoration:none] border-none outline-none`}
              >
                <Save size={14} /> {isAdd ? 'Lưu hoạt động' : 'Lưu thay đổi'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
'use client';

import { X, Save, FileText, Calendar, Link as LinkIcon, Trash2, AlertCircle } from "lucide-react";

export default function MHGPModal({ mode, data, onClose, onConfirmDelete }: any) {
  if (mode === 'delete') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200 text-black">
        <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-red-50">
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full mx-auto flex items-center justify-center shadow-inner">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Xóa mô hình?</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed px-4">
                Bạn chắc chắn muốn xóa mô hình <span className="font-bold text-red-600">"{data?.name}"</span>?
              </p>
            </div>
          </div>
          <div className="flex p-6 gap-3 bg-slate-50">
            <button onClick={onClose} className="flex-1 py-3 px-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-200 transition-all uppercase text-[10px] tracking-widest text-black">Hủy bỏ</button>
            <button 
              onClick={() => { onConfirmDelete(data.id); onClose(); }}
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
            >
              <Trash2 size={14} /> Xóa
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isView = mode === 'view';
  const headerBg = isView ? "bg-blue-600" : "bg-amber-500";
  const btnBg = isView ? "bg-blue-600 hover:bg-blue-700" : "bg-amber-500 hover:bg-amber-600";
  const labelColor = isView ? "text-blue-500" : "text-amber-600";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200 text-black">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className={`${headerBg} p-6 flex items-center justify-between text-white shrink-0 transition-colors duration-300`}>
          <h3 className="font-bold uppercase tracking-widest text-xs">
            {mode === 'view' ? 'Chi tiết MHGP' : mode === 'add' ? 'Thêm MHGP mới' : 'Cập nhật MHGP'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tên MHGP / Công trình</label>
              <input disabled={isView} defaultValue={data?.name} className="w-full p-3 bg-slate-50 rounded-xl border-none font-bold outline-none focus:ring-2 ring-amber-400 disabled:ring-0" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Năm học</label>
              <input disabled={isView} defaultValue={data?.year} className="w-full p-3 bg-slate-50 rounded-xl border-none font-bold outline-none focus:ring-2 ring-amber-400 disabled:ring-0" />
            </div>
          </div>

          {[
            { l: "1. Lí do thực hiện", v: data?.reason },
            { l: "2. Tóm tắt MHGP", v: data?.summary },
            { l: "3. Đánh giá hiệu quả", v: data?.evaluation },
            { l: "4. Kinh phí thực hiện", v: data?.budget },
            { l: "5. Link file báo cáo", v: data?.fileLink, isLink: true },
          ].map((field, i) => (
            <div key={i} className="space-y-1">
              <label className={`text-[10px] font-black uppercase ${labelColor} ml-1`}>{field.l}</label>
              {field.isLink ? (
                <div className="relative">
                  <input disabled={isView} defaultValue={field.v} className={`w-full p-3 ${isView ? 'bg-blue-50/30 text-blue-600' : 'bg-amber-50/30 text-amber-700'} rounded-xl border-none font-bold outline-none pr-10`} />
                  <LinkIcon size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isView ? 'text-blue-400' : 'text-amber-400'}`} />
                </div>
              ) : (
                <textarea disabled={isView} rows={3} defaultValue={field.v} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-medium outline-none focus:ring-2 ring-amber-400" />
              )}
            </div>
          ))}
        </div>

        {!isView && (
          <div className="p-6 bg-slate-50 flex justify-end gap-3 shrink-0 border-t">
            <button onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-slate-400 hover:bg-slate-200 transition-all uppercase text-[10px] text-black">Hủy</button>
            <button className={`px-10 py-3 ${btnBg} text-white rounded-2xl font-bold shadow-lg transition-all uppercase text-[10px] flex items-center gap-2`}>
              <Save size={14} /> {mode === 'add' ? 'Thêm mới' : 'Lưu thay đổi'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
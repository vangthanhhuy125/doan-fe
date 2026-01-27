'use client';

import { X, Save, Flag, Link as LinkIcon, Trash2, AlertCircle, PlusCircle, Eye, FileEdit, Calendar } from "lucide-react";

export default function CTTNModal({ mode, data, onClose, onConfirmDelete }: any) {
  const isView = mode === 'view';
  const isAdd = mode === 'add';

  const renderHeaderIcon = () => {
    if (isView) return <Eye size={20} />;
    if (isAdd) return <PlusCircle size={20} />;
    return <FileEdit size={20} />;
  };

  if (mode === 'delete') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200 text-black">
        <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden border border-red-50">
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full mx-auto flex items-center justify-center shadow-inner">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Xóa công trình?</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed px-4">
                Má chắc chắn muốn xóa công trình <span className="font-bold text-red-600">"{data?.name}"</span>?
              </p>
            </div>
          </div>
          <div className="flex p-6 gap-3 bg-slate-50">
            <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-400 hover:bg-slate-200 transition-all uppercase text-[10px] tracking-widest text-black [text-decoration:none] border-none outline-none">Hủy</button>
            <button 
              onClick={() => { onConfirmDelete(data.id); onClose(); }}
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 [text-decoration:none] border-none outline-none"
            >
              <Trash2 size={14} /> Xóa ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  const headerBg = isView ? "bg-[#0054a5]" : "bg-amber-500";
  const btnBg = isView ? "bg-[#0054a5] hover:bg-[#004080]" : "bg-amber-500 hover:bg-amber-600";
  const ringColor = isView ? "focus:ring-blue-400" : "focus:ring-amber-400";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200 text-black">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className={`${headerBg} p-6 flex items-center justify-between text-white shrink-0 transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">{renderHeaderIcon()}</div>
            <h3 className="font-bold uppercase tracking-widest text-xs [text-decoration:none]">
              {isView ? 'Chi tiết công trình' : isAdd ? 'Đăng ký công trình mới' : 'Cập nhật công trình'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <form className="p-8 space-y-6 overflow-y-auto" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tên công trình thanh niên</label>
              <input disabled={isView} defaultValue={data?.name} required className={`w-full p-3 bg-slate-50 rounded-xl border-none font-bold outline-none focus:ring-2 ${ringColor} disabled:ring-0`} />
            </div>
            <div className="col-span-1 space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Năm học</label>
              <div className="relative">
                <input disabled={isView} defaultValue={data?.year} placeholder="2025-2026" className={`w-full p-3 bg-slate-50 rounded-xl border-none font-bold outline-none focus:ring-2 ${ringColor} disabled:ring-0`} />
                <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-[#0054a5] ml-1">Đơn vị thực hiện</label>
            <input disabled={isView} defaultValue={data?.unit} className={`w-full p-3 bg-slate-50 rounded-xl border-none font-bold outline-none focus:ring-2 ${ringColor} disabled:ring-0`} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-[#0054a5] ml-1">Nội dung & Chỉ tiêu thực hiện</label>
            <textarea disabled={isView} rows={4} defaultValue={data?.content} className={`w-full p-4 bg-slate-50 rounded-xl border-none font-medium outline-none focus:ring-2 ${ringColor} disabled:ring-0`} />
          </div>

          {!isView && (
            <div className="pt-4 flex gap-3 border-t">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest text-black [text-decoration:none] border-none outline-none">Hủy</button>
              <button type="submit" className={`flex-1 py-3 ${btnBg} text-white rounded-xl font-bold shadow-lg transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 [text-decoration:none] border-none outline-none`}>
                {isAdd ? <PlusCircle size={14} /> : <Save size={14} />} 
                {isAdd ? 'Đăng ký công trình' : 'Lưu thay đổi'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
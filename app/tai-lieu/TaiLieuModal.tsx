'use client';

import { X, Save, FileText, Link as LinkIcon, Trash2, AlertCircle, PlusCircle, Eye, FileEdit, Calendar } from "lucide-react";

export default function TaiLieuModal({ mode, data, onClose, onConfirmDelete }: any) {
  const isView = mode === 'view';
  const isAdd = mode === 'add';

  if (mode === 'delete') {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-red-100 animate-in zoom-in duration-300">
          <div className="p-6 text-center space-y-4 text-black">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full mx-auto flex items-center justify-center shadow-inner">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800">Xác nhận xóa?</h3>
              <p className="text-sm text-slate-500 leading-relaxed px-4">
                Bạn chắc chắn muốn xóa tài liệu <br/>
                <span className="font-bold text-red-600">"{data?.name}"</span>?
              </p>
            </div>
          </div>
          <div className="flex p-4 gap-3 bg-slate-50">
            <button 
              onClick={onClose} 
              className="flex-1 py-3 px-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all uppercase text-[11px] tracking-widest border-none outline-none"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={() => { onConfirmDelete(data.id); onClose(); }} 
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg hover:bg-red-700 transition-all uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 border-none outline-none"
            >
              <Trash2 size={14} /> Xác nhận xóa
            </button>
          </div>
        </div>
      </div>
    );
  }

  const headerBg = isView ? "bg-[#0054a5]" : "bg-[#f59e0b]";
  const btnBg = isView ? "bg-[#0054a5] hover:bg-[#004080]" : "bg-[#f59e0b] hover:bg-[#d97706]";
  const ringColor = isView ? "focus:border-[#0054a5]" : "focus:border-[#f59e0b]";
  const labelColor = isView ? "text-gray-400" : "text-[#f59e0b]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
        <div className={`${headerBg} p-6 flex items-center justify-between text-white transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {isView ? <Eye size={20} /> : isAdd ? <PlusCircle size={20} /> : <FileEdit size={20} />}
            </div>
            <h3 className="font-bold uppercase tracking-widest text-sm">
              {isView ? 'Chi tiết tài liệu' : isAdd ? 'Thêm tài liệu mới' : 'Cập nhật tài liệu'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white"><X size={20} /></button>
        </div>
        
        <form className="p-8 space-y-6 overflow-y-auto max-h-[85vh] text-black" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Tên tài liệu / Văn kiện</label>
            <input disabled={isView} defaultValue={data?.name} required className={`w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm font-bold ${ringColor} disabled:opacity-70`} placeholder="Nhập tên tài liệu..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Học kỳ</label>
              <select disabled={isView} defaultValue={data?.semester} className={`w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm font-bold ${ringColor} appearance-none cursor-pointer disabled:opacity-70`}>
                <option value="Học kỳ 1">Học kỳ 1</option>
                <option value="Học kỳ 2">Học kỳ 2</option>
                <option value="Học kỳ hè">Học kỳ hè</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Năm học</label>
              <div className="relative">
                <input disabled={isView} defaultValue={data?.year} placeholder="2025-2026" className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm font-bold ${ringColor} disabled:opacity-70`} />
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Loại tài liệu</label>
            <select disabled={isView} defaultValue={data?.category} className={`w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm font-bold ${ringColor} appearance-none cursor-pointer disabled:opacity-70`}>
              <option value="Văn kiện đoàn khoa">Văn kiện đoàn khoa</option>
              <option value="Hành chính">Hành chính</option>
              <option value="Tổ chức - Hoạt động">Tổ chức - Hoạt động</option>
              <option value="Thông báo - Kế hoạch Đoàn trường">Thông báo - Kế hoạch Đoàn trường</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Link văn kiện (Drive/Cloud)</label>
            <div className="relative">
              <input disabled={isView} defaultValue={data?.link} className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm font-bold ${ringColor} text-blue-600 disabled:opacity-70`} placeholder="https://..." />
              <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {!isView && (
            <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
              <button type="button" onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all text-xs tracking-widest uppercase border-none outline-none">Hủy bỏ</button>
              <button type="submit" className={`px-10 py-3 ${btnBg} text-white rounded-2xl font-bold shadow-lg transition-all text-xs tracking-widest uppercase flex items-center justify-center gap-2 border-none outline-none`}>
                {isAdd ? 'Lưu' : 'Cập nhật'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
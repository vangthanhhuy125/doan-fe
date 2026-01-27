'use client';

import { X, Save, FileText, Link as LinkIcon, Trash2, AlertCircle, PlusCircle, Eye, FileEdit, Calendar } from "lucide-react";

export default function TaiLieuModal({ mode, data, onClose, onConfirmDelete }: any) {
  const isView = mode === 'view';
  const isAdd = mode === 'add';

  if (mode === 'delete') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 text-black">
        <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden border border-red-50">
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full mx-auto flex items-center justify-center shadow-inner">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Xóa tài liệu?</h3>
              <p className="text-[13px] text-slate-500 px-4 italic">
                Bạn chắc chắn muốn xóa <span className="font-bold text-red-600">"{data?.name}"</span>?
              </p>
            </div>
          </div>
          <div className="flex p-6 gap-3 bg-slate-50">
            <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-400 hover:bg-slate-200 transition-all uppercase text-[10px] tracking-widest border-none outline-none [text-decoration:none]">Hủy</button>
            <button onClick={() => { onConfirmDelete(data.id); onClose(); }} className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border-none outline-none [text-decoration:none]">
              <Trash2 size={14} /> Xác nhận xóa
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ĐỒNG BỘ MÀU SẮC: View -> Xanh dương, Add/Edit -> Cam
  const mainColor = isView ? "#0054a5" : "#f59e0b";
  const headerBg = isView ? "bg-[#0054a5]" : "bg-[#f59e0b]"; 
  const btnBg = isView ? "bg-[#0054a5] hover:bg-[#004080]" : "bg-[#f59e0b] hover:bg-[#d97706]";
  const ringColor = isView ? "ring-blue-400" : "ring-amber-400";
  const labelColor = isView ? "text-slate-400" : "text-[#f59e0b]";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 text-black">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`${headerBg} p-6 flex items-center justify-between text-white shrink-0 transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {isView ? <Eye size={20} /> : isAdd ? <PlusCircle size={20} /> : <FileEdit size={20} />}
            </div>
            <h3 className="font-bold uppercase tracking-widest text-xs [text-decoration:none]">
              {isView ? 'Chi tiết tài liệu' : isAdd ? 'Thêm tài liệu mới' : 'Cập nhật tài liệu'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white"><X size={20} /></button>
        </div>
        
        <form className="p-8 space-y-5 overflow-y-auto" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1">
            <label className={`text-[10px] font-black uppercase ml-1 ${labelColor}`}>Tên tài liệu / Văn kiện</label>
            <input disabled={isView} defaultValue={data?.name} required className={`w-full p-3 bg-slate-50 rounded-xl border-none font-bold outline-none focus:ring-2 ${ringColor} disabled:ring-0`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={`text-[10px] font-black uppercase ml-1 ${labelColor}`}>Học kỳ</label>
              <select disabled={isView} defaultValue={data?.semester} className={`w-full p-3 bg-slate-50 rounded-xl border-none font-bold outline-none focus:ring-2 ${ringColor} disabled:ring-0 appearance-none cursor-pointer`}>
                <option value="Học kỳ 1">Học kỳ 1</option>
                <option value="Học kỳ 2">Học kỳ 2</option>
                <option value="Học kỳ hè">Học kỳ hè</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className={`text-[10px] font-black uppercase ml-1 ${labelColor}`}>Năm học</label>
              <div className="relative">
                <input disabled={isView} defaultValue={data?.year} placeholder="2025-2026" className={`w-full p-3 bg-slate-50 rounded-xl border-none font-bold outline-none focus:ring-2 ${ringColor} disabled:ring-0`} />
                <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-[10px] font-black uppercase ml-1 ${labelColor}`}>Loại tài liệu</label>
            <select disabled={isView} defaultValue={data?.category} className={`w-full p-3 bg-slate-50 rounded-xl border-none font-bold outline-none focus:ring-2 ${ringColor} disabled:ring-0 appearance-none cursor-pointer`}>
              <option value="Văn kiện đoàn khoa">Văn kiện đoàn khoa</option>
              <option value="Hành chính">Hành chính</option>
              <option value="Tổ chức - Hoạt động">Tổ chức - Hoạt động</option>
              <option value="Thông báo - Kế hoạch Đoàn trường">Thông báo - Kế hoạch Đoàn trường</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className={`text-[10px] font-black uppercase ml-1 ${labelColor}`}>Link văn kiện (Drive/Cloud)</label>
            <div className="relative">
              <input disabled={isView} defaultValue={data?.link} className={`w-full p-3 bg-slate-50 rounded-xl border-none font-bold outline-none pr-10 focus:ring-2 ${ringColor} text-blue-600 disabled:ring-0`} />
              <LinkIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {!isView && (
            <div className="pt-4 flex gap-3 border-t">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-100 transition-all text-[10px] uppercase border-none outline-none [text-decoration:none]">Hủy</button>
              <button type="submit" className={`flex-1 py-3 ${btnBg} text-white rounded-xl font-bold shadow-lg transition-all text-[10px] uppercase flex items-center justify-center gap-2 border-none outline-none [text-decoration:none]`}>
                <Save size={14} /> {isAdd ? 'Lưu tài liệu' : 'Lưu thay đổi'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
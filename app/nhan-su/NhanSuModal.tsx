'use client';

import { X, Save, User, Trash2, AlertCircle, PlusCircle, Eye, FileEdit, GraduationCap, Phone, Mail, Calendar } from "lucide-react";

export default function NhanSuModal({ mode, data, onClose, onConfirmDelete }: any) {
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
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Xóa nhân sự?</h3>
              <p className="text-[13px] text-slate-500 px-4 italic">
                Bạn chắc chắn muốn xóa <span className="font-bold text-red-600">"{data?.name}"</span>?
              </p>
            </div>
          </div>
          <div className="flex p-6 gap-3 bg-slate-50">
            <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-400 hover:bg-slate-200 transition-all uppercase text-[10px] border-none outline-none [text-decoration:none]">Hủy</button>
            <button onClick={() => { onConfirmDelete(data.id); onClose(); }} className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all uppercase text-[10px] flex items-center justify-center gap-2 border-none outline-none [text-decoration:none]">
              <Trash2 size={14} /> Xác nhận xóa
            </button>
          </div>
        </div>
      </div>
    );
  }

  const mainColor = isView ? "bg-[#0054a5]" : "bg-[#f59e0b]";
  const btnBg = isView ? "bg-[#0054a5] hover:bg-[#004080]" : "bg-[#f59e0b] hover:bg-[#d97706]";
  const ringColor = isView ? "ring-blue-400" : "ring-amber-400";
  const labelColor = isView ? "text-slate-400" : "text-[#f59e0b]";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 text-black">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className={`${mainColor} p-6 flex items-center justify-between text-white shrink-0 transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {isView ? <Eye size={20} /> : isAdd ? <PlusCircle size={20} /> : <FileEdit size={20} />}
            </div>
            <h3 className="font-bold uppercase tracking-widest text-xs [text-decoration:none]">
              {isView ? 'Thông tin nhân sự' : isAdd ? 'Thêm nhân sự mới' : 'Cập nhật nhân sự'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white"><X size={20} /></button>
        </div>
        
        <form className="p-8 space-y-5 overflow-y-auto" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={`text-[10px] font-black uppercase ml-1 ${labelColor}`}>Họ và tên</label>
              <div className="relative">
                <input disabled={isView} defaultValue={data?.name} required className={`w-full p-3 pl-10 bg-slate-50 rounded-xl border-none font-bold outline-none focus:ring-2 ${ringColor} disabled:ring-0`} />
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div className="space-y-1">
              <label className={`text-[10px] font-black uppercase ml-1 ${labelColor}`}>Mã số sinh viên (MSSV)</label>
              <div className="relative">
                <input disabled={isView} defaultValue={data?.mssv} required className={`w-full p-3 pl-10 bg-slate-50 rounded-xl border-none font-bold outline-none focus:ring-2 ${ringColor} disabled:ring-0`} />
                <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={`text-[10px] font-black uppercase ml-1 ${labelColor}`}>Chi đoàn</label>
              <input disabled={isView} defaultValue={data?.class} placeholder="VD: PMCL2023" className={`w-full p-3 bg-slate-50 rounded-xl border-none font-bold outline-none focus:ring-2 ${ringColor} disabled:ring-0`} />
            </div>
            <div className="space-y-1">
              <label className={`text-[10px] font-black uppercase ml-1 ${labelColor}`}>Số điện thoại</label>
              <div className="relative">
                <input disabled={isView} defaultValue={data?.phone} className={`w-full p-3 pl-10 bg-slate-50 rounded-xl border-none font-bold outline-none focus:ring-2 ${ringColor} disabled:ring-0`} />
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={`text-[10px] font-black uppercase ml-1 ${labelColor}`}>Ngày sinh</label>
              <div className="relative">
                <input type="date" disabled={isView} defaultValue={data?.birthday} className={`w-full p-3 pl-10 bg-slate-50 rounded-xl border-none font-bold outline-none focus:ring-2 ${ringColor} disabled:ring-0`} />
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-1 text-slate-400">Email (Tự động sinh)</label>
              <div className="relative">
                <input disabled defaultValue={data?.mssv ? `${data.mssv}@gm.uit.edu.vn` : "Nhập MSSV để tạo email..."} className="w-full p-3 pl-10 bg-slate-100 rounded-xl border-none font-bold text-slate-400 outline-none" />
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
            </div>
          </div>

          {!isView && (
            <div className="pt-4 flex gap-3 border-t">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-100 transition-all text-[10px] uppercase border-none outline-none [text-decoration:none]">Hủy</button>
              <button type="submit" className={`flex-1 py-3 ${btnBg} text-white rounded-xl font-bold shadow-lg transition-all text-[10px] uppercase flex items-center justify-center gap-2 border-none outline-none [text-decoration:none]`}>
                <Save size={14} /> {isAdd ? 'Lưu nhân sự' : 'Lưu thay đổi'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
'use client';

import { useState } from "react";
import { X, Save, User, Trash2, AlertCircle, PlusCircle, Eye, FileEdit, Shield, Key, UserCheck } from "lucide-react";

export default function CaiDatModal({ mode, data, onClose, onConfirmDelete, nhanSuList = [] }: any) {
  const isView = mode === 'view';
  const isAdd = mode === 'add';

  if (mode === 'delete') {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-black">
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-red-100 animate-in zoom-in duration-300">
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full mx-auto flex items-center justify-center shadow-inner">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Xác nhận xóa?</h3>
              <p className="text-sm text-slate-500 leading-relaxed px-4">
                Bạn chắc chắn muốn thu hồi quyền truy cập của <br/>
                <span className="font-bold text-red-600">"{data?.displayName}"</span>?
              </p>
            </div>
          </div>
          <div className="flex p-4 gap-3 bg-slate-50">
            <button onClick={onClose} className="flex-1 py-3 px-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all uppercase text-[11px] tracking-widest border-none outline-none">Hủy bỏ</button>
            <button onClick={() => { onConfirmDelete(data._id); onClose(); }} className="flex-1 py-3 px-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg hover:bg-red-700 transition-all uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 border-none outline-none">
               Xóa
            </button>
          </div>
        </div>
      </div>
    );
  }

  const headerBg = isView ? "bg-[#0054a5]" : "bg-[#f59e0b]";
  const btnBg = isView ? "bg-[#0054a5] hover:bg-[#004080]" : "bg-[#f59e0b] hover:bg-[#d97706]";
  const ringColor = isView ? "focus:border-[#0054a5]" : "focus:border-[#f59e0b]";
  const labelColor = isView ? "text-slate-400" : "text-[#f59e0b]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200 text-black">
      <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
        <div className={`${headerBg} p-6 flex items-center justify-between text-white transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {isView ? <Eye size={20} /> : isAdd ? <PlusCircle size={20} /> : <FileEdit size={20} />}
            </div>
            <h3 className="font-bold uppercase tracking-widest text-sm">
              {isView ? 'Chi tiết tài khoản' : isAdd ? 'Cấp tài khoản mới' : 'Chỉnh sửa tài khoản'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white"><X size={20} /></button>
        </div>
        
        <form className="p-8 space-y-6 overflow-y-auto max-h-[85vh]" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Người sở hữu tài khoản</label>
            <div className="relative">
              <select 
                disabled={isView} 
                defaultValue={data?.displayName}
                className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm appearance-none cursor-pointer ${ringColor} disabled:opacity-70`}
              >
                <option value="">Chọn từ danh sách nhân sự...</option>
                {nhanSuList.map((ns: any) => (
                  <option key={ns._id} value={ns.name}>{ns.name} - {ns.mssv}</option>
                ))}
              </select>
              <UserCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Tên đăng nhập</label>
              <div className="relative">
                <input disabled={isView} defaultValue={data?.username} required className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm  ${ringColor} disabled:opacity-70`} placeholder="VD: admin_khoa" />
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Mật khẩu truy cập</label>
              <div className="relative">
                <input disabled={isView} defaultValue={data?.password} required className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm  ${ringColor} disabled:opacity-70`} placeholder="Nhập mật khẩu..." />
                <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {!isView && (
            <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
              <button type="button" onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all text-xs tracking-widest uppercase border-none outline-none">Hủy bỏ</button>
              <button type="submit" className={`px-10 py-3 ${btnBg} text-white rounded-2xl font-bold shadow-lg transition-all text-xs tracking-widest uppercase flex items-center justify-center gap-2 border-none outline-none`}>
                {isAdd ? 'Cấp tài khoản' : 'Cập nhật'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
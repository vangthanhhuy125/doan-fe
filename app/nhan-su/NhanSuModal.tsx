'use client';

import { useState, useRef } from "react";
import { X, Save, User, Trash2, AlertCircle, PlusCircle, Eye, FileEdit, GraduationCap, Phone, Mail, Calendar, Camera } from "lucide-react";

export default function NhanSuModal({ mode, data, onClose, onConfirmDelete, onSave }: any) {
  const isView = mode === 'view';
  const isAdd = mode === 'add';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(data?.image_url || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isView) return;

    const formData = new FormData(formRef.current!);
    const payload = {
      ...data,
      name: formData.get("name"),
      mssv: formData.get("mssv"),
      class: formData.get("class"),
      phone: formData.get("phone"),
      birthday: formData.get("birthday"),
      image_url: avatarPreview,
    };

    onSave(payload);
  };

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
                Bạn chắc chắn muốn xóa nhân sự <br/>
                <span className="font-bold text-red-600">"{data?.full_name || data?.name}"</span>?
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
              onClick={() => { onConfirmDelete(data._id || data.id); onClose(); }} 
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 border-none outline-none"
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
        <div className={`${headerBg} p-6 flex items-center justify-between text-white transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {isView ? <Eye size={20} /> : isAdd ? <PlusCircle size={20} /> : <FileEdit size={20} />}
            </div>
            <h3 className="font-bold uppercase tracking-widest text-sm">
              {isView ? 'Thông tin nhân sự' : isAdd ? 'Thêm nhân sự mới' : 'Cập nhật nhân sự'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white"><X size={20} /></button>
        </div>
        
        <form ref={formRef} className="p-8 space-y-6 overflow-y-auto max-h-[85vh] text-black" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center space-y-3">
            <div className="relative group">
              <div className={`w-32 h-32 rounded-full border-4 ${isView ? 'border-[#0054a5]/20' : 'border-[#f59e0b]/20'} overflow-hidden bg-gray-100 flex items-center justify-center shadow-inner`}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-gray-300" />
                )}
              </div>
              {!isView && (
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-[#f59e0b] text-white rounded-full shadow-lg hover:bg-[#d97706] transition-all transform hover:scale-110"
                >
                  <Camera size={18} />
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <label className="text-[10px] font-bold uppercase text-gray-400">Ảnh đại diện</label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Họ và tên</label>
              <div className="relative">
                <input name="name" disabled={isView} defaultValue={data?.full_name || data?.name} required className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm ${ringColor} disabled:opacity-70`} placeholder="Nhập họ và tên..." />
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Mã số sinh viên (MSSV)</label>
              <div className="relative">
                <input name="mssv" disabled={isView} defaultValue={data?.student_id || data?.mssv} required className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm ${ringColor} disabled:opacity-70`} placeholder="Nhập MSSV..." />
                <GraduationCap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Chi đoàn</label>
              <input name="class" disabled={isView} defaultValue={data?.class} className={`w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm ${ringColor} disabled:opacity-70`} placeholder="VD: PMCL2023" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Số điện thoại</label>
              <div className="relative">
                <input name="phone" disabled={isView} defaultValue={data?.phone} className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm ${ringColor} disabled:opacity-70`} placeholder="Nhập SĐT..." />
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Ngày sinh</label>
              <div className="relative">
                <input name="birthday" type="date" disabled={isView} defaultValue={data?.birthday} className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm ${ringColor} disabled:opacity-70`} />
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Email</label>
              <div className="relative">
                <input disabled value={data?.student_id || data?.mssv ? `${data.student_id || data.mssv}@gm.uit.edu.vn` : ""} className="w-full p-4 pl-12 bg-slate-100 rounded-2xl border-none text-sm text-slate-400 outline-none" />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
            </div>
          </div>

          {!isView && (
            <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
              <button type="button" onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all text-xs tracking-widest uppercase border-none outline-none">Hủy bỏ</button>
              <button type="submit" className={`px-10 py-3 ${btnBg} text-white rounded-2xl font-bold shadow-lg transition-all text-xs tracking-widest uppercase flex items-center justify-center gap-2 border-none outline-none`}>
                {isAdd ? <PlusCircle size={14} /> : <Save size={14} />} 
                {isAdd ? 'Lưu' : 'Cập nhật'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
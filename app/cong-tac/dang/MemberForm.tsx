'use client';

import { X, Save, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";

export default function MemberForm({ data, onClose, onSave, title, color }: any) {
  const [formData, setFormData] = useState({ name: "", mssv: "", chiDoan: "" });

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
        <div className={`${color} p-6 flex items-center justify-between text-white`}>
          <div className="flex items-center gap-3">
            <UserPlus size={20} />
            <h3 className="font-bold uppercase tracking-widest text-xs">{data ? `Sửa thông tin ${title}` : `Thêm ${title}`}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Họ và tên</label>
            <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-blue-400 outline-none text-sm font-bold text-black" placeholder="Nguyễn Văn A" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Mã số sinh viên</label>
            <input required value={formData.mssv} onChange={(e) => setFormData({...formData, mssv: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-blue-400 outline-none text-sm font-bold text-black" placeholder="2352xxxx" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Chi đoàn</label>
            <input required value={formData.chiDoan} onChange={(e) => setFormData({...formData, chiDoan: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-blue-400 outline-none text-sm font-bold text-black" placeholder="PMCL2023.1" />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all text-[10px] uppercase tracking-widest">Hủy</button>
            <button type="submit" className={`flex-1 py-3 ${color} text-white rounded-2xl font-bold shadow-lg transition-all text-[10px] uppercase tracking-widest`}>Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}
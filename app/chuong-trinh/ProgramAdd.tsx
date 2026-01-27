'use client';

import { X, Save, Link as LinkIcon, FileText, DollarSign, Award, Calendar } from "lucide-react";

interface ProgramAddProps {
  onClose: () => void;
  onSave: (newItem: any) => void;
}

export default function ProgramAdd({ onClose, onSave }: ProgramAddProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newItem = {
      name: formData.get("name"),
      stakeholder: formData.get("stakeholder"),
      month: formData.get("month"),
      year: formData.get("year"),
      semester: formData.get("semester"),
      academicYear: formData.get("academicYear"),
      linkTaiLieu: formData.get("linkTaiLieu") || "#",
      linkKeHoach: formData.get("linkKeHoach") || "#",
      linkDTKP: formData.get("linkDTKP") || "#",
      linkDRL: formData.get("linkDRL") || "#",
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="bg-[#1d92ff] p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><Save size={20} /></div>
            <h3 className="font-bold uppercase tracking-widest text-sm text-white">Thêm chương trình năm</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[85vh]">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Tên chương trình</label>
              <input name="name" required className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-[#1d92ff] transition-all outline-none text-sm text-black font-bold" placeholder="Nhập tên chương trình..." />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Stakeholder (Người phụ trách/Trưởng Ban Tổ chức)</label>
              <input name="stakeholder" className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-[#1d92ff] transition-all outline-none text-sm text-black font-bold" placeholder="VD: Đoàn trường, Khoa CNPM..." />
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-[#0054a5] font-bold text-xs uppercase border-b border-slate-200 pb-2">
              <Calendar size={14} /> Phân loại thời gian
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Tháng</label>
                <select name="month" className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none text-sm font-bold text-black focus:border-[#1d92ff]">
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i+1} value={(i+1).toString().padStart(2, '0')}>Tháng {i+1}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Năm</label>
                <select name="year" className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none text-sm font-bold text-black focus:border-[#1d92ff]">
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Học kỳ</label>
                <select name="semester" className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none text-sm font-bold text-black focus:border-[#1d92ff]">
                  <option value="HK1">Học kỳ 1</option>
                  <option value="HK2">Học kỳ 2</option>
                  <option value="HK3">Học kỳ 3</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Năm học</label>
                <select name="academicYear" className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none text-sm font-bold text-black focus:border-[#1d92ff]">
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-blue-500 flex items-center gap-1"><LinkIcon size={12}/> Link Tài liệu</label>
              <input name="linkTaiLieu" className="w-full p-3 bg-blue-50/50 rounded-xl border border-blue-100 outline-none text-xs focus:bg-white text-black" placeholder="https://drive.google.com/..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-emerald-500 flex items-center gap-1"><FileText size={12}/> Link Kế hoạch</label>
              <input name="linkKeHoach" className="w-full p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 outline-none text-xs focus:bg-white text-black" placeholder="https://drive.google.com/..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-amber-500 flex items-center gap-1"><DollarSign size={12}/> Link Dự trù KP</label>
              <input name="linkDTKP" className="w-full p-3 bg-amber-50/50 rounded-xl border border-amber-100 outline-none text-xs focus:bg-white text-black" placeholder="https://drive.google.com/..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-purple-500 flex items-center gap-1"><Award size={12}/> Link Danh sách ĐRL</label>
              <input name="linkDRL" className="w-full p-3 bg-purple-50/50 rounded-xl border border-purple-100 outline-none text-xs focus:bg-white text-black" placeholder="https://drive.google.com/..." />
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all text-xs tracking-widest uppercase">Hủy bỏ</button>
            <button type="submit" className="px-10 py-3 bg-[#1d92ff] text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-[#0054a5] transition-all text-xs tracking-widest uppercase">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}
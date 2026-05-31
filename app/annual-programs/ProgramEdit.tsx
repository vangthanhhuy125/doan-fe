'use client';

import { useState } from "react";
import { X, Save, Link as LinkIcon, FileText, DollarSign, Award, Calendar } from "lucide-react";

interface ProgramEditProps {
  data: any;
  onClose: () => void;
  onSave: (updatedItem: any) => void;
}

export default function ProgramEdit({ data, onClose, onSave }: ProgramEditProps) {
  const [formData, setFormData] = useState({
    ...data,
    program_name: data.program_name || data.name || "",
    stakeholders: data.stakeholders || data.stakeholder || "",
    academic_year: data.academic_year || data.academicYear || "",
    source_url: data.source_url || data.linkTaiLieu || "",
    plan_url: data.plan_url || data.linkKeHoach || "",
    budget_url: data.budget_url || data.linkDTKP || "",
    training_score_list_url: data.training_score_list_url || data.linkDRL || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="bg-amber-500 p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><Save size={20} /></div>
            <h3 className="font-bold uppercase tracking-widest text-sm text-white">Chỉnh sửa chương trình</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white border-none bg-transparent outline-none"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[85vh]">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Tên chương trình</label>
              <input 
                value={formData.program_name}
                onChange={(e) => setFormData({...formData, program_name: e.target.value})}
                className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-amber-500 transition-all outline-none font-bold text-sm text-black" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Stakeholder</label>
              <input 
                value={formData.stakeholders}
                onChange={(e) => setFormData({...formData, stakeholders: e.target.value})}
                className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-amber-500 transition-all outline-none font-bold text-sm text-black" 
              />
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase border-b border-slate-200 pb-2">
              <Calendar size={14} /> Phân loại thời gian
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Tháng</label>
                <select 
                  value={formData.month}
                  onChange={(e) => setFormData({...formData, month: e.target.value})}
                  className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none text-sm font-bold text-black focus:border-amber-500 cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i+1} value={(i+1).toString().padStart(2, '0')}>Tháng {(i+1).toString().padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Năm</label>
                <select 
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none text-sm font-bold text-black focus:border-amber-500 cursor-pointer"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Học kỳ</label>
                <select 
                  value={formData.semester}
                  onChange={(e) => setFormData({...formData, semester: e.target.value})}
                  className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none text-sm font-bold text-black focus:border-amber-500 cursor-pointer"
                >
                  <option value="HK1">Học kỳ 1</option>
                  <option value="HK2">Học kỳ 2</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Năm học</label>
                <select 
                  value={formData.academic_year}
                  onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                  className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none text-sm font-bold text-black focus:border-amber-500 cursor-pointer"
                >
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
              <input value={formData.source_url} onChange={(e) => setFormData({...formData, source_url: e.target.value})} className="w-full p-3 bg-blue-50/50 rounded-xl border border-blue-100 outline-none text-xs focus:bg-white text-black" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-emerald-500 flex items-center gap-1"><FileText size={12}/> Link Kế hoạch</label>
              <input value={formData.plan_url} onChange={(e) => setFormData({...formData, plan_url: e.target.value})} className="w-full p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 outline-none text-xs focus:bg-white text-black" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-amber-500 flex items-center gap-1"><DollarSign size={12}/> Link Dự trù KP</label>
              <input value={formData.budget_url} onChange={(e) => setFormData({...formData, budget_url: e.target.value})} className="w-full p-3 bg-amber-50/50 rounded-xl border border-amber-100 outline-none text-xs focus:bg-white text-black" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-purple-500 flex items-center gap-1"><Award size={12}/> Link Danh sách ĐRL</label>
              <input value={formData.training_score_list_url} onChange={(e) => setFormData({...formData, training_score_list_url: e.target.value})} className="w-full p-3 bg-purple-50/50 rounded-xl border border-purple-100 outline-none text-xs focus:bg-white text-black" />
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all uppercase text-xs tracking-widest text-black border-none bg-transparent outline-none">Hủy bỏ</button>
            <button type="submit" className="px-10 py-3 bg-amber-500 text-white rounded-2xl font-bold shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all uppercase text-xs tracking-widest border-none outline-none">Cập nhật</button>
          </div>
        </form>
      </div>
    </div>
  );
}
'use client';

import { X, Save, FileText, Calendar, Link as LinkIcon, Trash2, AlertCircle, PlusCircle, Eye, FileEdit } from "lucide-react";
import { useState } from "react";

export default function MHGPModal({ mode, data, onClose, onConfirmDelete, onSave }: any) {
  const isView = mode === 'view';
  const isAdd = mode === 'add';

  const [formData, setFormData] = useState({
    solution_model_name: data?.solution_model_name || "",
    academic_year: data?.academic_year || "",
    reason: data?.reason || "",
    summary: data?.summary || "",
    effectiveness: data?.effectiveness || "",
    budget: data?.budget || "",
    report_url: data?.report_url || ""
  });

  if (mode === 'delete') {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-red-100 animate-in zoom-in duration-300">
          <div className="p-6 text-center space-y-4 text-black">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full mx-auto flex items-center justify-center shadow-inner">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Xác nhận xóa?</h3>
              <p className="text-sm text-slate-500 leading-relaxed px-4">
                Bạn chắc chắn muốn xóa mô hình <br/>
                <span className="font-bold text-red-600">"{data?.solution_model_name}"</span>?
              </p>
            </div>
          </div>
          <div className="flex p-4 gap-3 bg-slate-50">
            <button onClick={onClose} className="flex-1 py-3 px-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all uppercase text-[11px] tracking-widest border-none outline-none">Hủy bỏ</button>
            <button onClick={() => { onConfirmDelete(data._id); }} className="flex-1 py-3 px-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 border-none outline-none">
              Xóa
            </button>
          </div>
        </div>
      </div>
    );
  }

  const headerBg = "bg-[#0054a5]";
  const btnBg = "bg-[#0054a5] hover:bg-[#004080]";
  const ringColor = "focus:border-[#0054a5]";
  const labelColor = isView ? "text-slate-400" : "text-[#0054a5]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200 text-black">
      <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
        <div className={`${headerBg} p-6 flex items-center justify-between text-white shrink-0 transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {isView ? <Eye size={20} /> : isAdd ? <PlusCircle size={20} /> : <FileEdit size={20} />}
            </div>
            <h3 className="font-bold uppercase tracking-widest text-sm">
              {isView ? 'Chi tiết MHGP' : isAdd ? 'Thêm MHGP mới' : 'Cập nhật MHGP'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white"><X size={20} /></button>
        </div>
        
        <form className="p-8 space-y-6 overflow-y-auto max-h-[85vh]" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Tên MHGP</label>
              <input disabled={isView} value={formData.solution_model_name} onChange={(e) => setFormData({...formData, solution_model_name: e.target.value})} required className={`w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm font-bold ${ringColor} disabled:opacity-70`} placeholder="Nhập tên mô hình..." />
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Năm học</label>
              <input disabled={isView} value={formData.academic_year} onChange={(e) => setFormData({...formData, academic_year: e.target.value})} placeholder="2025-2026" required className={`w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm font-bold ${ringColor} disabled:opacity-70`} />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>1. Lí do thực hiện</label>
            <textarea disabled={isView} value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} rows={3} className={`w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm font-medium ${ringColor} disabled:opacity-70`} placeholder="Nhập nội dung..." />
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>2. Tóm tắt MHGP</label>
            <textarea disabled={isView} value={formData.summary} onChange={(e) => setFormData({...formData, summary: e.target.value})} rows={3} className={`w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm font-medium ${ringColor} disabled:opacity-70`} placeholder="Nhập nội dung..." />
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>3. Đánh giá hiệu quả</label>
            <textarea disabled={isView} value={formData.effectiveness} onChange={(e) => setFormData({...formData, effectiveness: e.target.value})} rows={3} className={`w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm font-medium ${ringColor} disabled:opacity-70`} placeholder="Nhập nội dung..." />
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>4. Kinh phí thực hiện</label>
            <textarea disabled={isView} value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} rows={2} className={`w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm font-medium ${ringColor} disabled:opacity-70`} placeholder="Nhập nội dung..." />
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>5. Link file báo cáo</label>
            <div className="relative">
              <input disabled={isView} value={formData.report_url} onChange={(e) => setFormData({...formData, report_url: e.target.value})} className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm font-bold ${ringColor} text-blue-600 disabled:opacity-70`} placeholder="https://..." />
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
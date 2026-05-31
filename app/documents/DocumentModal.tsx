'use client';

import { useState } from "react";
import { X, Save, FileText, Link as LinkIcon, Trash2, AlertCircle, PlusCircle, Eye, FileEdit, Calendar } from "lucide-react";

export default function TaiLieuModal({ mode, data, onClose, onConfirmDelete, onSave }: any) {
  const isView = mode === 'view';
  const isAdd = mode === 'add';

  const [formData, setFormData] = useState({
    document_name: data?.document_name || "",
    semester: data?.semester || "Học kỳ 1",
    academic_year: data?.academic_year || "",
    document_type: data?.document_type || "Văn kiện đoàn khoa",
    document_url: data?.document_url || ""
  });

  // --- MODAL XÁC NHẬN XÓA (RESPONSIVE) ---
  if (mode === 'delete') {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-sm rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-red-100 animate-in zoom-in duration-300">
          <div className="p-5 sm:p-6 text-center space-y-4 text-black">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 text-red-500 rounded-full mx-auto flex items-center justify-center shadow-inner">
              <AlertCircle size={28} className="sm:w-[32px] sm:h-[32px]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-800">Xác nhận xóa?</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed px-2 sm:px-4">
                Bạn chắc chắn muốn xóa tài liệu <br/>
                <span className="font-bold text-red-600 block mt-1 break-words">"{data?.document_name}"</span>?
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row p-4 gap-2 sm:gap-3 bg-slate-50 border-t border-slate-100">
            <button 
              type="button"
              onClick={onClose} 
              className="w-full sm:flex-1 py-3 px-4 rounded-xl sm:rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all uppercase text-[10px] sm:text-[11px] tracking-widest border-none outline-none order-2 sm:order-1"
            >
              Hủy bỏ
            </button>
            <button 
              type="button"
              onClick={() => { onConfirmDelete(data._id); onClose(); }} 
              className="w-full sm:flex-1 py-3 px-4 bg-red-600 text-white rounded-xl sm:rounded-2xl font-bold shadow-lg hover:bg-red-700 transition-all uppercase text-[10px] sm:text-[11px] tracking-widest flex items-center justify-center gap-2 border-none outline-none order-1 sm:order-2"
            >
              <Trash2 size={14} /> Xác nhận xóa
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- CẤU HÌNH THEME MÀU ---
  const headerBg = isView ? "bg-[#0054a5]" : "bg-[#f59e0b]";
  const btnBg = isView ? "bg-[#0054a5] hover:bg-[#004080]" : "bg-[#f59e0b] hover:bg-[#d97706]";
  const ringColor = isView ? "focus:border-[#0054a5]" : "focus:border-[#f59e0b]";
  const labelColor = isView ? "text-gray-400" : "text-[#f59e0b]";

  // --- MODAL THÊM / SỬA / XEM CHI TIẾT (RESPONSIVE) ---
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-4 animate-in zoom-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]">
        
        {/* Header Modal - Responsive Padding */}
        <div className={`${headerBg} p-4 sm:p-6 flex items-center justify-between text-white transition-colors duration-300 flex-shrink-0`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
              {isView ? <Eye size={18} /> : isAdd ? <PlusCircle size={18} /> : <FileEdit size={18} />}
            </div>
            <h3 className="font-bold uppercase tracking-widest text-xs sm:text-sm truncate max-w-[200px] sm:max-w-none">
              {isView ? 'Chi tiết tài liệu' : isAdd ? 'Thêm tài liệu mới' : 'Cập nhật tài liệu'}
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white outline-none"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Form Content - Responsive Scroll & Grid */}
        <form 
          className="p-5 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto text-black flex-grow unique-scrollbar" 
          onSubmit={(e) => { e.preventDefault(); onSave(formData); }}
        >
          {/* Tên tài liệu */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className={`text-[9px] sm:text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Tên tài liệu</label>
            <input 
              disabled={isView} 
              value={formData.document_name} 
              onChange={(e) => setFormData({...formData, document_name: e.target.value})} 
              required 
              className={`w-full p-3.5 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-xs sm:text-sm font-bold ${ringColor} disabled:opacity-70`} 
              placeholder="Nhập tên tài liệu..." 
            />
          </div>

          {/* Grid Học kỳ & Năm học - Tự động xuống hàng trên Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <label className={`text-[9px] sm:text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Học kỳ</label>
              <div className="relative">
                <select 
                  disabled={isView} 
                  value={formData.semester} 
                  onChange={(e) => setFormData({...formData, semester: e.target.value})} 
                  className={`w-full p-3.5 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-xs sm:text-sm font-bold ${ringColor} appearance-none cursor-pointer disabled:opacity-70 pr-10`}
                >
                  <option value="Học kỳ 1">Học kỳ 1</option>
                  <option value="Học kỳ 2">Học kỳ 2</option>
                  <option value="Trong năm">Trong năm</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              <label className={`text-[9px] sm:text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Năm học</label>
              <div className="relative">
                <input 
                  disabled={isView} 
                  value={formData.academic_year} 
                  onChange={(e) => setFormData({...formData, academic_year: e.target.value})} 
                  placeholder="2025-2026" 
                  className={`w-full p-3.5 sm:p-4 pl-10 sm:pl-12 bg-gray-50 rounded-xl sm:rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-xs sm:text-sm font-bold ${ringColor} disabled:opacity-70`} 
                />
                <Calendar size={16} className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Loại tài liệu */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className={`text-[9px] sm:text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Loại tài liệu</label>
            <div className="relative">
              <select 
                disabled={isView} 
                value={formData.document_type} 
                onChange={(e) => setFormData({...formData, document_type: e.target.value})} 
                className={`w-full p-3.5 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-xs sm:text-sm font-bold ${ringColor} appearance-none cursor-pointer disabled:opacity-70 pr-10`}
              >
                <option value="Văn kiện đoàn khoa">Văn kiện đoàn khoa</option>
                <option value="Hành chính">Hành chính</option>
                <option value="Tổ chức - Hoạt động">Tổ chức - Hoạt động</option>
                <option value="Thông báo - Kế hoạch Đoàn trường">Thông báo - Kế hoạch Đoàn trường</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {/* Link Drive */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className={`text-[9px] sm:text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Link văn kiện (Drive)</label>
            <div className="relative">
              <input 
                disabled={isView} 
                value={formData.document_url} 
                onChange={(e) => setFormData({...formData, document_url: e.target.value})} 
                className={`w-full p-3.5 sm:p-4 pl-10 sm:pl-12 bg-gray-50 rounded-xl sm:rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-xs sm:text-sm font-bold ${ringColor} text-blue-600 disabled:opacity-70 truncate`} 
                placeholder="https://..." 
              />
              <LinkIcon size={16} className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Nút thao tác dưới Footer Form */}
          {!isView && (
            <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 border-t border-gray-100 flex-shrink-0">
              <button 
                type="button" 
                onClick={onClose} 
                className="w-full sm:w-auto order-2 sm:order-1 px-6 py-3 rounded-xl sm:rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all text-[11px] tracking-widest uppercase border-none outline-none"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                className={`w-full sm:w-auto order-1 sm:order-2 px-8 sm:px-10 py-3 ${btnBg} text-white rounded-xl sm:rounded-2xl font-bold shadow-lg transition-all text-[11px] tracking-widest uppercase flex items-center justify-center gap-2 border-none outline-none`}
              >
                {isAdd ? 'Lưu' : 'Cập nhật'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
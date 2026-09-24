'use client';

import { useState } from "react";
import { FileText, Plus, Eye, Edit, Trash2, Search, Filter, RotateCcw, Link as LinkIcon, Info } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

const CATEGORY_INTRO: any = {
  "Văn kiện Đoàn khoa": "Bao gồm các chỉ đạo, nghị quyết, văn kiện chính thức của Đoàn khoa qua các thời kỳ.",
  "Hành chính": "Các biểu mẫu, thanh quyết toán, công văn phục vụ công tác văn phòng.",
  "Tổ chức - Hoạt động": "Danh sách nhân sự các chương trình, công nhận các hoạt động thi đua sinh viên giỏi cấp khoa.",
  "Thông báo - Khen thưởng": "Các thông báo khẩn, kết quả khen thưởng thi đua chi đoàn, hướng dẫn nghiệp vụ công tác đoàn viên."
};

export default function SectionTaiLieu({ taiLieuList, onOpenModal, documentCategories = [] }: any) {
  const { canCreate, canView, canEdit, canDelete } = usePermissions('tai-lieu');
  const hasAnyAction = canView || canEdit || canDelete;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCat, setFilterCat] = useState("");

  const filteredList = taiLieuList.filter((item: any) => {
    const matchesSearch = item.document_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCat === "" || item.document_type === filterCat;
    return matchesSearch && matchesCat;
  });

  return (
    <section className="space-y-4 sm:space-y-6 text-black">
      {/* Tiêu đề & Nút thêm tài liệu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#0054a5] pb-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0054a5] rounded-xl text-white shadow-lg shadow-blue-100">
            <FileText size={24} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-[#0054a5] tracking-tight">Tài liệu</h2>
        </div>

        {/* 🟢 Chỉ hiển thị nút Thêm khi có quyền create */}
        {canCreate && (
          <button 
            onClick={() => onOpenModal('add')} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0054a5] text-white px-4 py-2.5 sm:py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer border-none outline-none"
          >
            <Plus size={16} /> <span>Thêm tài liệu</span>
          </button>
        )}
      </div>

      {/* Thanh tìm kiếm & lọc */}
      <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center gap-3 sm:gap-4 shadow-sm">
        <div className="relative flex-1 min-w-0 md:min-w-[300px] group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0054a5] transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm tài liệu..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-12 pr-4 py-2.5 sm:py-3 bg-white rounded-xl text-xs sm:text-sm border-none outline-none focus:ring-2 ring-blue-400 shadow-sm font-semibold" 
          />
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-initial">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0054a5] transition-colors" />
            <select 
              value={filterCat} 
              onChange={(e) => setFilterCat(e.target.value)} 
              className="w-full md:w-auto pl-12 pr-10 py-2.5 sm:py-3 bg-white rounded-xl text-xs sm:text-sm font-bold border-none outline-none focus:ring-2 ring-blue-400 shadow-sm appearance-none min-w-0 md:min-w-[280px] cursor-pointer transition-all"
            >
              <option value="">Tất cả loại tài liệu</option>
              {documentCategories.map((cat: string, index: number) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          {(searchTerm || filterCat) && (
            <button 
              onClick={() => {setSearchTerm(""); setFilterCat("");}} 
              className="p-2.5 sm:p-3 bg-white text-red-500 rounded-xl shadow-sm hover:bg-red-50 transition-all active:scale-90 flex-shrink-0 cursor-pointer border-none outline-none"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>
      </div>

      {filterCat && CATEGORY_INTRO[filterCat] && (
        <div className="bg-blue-50 border-l-4 border-l-[#0054a5] p-3 sm:p-4 rounded-r-xl animate-in slide-in-from-left duration-300">
          <div className="flex items-center gap-2 text-[#0054a5] mb-1">
            <Info size={16} />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Giới thiệu {filterCat}</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">{CATEGORY_INTRO[filterCat]}</p>
        </div>
      )}

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left table-auto min-w-[700px] sm:min-w-0">
            <thead className="bg-[#0054a5] text-white font-bold text-[11px] sm:text-[13px] tracking-widest text-center">
              <tr>
                <th className="px-3 sm:px-4 py-4 sm:py-5 w-12 sm:w-16 text-center">STT</th>
                <th className="px-4 sm:px-6 py-4 sm:py-5 text-center">Tên tài liệu</th>
                <th className="px-4 sm:px-6 py-4 sm:py-5 text-center">Học kỳ</th>
                <th className="px-4 sm:px-6 py-4 sm:py-5 text-center">Năm học</th>
                <th className="px-4 sm:px-6 py-4 sm:py-5 text-center">Loại tài liệu</th>
                <th className="px-4 sm:px-6 py-4 sm:py-5 text-center">Link</th>
                {/* 🟢 Ẩn header Thao tác nếu không có quyền xem, sửa, xóa */}
                {hasAnyAction && (
                  <th className="px-4 sm:px-6 py-4 sm:py-5 w-36 sm:w-40 text-center">Thao tác</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length > 0 ? (
                filteredList.map((item: any, index: number) => (
                  <tr key={item._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-center font-bold text-slate-400 group-hover:text-[#0054a5]">{index + 1}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-slate-700 leading-relaxed max-w-[200px] sm:max-w-none truncate sm:whitespace-normal">{item.document_name}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center font-bold text-slate-500 whitespace-nowrap">{item.semester}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center font-bold text-slate-500 whitespace-nowrap">{item.academic_year}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-slate-500 italic">{item.document_type}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                      <a 
                        href={item.document_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline font-bold text-[11px] sm:text-xs bg-blue-50 px-2.5 sm:px-3 py-1 rounded-full no-underline whitespace-nowrap"
                      >
                        <LinkIcon size={12} /> Xem file
                      </a>
                    </td>

                    {/* 🟢 Ẩn / hiện icon tương ứng từng quyền */}
                    {hasAnyAction && (
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          {canView && (
                            <button 
                              onClick={() => onOpenModal('view', item)} 
                              className="p-1.5 sm:p-2 text-[#0054a5] hover:bg-blue-100 rounded-lg border-none outline-none transition-all cursor-pointer"
                              title="Xem chi tiết"
                            >
                              <Eye size={17} />
                            </button>
                          )}
                          {canEdit && (
                            <button 
                              onClick={() => onOpenModal('edit', item)} 
                              className="p-1.5 sm:p-2 text-amber-600 hover:bg-amber-100 rounded-lg border-none outline-none transition-all cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Edit size={17} />
                            </button>
                          )}
                          {canDelete && (
                            <button 
                              onClick={() => onOpenModal('delete', item)} 
                              className="p-1.5 sm:p-2 text-red-600 hover:bg-red-100 rounded-lg border-none outline-none transition-all cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 size={17} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={hasAnyAction ? 7 : 6} className="px-6 py-12 sm:py-16 text-center italic text-slate-400 font-bold">
                    Không tìm thấy tài liệu nào phù hợp...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
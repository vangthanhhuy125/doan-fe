'use client';

import { useState } from "react";
import { FileText, Plus, Eye, Edit, Trash2, Search, Filter, RotateCcw, Link as LinkIcon, Info } from "lucide-react";

const CATEGORY_INTRO: any = {
  "Văn kiện đoàn khoa": "Bao gồm các văn bản chỉ đạo, nghị quyết đại hội và các văn kiện chính thức từ Đoàn khoa qua các thời kỳ.",
  "Hành chính": "Các biểu mẫu dự trù, thanh quyết toán, công văn đi và đến phục vụ công tác văn phòng Đoàn.",
  "Tổ chức - Hoạt động": "Tài liệu hướng dẫn tổ chức sự kiện, kịch bản chương trình và hồ sơ nhân sự Đoàn.",
  "Thông báo - Kế hoạch Đoàn trường": "Các thông báo khẩn, kế hoạch tác chiến và văn bản hướng dẫn nghiệp vụ trực tiếp từ Đoàn trường Đại học."
};

export default function SectionTaiLieu({ taiLieuList, onOpenModal }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCat, setFilterCat] = useState("");

  const filteredList = taiLieuList.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCat === "" || item.category === filterCat;
    return matchesSearch && matchesCat;
  });

  return (
    <section className="space-y-6 text-black">
      <div className="flex items-center justify-between border-b-2 border-[#0054a5] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0054a5] rounded-xl text-white shadow-lg shadow-blue-100"><FileText size={24} /></div>
          <h2 className="text-2xl font-black uppercase text-[#0054a5] tracking-tight">Tài liệu</h2>
        </div>
        <button onClick={() => onOpenModal('add')} className="flex items-center gap-2 bg-[#0054a5] text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 text-xs uppercase tracking-wider">
          <Plus size={16} /> Thêm tài liệu
        </button>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[300px] group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0054a5] transition-colors" />
          <input type="text" placeholder="Tìm tên tài liệu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-sm border-none outline-none focus:ring-2 ring-blue-400 shadow-sm" />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Filter 
              size={16} 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0054a5] transition-colors" 
            />
            <select 
              value={filterCat} 
              onChange={(e) => setFilterCat(e.target.value)} 
              className="pl-12 pr-10 py-3 bg-white rounded-xl text-sm font-bold border-none outline-none focus:ring-2 ring-blue-400 shadow-sm appearance-none min-w-[280px] cursor-pointer transition-all"
            >
              <option value="">Tất cả loại tài liệu</option>
              <option value="Văn kiện đoàn khoa">Văn kiện đoàn khoa</option>
              <option value="Hành chính">Hành chính</option>
              <option value="Tổ chức - Hoạt động">Tổ chức - Hoạt động</option>
              <option value="Thông báo - Kế hoạch Đoàn trường">Thông báo - Kế hoạch Đoàn trường</option>
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
              className="p-3 bg-white text-red-500 rounded-xl shadow-sm hover:bg-red-50 transition-all active:scale-90"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>
        </div>

      {filterCat && (
        <div className="bg-blue-50 border-l-4 border-[#0054a5] p-4 rounded-r-xl animate-in slide-in-from-left duration-300">
          <div className="flex items-center gap-2 text-[#0054a5] mb-1">
            <Info size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Giới thiệu về {filterCat}</span>
          </div>
          <p className="text-sm font-medium text-slate-600 leading-relaxed">{CATEGORY_INTRO[filterCat]}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0054a5] text-white font-bold text-[13px] tracking-widest text-center">
            <tr>
              <th className="px-4 py-5 w-16 text-center">STT</th>
              <th className="px-6 py-5 text-center">Tên tài liệu</th>
              <th className="px-6 py-5 text-center">Học kỳ</th>
              <th className="px-6 py-5 text-center">Năm học</th>
              <th className="px-6 py-5 text-center">Loại tài liệu</th>
              <th className="px-6 py-5 text-center">Link</th>
              <th className="px-6 py-5 w-40 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredList.length > 0 ? filteredList.map((item: any, index: number) => (
              <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-4 py-4 text-center font-bold text-slate-400 group-hover:text-[#0054a5]">{index + 1}</td>
                <td className="px-6 py-4 font-bold text-slate-700 leading-relaxed">{item.name}</td>
                <td className="px-6 py-4 text-center font-bold text-slate-500">{item.semester}</td>
                <td className="px-6 py-4 text-center font-bold text-slate-500">{item.year}</td>
                <td className="px-6 py-4 font-medium text-slate-500 italic">{item.category}</td>
                <td className="px-6 py-4 text-center">
                  <a href={item.link} target="_blank" className="inline-flex items-center gap-1 text-blue-600 hover:underline font-bold text-xs bg-blue-50 px-3 py-1 rounded-full no-underline"><LinkIcon size={12} /> Xem file</a>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => onOpenModal('view', item)} className="p-2 text-[#0054a5] hover:bg-blue-100 rounded-lg border-none outline-none transition-all"><Eye size={18} /></button>
                    <button onClick={() => onOpenModal('edit', item)} className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg border-none outline-none transition-all"><Edit size={18} /></button>
                    <button onClick={() => onOpenModal('delete', item)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg border-none outline-none transition-all"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="px-6 py-16 text-center italic text-slate-400 font-bold">Không tìm thấy tài liệu nào phù hợp...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
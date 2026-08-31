// SectionHuman Resources.tsx
'use client';

import { useState } from "react";
import { Users, Plus, Eye, Edit, Trash2, Search, Filter, RotateCcw, Phone, Mail, Calendar, GraduationCap } from "lucide-react";

interface Props {
  nhanSuList: any[];
  onOpenModal: (mode: string, data?: any) => void;
}

export default function SectionNhanSu({ nhanSuList = [], onOpenModal }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const safeList = Array.isArray(nhanSuList) ? nhanSuList : [];

  const classes = Array.from(new Set(safeList.map((item: any) => item.class))).filter(Boolean).sort();
  const birthYears = Array.from(new Set(safeList.map((item: any) => item.birthday?.split('-')[0]))).filter(Boolean).sort().reverse();

  const filteredList = safeList.filter((item: any) => {
    const birthdayParts = item.birthday?.split('-'); 
    const matchesSearch = (item.full_name || item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.student_id || item.mssv || "").includes(searchTerm);
    const matchesClass = filterClass === "" || item.class === filterClass;
    const matchesMonth = filterMonth === "" || (birthdayParts && parseInt(birthdayParts[1]) === parseInt(filterMonth));
    const matchesYear = filterYear === "" || (birthdayParts && birthdayParts[0] === filterYear);
    return matchesSearch && matchesClass && matchesMonth && matchesYear;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setFilterClass("");
    setFilterMonth("");
    setFilterYear("");
  };

  return (
    <section className="space-y-6 text-black">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#0054a5] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0054a5] rounded-2xl text-white shadow-md shadow-blue-500/20 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-[#0054a5] tracking-tight">
              Danh sách BCH Đoàn - Hội
            </h2>
            <p className="text-xs text-slate-400 font-semibold hidden sm:block">
              Quản lý hồ sơ, thông tin chi tiết và quyền truy cập của cán bộ Đoàn - Hội
            </p>
          </div>
        </div>
        <button 
          onClick={() => onOpenModal('add')} 
          className="bg-[#0054a5] text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-95 border-none outline-none cursor-pointer shrink-0 w-full sm:w-auto"
        >
          <Plus size={16} /> <span>Thêm nhân sự</span>
        </button>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shadow-xs">
        <div className="relative group sm:col-span-2 lg:col-span-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0054a5] transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm tên hoặc MSSV..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-11 pr-4 py-2.5 bg-white rounded-xl text-xs sm:text-sm font-bold border border-slate-200 outline-none focus:border-[#0054a5] focus:ring-2 ring-blue-100 shadow-2xs transition-all" 
          />
        </div>
        
        <div className="relative group">
          <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0054a5]" />
          <select 
            value={filterClass} 
            onChange={(e) => setFilterClass(e.target.value)} 
            className="w-full pl-11 pr-8 py-2.5 bg-white rounded-xl text-xs sm:text-sm font-bold border border-slate-200 outline-none focus:border-[#0054a5] focus:ring-2 ring-blue-100 shadow-2xs appearance-none cursor-pointer"
          >
            <option value="">Tất cả Chi đoàn</option>
            {classes.map((c: any) => (
              <option key={String(c)} value={String(c)}>{String(c)}</option>
            ))}
          </select>
        </div>

        <div className="relative group">
          <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0054a5]" />
          <select 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)} 
            className="w-full pl-11 pr-8 py-2.5 bg-white rounded-xl text-xs sm:text-sm font-bold border border-slate-200 outline-none focus:border-[#0054a5] focus:ring-2 ring-blue-100 shadow-2xs appearance-none cursor-pointer"
          >
            <option value="">Lọc tháng sinh</option>
            {Array.from({length: 12}, (_, i) => (
              <option key={i+1} value={i+1}>Tháng {i+1}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <div className="relative group flex-1">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0054a5]" />
            <select 
              value={filterYear} 
              onChange={(e) => setFilterYear(e.target.value)} 
              className="w-full pl-11 pr-8 py-2.5 bg-white rounded-xl text-xs sm:text-sm font-bold border border-slate-200 outline-none focus:border-[#0054a5] focus:ring-2 ring-blue-100 shadow-2xs appearance-none cursor-pointer"
            >
              <option value="">Lọc năm sinh</option>
              {birthYears.map((y: any) => (
                <option key={String(y)} value={String(y)}>{String(y)}</option>
              ))}
            </select>
          </div>
          {(searchTerm || filterClass || filterMonth || filterYear) && (
            <button 
              onClick={resetFilters} 
              className="p-2.5 bg-white text-rose-600 hover:bg-rose-50 rounded-xl shadow-2xs border border-rose-200 transition-all border-none outline-none cursor-pointer shrink-0"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>

      {/* GIAO DIỆN DESKTOP & TABLET: BẢNG CUỘN NGANG AN TOÀN */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse min-w-[720px]">
            <thead className="bg-[#0054a5] text-white font-bold text-xs uppercase tracking-wider text-center">
              <tr>
                <th className="px-4 py-4 w-14 text-center">STT</th>
                <th className="px-5 py-4 text-left">Họ và tên</th>
                <th className="px-4 py-4 text-center">MSSV</th>
                <th className="px-4 py-4 text-center">Chi đoàn</th>
                <th className="px-5 py-4 text-left">SĐT / Email</th>
                <th className="px-4 py-4 text-center">Ngày sinh</th>
                <th className="px-4 py-4 text-center w-36">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length > 0 ? (
                filteredList.map((item: any, index: number) => (
                  <tr key={item._id || item.id} className="hover:bg-blue-50/40 transition-colors group text-black font-medium">
                    <td className="px-4 py-3.5 text-center font-bold text-slate-400 group-hover:text-[#0054a5]">{index + 1}</td>
                    <td className="px-5 py-3.5 font-extrabold text-slate-800 leading-snug">
                      {item.full_name || item.name}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-500 font-mono text-xs">
                      {item.student_id || item.mssv}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                        {item.class || '---'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-xs font-bold text-[#0054a5]">{item.phone || '---'}</div>
                      <div className="text-[10px] text-slate-400 font-medium truncate max-w-[180px]">
                        {item.personal_email || (item.student_id || item.mssv ? `${item.student_id || item.mssv}@gm.uit.edu.vn` : '---')}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-semibold text-slate-600 text-xs">
                      {item.birthday ? new Date(item.birthday).toLocaleDateString('vi-VN') : "---"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => onOpenModal('view', item)} className="p-2 text-[#0054a5] hover:bg-blue-100 rounded-xl transition-all border-none bg-transparent cursor-pointer" title="Xem chi tiết">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => onOpenModal('edit', item)} className="p-2 text-amber-600 hover:bg-amber-100 rounded-xl transition-all border-none bg-transparent cursor-pointer" title="Chỉnh sửa">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => onOpenModal('delete', item)} className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-all border-none bg-transparent cursor-pointer" title="Xóa">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center italic text-slate-400 font-bold">
                    Không có nhân sự nào phù hợp...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GIAO DIỆN MOBILE: DẠNG CARD TIỆN DỤNG, TRỰC QUAN */}
      <div className="grid grid-cols-1 gap-3.5 md:hidden">
        {filteredList.length > 0 ? (
          filteredList.map((item: any, index: number) => (
            <div 
              key={item._id || item.id} 
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#0054a5] font-black text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                      {item.full_name || item.name}
                    </h4>
                    <span className="text-[11px] font-bold text-slate-400 font-mono">
                      MSSV: {item.student_id || item.mssv || '---'}
                    </span>
                  </div>
                </div>

                <span className="bg-blue-50 text-[#0054a5] border border-blue-100 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase shrink-0">
                  {item.class || '---'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium pt-0.5">
                <div className="flex items-center gap-1.5 truncate">
                  <Phone size={13} className="text-[#0054a5] shrink-0" />
                  <span className="truncate">{item.phone || '---'}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Calendar size={13} className="text-[#0054a5] shrink-0" />
                  <span className="truncate">{item.birthday ? new Date(item.birthday).toLocaleDateString('vi-VN') : '---'}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2 truncate text-slate-500">
                  <Mail size={13} className="text-[#0054a5] shrink-0" />
                  <span className="truncate">{item.personal_email || (item.student_id || item.mssv ? `${item.student_id || item.mssv}@gm.uit.edu.vn` : '---')}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  onClick={() => onOpenModal('view', item)} 
                  className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-[#0054a5] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border-none cursor-pointer"
                >
                  <Eye size={14} /> <span>Xem</span>
                </button>
                <button 
                  onClick={() => onOpenModal('edit', item)} 
                  className="flex-1 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border-none cursor-pointer"
                >
                  <Edit size={14} /> <span>Sửa</span>
                </button>
                <button 
                  onClick={() => onOpenModal('delete', item)} 
                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs flex items-center justify-center border-none cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs font-bold text-slate-400 italic bg-white rounded-2xl border border-slate-200">
            Không có nhân sự nào phù hợp...
          </div>
        )}
      </div>
    </section>
  );
}
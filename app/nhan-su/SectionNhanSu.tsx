'use client';

import { useState } from "react";
import { Users, Plus, Eye, Edit, Trash2, Search, Filter, RotateCcw } from "lucide-react";

interface Props {
  nhanSuList: any[];
  onOpenModal: (mode: string, data?: any) => void;
}

export default function SectionNhanSu({ nhanSuList, onOpenModal }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const classes = Array.from(new Set(nhanSuList.map((item: any) => item.class))).filter(Boolean).sort();
  const birthYears = Array.from(new Set(nhanSuList.map((item: any) => item.birthday?.split('-')[0]))).filter(Boolean).sort().reverse();

  const filteredList = nhanSuList.filter((item: any) => {
    const birthdayParts = item.birthday?.split('-'); 
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.mssv.includes(searchTerm);
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
      <div className="flex items-center justify-between border-b-2 border-[#0054a5] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0054a5] rounded-xl text-white shadow-lg shadow-blue-100">
            <Users size={24} />
          </div>
          <h2 className="text-2xl font-black uppercase text-[#0054a5] tracking-tight">Danh sách BCH Đoàn - Hội</h2>
        </div>
        <button 
          onClick={() => onOpenModal('add')} 
          className="bg-[#0054a5] text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-[10px] uppercase tracking-widest active:scale-95 border-none outline-none"
        >
          <Plus size={16} /> Thêm nhân sự
        </button>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-sm">
        <div className="relative group md:col-span-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0054a5] transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm tên hoặc MSSV..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-sm font-bold border-none outline-none focus:ring-2 ring-blue-400 shadow-sm transition-all" 
          />
        </div>
        
        <div className="relative group">
          <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0054a5]" />
          <select 
            value={filterClass} 
            onChange={(e) => setFilterClass(e.target.value)} 
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-sm font-bold border-none outline-none focus:ring-2 ring-blue-400 shadow-sm appearance-none cursor-pointer"
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
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-sm font-bold border-none outline-none focus:ring-2 ring-blue-400 shadow-sm appearance-none cursor-pointer"
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
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-sm font-bold border-none outline-none focus:ring-2 ring-blue-400 shadow-sm appearance-none cursor-pointer"
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
              className="p-3 bg-white text-red-500 rounded-xl shadow-sm border border-red-100 hover:bg-red-50 transition-all border-none outline-none"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#0054a5] text-white font-bold text-[13px] tracking-widest text-center">
            <tr>
              <th className="px-4 py-5 w-16 text-center">STT</th>
              <th className="px-6 py-5 text-center">Họ và tên</th>
              <th className="px-6 py-5 text-center">MSSV</th>
              <th className="px-6 py-5 text-center">Chi đoàn</th>
              <th className="px-6 py-5 text-center">SĐT / Email</th>
              <th className="px-6 py-5 text-center">Ngày sinh</th>
              <th className="px-6 py-5 text-center w-40"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredList.length > 0 ? (
              filteredList.map((item: any, index: number) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group text-black font-medium">
                  <td className="px-4 py-4 text-center font-bold text-slate-400 group-hover:text-[#0054a5]">{index + 1}</td>
                  <td className="px-6 py-4 font-bold text-slate-700 leading-relaxed text-xm tracking-tight">{item.name}</td>
                  <td className="px-6 py-4 text-center font-bold text-slate-500">{item.mssv}</td>
                  <td className="px-6 py-4 text-center font-bold text-slate-500">{item.class}</td>
                  <td className="px-6 py-4">
                     <div className="text-[11px] font-bold text-blue-600">{item.phone}</div>
                     <div className="text-[10px] text-slate-400 italic">{item.mssv}@gm.uit.edu.vn</div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-500">
                    {item.birthday ? new Date(item.birthday).toLocaleDateString('vi-VN') : "---"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => onOpenModal('view', item)} className="p-2 text-[#0054a5] hover:bg-blue-100 rounded-lg transition-all border-none outline-none"><Eye size={18} /></button>
                      <button onClick={() => onOpenModal('edit', item)} className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-all border-none outline-none"><Edit size={18} /></button>
                      <button onClick={() => onOpenModal('delete', item)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all border-none outline-none"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center italic text-slate-400 font-bold">
                  Không có nhân sự nào phù hợp...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
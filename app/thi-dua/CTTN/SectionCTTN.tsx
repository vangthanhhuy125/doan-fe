'use client';

import { useState } from "react";
import { Flag, Plus, Eye, Edit, Trash2, Search, RotateCcw, Filter } from "lucide-react";

interface Props {
  cttnList: any[];
  onOpenModal: (mode: string, data?: any) => void;
}

export default function SectionCTTN({ cttnList, onOpenModal }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const years = Array.from(new Set(cttnList.map(item => item.academic_year))).filter(Boolean).sort().reverse();

  const filteredList = cttnList.filter(item => {
    const matchesSearch = item.youth_project_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.unit_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === "" || item.academic_year === filterYear;
    return matchesSearch && matchesYear;
  });

  return (
    <section className="space-y-6 text-black">
      <div className="flex items-center justify-between border-b-2 border-[#0054a5] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0054a5] rounded-xl text-white shadow-lg shadow-blue-100">
            <Flag size={24} />
          </div>
          <h2 className="text-2xl font-black uppercase text-[#0054a5] tracking-tight">Công trình thanh niên</h2>
        </div>
        <button
          onClick={() => onOpenModal('add')}
          className="flex items-center gap-2 bg-[#0054a5] text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-[#1d92ff] transition-all active:scale-95 text-xs uppercase tracking-wider border-none outline-none"
        >
          <Plus size={16} /> Thêm CTTN
        </button>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[250px] group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0054a5] transition-colors" />
          <input type="text" placeholder="Tìm tên công trình hoặc đơn vị" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-sm border border-slate-200 focus:border-blue-400 outline-none shadow-sm transition-all" />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0054a5] transition-colors" />
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="pl-12 pr-10 py-3 bg-white rounded-xl text-sm font-bold border border-slate-200 focus:border-blue-400 outline-none appearance-none cursor-pointer shadow-sm min-w-[180px]">
              <option value="">Tất cả năm học</option>
              {years.map(year => <option key={String(year)} value={String(year)}>{String(year)}</option>)}
            </select>
          </div>
          {(searchTerm || filterYear) && (
            <button onClick={() => {setSearchTerm(""); setFilterYear("");}} className="p-3 bg-white text-red-500 rounded-xl border border-red-100 hover:bg-red-50 shadow-sm border-none outline-none bg-transparent"><RotateCcw size={18} /></button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0054a5] text-white font-bold text-[13px] tracking-widest text-center">
            <tr>
              <th className="px-4 py-5 w-16 text-center">STT</th>
              <th className="px-6 py-5 text-center">Tên công trình</th>
              <th className="px-6 py-5 text-center">Đơn vị thực hiện</th>
              <th className="px-6 py-5 w-32 text-center">Năm học</th>
              <th className="px-6 py-5 w-40"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredList.length > 0 ? filteredList.map((item, index) => (
              <tr key={item._id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-4 py-4 text-center font-bold text-slate-400 group-hover:text-[#0054a5]">{index + 1}</td>
                <td className="px-6 py-4 font-bold text-slate-700 leading-relaxed">{item.youth_project_name}</td>
                <td className="px-6 py-4 font-medium text-slate-500">{item.unit_name}</td>
                <td className="px-6 py-4 text-center font-bold text-slate-400 group-hover:text-[#0054a5]">{item.academic_year}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => onOpenModal('view', item)} className="p-2 text-[#0054a5] hover:bg-blue-100 rounded-lg transition-all shadow-sm border border-transparent hover:border-blue-200 bg-transparent outline-none"><Eye size={18} /></button>
                    <button onClick={() => onOpenModal('edit', item)} className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-all shadow-sm border border-transparent hover:border-amber-200 bg-transparent outline-none"><Edit size={18} /></button>
                    <button onClick={() => onOpenModal('delete', item)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all shadow-sm border border-transparent hover:border-red-200 bg-transparent outline-none"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-6 py-16 text-center italic text-slate-400 font-bold">Không tìm thấy công trình nào...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
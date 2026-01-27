'use client';

import { useState } from "react";
import { Lightbulb, Plus, Eye, Edit, Trash2, Search, Filter, RotateCcw } from "lucide-react";

interface Props {
  mhgpList: any[];
  onOpenModal: (mode: string, data?: any) => void;
}

export default function SectionMHGP({ mhgpList, onOpenModal }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const years = Array.from(new Set(mhgpList.map(item => item.year))).sort().reverse();

  const filteredList = mhgpList.filter(item => {
    const matchesName = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === "" || item.year === filterYear;
    return matchesName && matchesYear;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setFilterYear("");
  };

  return (
    <section className="space-y-6 text-black">
      <div className="flex items-center justify-between border-b-2 border-blue-600 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-100">
            <Lightbulb size={24} />
          </div>
          <h2 className="text-2xl font-black uppercase text-blue-600 tracking-tight">Mô hình giải pháp</h2>
        </div>
        <button 
          onClick={() => onOpenModal('add')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 text-xs uppercase tracking-wider"
        >
          <Plus size={16} /> Thêm MHGP
        </button>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[250px] group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text"
            placeholder="Tìm kiếm tên mô hình giải pháp"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-sm border border-slate-200 focus:border-blue-400 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <select 
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="pl-12 pr-10 py-3 bg-white rounded-xl text-sm font-bold border border-slate-200 focus:border-blue-400 outline-none appearance-none cursor-pointer transition-all shadow-sm min-w-[180px]"
            >
              <option value="">Tất cả năm học</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {(searchTerm || filterYear) && (
            <button 
              onClick={resetFilters}
              className="p-3 bg-white text-red-500 rounded-xl border border-red-100 hover:border-red-300 hover:bg-red-50 transition-all shadow-sm"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
        <table className="w-full text-sm text-left text-black">
          <thead className="bg-blue-600 text-white font-bold text-[13px] tracking-widest">
            <tr>
              <th className="px-4 py-5 text-center w-16">STT</th>
              <th className="px-6 py-5 text-center">Tên Mô hình - Giải pháp</th>
              <th className="px-6 py-5 text-center w-32">Năm học</th>
              <th className="px-6 py-5 text-center w-40"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredList.length > 0 ? (
              filteredList.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-4 py-5 text-center font-bold text-slate-400 group-hover:text-blue-600">
                    {index + 1}
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-700 leading-relaxed">{item.name}</td>
                  <td className="px-6 py-5 text-center font-bold text-slate-400 group-hover:text-blue-600">{item.year}</td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => onOpenModal('view', item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all shadow-sm border border-transparent hover:border-blue-200">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => onOpenModal('edit', item)} className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-all shadow-sm border border-transparent hover:border-amber-200">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => onOpenModal('delete', item)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all shadow-sm border border-transparent hover:border-red-200">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center">
                   <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Search size={40} className="opacity-20" />
                      <p className="font-bold italic">Không tìm thấy kết quả nào phù hợp với bộ lọc...</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
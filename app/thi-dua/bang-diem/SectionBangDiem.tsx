'use client';

import { useState } from "react";
import { Award, Plus, Eye, Edit, Trash2, Search, Link as LinkIcon, RotateCcw, Filter } from "lucide-react";

interface Props {
  activities: any[];
  onOpenModal: (mode: string, data?: any) => void;
}

export default function SectionBangDiem({ activities, onOpenModal }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const years = Array.from(new Set(activities.map(item => item.namHoc))).sort().reverse();

  const filteredActivities = activities.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.plan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === "" || item.namHoc === filterYear;
    return matchesSearch && matchesYear;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setFilterYear("");
  };

  return (
    <section className="space-y-6 text-black">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-100">
            <Award size={24} />
          </div>
          <h2 className="text-2xl font-black uppercase text-emerald-600 tracking-tight">Bảng điểm thi đua</h2>
        </div>
        <button 
          onClick={() => onOpenModal('add')}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2 text-[10px] uppercase tracking-widest active:scale-95"
        >
          <Plus size={16} /> Thêm minh chứng
        </button>
      </div>

      {/* THANH TÌM KIẾM & LỌC */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[250px] group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text"
            placeholder="Tìm kiếm tên hoạt động hoặc số hiệu kế hoạch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-sm font-bold border border-slate-200 focus:border-emerald-400 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <select 
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="pl-12 pr-10 py-3 bg-white rounded-xl text-sm font-bold border border-slate-200 focus:border-emerald-400 outline-none appearance-none cursor-pointer transition-all shadow-sm min-w-[180px]"
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

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-emerald-600 text-white font-bold uppercase text-[10px] tracking-widest text-center">
            <tr>
              <th className="px-4 py-5 w-16">STT</th>
              <th className="px-6 py-5 text-left">Tên hoạt động</th>
              <th className="px-6 py-5 text-left">Kế hoạch</th>
              <th className="px-6 py-5 text-center w-32">Năm học</th>
              <th className="px-6 py-5">Minh chứng</th>
              <th className="px-6 py-5 w-40">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((item, index) => (
                <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors group text-black">
                  <td className="px-4 py-4 text-center font-bold text-slate-400 group-hover:text-emerald-600">{index + 1}</td>
                  <td className="px-6 py-4 font-bold text-slate-700 leading-relaxed">{item.name}</td>
                  <td className="px-6 py-4 font-medium text-slate-500 italic">{item.plan}</td>
                  <td className="px-6 py-4 text-center font-bold text-slate-400 group-hover:text-emerald-600">{item.namHoc}</td>
                  <td className="px-6 py-4 text-center">
                    <a href={item.evidence} target="_blank" className="inline-flex items-center gap-1 text-blue-600 hover:underline font-bold text-xs bg-blue-50 px-3 py-1 rounded-full">
                      <LinkIcon size={12} /> Bài đăng
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => onOpenModal('view', item)} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all shadow-sm border border-transparent hover:border-emerald-200"><Eye size={18} /></button>
                      <button onClick={() => onOpenModal('edit', item)} className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-all shadow-sm border border-transparent hover:border-amber-200"><Edit size={18} /></button>
                      <button onClick={() => onOpenModal('delete', item)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all shadow-sm border border-transparent hover:border-red-200"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                   <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Search size={40} className="opacity-20" />
                      <p className="font-bold italic">Không tìm thấy hoạt động nào...</p>
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
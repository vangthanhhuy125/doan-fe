'use client';

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Filter, Search, CalendarDays, RotateCcw } from "lucide-react";
import ProgramForm from "./ProgramForm";
import ConfirmDelete from "./ConfirmDelete";

export default function ToChucPage() {
  const [data, setData] = useState<any[]>([]);
  const [formModal, setFormModal] = useState<{ open: boolean; mode: 'add' | 'edit' | 'view'; item: any }>({
    open: false,
    mode: 'view',
    item: null
  });
  const [deleteItem, setDeleteItem] = useState<any>(null);
  
  const [systemConfig, setSystemConfig] = useState<any>({
    years: [],
    academicYears: [],
    semesters: []
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterAcademicYear, setFilterAcademicYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const fetchPrograms = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/programs`);
      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSystemConfig = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/system-config`);
      if (res.ok) {
        const result = await res.json();
        setSystemConfig({
          years: result?.years || [],
          academicYears: result?.academicYears || [],
          semesters: result?.semesters || []
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchSystemConfig();
  }, []);

  const handleSaveProgram = async (formData: any) => {
    try {
      const isEdit = formModal.mode === 'edit';
      const url = isEdit 
        ? `${process.env.NEXT_PUBLIC_API_URL}/programs/${formData._id}` 
        : `${process.env.NEXT_PUBLIC_API_URL}/programs`;
        
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchPrograms();
        setFormModal({ open: false, mode: 'view', item: null });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteItem) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/programs/${deleteItem._id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          await fetchPrograms();
          setDeleteItem(null);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterMonth("");
    setFilterYear("");
    setFilterSemester("");
    setFilterAcademicYear("");
  };

  const isFiltering = searchTerm !== "" || filterSemester !== "" || filterAcademicYear !== "" || filterMonth !== "" || filterYear !== "";
  
  const filteredData = data.filter(item => {
    const matchesSearch = (item.program_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = filterSemester === "" || item.semester === filterSemester;
    const matchesAcademicYear = filterAcademicYear === "" || item.academic_year === filterAcademicYear;
    const matchesMonth = filterMonth === "" || item.month === filterMonth;
    const matchesYear = filterYear === "" || item.year === filterYear;
    return matchesSearch && matchesSemester && matchesAcademicYear && matchesMonth && matchesYear;
  });

  return (
    <div className="space-y-6 text-black">
      <div className="flex items-center justify-between border-b-2 border-[#0054a5] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0054a5] rounded-xl text-white shadow-lg shadow-blue-100 transition-transform hover:scale-105">
            <CalendarDays size={24} /> 
          </div>
          <h2 className="text-2xl font-black uppercase text-[#0054a5] tracking-tight">
            Chương trình khoa
          </h2>
        </div>
        <button 
          onClick={() => setFormModal({ open: true, mode: 'add', item: null })}
          className="flex items-center gap-2 bg-[#1d92ff] text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-[#0054a5] transition-all active:scale-95 text-xs uppercase tracking-wider border-none outline-none"
        >
          <Plus size={20} /> Thêm chương trình
        </button>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoạt động..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1d92ff] focus:ring-1 focus:ring-[#1d92ff] transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-4 items-end pt-2 border-t border-gray-100 text-left">
          <div className="flex items-center gap-2 text-[#0054a5] font-bold mb-1 mr-2 text-sm">
            <Filter size={16} /> <span>Lọc theo:</span>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-400">Tháng</label>
            <select 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="block w-28 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 cursor-pointer text-black font-bold"
            >
              <option value="">Tất cả</option>
              {Array.from({ length: 12 }, (_, i) => {
                const m = (i + 1).toString().padStart(2, '0');
                return <option key={m} value={m}>Tháng {m}</option>;
              })}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-400">Năm</label>
            <select 
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="block w-28 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 cursor-pointer text-black font-bold"
            >
              <option value="">Tất cả</option>
              {systemConfig.years.map((y: string, idx: number) => (
                <option key={idx} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-400">Học kỳ</label>
            <select 
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="block w-32 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 cursor-pointer text-black font-bold"
            >
              <option value="">Tất cả</option>
              {systemConfig.semesters.map((s: string, idx: number) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-400">Năm học</label>
            <select 
              value={filterAcademicYear}
              onChange={(e) => setFilterAcademicYear(e.target.value)}
              className="block w-40 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 cursor-pointer text-black font-bold"
            >
              <option value="">Tất cả</option>
              {systemConfig.academicYears.map((ay: string, idx: number) => (
                <option key={idx} value={ay}>{ay}</option>
              ))}
            </select>
          </div>

          {isFiltering && (
            <button 
              onClick={resetFilters}
              className="p-2 mb-0.5 text-red-500 hover:bg-red-50 rounded-full transition-all active:rotate-180 duration-500 border-none bg-transparent"
            >
              <RotateCcw size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0054a5] text-white text-[14px] font-bold">
            <tr>
              <th className="px-4 py-4 text-center uppercase w-12">STT</th>
              <th className="px-4 py-4 text-center">Tên chương trình</th>
              <th className="px-4 py-4 text-center">Tháng - Năm - HK - Niên khóa</th>
              <th className="px-4 py-4 text-center w-32"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={item._id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-4 py-4 text-center font-bold text-gray-400">{index + 1}</td>
                  <td className="px-4 py-4 font-bold text-[#0054a5]">{item.program_name}</td>
                  <td className="px-4 py-4 text-center text-gray-600 font-medium whitespace-nowrap">
                    {item.month}/{item.year} - {item.semester} - {item.academic_year}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setFormModal({ open: true, mode: 'view', item })} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border-none bg-transparent"><Eye size={18} /></button>
                      <button onClick={() => setFormModal({ open: true, mode: 'edit', item })} className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors border-none bg-transparent"><Edit size={18} /></button>
                      <button onClick={() => setDeleteItem(item)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors border-none bg-transparent"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-10 text-center text-gray-400 italic">
                  Không tìm thấy hoạt động nào phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formModal.open && (
        <ProgramForm
          mode={formModal.mode}
          data={formModal.item}
          systemConfig={systemConfig}
          onClose={() => setFormModal({ open: false, mode: 'view', item: null })}
          onSave={handleSaveProgram}
        />
      )}

      {deleteItem && (
        <ConfirmDelete 
          title={deleteItem.program_name}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
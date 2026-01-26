'use client';

import { useState } from "react";
import { 
  Calendar, Plus, Edit, Trash2, Eye, Filter, Search,
  CalendarDays
} from "lucide-react";
import ProgramView from "./ProgramView";
import ProgramAdd from "./ProgramAdd";
import ProgramEdit from "./ProgramEdit";
import ConfirmDelete from "./ConfirmDelete";

const initialData = [
  {
    id: 1,
    name: "Chiến dịch Tình nguyện Mùa hè xanh 2026",
    month: "07",
    year: "2026",
    semester: "HK2",
    academicYear: "2025-2026",
    stakeholder: "Đoàn trường, Địa phương",
    linkTaiLieu: "#", linkKeHoach: "#", linkDTKP: "#", linkDRL: "#",
  },
  {
    id: 2,
    name: "Hội thao Sinh viên Khoa CNPM",
    month: "10",
    year: "2026",
    semester: "HK1",
    academicYear: "2026-2027",
    stakeholder: "Ban Thể thao Khoa",
    linkTaiLieu: "#", linkKeHoach: "#", linkDTKP: "#", linkDRL: "#",
  },
];

export default function ToChucPage() {
  const [data, setData] = useState(initialData);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterAcademicYear, setFilterAcademicYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const handleAddProgram = (newItem: any) => {
    setData([...data, { ...newItem, id: Date.now() }]);
  };

  const handleUpdateProgram = (updatedItem: any) => {
    setData(data.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleConfirmDelete = () => {
    if (deleteItem) {
      setData(data.filter(item => item.id !== deleteItem.id));
      setDeleteItem(null);
    }
  };

  const filteredData = data.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = filterSemester === "" || item.semester === filterSemester;
    const matchesAcademicYear = filterAcademicYear === "" || item.academicYear === filterAcademicYear;
    const matchesMonth = filterMonth === "" || item.month === filterMonth;
    const matchesYear = filterYear === "" || item.year === filterYear;

    return matchesSearch && matchesSemester && matchesAcademicYear && matchesMonth && matchesYear;
  });

  return (
    <div className="space-y-6 text-black">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0054a5] rounded-xl text-white shadow-lg shadow-blue-100">
            <CalendarDays size={24} /> 
          </div>
          <h2 className="text-2xl font-black uppercase text-[#0054a5] tracking-tight">
            Chương trình năm
          </h2>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-[#1d92ff] text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-[#0054a5] transition-all active:scale-95"
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

        <div className="flex flex-wrap gap-4 items-end pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-[#0054a5] font-bold mb-1 mr-2 text-sm">
            <Filter size={16} /> <span>Lọc theo:</span>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-400">Học kỳ</label>
            <select 
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="block w-32 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="HK1">Học kỳ 1</option>
              <option value="HK2">Học kỳ 2</option>
              <option value="HK3">Học kỳ 3</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-400">Năm học</label>
            <select 
              value={filterAcademicYear}
              onChange={(e) => setFilterAcademicYear(e.target.value)}
              className="block w-40 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-400">Tháng</label>
            <select 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="block w-28 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
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
              className="block w-28 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>

          <button 
            onClick={() => { setSearchTerm(""); setFilterSemester(""); setFilterAcademicYear(""); setFilterMonth(""); setFilterYear(""); }}
            className="text-xs text-red-500 font-bold hover:underline pb-2 ml-auto"
          >
            Làm mới bộ lọc
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0054a5] text-white text-[14px] font-bold">
            <tr>
              <th className="px-4 py-4 text-center uppercase w-12">STT</th>
              <th className="px-4 py-4 text-center">Tên chương trình</th>
              <th className="px-4 py-4 text-center">Tháng - Năm - Học kì - Năm học</th>
              <th className="px-4 py-4 text-center w-32"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-4 py-4 text-center font-bold text-gray-400">{index + 1}</td>
                  <td className="px-4 py-4 font-bold text-[#0054a5]">{item.name}</td>
                  <td className="px-4 py-4 text-center text-gray-600 font-medium whitespace-nowrap">
                    {item.month}/{item.year} - {item.semester} - {item.academicYear}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setViewItem(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"><Eye size={18} /></button>
                      <button onClick={() => setEditItem(item)} className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"><Edit size={18} /></button>
                      <button onClick={() => setDeleteItem(item)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-10 text-center text-gray-400 italic">
                  Không tìm thấy hoạt động nào phù hợp với từ khóa hoặc bộ lọc của má.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewItem && <ProgramView data={viewItem} onClose={() => setViewItem(null)} />}
      {isAddOpen && <ProgramAdd onClose={() => setIsAddOpen(false)} onSave={handleAddProgram} />}
      {editItem && <ProgramEdit data={editItem} onClose={() => setEditItem(null)} onSave={handleUpdateProgram} />}
      {deleteItem && (
        <ConfirmDelete 
          title={deleteItem.name}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
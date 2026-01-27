'use client';

import { useState } from "react";
import { ShieldCheck, Star, Search, Filter, X } from "lucide-react";
import MemberList from "./MemberList";
import MemberForm from "./MemberForm";
import ConfirmNoticeDelete from "../thong-bao/ConfirmNoticeDelete";

export default function PartyDevelopment() {
  const [dangVien, setDangVien] = useState([
    { id: 1, name: "Nguyễn Văn An", mssv: "23520001", chiDoan: "PMCL2023.1" },
    { id: 2, name: "Lê Thị Bình", mssv: "23520002", chiDoan: "SE114.O11" }
  ]);
  const [dvut, setDvut] = useState([
    { id: 3, name: "Phạm Minh Đức", mssv: "23520003", chiDoan: "PMCL2022.2" }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterChiDoan, setFilterChiDoan] = useState("");

  const [modal, setModal] = useState<{ open: boolean, type: 'DV' | 'UT' | null, data: any }>({ open: false, type: null, data: null });
  const [deleteItem, setDeleteItem] = useState<{ type: 'DV' | 'UT', item: any } | null>(null);

  const chiDoanList = Array.from(new Set([...dangVien, ...dvut].map(i => i.chiDoan)));

  const handleSave = (formData: any) => {
    const list = modal.type === 'DV' ? dangVien : dvut;
    const setList = modal.type === 'DV' ? setDangVien : setDvut;

    if (formData.id) {
      setList(list.map(i => i.id === formData.id ? formData : i));
    } else {
      setList([...list, { ...formData, id: Date.now() }]);
    }
    setModal({ open: false, type: null, data: null });
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    if (deleteItem.type === 'DV') setDangVien(dangVien.filter(i => i.id !== deleteItem.item.id));
    else setDvut(dvut.filter(i => i.id !== deleteItem.item.id));
    setDeleteItem(null);
  };

  const filterData = (data: any[]) => {
    return data.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.mssv.includes(searchTerm);
      const matchesChiDoan = filterChiDoan === "" || item.chiDoan === filterChiDoan;
      return matchesSearch && matchesChiDoan;
    });
  };

  return (
    <div className="space-y-4 pt-6 border-t border-slate-100 text-black">
      <div className="flex items-center gap-2 text-red-600 mb-2">
        <ShieldCheck size={20} />
        <h3 className="font-bold uppercase text-sm tracking-tight">Công tác phát triển Đảng</h3>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative col-span-1 md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm tên hoặc MSSV..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 whitespace-nowrap">Lọc Chi đoàn</label>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 w-full">
                <Filter size={14} className="text-gray-400" />
                <select 
                  value={filterChiDoan}
                  onChange={(e) => setFilterChiDoan(e.target.value)}
                  className="bg-transparent outline-none text-xs font-bold text-slate-600 w-full"
                >
                  <option value="">Tất cả Chi đoàn</option>
                  {chiDoanList.map(cd => <option key={cd} value={cd}>{cd}</option>)}
                </select>
              </div>
            </div>
            {(searchTerm || filterChiDoan) && (
              <button 
                onClick={() => {setSearchTerm(""); setFilterChiDoan("");}}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Xóa lọc"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <MemberList 
          title="Đảng viên hiện tại" icon={<ShieldCheck size={18}/>} data={filterData(dangVien)}
          colorClass="bg-red-600" iconClass="bg-red-50 text-red-600"
          onAdd={() => setModal({ open: true, type: 'DV', data: null })}
          onEdit={(item: any) => setModal({ open: true, type: 'DV', data: item })}
          onDelete={(item: any) => setDeleteItem({ type: 'DV', item })}
        />
        <MemberList 
          title="Đoàn viên ưu tú" icon={<Star size={18}/>} data={filterData(dvut)}
          colorClass="bg-[#0054a5]" iconClass="bg-blue-50 text-blue-600"
          onAdd={() => setModal({ open: true, type: 'UT', data: null })}
          onEdit={(item: any) => setModal({ open: true, type: 'UT', data: item })}
          onDelete={(item: any) => setDeleteItem({ type: 'UT', item })}
        />
      </div>

      {modal.open && (
        <MemberForm 
          title={modal.type === 'DV' ? "Đảng viên" : "Đoàn viên ưu tú"}
          color={modal.type === 'DV' ? "bg-red-600" : "bg-[#0054a5]"}
          data={modal.data}
          onClose={() => setModal({ open: false, type: null, data: null })}
          onSave={handleSave}
        />
      )}

      {deleteItem && (
        <ConfirmNoticeDelete 
          title={deleteItem.item.name}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
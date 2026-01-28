'use client';

import { useState } from "react";
import { Shield, Plus, Eye, Edit, Trash2, Search, RotateCcw, Key } from "lucide-react";
import CaiDatModal from "./CaiDatModal";

export default function CaiDatPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState<any>({ open: false, mode: 'view', data: null });

  const [accounts, setAccounts] = useState([
    { _id: "65b2a...", displayName: "Nguyễn Văn Anh", username: "anh.uit", password: "password123" },
    { _id: "65b2b...", displayName: "Lê Thị Bình", username: "binh.se", password: "se_secret_2026" }
  ]);

  const filteredAccounts = accounts.filter(acc => 
    acc.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setAccounts(accounts.filter(a => a._id !== id));
  };

  return (
    <div className="space-y-6 text-black">
      <div className="flex items-center justify-between border-b-2 border-[#0054a5] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0054a5] rounded-xl text-white shadow-lg shadow-blue-100">
            <Shield size={24} />
          </div>
          <h2 className="text-2xl font-black uppercase text-[#0054a5] tracking-tight">Quản lý Quyền truy cập</h2>
        </div>
        <button 
          onClick={() => setModal({ open: true, mode: 'add', data: null })}
          className="bg-[#0054a5] text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 text-[10px] uppercase tracking-widest border-none outline-none flex items-center gap-2"
        >
          <Plus size={16} /> Cấp tài khoản
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0054a5] transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên người dùng..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl text-sm border-none outline-none focus:bg-white focus:ring-2 ring-blue-100 transition-all" 
          />
        </div>
        {searchTerm && (
          <button onClick={() => setSearchTerm("")} className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all">
            <RotateCcw size={18} />
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-xl bg-white">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#0054a5] text-white font-bold text-[13px]">
            <tr>
              <th className="px-6 py-5 text-center w-20">STT</th>
              <th className="px-6 py-5 text-center">Người sở hữu</th>
              <th className="px-6 py-5 text-center">Tên đăng nhập</th>
              <th className="px-6 py-5 text-center">Mật khẩu</th>
              <th className="px-6 py-5 text-center w-40"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredAccounts.map((item, index) => (
              <tr key={item._id} className="hover:bg-blue-50/50 transition-colors group">
                <td className="px-6 py-5 text-center font-bold text-slate-400 group-hover:text-[#0054a5] transition-colors text-xm">{index + 1}</td>
                <td className="px-6 py-5 font-black text-slate-700 text-xm">{item.displayName}</td>
                <td className="px-6 py-5 font-bold text-[#0054a5] text-xm">{item.username}</td>
                <td className="px-6 py-5 font-mono text-xm text-slate-500 bg-gray-50/50">{item.password}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setModal({ open: true, mode: 'view', data: item })} className="p-2 text-[#0054a5] hover:bg-blue-100 rounded-xl transition-all border-none outline-none"><Eye size={18} /></button>
                    <button onClick={() => setModal({ open: true, mode: 'edit', data: item })} className="p-2 text-amber-600 hover:bg-amber-100 rounded-xl transition-all border-none outline-none"><Edit size={18} /></button>
                    <button onClick={() => setModal({ open: true, mode: 'delete', data: item })} className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-all border-none outline-none"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <CaiDatModal 
          mode={modal.mode} 
          data={modal.data} 
          onClose={() => setModal({ ...modal, open: false })}
          onConfirmDelete={handleDelete}
          nhanSuList={[]} 
        />
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, RotateCcw } from "lucide-react";
import AccountsModal from "../accounts/AccountsModal";

export default function AccountsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [nhanSuList, setNhanSuList] = useState<any[]>([]);
  const [modal, setModal] = useState<any>({ open: false, mode: 'view', data: null });

  const fetchData = async () => {
    try {
      const [accRes, nsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/nhan-su`)
      ]);
      const accData = await accRes.json();
      const nsData = await nsRes.json();
      setAccounts(Array.isArray(accData) ? accData : []);
      setNhanSuList(Array.isArray(nsData) ? nsData : []);
    } catch (error) {
      setAccounts([]);
      setNhanSuList([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAccounts = accounts.filter(acc =>
    (acc.displayName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (acc.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/${id}`, {
      method: 'DELETE',
    });
    fetchData();
  };

  const handleSave = async (payload: any) => {
    const isAdd = modal.mode === 'add';
    const url = isAdd
      ? `${process.env.NEXT_PUBLIC_API_URL}/accounts`
      : `${process.env.NEXT_PUBLIC_API_URL}/accounts/${payload._id}`;

    await fetch(url, {
      method: isAdd ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setModal({ open: false, mode: 'view', data: null });
    fetchData();
  };

  const renderPasswordCell = (password: string) => {
    const isHashed = password?.startsWith('$2b$') || password?.startsWith('$2a$');
    if (isHashed) {
      return (
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono text-xs text-slate-400">••••••••</span>
          <span className="inline-flex items-center bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
            Đã bảo mật
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="font-mono text-xs font-bold text-slate-700">{password || '123456'}</span>
        <span className="inline-flex items-center bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
          Mặc định
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0054a5] transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên người dùng hoặc tên đăng nhập..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl text-sm border-none outline-none focus:bg-white focus:ring-2 ring-blue-100 transition-all font-bold"
          />
        </div>
        {searchTerm && (
          <button onClick={() => setSearchTerm("")} className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all border-none outline-none cursor-pointer">
            <RotateCcw size={18} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase">
          Tổng số: <strong className="text-[#0054a5]">{filteredAccounts.length}</strong> tài khoản
        </span>
        <button
          onClick={() => setModal({ open: true, mode: 'add', data: null })}
          className="flex items-center gap-2 bg-[#0054a5] text-white px-4 py-2.5 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-all active:scale-95 text-[10px] uppercase tracking-widest border-none outline-none cursor-pointer"
        >
          <Plus size={16} /> Cấp tài khoản
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-xl bg-white">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#0054a5] text-white font-bold text-[13px] tracking-widest">
            <tr>
              <th className="px-6 py-5 text-center w-20">STT</th>
              <th className="px-6 py-5 text-center">Người sở hữu</th>
              <th className="px-6 py-5 text-center">Tên đăng nhập</th>
              <th className="px-6 py-5 text-center">Mật khẩu</th>
              <th className="px-6 py-5 text-center w-40">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredAccounts.map((item, index) => (
              <tr key={item._id} className="hover:bg-blue-50/50 transition-colors group">
                <td className="px-6 py-5 text-center font-bold text-slate-400 group-hover:text-[#0054a5] transition-colors text-sm">{index + 1}</td>
                <td className="px-6 py-5 text-center font-black text-slate-700 text-sm">{item.displayName}</td>
                <td className="px-6 py-5 text-center font-bold text-[#0054a5] text-sm">{item.username}</td>
                <td className="px-6 py-5 text-center">{renderPasswordCell(item.password)}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setModal({ open: true, mode: 'edit', data: item })} className="p-2 text-amber-600 hover:bg-amber-100 rounded-xl transition-all border-none outline-none cursor-pointer" title="Chỉnh sửa"><Edit size={18} /></button>
                    <button onClick={() => setModal({ open: true, mode: 'delete', data: item })} className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-all border-none outline-none cursor-pointer" title="Xóa"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredAccounts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center italic text-slate-400 font-bold">Không có tài khoản nào...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <AccountsModal
          mode={modal.mode}
          data={modal.data}
          onClose={() => setModal({ ...modal, open: false })}
          onConfirmDelete={handleDelete}
          onSave={handleSave}
          nhanSuList={nhanSuList}
        />
      )}
    </div>
  );
}

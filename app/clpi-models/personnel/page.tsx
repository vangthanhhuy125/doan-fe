'use client';

import { useState } from 'react';
import { Users, Search, PlusCircle, Shield, UserCheck } from 'lucide-react';

export default function PersonnelManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const officers = [
    { id: '1', code: 'CB-2025-014', name: 'Nguyễn Văn A', position: 'Bí thư Chi đoàn', unit: 'Chi đoàn KTPM2025.1', role: 'Unit Manager' },
    { id: '2', code: 'CB-2024-002', name: 'Trần Thị B', position: 'Trưởng Ban', unit: 'Ban Học thuật', role: 'Reviewer' },
    { id: '3', code: 'CB-2025-089', name: 'Lê Hoàng C', position: 'Chủ nhiệm CLB', unit: 'CLB GamApp', role: 'Unit Manager' },
    { id: '4', code: 'CB-2024-055', name: 'Phạm Minh D', position: 'Phó Bí thư Đoàn Khoa', unit: 'BTV Đoàn Khoa', role: 'CLPI Admin' },
    { id: '5', code: 'CB-2025-102', name: 'Võ Thị F', position: 'Ủy viên BCH', unit: 'Chi đoàn KTPM2025.1', role: 'Officer' },
  ];

  const filtered = officers.filter(
    o => o.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Nhân sự Cán bộ</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Danh sách nhân sự, phân công vai trò và đơn vị theo dõi CLPI.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Thêm cán bộ mới')}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all border-none cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <PlusCircle size={16} /> Thêm cán bộ
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên cán bộ, chi đoàn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0054a5]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="text-[11px] text-slate-400 font-bold uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="py-4 px-6">MÃ CB</th>
                <th className="py-4 px-4">HỌ VÀ TÊN</th>
                <th className="py-4 px-4">CHỨC VỤ</th>
                <th className="py-4 px-4">ĐƠN VỊ TRỰC THUỘC</th>
                <th className="py-4 px-4 text-center">VAI TRÒ HỆ THỐNG</th>
                <th className="py-4 px-6 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-slate-500">{o.code}</td>
                  <td className="py-4 px-4 font-extrabold text-slate-900">{o.name}</td>
                  <td className="py-4 px-4 text-slate-600 font-semibold">{o.position}</td>
                  <td className="py-4 px-4 text-slate-700">{o.unit}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-[#0054a5] border border-blue-200">
                      {o.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <button type="button" className="text-xs font-bold text-[#0054a5] hover:underline border-none bg-transparent cursor-pointer">
                      Chỉnh sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
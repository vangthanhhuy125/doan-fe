'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, PlusCircle, Lock, Unlock, Eye, 
  Clock, CheckCircle2, AlertCircle, Search
} from 'lucide-react';

interface CycleItem {
  id: string;
  name: string;
  quarter: string;
  year: number;
  startDate: string;
  endDate: string;
  selfDeadline: string;
  reviewDeadline: string;
  totalOfficers: number;
  status: 'OPEN' | 'REVIEWING' | 'COMPLETED' | 'LOCKED';
}

export default function CyclesManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const cycles: CycleItem[] = [
    {
      id: 'cycle_q2_2026',
      name: 'Chu kỳ CLPI Quý II/2026',
      quarter: 'Quý II',
      year: 2026,
      startDate: '01/04/2026',
      endDate: '30/06/2026',
      selfDeadline: '30/06/2026',
      reviewDeadline: '10/07/2026',
      totalOfficers: 42,
      status: 'OPEN',
    },
    {
      id: 'cycle_q1_2026',
      name: 'Chu kỳ CLPI Quý I/2026',
      quarter: 'Quý I',
      year: 2026,
      startDate: '01/01/2026',
      endDate: '31/03/2026',
      selfDeadline: '31/03/2026',
      reviewDeadline: '10/04/2026',
      totalOfficers: 40,
      status: 'LOCKED',
    },
    {
      id: 'cycle_q4_2025',
      name: 'Chu kỳ CLPI Quý IV/2025',
      quarter: 'Quý IV',
      year: 2025,
      startDate: '01/10/2025',
      endDate: '31/12/2025',
      selfDeadline: '31/12/2025',
      reviewDeadline: '10/01/2026',
      totalOfficers: 38,
      status: 'LOCKED',
    },
  ];

  const getStatusBadge = (status: CycleItem['status']) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">Đang diễn ra</span>;
      case 'REVIEWING':
        return <span className="px-3 py-1 bg-blue-50 text-[#0054a5] border border-blue-200 rounded-full text-xs font-bold">Đang thẩm định</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-bold">Đã công bố</span>;
      case 'LOCKED':
        return <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-bold flex items-center gap-1"><Lock size={12} /> Đã khóa</span>;
    }
  };

  const filtered = cycles.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Chu kỳ Đánh giá</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Thiết lập mốc thời gian, đối tượng tham gia và điều phối trạng thái chu kỳ CLPI.
          </p>
        </div>

        <Link
          href="/clpi-models/cycles/wizard"
          className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all no-underline shadow-md shadow-blue-500/20 active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <PlusCircle size={16} /> Thiết lập chu kỳ mới
        </Link>
      </div>

      {/* Danh sách các chu kỳ */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm chu kỳ theo tên..."
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
                <th className="py-4 px-6">TÊN CHU KỲ</th>
                <th className="py-4 px-4">THỜI GIAN ĐÁNH GIÁ</th>
                <th className="py-4 px-4">HẠN TỰ CHẤM</th>
                <th className="py-4 px-4 text-center">CÁN BỘ</th>
                <th className="py-4 px-4 text-center">TRẠNG THÁI</th>
                <th className="py-4 px-6 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((cycle) => (
                <tr key={cycle.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-extrabold text-sm text-slate-900 leading-snug">{cycle.name}</p>
                    <span className="text-[11px] text-slate-400">Năm học: {cycle.year} - {cycle.year + 1}</span>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-semibold">
                    {cycle.startDate} — {cycle.endDate}
                  </td>
                  <td className="py-4 px-4 font-bold text-rose-600">
                    {cycle.selfDeadline}
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-slate-800">
                    {cycle.totalOfficers}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {getStatusBadge(cycle.status)}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border-none cursor-pointer"
                    >
                      Chi tiết
                    </button>
                    {cycle.status === 'OPEN' && (
                      <button
                        type="button"
                        onClick={() => alert('Đã khóa chu kỳ thành công!')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 cursor-pointer"
                      >
                        Khóa chu kỳ
                      </button>
                    )}
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
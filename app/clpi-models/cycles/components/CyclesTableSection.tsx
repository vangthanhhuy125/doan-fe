'use client';

import { useState, useMemo } from 'react';
import { PlusCircle, Lock, Search, Loader2, Trash2, Eye } from 'lucide-react';
import { CycleItem } from '../types';

interface Props {
  cycles: CycleItem[];
  loading: boolean;
  onOpenCreate: () => void;
  onViewDetail: (cycle: CycleItem) => void;
  onLockCycle: (cycle: CycleItem) => void;
  onDeleteCycle: (cycle: CycleItem) => void;
}

export default function CyclesTableSection({
  cycles,
  loading,
  onOpenCreate,
  onViewDetail,
  onLockCycle,
  onDeleteCycle,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(
    () => cycles.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase().trim())),
    [cycles, searchTerm]
  );

  const getStatusBadge = (status: CycleItem['status']) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
            Đang diễn ra
          </span>
        );
      case 'REVIEWING':
        return (
          <span className="inline-block px-3 py-1 bg-blue-50 text-[#0054a5] border border-blue-200 rounded-full text-xs font-bold">
            Đang thẩm định
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-bold">
            Đã công bố
          </span>
        );
      case 'LOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-bold">
            <Lock size={12} /> Đã khóa
          </span>
        );
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản lý Chu kỳ Đánh giá
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Thiết lập mốc thời gian, đối tượng tham gia và điều phối trạng thái chu kỳ CLPI.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreate}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all border-none cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <PlusCircle size={16} /> Thiết lập chu kỳ mới
        </button>
      </div>

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

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
          </div>
        ) : (
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
                {filtered.length > 0 ? (
                  filtered.map((cycle) => (
                    <tr key={cycle.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-extrabold text-sm text-slate-900 leading-snug">
                          {cycle.name}
                        </p>
                        <span className="text-[11px] text-slate-400">
                          {cycle.quarter} — Năm {cycle.year}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-semibold">
                        {cycle.startDate} — {cycle.endDate}
                      </td>
                      <td className="py-4 px-4 font-bold text-rose-600">{cycle.selfDeadline}</td>
                      <td className="py-4 px-4 text-center font-bold text-slate-800">
                        {cycle.totalOfficers}
                      </td>
                      <td className="py-4 px-4 text-center">{getStatusBadge(cycle.status)}</td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewDetail(cycle)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border-none cursor-pointer transition-colors"
                          >
                            <Eye size={13} /> Chi tiết
                          </button>

                          {cycle.status === 'OPEN' && (
                            <button
                              type="button"
                              onClick={() => onLockCycle(cycle)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl text-xs border border-amber-200 cursor-pointer transition-colors"
                            >
                              <Lock size={13} /> Khóa
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onDeleteCycle(cycle)}
                            title="Xóa chu kỳ"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 cursor-pointer transition-colors"
                          >
                            <Trash2 size={13} /> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-slate-400 italic font-semibold"
                    >
                      {cycles.length === 0
                        ? 'Chưa có chu kỳ đánh giá CLPI nào. Nhấn "Thiết lập chu kỳ mới" để tạo.'
                        : 'Không tìm thấy chu kỳ phù hợp.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
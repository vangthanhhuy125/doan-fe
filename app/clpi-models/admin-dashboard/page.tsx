'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, Award, Calendar, CheckCircle2, 
  ClockAlert, ArrowUpRight, TrendingUp, BarChart3,
  Download, PlusCircle, Search, ChevronRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [selectedCycle] = useState('Quý II/2026');

  // Thống kê tổng hợp toàn khoa
  const stats = {
    totalOfficers: 42,
    submittedReports: 39,
    approvedEvaluations: 34,
    pendingReviews: 5,
    averageCLPI: 87.2,
    excellentRate: 28, // %
  };

  const unitSummaries = [
    { id: '1', name: 'Chi đoàn KTPM2025.1', total: 6, submitted: 6, avgCLPI: 89.4, status: 'Hoàn thành' },
    { id: '2', name: 'Chi đoàn KTPM2024.1', total: 8, submitted: 8, avgCLPI: 88.1, status: 'Hoàn thành' },
    { id: '3', name: 'Ban Học thuật', total: 10, submitted: 9, avgCLPI: 86.5, status: 'Chờ duyệt 1' },
    { id: '4', name: 'Ban Phong trào', total: 9, submitted: 8, avgCLPI: 85.0, status: 'Chờ duyệt 1' },
    { id: '5', name: 'CLB GamApp', total: 9, submitted: 8, avgCLPI: 87.8, status: 'Chờ duyệt 1' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header tổng quan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <span className="text-[11px] font-black uppercase text-[#0054a5] tracking-wider px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded-lg">
            Quản trị BTV Đoàn Khoa
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Bảng điều khiển BTV — {selectedCycle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Theo dõi tiến độ thẩm định, phê duyệt và hiệu suất cán bộ trên quy mô toàn khoa.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Link
            href="/clpi-models/cycles/wizard"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all no-underline shadow-md shadow-blue-500/20 active:scale-95"
          >
            <PlusCircle size={15} /> Tạo chu kỳ mới
          </Link>
          <Link
            href="/clpi-models/analytics"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all no-underline"
          >
            <Download size={15} /> Xuất thống kê
          </Link>
        </div>
      </div>

      {/* KPI Cards toàn khoa */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng số cán bộ</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-slate-900">{stats.totalOfficers}</h3>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp size={12} /> 100% active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Bao gồm BTV, BCH, Chi đoàn & CLB</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tỷ lệ nộp hồ sơ</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-[#0054a5]">
              {Math.round((stats.submittedReports / stats.totalOfficers) * 100)}%
            </h3>
            <span className="text-xs font-bold text-slate-400">({stats.submittedReports}/{stats.totalOfficers})</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Hạn nộp tự chấm: 30/06/2026</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CLPI Trung bình</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-emerald-600">{stats.averageCLPI}</h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Tốt
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Tăng +1.4 điểm so với Quý I/2026</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hồ sơ chờ BTV duyệt</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-amber-600">{stats.pendingReviews}</h3>
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
              <ClockAlert size={12} /> Cần xử lý
            </span>
          </div>
          <Link href="/clpi-models/review" className="text-[11px] font-bold text-[#0054a5] hover:underline block">
            Xem danh sách chờ duyệt →
          </Link>
        </div>
      </div>

      {/* Cơ cấu xếp loại & Tiến độ đơn vị */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Phân bố xếp loại (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-xs font-black uppercase text-slate-800 tracking-wider">
            Cơ cấu xếp loại toàn khoa
          </h2>
          <div className="space-y-3 pt-2">
            {[
              { label: 'Xuất sắc (≥ 90)', count: 12, pct: 28, color: 'bg-emerald-500' },
              { label: 'Tốt (80 - 89.9)', count: 20, pct: 48, color: 'bg-blue-600' },
              { label: 'Đạt (65 - 79.9)', count: 8, pct: 19, color: 'bg-amber-500' },
              { label: 'Cần hỗ trợ (50 - 64.9)', count: 2, pct: 5, color: 'bg-orange-500' },
              { label: 'Chưa đạt (< 50)', count: 0, pct: 0, color: 'bg-rose-500' },
            ].map((grade) => (
              <div key={grade.label} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">{grade.label}</span>
                  <span className="text-slate-900">{grade.count} cán bộ ({grade.pct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`${grade.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${grade.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bảng tiến độ theo đơn vị (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              Tiến độ theo Chi đoàn & Đơn vị trực thuộc
            </h2>
            <Link href="/clpi-models/unit-dashboard" className="text-xs font-bold text-[#0054a5] hover:underline no-underline">
              Xem tất cả đơn vị →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="text-[11px] text-slate-400 font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Đơn vị</th>
                  <th className="py-2.5 px-3 text-center">Tiến độ nộp</th>
                  <th className="py-2.5 px-3 text-center">CLPI TB</th>
                  <th className="py-2.5 px-3 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {unitSummaries.map((unit) => (
                  <tr key={unit.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-extrabold text-slate-900">{unit.name}</td>
                    <td className="py-3 px-3 text-center font-bold text-[#0054a5]">
                      {unit.submitted}/{unit.total} ({Math.round((unit.submitted / unit.total) * 100)}%)
                    </td>
                    <td className="py-3 px-3 text-center font-black text-emerald-600">{unit.avgCLPI}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0054a5] border border-blue-200">
                        {unit.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
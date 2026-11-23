'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClockAlert, TrendingUp, Download, PlusCircle, Loader2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const [selectedCycle, setSelectedCycle] = useState('');
  const [stats, setStats] = useState({
    totalOfficers: 0,
    submittedReports: 0,
    approvedEvaluations: 0,
    pendingReviews: 0,
    averageCLPI: 0,
    excellentRate: 0,
  });
  const [unitSummaries, setUnitSummaries] = useState<any[]>([]);
  const [gradeDistribution, setGradeDistribution] = useState([
    { label: 'Xuất sắc (≥ 90)', count: 0, pct: 0, color: 'bg-emerald-500' },
    { label: 'Tốt (80 - 89.9)', count: 0, pct: 0, color: 'bg-blue-600' },
    { label: 'Đạt (65 - 79.9)', count: 0, pct: 0, color: 'bg-amber-500' },
    { label: 'Cần hỗ trợ (50 - 64.9)', count: 0, pct: 0, color: 'bg-orange-500' },
    { label: 'Chưa đạt (< 50)', count: 0, pct: 0, color: 'bg-rose-500' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
        const [dashRes, queueRes] = await Promise.all([
          fetch(`${apiUrl}/clpi/admin-dashboard`),
          fetch(`${apiUrl}/clpi/review/queue`),
        ]);

        if (dashRes.ok) {
          const data = await dashRes.json();
          setSelectedCycle(data.cycleName || '');
          if (data.stats) setStats(data.stats);
          setUnitSummaries(Array.isArray(data.unitSummaries) ? data.unitSummaries : []);
        }

        if (queueRes.ok) {
          const list = await queueRes.json();
          const finalized = (Array.isArray(list) ? list : []).filter((e: any) =>
            ['APPROVED', 'FINALIZED'].includes(e.status)
          );
          const counts = [0, 0, 0, 0, 0];
          finalized.forEach((e: any) => {
            const s = Number(e.finalClpiScore || 0);
            if (s >= 90) counts[0]++;
            else if (s >= 80) counts[1]++;
            else if (s >= 65) counts[2]++;
            else if (s >= 50) counts[3]++;
            else counts[4]++;
          });
          setGradeDistribution((prev) =>
            prev.map((g, i) => ({
              ...g,
              count: counts[i],
              pct: finalized.length > 0 ? Math.round((counts[i] / finalized.length) * 100) : 0,
            }))
          );
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <span className="text-[11px] font-black uppercase text-[#0054a5] tracking-wider px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded-lg">
            Quản trị BTV Đoàn Khoa
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Bảng điều khiển BTV {selectedCycle ? `— ${selectedCycle}` : ''}
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng số cán bộ</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-slate-900">{stats.totalOfficers}</h3>
            {stats.totalOfficers > 0 && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp size={12} /> Active
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Bao gồm BTV, BCH, Chi đoàn & CLB</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tỷ lệ nộp hồ sơ</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-[#0054a5]">
              {stats.totalOfficers > 0 ? Math.round((stats.submittedReports / stats.totalOfficers) * 100) : 0}%
            </h3>
            <span className="text-xs font-bold text-slate-400">
              ({stats.submittedReports}/{stats.totalOfficers})
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Tổng hợp theo chu kỳ hiện tại</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CLPI Trung bình</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-emerald-600">
              {stats.approvedEvaluations > 0 ? stats.averageCLPI : '—'}
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {stats.approvedEvaluations > 0 ? `Trên ${stats.approvedEvaluations} hồ sơ đã duyệt` : 'Chưa có hồ sơ duyệt'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hồ sơ chờ BTV duyệt</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-amber-600">{stats.pendingReviews}</h3>
            {stats.pendingReviews > 0 && (
              <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                <ClockAlert size={12} /> Cần xử lý
              </span>
            )}
          </div>
          <Link href="/clpi-models/review" className="text-[11px] font-bold text-[#0054a5] hover:underline block">
            Xem danh sách chờ duyệt →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-xs font-black uppercase text-slate-800 tracking-wider">
            Cơ cấu xếp loại toàn khoa
          </h2>
          <div className="space-y-3 pt-2">
            {gradeDistribution.map((grade) => (
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
                {unitSummaries.length > 0 ? (
                  unitSummaries.map((unit) => (
                    <tr key={unit.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-extrabold text-slate-900">{unit.name}</td>
                      <td className="py-3 px-3 text-center font-bold text-[#0054a5]">
                        {unit.submitted}/{unit.total} ({unit.total > 0 ? Math.round((unit.submitted / unit.total) * 100) : 0}%)
                      </td>
                      <td className="py-3 px-3 text-center font-black text-emerald-600">
                        {unit.avgCLPI > 0 ? unit.avgCLPI : '—'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0054a5] border border-blue-200">
                          {unit.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 italic font-semibold">
                      Chưa có dữ liệu đơn vị trực thuộc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
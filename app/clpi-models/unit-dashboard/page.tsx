'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, Loader2, Filter } from 'lucide-react';

interface UnitMemberClpi {
  id: string;
  fullName: string;
  positionName: string;
  wpiScore: number | null;
  leiScore: number | null;
  ceiScore: number | null;
  sdiScore: number | null;
  clpiScore: number | null;
  classification: string | null;
}

interface UnitDashboardData {
  unitId: string;
  unitName: string;
  cycleName: string;
  totalMembers: number;
  onTimeReportRate: number;
  averageClpi: number;
  completedTasksRate: number;
  members: UnitMemberClpi[];
}

const CLASSIFICATION_BADGES: Record<string, { label: string; style: string }> = {
  'Xuất sắc': { label: 'Xuất sắc', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'Tốt': { label: 'Tốt', style: 'bg-blue-50 text-blue-700 border-blue-200' },
  'Đạt': { label: 'Đạt', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  'Cần hỗ trợ': { label: 'Cần hỗ trợ', style: 'bg-orange-50 text-orange-700 border-orange-200' },
  'Chưa đạt': { label: 'Chưa đạt', style: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function UnitDashboardPage() {
  const [data, setData] = useState<UnitDashboardData | null>(null);
  const [unitOptions, setUnitOptions] = useState<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const getHeaders = () => {
    const token = localStorage.getItem('token') || '';
    let userId = '';
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        const u = parsed.user || parsed;
        userId = String(u._id || u.id || u.user_id || '').trim();
      }
    } catch {}
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (userId) headers['x-user-id'] = userId;
    return headers;
  };

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
        const res = await fetch(`${apiUrl}/clpi/personnel`, { headers: getHeaders() });
        if (res.ok) {
          const list = await res.json();
          const set = new Set<string>();
          (Array.isArray(list) ? list : []).forEach((u: any) => {
            if (u.unit && String(u.unit).trim()) set.add(String(u.unit).trim());
          });
          setUnitOptions(Array.from(set).sort());
        }
      } catch {}
    };
    fetchUnits();
  }, []);

  useEffect(() => {
    const fetchUnitDashboard = async () => {
      setLoading(true);
      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
        const query = selectedUnit ? `?unitId=${encodeURIComponent(selectedUnit)}` : '';
        const res = await fetch(`${apiUrl}/clpi/unit-dashboard${query}`, {
          headers: getHeaders(),
        });

        if (res.ok) {
          const resData = await res.json();
          setData({
            unitId: resData.unitId || 'all',
            unitName: resData.unitName || 'Toàn Đoàn Khoa CNPM',
            cycleName: resData.cycleName || '',
            totalMembers: Number(resData.totalMembers || 0),
            onTimeReportRate: Number(resData.onTimeReportRate || 0),
            averageClpi: Number(resData.averageClpi || 0),
            completedTasksRate: Number(resData.completedTasksRate || 0),
            members: Array.isArray(resData.members) ? resData.members : [],
          });
        } else {
          setData(null);
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUnitDashboard();
  }, [selectedUnit]);

  const filteredMembers = useMemo(() => {
    if (!data) return [];
    const s = searchTerm.toLowerCase().trim();
    return data.members.filter(
      (m) =>
        !s ||
        (m.fullName || '').toLowerCase().includes(s) ||
        (m.positionName || '').toLowerCase().includes(s)
    );
  }, [data, searchTerm]);

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center bg-white rounded-3xl border border-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 text-slate-800 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Bảng điều khiển Đơn vị — {data?.unitName || 'Toàn Đoàn Khoa CNPM'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Theo dõi tiến độ, hiệu suất công việc và chỉ số CLPI của các cán bộ thuộc đơn vị
            {data?.cycleName ? ` (${data.cycleName})` : ''}.
          </p>
        </div>

        {unitOptions.length > 0 && (
          <div className="relative w-full sm:w-64 shrink-0">
            <Filter size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#0054a5] cursor-pointer shadow-2xs"
            >
              <option value="">Toàn Đoàn Khoa CNPM</option>
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Tổng cán bộ đơn vị
          </p>
          <h3 className="text-3xl font-black text-slate-900">
            {String(data?.totalMembers || 0).padStart(2, '0')}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Báo cáo đúng hạn
          </p>
          <h3 className="text-3xl font-black text-emerald-600">
            {data?.onTimeReportRate || 0}%
          </h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            CLPI Trung bình
          </p>
          <h3 className="text-3xl font-black text-[#0054a5]">
            {data && data.averageClpi > 0 ? data.averageClpi.toFixed(1) : '—'}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Nhiệm vụ hoàn thành
          </p>
          <h3 className="text-3xl font-black text-slate-900">
            {data?.completedTasksRate || 0}%
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4 p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <h2 className="text-xs font-black uppercase text-slate-700 tracking-wider">
            DANH SÁCH CÁN BỘ ĐƠN VỊ & KẾT QUẢ CLPI
          </h2>

          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo họ tên, chức vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4 w-44">Chức vụ</th>
                <th className="py-3.5 px-4 w-20 text-center">WPI</th>
                <th className="py-3.5 px-4 w-20 text-center">LEI</th>
                <th className="py-3.5 px-4 w-20 text-center">CEI</th>
                <th className="py-3.5 px-4 w-20 text-center">SDI</th>
                <th className="py-3.5 px-4 w-24 text-center">CLPI</th>
                <th className="py-3.5 px-4 w-32 text-center">Xếp loại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredMembers.map((m) => {
                const badgeObj = m.classification ? CLASSIFICATION_BADGES[m.classification] : null;

                return (
                  <tr key={m.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-4 px-4 font-extrabold text-slate-900">
                      <Link
                        href={`/clpi-models/evaluations/${m.id}/result`}
                        className="hover:text-[#0054a5] transition-colors no-underline text-slate-900 block"
                      >
                        {m.fullName}
                      </Link>
                    </td>

                    <td className="py-4 px-4 text-slate-600 font-semibold">{m.positionName}</td>

                    <td className="py-4 px-4 text-center font-black text-[#0054a5]">
                      {m.wpiScore !== null ? m.wpiScore.toFixed(0) : '—'}
                    </td>

                    <td className="py-4 px-4 text-center font-black text-emerald-600">
                      {m.leiScore !== null ? m.leiScore.toFixed(0) : '—'}
                    </td>

                    <td className="py-4 px-4 text-center font-black text-amber-600">
                      {m.ceiScore !== null ? m.ceiScore.toFixed(0) : '—'}
                    </td>

                    <td className="py-4 px-4 text-center font-black text-purple-600">
                      {m.sdiScore !== null ? m.sdiScore.toFixed(0) : '—'}
                    </td>

                    <td className="py-4 px-4 text-center font-black text-slate-900 text-sm">
                      {m.clpiScore !== null ? m.clpiScore.toFixed(1) : '—'}
                    </td>

                    <td className="py-4 px-4 text-center">
                      {badgeObj ? (
                        <span
                          className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold border ${badgeObj.style}`}
                        >
                          {badgeObj.label}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-semibold">
                          {m.classification || '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 italic font-semibold">
                    {!data || data.members.length === 0
                      ? 'Chưa có dữ liệu cán bộ thuộc đơn vị này.'
                      : 'Không tìm thấy cán bộ nào phù hợp trong đơn vị.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
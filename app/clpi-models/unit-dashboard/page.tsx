'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, CheckCircle2, Award, CheckSquare, 
  Search, ArrowRight, Loader2, BarChart3 
} from 'lucide-react';

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
  onTimeReportRate: number; // %
  averageClpi: number;
  completedTasksRate: number; // %
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock dữ liệu chuẩn xác 100% theo mockup màn hình 10 của BRD
  const mockUnitData: UnitDashboardData = {
    unitId: 'unit_ktpm2025_1',
    unitName: 'Chi đoàn KTPM2025.1',
    cycleName: 'Quý II/2026',
    totalMembers: 5,
    onTimeReportRate: 88,
    averageClpi: 86.4,
    completedTasksRate: 92,
    members: [
      {
        id: 'user_01',
        fullName: 'Nguyễn Văn A',
        positionName: 'Bí thư Chi đoàn',
        wpiScore: 94.0,
        leiScore: 92.0,
        ceiScore: 91.0,
        sdiScore: 93.0,
        clpiScore: 93.0,
        classification: 'Xuất sắc',
      },
      {
        id: 'user_02',
        fullName: 'Trần Minh C',
        positionName: 'Phó Bí thư',
        wpiScore: 88.0,
        leiScore: 86.0,
        ceiScore: 85.0,
        sdiScore: 87.0,
        clpiScore: 86.8,
        classification: 'Tốt',
      },
      {
        id: 'user_03',
        fullName: 'Lê Hoàng D',
        positionName: 'Ủy viên BCH',
        wpiScore: 70.0,
        leiScore: 65.0,
        ceiScore: 60.0,
        sdiScore: 68.0,
        clpiScore: 66.2,
        classification: 'Đạt',
      },
      {
        id: 'user_04',
        fullName: 'Phạm Thanh E',
        positionName: 'Ủy viên BCH',
        wpiScore: 55.0,
        leiScore: 58.0,
        ceiScore: 62.0,
        sdiScore: 50.0,
        clpiScore: 56.1,
        classification: 'Cần hỗ trợ',
      },
      {
        id: 'user_05',
        fullName: 'Võ Thị F',
        positionName: 'Đoàn viên',
        wpiScore: null,
        leiScore: null,
        ceiScore: null,
        sdiScore: null,
        clpiScore: null,
        classification: null,
      },
    ],
  };

  useEffect(() => {
    const fetchUnitDashboard = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clpi/unit-dashboard`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const resData = await res.json();
          setData(resData);
        } else {
          setData(mockUnitData);
        }
      } catch (e) {
        setData(mockUnitData);
      } finally {
        setLoading(false);
      }
    };

    fetchUnitDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-72 items-center justify-center bg-white rounded-3xl border border-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
      </div>
    );
  }

  const filteredMembers = data.members.filter((m) => {
    const s = searchTerm.toLowerCase().trim();
    return !s || m.fullName.toLowerCase().includes(s) || m.positionName.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6 pb-16 text-slate-800 animate-in fade-in duration-200">
      {/* 1. Header Màn hình */}
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Bảng điều khiển Đơn vị — {data.unitName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Theo dõi tiến độ, hiệu suất công việc và chỉ số CLPI của các cán bộ thuộc đơn vị.
        </p>
      </div>

      {/* 2. Hàng 4 Thẻ KPI Đơn vị */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng cán bộ đơn vị */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Tổng cán bộ đơn vị
          </p>
          <h3 className="text-3xl font-black text-slate-900">
            {String(data.totalMembers).padStart(2, '0')}
          </h3>
        </div>

        {/* Card 2: Báo cáo đúng hạn */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Báo cáo đúng hạn
          </p>
          <h3 className="text-3xl font-black text-emerald-600">
            {data.onTimeReportRate}%
          </h3>
        </div>

        {/* Card 3: CLPI Trung bình */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            CLPI Trung bình
          </p>
          <h3 className="text-3xl font-black text-[#0054a5]">
            {data.averageClpi.toFixed(1)}
          </h3>
        </div>

        {/* Card 4: Nhiệm vụ hoàn thành */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Nhiệm vụ hoàn thành
          </p>
          <h3 className="text-3xl font-black text-slate-900">
            {data.completedTasksRate}%
          </h3>
        </div>
      </div>

      {/* 3. Bảng: DANH SÁCH CÁN BỘ ĐƠN VỊ & KẾT QUẢ CLPI */}
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
                    {/* Cột Họ và tên */}
                    <td className="py-4 px-4 font-extrabold text-slate-900">
                      <Link
                        href={`/clpi-models/evaluations/${m.id}/result`}
                        className="hover:text-[#0054a5] transition-colors no-underline text-slate-900 block"
                      >
                        {m.fullName}
                      </Link>
                    </td>

                    {/* Cột Chức vụ */}
                    <td className="py-4 px-4 text-slate-600 font-semibold">
                      {m.positionName}
                    </td>

                    {/* Cột WPI (Màu xanh dương) */}
                    <td className="py-4 px-4 text-center font-black text-[#0054a5]">
                      {m.wpiScore !== null ? m.wpiScore.toFixed(0) : '—'}
                    </td>

                    {/* Cột LEI (Màu xanh ngọc) */}
                    <td className="py-4 px-4 text-center font-black text-emerald-600">
                      {m.leiScore !== null ? m.leiScore.toFixed(0) : '—'}
                    </td>

                    {/* Cột CEI (Màu cam) */}
                    <td className="py-4 px-4 text-center font-black text-amber-600">
                      {m.ceiScore !== null ? m.ceiScore.toFixed(0) : '—'}
                    </td>

                    {/* Cột SDI (Màu tím) */}
                    <td className="py-4 px-4 text-center font-black text-purple-600">
                      {m.sdiScore !== null ? m.sdiScore.toFixed(0) : '—'}
                    </td>

                    {/* Cột CLPI (Xanh đậm) */}
                    <td className="py-4 px-4 text-center font-black text-slate-900 text-sm">
                      {m.clpiScore !== null ? m.clpiScore.toFixed(1) : '—'}
                    </td>

                    {/* Cột Xếp loại */}
                    <td className="py-4 px-4 text-center">
                      {badgeObj ? (
                        <span className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold border ${badgeObj.style}`}>
                          {badgeObj.label}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 italic font-semibold">
                    Không tìm thấy cán bộ nào phù hợp trong đơn vị.
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
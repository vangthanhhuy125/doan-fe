'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Hourglass, ClockAlert, CheckCircle2, 
  Search, Filter, ArrowRight, Loader2, RotateCcw 
} from 'lucide-react';

export interface ReviewQueueItem {
  id: string;
  fullName: string;
  unitBranch: string;
  positionName: string;
  submittedAt: string; // dd/MM/yyyy
  selfScore: number;
  reviewerScore: number | null; // null nếu Chưa chấm
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'NEEDS_REVISION' | 'RESUBMITTED' | 'APPROVED' | 'FINALIZED';
  isOverdue?: boolean;
}

const STATUS_BADGES: Record<string, { label: string; style: string }> = {
  SUBMITTED: { label: 'Chờ đánh giá', style: 'bg-blue-50 text-blue-700 border-blue-200' },
  RESUBMITTED: { label: 'Đã nộp lại', style: 'bg-purple-50 text-purple-700 border-purple-200' },
  UNDER_REVIEW: { label: 'Đang thẩm định', style: 'bg-sky-50 text-sky-700 border-sky-200' },
  NEEDS_REVISION: { label: 'Cần bổ sung', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  APPROVED: { label: 'Đã duyệt', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  FINALIZED: { label: 'Đã công bố', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export default function ReviewQueuePage() {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Mock dữ liệu chuẩn xác theo mockup màn hình 8 của BRD
  const mockQueueData: ReviewQueueItem[] = [
    {
      id: 'eval_01',
      fullName: 'Nguyễn Văn A',
      unitBranch: 'KTPM2025.1',
      positionName: 'Bí thư Chi đoàn',
      submittedAt: '15/08/2026',
      selfScore: 93.0,
      reviewerScore: null,
      status: 'SUBMITTED',
      isOverdue: false,
    },
    {
      id: 'eval_02',
      fullName: 'Trần Thị B',
      unitBranch: 'Ban Học thuật',
      positionName: 'Trưởng Ban',
      submittedAt: '14/08/2026',
      selfScore: 88.5,
      reviewerScore: null,
      status: 'SUBMITTED',
      isOverdue: true,
    },
    {
      id: 'eval_03',
      fullName: 'Lê Hoàng C',
      unitBranch: 'CLB GamApp',
      positionName: 'Chủ nhiệm CLB',
      submittedAt: '12/08/2026',
      selfScore: 91.0,
      reviewerScore: 89.0,
      status: 'NEEDS_REVISION',
      isOverdue: false,
    },
    {
      id: 'eval_04',
      fullName: 'Phạm Minh D',
      unitBranch: 'KTPM2024.2',
      positionName: 'Phó Bí thư',
      submittedAt: '10/08/2026',
      selfScore: 95.0,
      reviewerScore: 94.2,
      status: 'APPROVED',
      isOverdue: false,
    },
  ];

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clpi/review/queue`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setQueue(Array.isArray(data) && data.length > 0 ? data : mockQueueData);
      } else {
        setQueue(mockQueueData);
      }
    } catch (e) {
      setQueue(mockQueueData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // Tính toán số liệu KPI thẻ trên cùng
  const kpiStats = useMemo(() => {
    const pendingCount = queue.filter(q => q.status === 'SUBMITTED' || q.status === 'RESUBMITTED' || q.status === 'UNDER_REVIEW').length;
    const overdueCount = queue.filter(q => q.isOverdue && q.status !== 'APPROVED' && q.status !== 'FINALIZED').length;
    const approvedCount = queue.filter(q => q.status === 'APPROVED' || q.status === 'FINALIZED').length;
    return { pendingCount, overdueCount, approvedCount };
  }, [queue]);

  const filteredQueue = useMemo(() => {
    return queue.filter(item => {
      const s = searchTerm.toLowerCase().trim();
      const matchSearch = !s ||
        item.fullName.toLowerCase().includes(s) ||
        item.unitBranch.toLowerCase().includes(s) ||
        item.positionName.toLowerCase().includes(s);

      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [queue, searchTerm, statusFilter]);

  return (
    <div className="space-y-6 pb-16 text-slate-800 animate-in fade-in duration-200">
      {/* 1. Header màn hình */}
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Hồ sơ chờ đánh giá
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Danh sách hồ sơ tự đánh giá CLPI cán bộ cần BTV thẩm định và cho điểm chính thức.
        </p>
      </div>

      {/* 2. Hàng 3 Thẻ KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Chờ xử lý */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chờ xử lý</p>
            <h3 className="text-3xl font-black text-amber-600 mt-1">
              {String(kpiStats.pendingCount).padStart(2, '0')}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Hourglass size={24} />
          </div>
        </div>

        {/* Card 2: Sắp quá hạn */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sắp quá hạn</p>
            <h3 className="text-3xl font-black text-rose-600 mt-1">
              {String(kpiStats.overdueCount).padStart(2, '0')}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ClockAlert size={24} />
          </div>
        </div>

        {/* Card 3: Đã duyệt tuần này */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đã duyệt tuần này</p>
            <h3 className="text-3xl font-black text-emerald-600 mt-1">
              {String(kpiStats.approvedCount).padStart(2, '0')}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* 3. Thanh tìm kiếm & Lọc trạng thái */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên cán bộ, chi đoàn, chức vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer focus:border-[#0054a5]"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="SUBMITTED">Chờ đánh giá</option>
            <option value="NEEDS_REVISION">Cần bổ sung</option>
            <option value="APPROVED">Đã duyệt</option>
          </select>

          {(searchTerm || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl border-none bg-transparent cursor-pointer"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 4. Bảng danh sách hồ sơ cần thẩm định */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-6">CÁN BỘ</th>
                  <th className="py-4 px-4">ĐƠN VỊ / CHỨC VỤ</th>
                  <th className="py-4 px-4 w-32">NGÀY NỘP</th>
                  <th className="py-4 px-4 w-28 text-center">TỰ CHẤM</th>
                  <th className="py-4 px-4 w-28 text-center">BTV CHẤM</th>
                  <th className="py-4 px-4 w-36 text-center">TRẠNG THÁI</th>
                  <th className="py-4 px-6 w-36 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.map((item) => {
                  const statusObj = STATUS_BADGES[item.status] || STATUS_BADGES.SUBMITTED;
                  const isApproved = item.status === 'APPROVED' || item.status === 'FINALIZED';

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                      {/* Cột Cán bộ */}
                      <td className="py-4 px-6">
                        <Link
                          href={`/clpi-models/review/${item.id}`}
                          className="font-extrabold text-sm text-slate-900 hover:text-[#0054a5] transition-colors leading-snug no-underline block"
                        >
                          {item.fullName}
                        </Link>
                      </td>

                      {/* Cột Đơn vị / Chức vụ */}
                      <td className="py-4 px-4 font-semibold text-slate-600">
                        {item.unitBranch} • {item.positionName}
                      </td>

                      {/* Cột Ngày nộp */}
                      <td className="py-4 px-4 font-semibold text-slate-500 whitespace-nowrap">
                        {item.submittedAt}
                      </td>

                      {/* Cột Tự chấm */}
                      <td className="py-4 px-4 text-center font-black text-[#0054a5]">
                        {item.selfScore.toFixed(1)}
                      </td>

                      {/* Cột BTV chấm */}
                      <td className="py-4 px-4 text-center font-black">
                        {item.reviewerScore !== null ? (
                          <span className="text-slate-800">{item.reviewerScore.toFixed(1)}</span>
                        ) : (
                          <span className="text-slate-400 font-semibold italic text-[11px]">Chưa chấm</span>
                        )}
                      </td>

                      {/* Cột Trạng thái */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border ${statusObj.style}`}>
                          {statusObj.label}
                        </span>
                      </td>

                      {/* Cột Thao tác: Nút Thẩm định → hoặc Xem chi tiết → */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <Link
                          href={`/clpi-models/review/${item.id}`}
                          className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all no-underline ${
                            isApproved
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-[#0054a5] hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 active:scale-95'
                          }`}
                        >
                          <span>{isApproved ? 'Xem chi tiết →' : 'Thẩm định →'}</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {filteredQueue.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold italic">
                      Hiện không có hồ sơ nào cần thẩm định phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
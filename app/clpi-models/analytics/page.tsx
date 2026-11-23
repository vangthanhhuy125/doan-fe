'use client';

import { useState, useEffect } from 'react';
import { FileSpreadsheet, FileText, Loader2 } from 'lucide-react';

interface TopOfficer {
  name: string;
  unit: string;
  score: number;
}

interface QuarterTrend {
  quarter: string;
  score: number;
}

export default function AnalyticsReportsPage() {
  const [topOfficers, setTopOfficers] = useState<TopOfficer[]>([]);
  const [quarterTrends, setQuarterTrends] = useState<QuarterTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
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

        const res = await fetch(`${apiUrl}/clpi/analytics`, { headers });
        if (res.ok) {
          const data = await res.json();
          setTopOfficers(Array.isArray(data?.topOfficers) ? data.topOfficers : []);
          setQuarterTrends(Array.isArray(data?.quarterTrends) ? data.quarterTrends : []);
        } else {
          setTopOfficers([]);
          setQuarterTrends([]);
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu thống kê CLPI:', error);
        setTopOfficers([]);
        setQuarterTrends([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleExportExcel = async () => {
    if (downloading || (topOfficers.length === 0 && quarterTrends.length === 0)) return;
    setDownloading(true);
    try {
      const ExcelJS = (await import('exceljs')).default || (await import('exceljs'));
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Thong_Ke_CLPI');

      sheet.columns = [
        { header: 'Hạng', key: 'rank', width: 10 },
        { header: 'Họ và tên cán bộ', key: 'name', width: 30 },
        { header: 'Đơn vị / Chi đoàn', key: 'unit', width: 28 },
        { header: 'Điểm CLPI', key: 'score', width: 16 },
      ];

      topOfficers.forEach((item, idx) => {
        sheet.addRow({
          rank: idx + 1,
          name: item.name,
          unit: item.unit,
          score: item.score,
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bao_Cao_Thong_Ke_CLPI_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Lỗi xuất Excel:', error);
      alert('Không thể xuất file Excel. Vui lòng thử lại.');
    } finally {
      setDownloading(false);
    }
  };

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Báo cáo & Thống kê CLPI</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Tổng hợp dữ liệu hiệu suất, xuất bảng xếp loại cán bộ phục vụ thi đua - khen thưởng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={downloading || (topOfficers.length === 0 && quarterTrends.length === 0)}
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all border-none cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
          >
            <FileSpreadsheet size={16} /> Xuất Excel
          </button>
          <button
            type="button"
            disabled={downloading || (topOfficers.length === 0 && quarterTrends.length === 0)}
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all border-none cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50"
          >
            <FileText size={16} /> Xuất PDF
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center bg-white rounded-3xl border border-slate-200/90">
          <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <h2 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              Top 5 Cán bộ có thành tích xuất sắc nhất
            </h2>
            {topOfficers.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {topOfficers.map((c, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-extrabold text-slate-900">
                        {idx + 1}. {c.name}
                      </p>
                      <p className="text-[11px] text-slate-400">{c.unit || 'Chưa phân đơn vị'}</p>
                    </div>
                    <span className="font-black text-emerald-600 text-sm">
                      {Number(c.score).toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs font-semibold italic text-slate-400">
                Chưa có dữ liệu hồ sơ CLPI được phê duyệt trong chu kỳ hiện tại.
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <h2 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              Biến động điểm CLPI trung bình qua các chu kỳ
            </h2>
            {quarterTrends.length > 0 ? (
              <div className="h-48 flex items-end justify-between gap-4 pt-6 px-4">
                {quarterTrends.map((q) => (
                  <div
                    key={q.quarter}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                  >
                    <span className="text-xs font-black text-[#0054a5]">
                      {q.score > 0 ? Number(q.score).toFixed(1) : '—'}
                    </span>
                    <div className="w-full bg-slate-100 rounded-t-xl h-full flex items-end">
                      <div
                        className="w-full bg-[#0054a5] rounded-t-xl transition-all duration-500"
                        style={{ height: `${Math.min(100, Math.max(0, Number(q.score)))}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 text-center truncate max-w-full">
                      {q.quarter}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs font-semibold italic text-slate-400">
                Chưa có dữ liệu lịch sử chu kỳ đánh giá CLPI.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
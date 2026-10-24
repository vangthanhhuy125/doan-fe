'use client';

import { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';

export default function AnalyticsReportsPage() {
  const [downloading, setDownloading] = useState(false);

  const handleExport = (type: 'EXCEL' | 'PDF') => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`Đã xuất báo cáo tổng hợp CLPI định dạng ${type} thành công!`);
    }, 1000);
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
            disabled={downloading}
            onClick={() => handleExport('EXCEL')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all border-none cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
          >
            <FileSpreadsheet size={16} /> Xuất Excel
          </button>
          <button
            type="button"
            disabled={downloading}
            onClick={() => handleExport('PDF')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all border-none cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50"
          >
            <FileText size={16} /> Xuất PDF
          </button>
        </div>
      </div>

      {/* 2 Khối phân tích nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <h2 className="text-xs font-black uppercase text-slate-800 tracking-wider">
            Top 5 Cán bộ có thành tích xuất sắc nhất
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              { name: 'Nguyễn Văn A', unit: 'Chi đoàn KTPM2025.1', score: 94.2 },
              { name: 'Phạm Minh D', unit: 'Chi đoàn KTPM2024.2', score: 93.8 },
              { name: 'Trần Thị B', unit: 'Ban Học thuật', score: 92.5 },
              { name: 'Lê Hoàng C', unit: 'CLB GamApp', score: 91.0 },
              { name: 'Võ Thị F', unit: 'Chi đoàn KTPM2025.1', score: 89.8 },
            ].map((c, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-extrabold text-slate-900">{idx + 1}. {c.name}</p>
                  <p className="text-[11px] text-slate-400">{c.unit}</p>
                </div>
                <span className="font-black text-emerald-600 text-sm">{c.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <h2 className="text-xs font-black uppercase text-slate-800 tracking-wider">
            Biến động điểm CLPI trung bình 4 Quý
          </h2>
          <div className="h-48 flex items-end justify-between gap-4 pt-6 px-4">
            {[
              { quarter: 'Q3/2025', score: 84.5 },
              { quarter: 'Q4/2025', score: 85.8 },
              { quarter: 'Q1/2026', score: 86.4 },
              { quarter: 'Q2/2026', score: 87.2 },
            ].map((q) => (
              <div key={q.quarter} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs font-black text-[#0054a5]">{q.score}</span>
                <div className="w-full bg-slate-100 rounded-t-xl h-full flex items-end">
                  <div
                    className="w-full bg-[#0054a5] rounded-t-xl transition-all duration-500"
                    style={{ height: `${(q.score / 100) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-500">{q.quarter}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
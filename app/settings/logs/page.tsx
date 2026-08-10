'use client';

import { useState, useEffect } from 'react';
import { 
  History, Search, Filter, RotateCcw, FileSpreadsheet, 
  Loader2, Eye, Clock, X, User, Activity, ShieldAlert
} from 'lucide-react';
import * as XLSX from 'xlsx';

export interface SystemLog {
  _id?: string;
  userId: string;
  userName?: string;
  full_name?: string;
  action: string;
  resource: string;
  details?: any;
  timestamp: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  // States lọc & tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');

  // Modal chi tiết Log
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Lỗi lấy lịch sử thao tác:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // 🟢 LỌC DỮ LIỆU LOGS (Tìm kiếm theo Tên & Hành động)
  const filteredLogs = logs.filter(log => {
    const actionText = (log.action || '').toLowerCase();
    const userText = (log.userId || '').toLowerCase();
    const nameText = (log.userName || log.full_name || log.details?.userName || log.details?.full_name || log.details?.name || '').toLowerCase();
    
    const search = searchTerm.toLowerCase();
    const matchesSearch = actionText.includes(search) || userText.includes(search) || nameText.includes(search);

    const matchesResource = resourceFilter === 'all' || log.resource === resourceFilter;

    let matchesTime = true;
    if (timeFilter !== 'all' && log.timestamp) {
      const logDate = new Date(log.timestamp).getTime();
      const now = new Date().getTime();
      const diffDays = (now - logDate) / (1000 * 3600 * 24);

      if (timeFilter === 'today') matchesTime = diffDays <= 1;
      else if (timeFilter === '7days') matchesTime = diffDays <= 7;
      else if (timeFilter === '30days') matchesTime = diffDays <= 30;
    }

    return matchesSearch && matchesResource && matchesTime;
  });

  // 🟢 XUẤT BÁO CÁO LOGS RA FILE EXCEL
  const handleExportExcel = () => {
    if (filteredLogs.length === 0) {
      alert('Không có dữ liệu log để xuất Excel theo bộ lọc!');
      return;
    }

    const headers = ['STT', 'Thời gian', 'Người thực hiện', 'Hành động', 'Tài nguyên', 'Địa chỉ IP / Chi tiết'];
    const rows = filteredLogs.map((item, idx) => [
      idx + 1,
      new Date(item.timestamp).toLocaleString('vi-VN'),
      item.userName || item.full_name || item.details?.userName || item.userId || 'Hệ thống',
      item.action || '—',
      item.resource || '—',
      item.details?.ip ? `IP: ${item.details.ip}` : JSON.stringify(item.details || {})
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lịch sử thao tác');
    XLSX.writeFile(workbook, `Lich_su_thao_tac_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const isFiltering = searchTerm !== '' || resourceFilter !== 'all' || timeFilter !== 'all';

  const uniqueResources = Array.from(new Set(logs.map(l => l.resource).filter(Boolean)));

  return (
    <div className="space-y-6 text-black">
      {/* HEADER TÊN TRANG & CÁC NÚT THAO TÁC */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-emerald-600 pb-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-2xl border border-emerald-100 shadow-sm transition-transform hover:scale-105">
            <History size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-600 uppercase tracking-tight">
              Lịch sử truy cập & thao tác
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold">
            <ShieldAlert size={14} className="text-emerald-600" />
            Tự động dọn dẹp log sau 60 ngày
          </span>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95 text-xs uppercase tracking-wider border-none outline-none cursor-pointer"
          >
            <FileSpreadsheet size={18} /> Xuất Excel
          </button>
        </div>
      </div>

      {/* THANH TÌM KIẾM VÀ BỘ LỌC */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Ô TÌM KIẾM */}
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên người dùng hoặc hành động..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold text-black"
            />
          </div>

          {/* CỤM DROPDOWN BỘ LỌC */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <Filter size={16} /> <span>Lọc:</span>
            </div>

            {/* LỌC THEO TÀI NGUYÊN */}
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-500 cursor-pointer text-black font-bold"
            >
              <option value="all">Tất cả tài nguyên</option>
              {uniqueResources.map((res, idx) => (
                <option key={idx} value={res}>{res}</option>
              ))}
            </select>

            {/* LỌC THEO THỜI GIAN */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-500 cursor-pointer text-black font-bold"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Trong hôm nay</option>
              <option value="7days">7 ngày gần đây</option>
              <option value="30days">30 ngày gần đây</option>
            </select>

            {isFiltering && (
              <button
                onClick={() => { setSearchTerm(''); setResourceFilter('all'); setTimeFilter('all'); }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all active:rotate-180 duration-500 border-none bg-transparent outline-none cursor-pointer"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BẢNG HIỂN THỊ LOGS */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full text-sm text-center border-collapse">
          <thead className="bg-emerald-600 text-white text-[13px] font-bold">
            <tr>
              <th className="px-4 py-4 text-center w-12">STT</th>
              <th className="px-4 py-4 text-center whitespace-nowrap">Thời gian</th>
              <th className="px-4 py-4 text-center">Người thực hiện</th>
              <th className="px-4 py-4 text-center">Hành động</th>
              <th className="px-4 py-4 text-center">Tài nguyên</th>
              <th className="px-4 py-4 text-center w-24">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-400">
                  <Loader2 className="animate-spin h-7 w-7 mx-auto text-emerald-600" />
                  <span className="text-xs font-semibold mt-2 block">Đang tải lịch sử...</span>
                </td>
              </tr>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => (
                <tr key={log._id || index} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="px-4 py-3.5 text-center font-bold text-gray-400">{index + 1}</td>
                  
                  {/* Thời gian */}
                  <td className="px-4 py-3.5 text-center text-xs font-semibold text-gray-600 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <Clock size={14} className="text-emerald-600" />
                      <span>{new Date(log.timestamp).toLocaleString('vi-VN')}</span>
                    </div>
                  </td>

                  {/* Tên người thực hiện / User ID */}
                  <td className="px-4 py-3.5 text-center font-bold text-gray-800">
                    <div className="flex items-center justify-center gap-1.5">
                      <User size={14} className="text-gray-400" />
                      <span>{log.userName || log.full_name || log.details?.userName || log.userId || 'Hệ thống'}</span>
                    </div>
                  </td>

                  {/* Hành động */}
                  <td className="px-4 py-3.5 text-center font-bold text-emerald-700">
                    <span className="font-mono text-xs bg-emerald-50 px-2 py-1 rounded border border-emerald-200 inline-block">
                      {log.action}
                    </span>
                  </td>

                  {/* Loại Tài nguyên */}
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-200 inline-block">
                      {log.resource}
                    </span>
                  </td>

                  {/* Nút Xem chi tiết */}
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-2 text-emerald-600 hover:bg-emerald-100/60 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                      title="Xem chi tiết dữ liệu"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-400 italic font-medium">
                  Không tìm thấy lịch sử thao tác nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL XEM CHI TIẾT DỮ LIỆU LOG */}
      {selectedLog && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-black">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={20} />
                <h4 className="font-bold text-sm tracking-wider">Chi tiết lịch sử thao tác</h4>
              </div>
              <button 
                onClick={() => setSelectedLog(null)} 
                className="p-1 hover:bg-white/20 rounded-full transition-colors border-none bg-transparent text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-semibold text-gray-700">
              <div className="grid grid-cols-2 gap-4 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                <div>
                  <span className="text-gray-400 block text-[10px]">NGƯỜI THỰC HIỆN</span>
                  <span className="font-bold text-gray-900 text-sm">
                    {selectedLog.userName || selectedLog.full_name || selectedLog.details?.userName || selectedLog.userId || 'Hệ thống'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">THỜI GIAN</span>
                  <span className="font-bold text-gray-900">{new Date(selectedLog.timestamp).toLocaleString('vi-VN')}</span>
                </div>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px] mb-1">HÀNH ĐỘNG API</span>
                <div className="p-2 bg-emerald-50 text-emerald-700 font-mono rounded-lg border border-emerald-200 font-bold">
                  {selectedLog.action}
                </div>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px] mb-1">CHI TIẾT KỸ THUẬT (PAYLOAD / METADATA)</span>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed max-h-60">
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-gray-50 flex justify-end border-t border-gray-100">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 font-bold text-xs tracking-wider text-gray-700 rounded-xl transition-all border-none cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
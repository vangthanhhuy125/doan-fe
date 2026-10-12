'use client';

import { Calendar, MapPin, Users, Edit, Trash2, UserCheck, Lock, Unlock, FileSpreadsheet, Share2, Clock } from 'lucide-react';
import * as XLSX from 'xlsx';
import { AttendanceSession } from './types';

interface Props {
  sessions: AttendanceSession[];
  currentUserId: string;
  isAdmin: boolean;
  onOpenCheckIn: (session: AttendanceSession) => void;
  onOpenShare: (session: AttendanceSession) => void;
  onEdit: (session: AttendanceSession) => void;
  onDelete: (session: AttendanceSession) => void;
  onToggleLock: (session: AttendanceSession) => void;
}

export default function AttendanceList({
  sessions,
  currentUserId,
  isAdmin,
  onOpenCheckIn,
  onOpenShare,
  onEdit,
  onDelete,
  onToggleLock,
}: Props) {
  const exportExcel = (session: AttendanceSession) => {
    const records = session.records || [];
    if (records.length === 0) {
      alert('Chưa có lượt điểm danh nào!');
      return;
    }
    const headers = ['STT', 'MSSV', 'Họ và tên', 'Lớp', 'Trạng thái', 'Thời gian', 'Ghi chú'];
    const rows = records.map((r, i) => [i + 1, r.student_id, r.full_name, r.class_name || '', r.status, r.checkin_time, r.note || '']);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Điểm danh');
    XLSX.writeFile(wb, `Diem_danh_${session.code}.xlsx`);
  };

  // Tính toán trạng thái thời gian thực tế
  const getTimeStatus = (dateStr: string, start?: string, end?: string) => {
    if (!start || !end) return null;
    const now = new Date();
    const sessionDate = new Date(dateStr);

    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);

    const startTimeObj = new Date(sessionDate);
    startTimeObj.setHours(sh, sm, 0, 0);

    const endTimeObj = new Date(sessionDate);
    endTimeObj.setHours(eh, em, 0, 0);

    if (now < startTimeObj) {
      return { label: 'Chưa tới giờ', style: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    if (now >= startTimeObj && now <= endTimeObj) {
      return { label: 'Đang diễn ra', style: 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse' };
    }
    return { label: 'Đã hết giờ', style: 'bg-slate-100 text-slate-500 border-slate-200' };
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 font-medium italic">
        Không có buổi điểm danh nào do bạn tạo hoặc được chia sẻ.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sessions.map((item) => {
        const isLocked = Boolean(item.is_locked);
        const recordCount = item.records?.length || 0;
        const isOwner = isAdmin || String(item.created_by || '').toLowerCase() === currentUserId.toLowerCase();
        const timeStatus = getTimeStatus(item.date, item.start_time, item.end_time);

        return (
          <div
            key={item._id}
            className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:border-[#0054a5]/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-blue-50 text-[#0054a5] font-mono font-bold text-xs px-2.5 py-0.5 rounded-md border border-blue-200">
                      {item.code}
                    </span>

                    {!isOwner && (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                        Được ủy quyền
                      </span>
                    )}

                    {timeStatus && (
                      <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-md ${timeStatus.style}`}>
                        {timeStatus.label}
                      </span>
                    )}

                    {isLocked ? (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        Đã khóa
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Đang mở
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-base mt-2 leading-snug">{item.title}</h4>
                </div>

                {/* Các nút dành riêng cho Người tạo / Admin */}
                {isOwner && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onOpenShare(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border-none bg-transparent cursor-pointer"
                      title="Chia sẻ quyền điểm danh"
                    >
                      <Share2 size={15} />
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg border-none bg-transparent cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border-none bg-transparent cursor-pointer"
                      title="Xóa"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              {/* Thông tin ngày & khung giờ thực tế */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#0054a5]" /> {item.date}
                </span>
                {item.start_time && item.end_time && (
                  <span className="flex items-center gap-1.5 text-slate-700 font-mono">
                    <Clock size={13} className="text-[#0054a5]" /> {item.start_time} - {item.end_time}
                  </span>
                )}
                <span className="flex items-center gap-1.5 truncate col-span-2">
                  <MapPin size={13} className="text-rose-500 shrink-0" /> {item.location || 'Chưa có địa điểm'}
                </span>
              </div>

              {item.description && (
                <p className="text-xs text-slate-500 font-normal line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                <Users size={14} /> {recordCount} người đã check-in
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => exportExcel(item)}
                  className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl border border-emerald-200 cursor-pointer bg-white"
                  title="Xuất Excel"
                >
                  <FileSpreadsheet size={15} />
                </button>
                {isOwner && (
                  <button
                    onClick={() => onToggleLock(item)}
                    className={`p-2 rounded-xl border cursor-pointer ${
                      isLocked ? 'text-slate-600 bg-slate-100 border-slate-200' : 'text-rose-600 bg-rose-50 border-rose-200'
                    }`}
                    title={isLocked ? 'Mở khóa' : 'Khóa điểm danh'}
                  >
                    {isLocked ? <Unlock size={15} /> : <Lock size={15} />}
                  </button>
                )}
                <button
                  onClick={() => onOpenCheckIn(item)}
                  className="flex items-center gap-1 px-3.5 py-2 bg-[#0054a5] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs border-none cursor-pointer active:scale-95 transition-all"
                >
                  <UserCheck size={14} />
                  <span>Danh sách điểm danh</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
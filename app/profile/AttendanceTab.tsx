'use client';

import { useState, useEffect } from 'react';
import { 
  CalendarCheck, CheckCircle2, Clock, Calendar, MapPin, 
  Loader2, Lock, UserCheck, AlertCircle, Ban, GraduationCap, ArrowDownCircle
} from 'lucide-react';

interface AttendanceRecord {
  student_id: string;
  full_name: string;
  class_name?: string;
  status: 'present' | 'late' | 'excused' | 'absent';
  checkin_time: string;
  note?: string;
}

interface AttendanceSession {
  _id: string;
  title: string;
  code: string;
  date: string;
  location?: string;
  description?: string;
  target_intakes?: string[];
  is_locked?: boolean;
  records: AttendanceRecord[];
}

interface Props {
  userInfo: {
    student_id: string;
    full_name: string;
    class_name?: string;
  };
  onRefreshCount?: () => void;
}

const extractIntake = (user: { class_name?: string; student_id?: string }): string => {
  if (!user) return '';
  const classStr = user.class_name || '';
  const match = String(classStr).match(/(?:19|20)\d{2}/);
  if (match) {
    const year = parseInt(match[0], 10);
    if (year >= 1990 && year <= 2050) return String(year);
  }
  const sid = String(user.student_id || '').trim();
  if (sid.length >= 2) {
    const prefix = parseInt(sid.substring(0, 2), 10);
    if (!isNaN(prefix) && prefix >= 15 && prefix <= 35) {
      return `20${prefix}`;
    }
  }
  return '';
};

const STATUS_CONFIG = {
  present: { label: 'Có mặt', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  late: { label: 'Đến muộn', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  excused: { label: 'Có phép', style: 'bg-blue-50 text-blue-700 border-blue-200' },
  absent: { label: 'Vắng', style: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function AttendanceTab({ userInfo, onRefreshCount }: Props) {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance`);
      if (res.ok) {
        const data = await res.json();
        setSessions(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const userIntake = extractIntake(userInfo);

  const getMyRecord = (session: AttendanceSession) => {
    return (session.records || []).find(
      r => String(r.student_id).trim().toLowerCase() === String(userInfo.student_id).trim().toLowerCase()
    );
  };

  const handleSelfCheckIn = async (session: AttendanceSession) => {
    if (checkingInId || session.is_locked) return;
    setCheckingInId(session._id);

    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/${session._id}/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          student_id: userInfo.student_id,
          full_name: userInfo.full_name,
          class_name: userInfo.class_name || '',
          status: 'present',
          note: 'Sinh viên tự check-in trên hệ thống'
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Điểm danh thành công!', 'success');
        await fetchSessions();
        onRefreshCount?.();
      } else {
        showToast(data.message || 'Điểm danh thất bại!', 'error');
      }
    } catch (e) {
      showToast('Không thể kết nối đến máy chủ!', 'error');
    } finally {
      setCheckingInId(null);
    }
  };

  // Thống kê cá nhân
  const eligibleSessions = sessions.filter(s => {
    const targetIntakes = s.target_intakes || [];
    return targetIntakes.length === 0 || !userIntake || targetIntakes.includes(userIntake);
  });

  const attendedSessions = eligibleSessions.filter(s => {
    const r = getMyRecord(s);
    return r && (r.status === 'present' || r.status === 'late');
  });

  const attendanceRate = eligibleSessions.length > 0 
    ? Math.round((attendedSessions.length / eligibleSessions.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 text-black">
      {toastMsg && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold animate-in slide-in-from-top-4 duration-300 text-white ${
          toastMsg.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header & Thống kê cá nhân */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <CalendarCheck className="text-[#0054a5]" size={20} />
          <h3 className="text-lg font-bold text-gray-800">Lịch sử điểm danh hoạt động</h3>
        </div>
        <span className="text-xs font-semibold text-gray-500">
          Tổng số: <strong className="text-[#0054a5]">{eligibleSessions.length}</strong> buổi áp dụng
        </span>
      </div>

      {/* Card thống kê tóm tắt */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center gap-3">
          <div className="p-2.5 bg-[#0054a5] text-white rounded-xl">
            <CalendarCheck size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-gray-500">Buổi áp dụng</p>
            <p className="text-lg font-black text-[#0054a5]">{eligibleSessions.length} buổi</p>
          </div>
        </div>

        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-gray-500">Đã tham gia</p>
            <p className="text-lg font-black text-emerald-700">{attendedSessions.length} buổi</p>
          </div>
        </div>

        <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center gap-3">
          <div className="p-2.5 bg-purple-600 text-white rounded-xl">
            <UserCheck size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-gray-500">Tỷ lệ chuyên cần</p>
            <p className="text-lg font-black text-purple-900">{attendanceRate}%</p>
          </div>
        </div>
      </div>

      {/* Danh sách buổi điểm danh */}
      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-12 text-center text-sm font-medium text-gray-400 italic">
          Hiện tại chưa có buổi điểm danh nào.
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const myRecord = getMyRecord(session);
            const isCheckedIn = Boolean(myRecord);
            const isLocked = Boolean(session.is_locked);
            const targetIntakes = session.target_intakes || [];
            const isEligible = targetIntakes.length === 0 || !userIntake || targetIntakes.includes(userIntake);

            return (
              <div
                key={session._id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs hover:border-[#0054a5]/40 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div className="space-y-1.5 flex-1 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-blue-50 text-[#0054a5] font-mono text-xs px-2.5 py-0.5 rounded-md font-bold border border-blue-200">
                        {session.code}
                      </span>

                      <h4 className="font-extrabold text-slate-900 text-base leading-snug">
                        {session.title}
                      </h4>

                      {/* Trạng thái phiên */}
                      {isLocked ? (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full text-[11px] font-bold border border-rose-200">
                          <Lock size={11} /> Đã khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[11px] font-bold border border-emerald-200">
                          <Clock size={11} /> Đang mở
                        </span>
                      )}

                      {/* Khóa áp dụng */}
                      {targetIntakes.length > 0 && (
                        <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full text-[11px] font-bold border border-sky-200">
                          <GraduationCap size={11} /> Khóa: {targetIntakes.map(k => `K${k}`).join(', ')}
                        </span>
                      )}

                      {!isEligible && (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[11px] font-bold border border-slate-200">
                          <Ban size={11} /> Không thuộc khóa
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="shrink-0 self-start sm:self-auto">
                    {isCheckedIn ? (
                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border ${STATUS_CONFIG[myRecord!.status]?.style}`}>
                        <CheckCircle2 size={15} />
                        <span>{STATUS_CONFIG[myRecord!.status]?.label || 'Đã có mặt'}</span>
                      </span>
                    ) : isLocked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold">
                        <Lock size={13} /> Đã kết thúc
                      </span>
                    ) : !isEligible ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-semibold">
                        Không thuộc đối tượng
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelfCheckIn(session)}
                        disabled={checkingInId === session._id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#0054a5] to-[#1d92ff] hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all border-none cursor-pointer disabled:opacity-50"
                      >
                        {checkingInId === session._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <ArrowDownCircle size={15} />
                        )}
                        <span>Điểm danh ngay</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Thông tin thời gian, địa điểm & ghi chú cá nhân */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 font-semibold pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#0054a5]" />
                    <span>Ngày diễn ra: <strong>{session.date}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-rose-500" />
                    <span>Địa điểm: {session.location || 'Chưa cập nhật'}</span>
                  </div>
                </div>

                {isCheckedIn && myRecord?.checkin_time && (
                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-medium flex items-center justify-between">
                    <span>Thời gian bạn check-in: <strong>{myRecord.checkin_time}</strong></span>
                    {myRecord.note && <span className="text-[11px] text-slate-500 italic">({myRecord.note})</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, Search, CheckCircle2, UserCheck, Clock, Users, ArrowDownCircle, 
  AlertCircle, FileSpreadsheet, Trash2, ChevronDown, Check, UserPlus 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { AttendanceSession, AttendanceRecord, AttendanceStatus } from './types';

interface Props {
  session: AttendanceSession;
  onClose: () => void;
  onRefresh: () => void;
}

const STATUS_BADGES: Record<AttendanceStatus, { label: string; style: string }> = {
  present: { label: 'Có mặt', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  late: { label: 'Đến muộn', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  excused: { label: 'Có phép', style: 'bg-blue-50 text-blue-700 border-blue-200' },
  absent: { label: 'Vắng', style: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function AttendanceCheckInModal({ session, onClose, onRefresh }: Props) {
  const [records, setRecords] = useState<AttendanceRecord[]>(session.records || []);
  const [dbMembers, setDbMembers] = useState<any[]>([]);
  const [searchPerson, setSearchPerson] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
  const [inputNote, setInputNote] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [searchTable, setSearchTable] = useState('');
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 3000);
  };

  useEffect(() => {
    const fetchDbMembers = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const [nsRes, usersRes, accRes] = await Promise.allSettled([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/nhan-su`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, { headers })
        ]);

        const map = new Map<string, any>();

        if (nsRes.status === 'fulfilled' && nsRes.value.ok) {
          const list = await nsRes.value.json();
          if (Array.isArray(list)) {
            list.forEach((item: any) => {
              const sid = String(item.student_id || item.mssv || '').trim();
              if (sid) {
                map.set(sid, {
                  student_id: sid,
                  full_name: String(item.full_name || item.name || '').trim(),
                  class_name: String(item.class || item.chi_doan || '').trim(),
                });
              }
            });
          }
        }

        if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
          const list = await usersRes.value.json();
          if (Array.isArray(list)) {
            list.forEach((item: any) => {
              const sid = String(item.student_id || item.mssv || '').trim();
              if (sid && !map.has(sid)) {
                map.set(sid, {
                  student_id: sid,
                  full_name: String(item.full_name || item.displayName || '').trim(),
                  class_name: String(item.class || item.class_name || '').trim(),
                });
              }
            });
          }
        }

        if (accRes.status === 'fulfilled' && accRes.value.ok) {
          const list = await accRes.value.json();
          if (Array.isArray(list)) {
            list.forEach((item: any) => {
              const sid = String(item.student_id || item.mssv || '').trim();
              if (sid && !map.has(sid)) {
                map.set(sid, {
                  student_id: sid,
                  full_name: String(item.displayName || item.full_name || '').trim(),
                  class_name: String(item.class || '').trim(),
                });
              }
            });
          }
        }

        setDbMembers(Array.from(map.values()));
      } catch (e) {
        console.error(e);
      }
    };

    fetchDbMembers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkedInSids = useMemo(() => {
    return new Set(records.map(r => String(r.student_id).trim().toLowerCase()));
  }, [records]);

  const filteredMembers = useMemo(() => {
    const s = searchPerson.toLowerCase().trim();
    if (!s) return dbMembers.slice(0, 30);
    return dbMembers.filter(m => 
      m.student_id.toLowerCase().includes(s) ||
      m.full_name.toLowerCase().includes(s) ||
      m.class_name.toLowerCase().includes(s)
    ).slice(0, 30);
  }, [dbMembers, searchPerson]);

  const handleSelectPerson = (person: any) => {
    setSelectedPerson(person);
    setSearchPerson(`${person.full_name} (${person.student_id})`);
    setIsDropdownOpen(false);
  };

  const handleCheckIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isChecking) return;

    let targetSid = selectedPerson?.student_id;
    let targetName = selectedPerson?.full_name;
    let targetClass = selectedPerson?.class_name;

    if (!targetSid) {
      const trimmed = searchPerson.trim();
      const matched = dbMembers.find(m => 
        m.student_id.toLowerCase() === trimmed.toLowerCase() ||
        m.full_name.toLowerCase() === trimmed.toLowerCase()
      );

      if (matched) {
        targetSid = matched.student_id;
        targetName = matched.full_name;
        targetClass = matched.class_name;
      } else {
        showAlert('Vui lòng chọn thành viên có trong danh sách hệ thống!', 'error');
        return;
      }
    }

    setIsChecking(true);
    try {
      const token = localStorage.getItem('token') || '';
      const finalNote = inputNote.trim() || 'BTC điểm danh tại chỗ';

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/${session._id}/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          student_id: targetSid,
          full_name: targetName,
          class_name: targetClass,
          status: 'present',
          note: finalNote,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const updatedRecord: AttendanceRecord = data.record;
        setRecords(prev => {
          const idx = prev.findIndex(r => r.student_id === targetSid);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = updatedRecord;
            return next;
          }
          return [updatedRecord, ...prev];
        });
        showAlert(`Điểm danh thành công: ${targetName} (${targetSid})`, 'success');
        setSearchPerson('');
        setSelectedPerson(null);
        setInputNote('');
        onRefresh();
      } else {
        showAlert(data.message || 'Lỗi điểm danh!', 'error');
      }
    } catch (err) {
      showAlert('Lỗi kết nối máy chủ!', 'error');
    } finally {
      setIsChecking(false);
      inputRef.current?.focus();
    }
  };

  const handleDeleteRecord = async (sid: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa lượt điểm danh của "${name}" (${sid})?`)) return;

    const nextRecords = records.filter(r => r.student_id !== sid);
    setRecords(nextRecords);

    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/${session._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ records: nextRecords }),
      });

      if (res.ok) {
        showAlert(`Đã xóa lượt điểm danh của ${name}`, 'success');
        onRefresh();
      } else {
        showAlert('Xóa lượt điểm danh thất bại!', 'error');
      }
    } catch (e) {
      showAlert('Lỗi kết nối máy chủ!', 'error');
    }
  };

  const handleUpdateStatus = async (sid: string, newStatus: AttendanceStatus) => {
    const updated = records.map(r => r.student_id === sid ? { ...r, status: newStatus } : r);
    setRecords(updated);

    try {
      const token = localStorage.getItem('token') || '';
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/${session._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ records: updated }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const exportExcel = () => {
    if (records.length === 0) {
      alert('Chưa có lượt điểm danh nào!');
      return;
    }
    const headers = ['STT', 'MSSV', 'Họ và tên', 'Lớp', 'Trạng thái', 'Thời gian điểm danh', 'Ghi chú'];
    const rows = records.map((r, i) => [
      i + 1,
      r.student_id,
      r.full_name,
      r.class_name || '',
      STATUS_BADGES[r.status]?.label || r.status,
      r.checkin_time,
      r.note || '',
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Điểm danh');
    XLSX.writeFile(wb, `Diem_danh_${session.code || 'Export'}.xlsx`);
  };

  // Nhận diện dòng do sinh viên tự check-in
  const isSelfCheckInRecord = (note?: string) => {
    return Boolean(note && note.toLowerCase().includes('tự check-in'));
  };

  const filtered = records.filter(r => {
    const s = searchTable.toLowerCase().trim();
    return !s || r.student_id.toLowerCase().includes(s) || r.full_name.toLowerCase().includes(s) || (r.class_name || '').toLowerCase().includes(s);
  });

  const presentCount = records.filter(r => r.status === 'present').length;
  const lateCount = records.filter(r => r.status === 'late').length;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-6 text-black animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#004282] to-[#0054a5] p-5 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-blue-100 font-mono text-xs px-2.5 py-0.5 rounded-md font-bold">
                {session.code}
              </span>
              <h3 className="font-extrabold text-base sm:text-lg">{session.title}</h3>
            </div>
            <p className="text-xs text-blue-100 mt-1">Ngày: {session.date} | Địa điểm: {session.location || 'N/A'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportExcel}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs border-none cursor-pointer"
            >
              <FileSpreadsheet size={15} /> <span>Xuất Excel</span>
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors border-none bg-transparent text-white cursor-pointer">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Thanh tìm kiếm & chọn người điểm danh từ DB */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 shrink-0">
          <form onSubmit={handleCheckIn} className="flex flex-col sm:flex-row items-center gap-2 max-w-3xl mx-auto">
            <div className="relative flex-1 w-full" ref={dropdownRef}>
              <UserCheck size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                autoFocus
                type="text"
                placeholder="Gõ tên hoặc MSSV để chọn từ danh sách..."
                value={searchPerson}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchPerson(e.target.value);
                  setSelectedPerson(null);
                  setIsDropdownOpen(true);
                }}
                className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold outline-none focus:border-[#0054a5] focus:ring-2 ring-blue-100"
              />
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

              {/* Dropdown danh sách thành viên từ DB */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((m) => {
                      const isChecked = checkedInSids.has(m.student_id.toLowerCase());
                      return (
                        <div
                          key={m.student_id}
                          onClick={() => handleSelectPerson(m)}
                          className={`p-2.5 px-4 hover:bg-blue-50/80 cursor-pointer flex items-center justify-between transition-colors ${
                            selectedPerson?.student_id === m.student_id ? 'bg-blue-50 text-[#0054a5]' : ''
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              {m.full_name} <span className="text-[#0054a5] font-mono">({m.student_id})</span>
                            </p>
                            {m.class_name && (
                              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Lớp: {m.class_name}</p>
                            )}
                          </div>
                          {isChecked ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                              <Check size={11} /> Đã có mặt
                            </span>
                          ) : (
                            <UserPlus size={14} className="text-slate-400 shrink-0" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 italic font-semibold">
                      Không tìm thấy thành viên phù hợp trong cơ sở dữ liệu...
                    </div>
                  )}
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder="Ghi chú (tùy chọn)..."
              value={inputNote}
              onChange={(e) => setInputNote(e.target.value)}
              className="w-full sm:w-44 px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5]"
            />

            <button
              type="submit"
              disabled={isChecking || !searchPerson.trim()}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 border-none cursor-pointer disabled:opacity-50 transition-all shrink-0 active:scale-95 shadow-sm"
            >
              <ArrowDownCircle size={16} /> Check-in
            </button>
          </form>

          {alertMsg && (
            <div className={`mt-2.5 p-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 animate-in fade-in ${
              alertMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {alertMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{alertMsg.text}</span>
            </div>
          )}
        </div>

        {/* Thống kê nhanh */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between text-xs font-bold shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-600">
              <Users size={15} className="text-[#0054a5]" /> Tổng lượt: <strong>{records.length}</strong>
            </span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Có mặt: {presentCount}
            </span>
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Đến muộn: {lateCount}
            </span>
          </div>

          <div className="relative w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, MSSV..."
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
            />
          </div>
        </div>

        {/* Danh sách bản ghi điểm danh */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 w-12 text-center">STT</th>
                <th className="px-4 py-3 w-28">MSSV</th>
                <th className="px-4 py-3">Họ và Tên</th>
                <th className="px-4 py-3 w-28 text-center">Lớp</th>
                <th className="px-4 py-3 w-36 text-center">Trạng thái</th>
                <th className="px-4 py-3 w-40 text-center">Thời gian</th>
                <th className="px-4 py-3">Ghi chú</th>
                <th className="px-4 py-3 w-16 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r, i) => {
                const isSelf = isSelfCheckInRecord(r.note);

                return (
                  <tr key={r.student_id + i} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-4 py-3 text-center text-xs font-bold text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 font-mono font-bold text-[#0054a5]">{r.student_id}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{r.full_name}</td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-slate-500">{r.class_name || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={r.status}
                        onChange={(e) => handleUpdateStatus(r.student_id, e.target.value as AttendanceStatus)}
                        className={`px-2 py-1 rounded-md text-xs font-bold border outline-none cursor-pointer ${
                          STATUS_BADGES[r.status]?.style
                        }`}
                      >
                        <option value="present">Có mặt</option>
                        <option value="late">Đến muộn</option>
                        <option value="excused">Có phép</option>
                        <option value="absent">Vắng</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-slate-500 font-mono">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" /> {r.checkin_time}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{r.note || '—'}</td>
                    
                    {/* Ẩn nút xóa đối với dòng sinh viên tự check-in */}
                    <td className="px-4 py-3 text-center">
                      {!isSelf ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(r.student_id, r.full_name)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                          title="Xóa lượt điểm danh thủ công này"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs font-bold select-none">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-xs text-slate-400 italic font-semibold">
                    Chưa có lượt điểm danh nào phù hợp...
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
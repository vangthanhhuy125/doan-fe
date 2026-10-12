'use client';

import { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Filter, RotateCcw, Loader2 } from 'lucide-react';
import { AttendanceSession } from './types';
import AttendanceList from './AttendanceList';
import AttendanceSessionModal from './AttendanceSessionModal';
import AttendanceCheckInModal from './AttendanceCheckInModal';
import ShareAttendanceModal from './ShareAttendanceModal';

const cleanVal = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val.trim().toLowerCase();
  if (typeof val === 'object') {
    if (val.$oid) return String(val.$oid).trim().toLowerCase();
    if (val._id) return cleanVal(val._id);
    if (val.id) return cleanVal(val.id);
    if (val.user_id) return cleanVal(val.user_id);
    if (val.student_id) return cleanVal(val.student_id);
  }
  return String(val).trim().toLowerCase();
};

export default function AttendancePage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'locked'>('all');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [activeSessionForModal, setActiveSessionForModal] = useState<AttendanceSession | null | 'new'>(null);
  const [activeSessionForCheckIn, setActiveSessionForCheckIn] = useState<AttendanceSession | null>(null);
  const [shareTargetSession, setShareTargetSession] = useState<AttendanceSession | null>(null);

  useEffect(() => {
    let resolvedId = '';
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            resolvedId = cleanVal(payload._id || payload.user_id || payload.id || payload.sub);
            if (payload.role === 'admin' || payload.username === 'admin') setIsAdmin(true);
          }
        }
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          if (!resolvedId) resolvedId = cleanVal(u._id || u.user_id || u.id);
          if (u.role === 'admin' || u.username === 'admin') setIsAdmin(true);
        }
      } catch (e) {}
      setCurrentUserId(resolvedId);
    }
  }, []);

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

  const handleToggleLock = async (session: AttendanceSession) => {
    try {
      const token = localStorage.getItem('token') || '';
      const updated = !session.is_locked;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/${session._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
          'x-user-id': currentUserId,
        },
        body: JSON.stringify({ is_locked: updated }),
      });
      if (res.ok) {
        setSessions(prev => prev.map(s => s._id === session._id ? { ...s, is_locked: updated } : s));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (session: AttendanceSession) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa buổi điểm danh "${session.title}"?`)) return;
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/${session._id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '', 'x-user-id': currentUserId },
      });
      if (res.ok) {
        fetchSessions();
      } else {
        alert('Xóa thất bại!');
      }
    } catch (e) {
      alert('Lỗi kết nối máy chủ!');
    }
  };

  // LỌC QUYỀN RIÊNG TƯ: Chỉ hiển thị phiếu của Người tạo HOẶC người được chia sẻ (Admin xem hết)
  const accessibleSessions = sessions.filter(s => {
    if (isAdmin) return true;
    const createdBy = cleanVal(s.created_by);
    const isOwner = !createdBy || createdBy === currentUserId;
    const isShared = (s.shared_users || []).some(u => cleanVal(u.user_id) === currentUserId || cleanVal(u.username) === currentUserId);
    return isOwner || isShared;
  });

  const filteredSessions = accessibleSessions.filter(s => {
    const matchSearch = (s.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' ? true : statusFilter === 'locked' ? Boolean(s.is_locked) : !s.is_locked;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 text-black">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-[#0054a5] pb-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0054a5] rounded-xl text-white shadow-lg shadow-blue-100">
            <UserCheck size={24} />
          </div>
          <h2 className="text-2xl font-black uppercase text-[#0054a5] tracking-tight">
            Quản lý điểm danh hoạt động
          </h2>
        </div>

        <button
          onClick={() => setActiveSessionForModal('new')}
          className="flex items-center gap-2 bg-[#1d92ff] text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-[#0054a5] transition-all text-xs uppercase tracking-wider border-none cursor-pointer active:scale-95"
        >
          <Plus size={18} /> Tạo buổi điểm danh
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, mã điểm danh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0054a5] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0054a5]">
            <Filter size={15} /> <span>Trạng thái:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer"
          >
            <option value="all">Tất cả</option>
            <option value="open">Đang mở</option>
            <option value="locked">Đã khóa</option>
          </select>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl border-none bg-transparent cursor-pointer"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center bg-white rounded-3xl border border-slate-200">
          <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
        </div>
      ) : (
        <AttendanceList
          sessions={filteredSessions}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onOpenCheckIn={(session) => setActiveSessionForCheckIn(session)}
          onOpenShare={(session) => setShareTargetSession(session)}
          onEdit={(session) => setActiveSessionForModal(session)}
          onDelete={handleDelete}
          onToggleLock={handleToggleLock}
        />
      )}

      {activeSessionForModal && (
        <AttendanceSessionModal
          session={activeSessionForModal === 'new' ? null : activeSessionForModal}
          currentUserId={currentUserId}
          onClose={() => setActiveSessionForModal(null)}
          onSaved={fetchSessions}
        />
      )}

      {activeSessionForCheckIn && (
        <AttendanceCheckInModal
          session={activeSessionForCheckIn}
          onClose={() => setActiveSessionForCheckIn(null)}
          onRefresh={fetchSessions}
        />
      )}

      {shareTargetSession && (
        <ShareAttendanceModal
          session={shareTargetSession}
          onClose={() => setShareTargetSession(null)}
          onSaved={fetchSessions}
        />
      )}
    </div>
  );
}
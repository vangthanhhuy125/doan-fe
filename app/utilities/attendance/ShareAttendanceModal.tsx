'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Share2, Search, UserPlus, Shield, Trash2, Loader2 } from 'lucide-react';
import { AttendanceSession, SharedUser } from './types';

interface Props {
  session: AttendanceSession;
  onClose: () => void;
  onSaved: () => void;
}

export default function ShareAttendanceModal({ session, onClose, onSaved }: Props) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>(session.shared_users || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`);
        if (res.ok) {
          const data = await res.json();
          setAccounts(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchAccounts();
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

  const createdBy = String(session.created_by || '').trim().toLowerCase();

  const availableAccounts = accounts.filter(acc => {
    const accId = String(acc._id || acc.user_id || acc.id || '').trim().toLowerCase();
    const accUname = String(acc.username || '').trim().toLowerCase();
    const isOwner = accId === createdBy || accUname === createdBy;
    const isAlreadyShared = sharedUsers.some(
      u => String(u.user_id).toLowerCase() === accId || String(u.username).toLowerCase() === accUname
    );
    const s = searchTerm.toLowerCase().trim();
    const matches = !s ||
      (acc.displayName || '').toLowerCase().includes(s) ||
      (acc.username || '').toLowerCase().includes(s) ||
      (acc.student_id || '').toLowerCase().includes(s);

    return !isOwner && !isAlreadyShared && matches;
  });

  const handleAddUser = (acc: any) => {
    const newUser: SharedUser = {
      user_id: String(acc._id || acc.user_id || acc.id),
      user_name: acc.displayName || acc.username,
      username: acc.username,
    };
    setSharedUsers(prev => [...prev, newUser]);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const handleRemoveUser = (userId: string) => {
    setSharedUsers(prev => prev.filter(u => u.user_id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/${session._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ shared_users: sharedUsers }),
      });

      if (res.ok) {
        onSaved();
        onClose();
      } else {
        alert('Lưu phân quyền chia sẻ thất bại!');
      }
    } catch (e) {
      alert('Không thể kết nối đến máy chủ!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-black">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
        <div className="bg-[#0054a5] p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Share2 size={18} />
            <h3 className="font-bold text-sm uppercase tracking-wider">Chia sẻ quyền điểm danh</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors border-none bg-transparent text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
          <div className="space-y-1" ref={dropdownRef}>
            <label className="text-[11px] font-bold uppercase text-slate-500">Thêm người được ủy quyền điểm danh</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm theo tên đăng nhập hoặc họ tên..."
                value={searchTerm}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-[#0054a5]"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {availableAccounts.length > 0 ? (
                    availableAccounts.map(acc => (
                      <div
                        key={acc._id || acc.id}
                        onClick={() => handleAddUser(acc)}
                        className="p-2.5 px-4 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800">{acc.displayName || acc.username}</p>
                          <p className="text-[10px] text-slate-400">@{acc.username}</p>
                        </div>
                        <UserPlus size={14} className="text-[#0054a5]" />
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 italic">Không tìm thấy tài khoản phù hợp...</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-[11px] font-bold uppercase text-[#0054a5] flex items-center gap-1.5">
              <Shield size={14} /> Danh sách người được ủy quyền ({sharedUsers.length})
            </label>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sharedUsers.map(user => (
                <div key={user.user_id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{user.user_name || user.username}</p>
                    {user.username && <p className="text-[10px] text-slate-400">@{user.username}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveUser(user.user_id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                    title="Hủy ủy quyền"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}

              {sharedUsers.length === 0 && (
                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400 italic">
                  Chưa chia sẻ cho người dùng nào.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-slate-400 hover:bg-slate-100 text-xs uppercase border-none bg-transparent cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase shadow-md transition-all border-none cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span>Lưu phân quyền</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Share2, Search, UserPlus, Shield, Check, Trash2, Loader2 } from 'lucide-react';
import { RegistrationForm, FormPermission } from './types';

interface Props {
  form: RegistrationForm;
  onClose: () => void;
  onSavePermissions: (updatedPermissions: FormPermission[]) => Promise<void>;
}

export default function ShareFormModal({ form, onClose, onSavePermissions }: Props) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [sharedPermissions, setSharedPermissions] = useState<FormPermission[]>(
    form.shared_permissions || []
  );
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
        console.error('Lỗi tải tài khoản:', e);
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const createdBy = (form as any).created_by;

  const availableAccounts = accounts.filter(acc => {
    const accId = String(acc._id || acc.user_id || acc.id);
    const isOwner = String(accId) === String(createdBy);
    const isAlreadyShared = sharedPermissions.some(p => String(p.user_id) === String(accId));
    const matchesSearch =
      (acc.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.username || '').toLowerCase().includes(searchTerm.toLowerCase());

    return !isOwner && !isAlreadyShared && matchesSearch;
  });

  const handleAddUser = (acc: any) => {
    const accId = String(acc._id || acc.user_id || acc.id);
    const newPerm: FormPermission = {
      user_id: accId,
      user_name: acc.displayName || acc.username,
      username: acc.username,
      can_view_submissions: true,
      can_export: true,
      can_edit: false,
      can_lock: false,
      can_delete: false,
    };
    setSharedPermissions(prev => [...prev, newPerm]);
    setIsOpenDropdown(false);
    setSearchTerm('');
  };

  const handleTogglePerm = (userId: string, field: keyof FormPermission) => {
    setSharedPermissions(prev =>
      prev.map(p => {
        if (p.user_id === userId) {
          return { ...p, [field]: !p[field] };
        }
        return p;
      })
    );
  };

  const handleRemoveUser = (userId: string) => {
    setSharedPermissions(prev => prev.filter(p => p.user_id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSavePermissions(sharedPermissions);
      onClose();
    } catch (e) {
      console.error(e);
      alert('Lưu phân quyền chia sẻ thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200 text-black">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 max-h-[90vh] flex flex-col">
        <div className="bg-[#0054a5] p-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <Share2 size={20} />
            <h3 className="font-bold uppercase tracking-widest text-sm">Chia sẻ & Phân quyền truy cập</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full text-white border-none bg-transparent cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {/* TÌM KIẾM VÀ THÊM NGƯỜI DÙNG */}
          <div className="space-y-2" ref={dropdownRef}>
            <label className="text-[10px] font-bold uppercase text-gray-400">Thêm người được chia sẻ</label>
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên người dùng hoặc tên đăng nhập..."
                  value={searchTerm}
                  onFocus={() => setIsOpenDropdown(true)}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setIsOpenDropdown(true);
                  }}
                  className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-[#0054a5]"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              {isOpenDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-48 overflow-y-auto">
                  {availableAccounts.length > 0 ? (
                    availableAccounts.map(acc => (
                      <div
                        key={acc._id}
                        onClick={() => handleAddUser(acc)}
                        className="p-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between border-b border-gray-50 last:border-none transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800">{acc.displayName || acc.username}</p>
                          <p className="text-[10px] text-gray-400">@{acc.username}</p>
                        </div>
                        <UserPlus size={16} className="text-[#0054a5]" />
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-400 italic">
                      Không tìm thấy thành viên nào phù hợp...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* DANH SÁCH THÀNH VIÊN ĐÃ ĐƯỢC CHIA SẺ */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#0054a5] uppercase tracking-wider flex items-center gap-1.5">
              <Shield size={14} /> Danh sách người được ủy quyền ({sharedPermissions.length})
            </h4>

            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
              {sharedPermissions.map(perm => (
                <div
                  key={perm.user_id}
                  className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 hover:border-blue-200 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-800">{perm.user_name || perm.username}</p>
                      {perm.username && <p className="text-[10px] text-gray-400">@{perm.username}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(perm.user_id)}
                      className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg border-none bg-transparent cursor-pointer transition-colors"
                      title="Gỡ quyền chia sẻ"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* CHECKBOX QUYỀN HẠN CHI TIẾT */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-200/60">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={perm.can_view_submissions || false}
                        onChange={() => handleTogglePerm(perm.user_id, 'can_view_submissions')}
                        className="w-3.5 h-3.5 accent-[#0054a5] rounded"
                      />
                      <span className="text-[11px] font-bold text-slate-700">Xem danh sách SV</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={perm.can_export || false}
                        onChange={() => handleTogglePerm(perm.user_id, 'can_export')}
                        className="w-3.5 h-3.5 accent-emerald-600 rounded"
                      />
                      <span className="text-[11px] font-bold text-slate-700">Xuất Excel</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={perm.can_edit || false}
                        onChange={() => handleTogglePerm(perm.user_id, 'can_edit')}
                        className="w-3.5 h-3.5 accent-amber-500 rounded"
                      />
                      <span className="text-[11px] font-bold text-slate-700">Sửa phiếu</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={perm.can_lock || false}
                        onChange={() => handleTogglePerm(perm.user_id, 'can_lock')}
                        className="w-3.5 h-3.5 accent-rose-600 rounded"
                      />
                      <span className="text-[11px] font-bold text-slate-700">Khóa phiếu</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={perm.can_delete || false}
                        onChange={() => handleTogglePerm(perm.user_id, 'can_delete')}
                        className="w-3.5 h-3.5 accent-red-600 rounded"
                      />
                      <span className="text-[11px] font-bold text-slate-700">Xóa phiếu</span>
                    </label>
                  </div>
                </div>
              ))}

              {sharedPermissions.length === 0 && (
                <div className="p-6 bg-white rounded-2xl border border-dashed border-gray-200 text-center text-gray-400 text-xs italic">
                  Phiếu này chưa được chia sẻ cho thành viên nào...
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:bg-gray-100 text-xs uppercase border-none bg-transparent cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase shadow-lg border-none cursor-pointer disabled:opacity-50 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Lưu phân quyền</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
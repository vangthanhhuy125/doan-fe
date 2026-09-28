'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Download, Edit, Trash2, Calendar, Share2 } from 'lucide-react';
import { RegistrationForm, FormPermission } from './types';
import { exportRegistrationToExcel } from './utils/exportExcel';

interface Props {
  forms: RegistrationForm[];
  onSelectForm: (form: RegistrationForm) => void;
  onEditForm: (form: RegistrationForm) => void;
  onDeleteForm: (id: string) => void;
  onOpenShareModal: (form: RegistrationForm) => void;
}

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

const getUserIdentifiers = (): Set<string> => {
  const ids = new Set<string>();
  if (typeof window === 'undefined') return ids;

  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      [u._id, u.user_id, u.id, u.student_id, u.username, u.email, u.nhan_su_id, u.personnel_id].forEach(v => {
        const c = cleanVal(v);
        if (c) ids.add(c);
      });
      if (u.user && typeof u.user === 'object') {
        [u.user._id, u.user.user_id, u.user.id, u.user.student_id, u.user.username].forEach(v => {
          const c = cleanVal(v);
          if (c) ids.add(c);
        });
      }
    }
  } catch (e) {}

  try {
    const token = localStorage.getItem('token');
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        [payload._id, payload.user_id, payload.id, payload.student_id, payload.username, payload.sub].forEach(v => {
          const c = cleanVal(v);
          if (c) ids.add(c);
        });
      }
    }
  } catch (e) {}

  return ids;
};

export default function FormList({ forms, onSelectForm, onEditForm, onDeleteForm, onOpenShareModal }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [userIds, setUserIds] = useState<Set<string>>(new Set());
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const ids = getUserIdentifiers();
    setUserIds(ids);

    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.role === 'admin' || u.username === 'admin' || u.user?.role === 'admin' || u.user?.username === 'admin') {
          setIsAdmin(true);
        }
      }
      const token = localStorage.getItem('token');
      if (token) {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          if (payload.role === 'admin' || payload.username === 'admin') {
            setIsAdmin(true);
          }
        }
      }
    } catch (e) {}
  }, []);

  const getFormId = (id: string | { $oid: string }): string => {
    if (typeof id === 'object' && id && '$oid' in id) {
      return id.$oid;
    }
    return String(id || '');
  };

  const filteredForms = forms.filter(f => {
    const titleStr = (f?.title || '').toLowerCase();
    const descStr = (f?.description || '').toLowerCase();
    const searchStr = (searchTerm || '').toLowerCase();

    return titleStr.includes(searchStr) || descStr.includes(searchStr);
  });

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm phiếu đăng ký..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-[#1d92ff]"
          />
        </div>
        <span className="text-xs font-bold text-gray-500 uppercase">
          Tổng số: <strong className="text-[#0054a5]">{filteredForms.length}</strong> phiếu
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredForms.length > 0 ? (
          filteredForms.map((form) => {
            const formId = getFormId(form._id);
            const createdByRaw = (form as any).created_by;
            const createdById = cleanVal(createdByRaw);

            const isOwner = !createdById ||
              userIds.has(createdById) ||
              (typeof createdByRaw === 'object' && (
                userIds.has(cleanVal(createdByRaw?.username)) ||
                userIds.has(cleanVal(createdByRaw?.student_id)) ||
                userIds.has(cleanVal(createdByRaw?._id)) ||
                userIds.has(cleanVal(createdByRaw?.user_id))
              ));

            const isCreator = isAdmin || isOwner;

            const sharedList: FormPermission[] = form.shared_permissions || [];
            const myPerm = sharedList.find(p => userIds.has(cleanVal(p.user_id)) || userIds.has(cleanVal(p.username)));

            const canExport = isCreator || Boolean(myPerm?.can_export);
            const canEdit = isCreator || Boolean(myPerm?.can_edit);
            const canDelete = isCreator || Boolean(myPerm?.can_delete);

            return (
              <div key={formId} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-[#0054a5]">{form.title || "Chưa có tiêu đề"}</h3>
                      {!isCreator && (
                        <span className="inline-flex items-center gap-1 bg-[#0054a5]/10 text-[#0054a5] px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[#0054a5]/20">
                          Được chia sẻ
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-600 leading-relaxed">{form.description || "Không có mô tả"}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      onClick={() => onSelectForm(form)}
                      className="flex items-center gap-1.5 bg-[#0054a5] hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all border-none cursor-pointer"
                    >
                      <Eye size={16} /> Theo dõi ({(form.submissions || []).length})
                    </button>

                    {isCreator && (
                      <button
                        onClick={() => onOpenShareModal(form)}
                        className="p-2 text-[#0054a5] hover:bg-blue-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                        title="Chia sẻ phiếu"
                      >
                        <Share2 size={18} />
                      </button>
                    )}

                    {canExport && (
                      <button
                        onClick={() => exportRegistrationToExcel(form)}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all border-none cursor-pointer"
                      >
                        <Download size={16} /> Excel
                      </button>
                    )}

                    {canEdit && (
                      <button
                        onClick={() => onEditForm(form)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                        title="Chỉnh sửa phiếu"
                      >
                        <Edit size={18} />
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => onDeleteForm(formId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                        title="Xóa phiếu"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 font-bold gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#1d92ff]" />
                    <span>Ngày phát hành: {form.created_at ? new Date(form.created_at).toLocaleDateString('vi-VN') : 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-blue-50 text-[#0054a5] px-2.5 py-1 rounded-lg border border-blue-100">
                      {(form.programs || []).length} Chương trình áp dụng
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">
                      {(form.submissions || []).length} Sinh viên đã đăng ký
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-10 rounded-2xl text-center text-gray-400 italic font-bold border border-gray-200">
            Không tìm thấy phiếu đăng ký nào.
          </div>
        )}
      </div>
    </div>
  );
}
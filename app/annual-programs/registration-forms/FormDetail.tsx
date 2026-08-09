'use client';

import { useState, useEffect } from 'react';
import { Download, Edit, Trash2, Users, CheckCircle2, Calendar, Lock, Unlock, ShieldAlert, Share2 } from 'lucide-react';
import { RegistrationForm, ProgramConfig, FormPermission } from './types';
import { exportRegistrationToExcel } from './utils/exportExcel';

interface Props {
  form: RegistrationForm;
  onEditForm: (form: RegistrationForm) => void;
  onDeleteForm: (id: string) => void;
  onOpenShareModal: (form: RegistrationForm) => void;
}

export default function FormDetail({ form, onEditForm, onDeleteForm, onOpenShareModal }: Props) {
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserId(user._id || user.user_id || user.id || '');
      } catch (e) {
        console.error('Lỗi đọc user:', e);
      }
    }
  }, []);

  const createdBy = (form as any).created_by;
  const isCreator = !createdBy || String(createdBy) === String(currentUserId);

  const sharedList: FormPermission[] = form.shared_permissions || [];
  const myPerm = sharedList.find(p => String(p.user_id) === String(currentUserId));

  const canViewSubmissions = isCreator || Boolean(myPerm?.can_view_submissions);
  const canExport = isCreator || Boolean(myPerm?.can_export);
  const canEdit = isCreator || Boolean(myPerm?.can_edit);
  const canLock = isCreator || Boolean(myPerm?.can_lock);
  const canDelete = isCreator || Boolean(myPerm?.can_delete);

  const getFormId = (id: string | { $oid: string }): string => {
    if (typeof id === 'object' && id && '$oid' in id) {
      return id.$oid;
    }
    return String(id || '');
  };

  const getDepartmentStats = (programId: string, deptName: string) => {
    return form.submissions.filter(sub => sub.choices && sub.choices[programId] === deptName).length;
  };

  const handleToggleLock = async () => {
    if (!canLock) {
      alert('Bạn không có quyền khóa/mở khóa phiếu này!');
      return;
    }

    const formId = getFormId(form._id);
    const newLockState = !form.is_locked;

    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-forms/${formId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': currentUserId
        },
        body: JSON.stringify({
          ...form,
          user_id: currentUserId,
          is_locked: newLockState
        })
      });

      if (res.ok) {
        alert(newLockState ? 'Đã khóa phiếu đăng ký!' : 'Đã mở khóa phiếu đăng ký!');
        window.location.reload();
      } else {
        const err = await res.json();
        alert(err.message || 'Thao tác thất bại!');
      }
    } catch (e) {
      console.error('Lỗi toggle khóa:', e);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) {
      alert('Bạn không có quyền xóa phiếu này!');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa phiếu đăng ký này?')) return;

    const formId = getFormId(form._id);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-forms/${formId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': currentUserId
        },
        body: JSON.stringify({ user_id: currentUserId })
      });

      if (res.ok || res.status === 204) {
        alert('Xóa phiếu thành công!');
        onDeleteForm(formId);
      } else {
        const err = await res.json();
        alert(err.message || 'Xóa phiếu thất bại!');
      }
    } catch (e) {
      console.error('Lỗi xóa phiếu:', e);
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;

      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      const day = pad(date.getDate());
      const month = pad(date.getMonth() + 1);
      const year = date.getFullYear();
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      const seconds = pad(date.getSeconds());

      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    } catch {
      return dateStr;
    }
  };

  const formatDateOnly = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 text-black">
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        {!isCreator && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-amber-800 text-xs font-bold">
            <ShieldAlert size={16} className="shrink-0 text-amber-600" />
            <span>Phiếu này được chia sẻ với bạn. Quyền hạn của bạn sẽ dựa theo sự ủy quyền của Người tạo phiếu.</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-black text-[#0054a5]">{form.title}</h3>
              {form.is_locked && (
                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-rose-200">
                  <Lock size={12} /> Đã khóa
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 font-medium">{form.description}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* NÚT CHIA SẺ (CHỈ DÀNH CHO NGƯỜI TẠO) */}
            {isCreator && (
              <button
                onClick={() => onOpenShareModal(form)}
                className="flex items-center gap-1.5 bg-blue-50 text-[#0054a5] hover:bg-blue-100 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-blue-200 transition-all cursor-pointer"
              >
                <Share2 size={16} /> Chia sẻ
              </button>
            )}

            {/* NÚT XUẤT EXCEL */}
            {canExport && (
              <button
                onClick={() => exportRegistrationToExcel(form)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all border-none cursor-pointer"
              >
                <Download size={16} /> Xuất Excel
              </button>
            )}

            {/* NÚT KHÓA */}
            {canLock && (
              <button
                onClick={handleToggleLock}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all border-none cursor-pointer text-white ${
                  form.is_locked ? 'bg-slate-700 hover:bg-slate-800' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {form.is_locked ? <Unlock size={16} /> : <Lock size={16} />}
                <span>{form.is_locked ? 'Mở khóa phiếu' : 'Khóa phiếu'}</span>
              </button>
            )}

            {/* NÚT SỬA */}
            {canEdit && (
              <button
                onClick={() => onEditForm(form)}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all border-none cursor-pointer"
              >
                <Edit size={16} /> Chỉnh sửa
              </button>
            )}

            {/* NÚT XÓA */}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                title="Xóa phiếu"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center gap-3">
            <div className="p-3 bg-[#0054a5] text-white rounded-xl">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-500">Tổng lượt đăng ký</p>
              <p className="text-xl font-black text-[#0054a5]">{form.submissions.length} sinh viên</p>
            </div>
          </div>
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-xl">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-500">Số hoạt động</p>
              <p className="text-xl font-black text-emerald-700">{form.programs.length} hoạt động</p>
            </div>
          </div>
          <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center gap-3">
            <div className="p-3 bg-purple-600 text-white rounded-xl">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-500">Ngày tạo phiếu</p>
              <p className="text-sm font-bold text-purple-900">{formatDateOnly(form.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-black text-[#0054a5] uppercase tracking-wider">
          Thống kê lượt đăng ký từng Ban theo chương trình
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {form.programs.map((prog) => (
            <div key={prog.program_id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-3">
              <div className="border-b border-gray-100 pb-2">
                <h5 className="font-black text-slate-800 text-sm">{prog.program_name}</h5>
                {prog.description && <p className="text-[11px] text-gray-500 italic truncate">{prog.description}</p>}
              </div>
              <div className="space-y-2">
                {prog.departments.map((dept) => {
                  const count = getDepartmentStats(prog.program_id, dept);
                  const percent = form.submissions.length > 0 
                    ? Math.round((count / form.submissions.length) * 100) 
                    : 0;
                  return (
                    <div key={dept} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-700">{dept}</span>
                        <span className="text-[#0054a5]">{count} người ({percent}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-[#1d92ff] h-2 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-black text-[#0054a5] uppercase tracking-wider">
          Danh sách chi tiết sinh viên đăng ký ({form.submissions.length})
        </h4>

        {canViewSubmissions ? (
          <div className="overflow-x-auto rounded-3xl border border-gray-200 shadow-sm bg-white">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-[#0054a5] text-white text-[13px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-4 text-center w-12">STT</th>
                  <th className="px-4 py-4 text-center w-28">MSSV</th>
                  <th className="px-4 py-4 text-left w-44">Họ và Tên</th>
                  <th className="px-4 py-4 text-center w-28">Lớp</th>
                  <th className="px-4 py-4 text-left">Nguyện vọng / Ban đăng ký</th>
                  <th className="px-4 py-4 text-center w-48">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {form.submissions.length > 0 ? (
                  form.submissions.map((sub: any, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-4 text-center font-bold text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-4 text-center font-bold text-[#0054a5]">{sub.student_id}</td>
                      <td className="px-4 py-4 font-bold text-slate-800">{sub.full_name}</td>
                      <td className="px-4 py-4 text-center font-semibold text-gray-600">{sub.class_name}</td>
                      
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          {form.programs.map((prog: ProgramConfig) => {
                            const dept = sub.choices?.[prog.program_id];
                            const leaderOpts: string[] = sub.leadership_choices?.[prog.program_id] || [];

                            if (!dept && leaderOpts.length === 0) return null;

                            return (
                              <div key={prog.program_id} className="space-y-1 text-xs">
                                <div className="font-bold text-slate-700 flex items-center gap-1.5 flex-wrap">
                                  <span>• {prog.program_name}:</span>
                                  {dept && (
                                    <span className="bg-blue-50 text-[#0054a5] px-2.5 py-0.5 rounded-md font-bold border border-blue-100">
                                      {dept}
                                    </span>
                                  )}
                                </div>

                                {leaderOpts.length > 0 && (
                                  <div className="pl-4 flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[11px] font-bold text-amber-700">Ứng cử:</span>
                                    {leaderOpts.map((opt) => (
                                      <span key={opt} className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-bold border border-amber-200 text-[11px]">
                                        ★ {opt}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-xs font-semibold text-gray-600 whitespace-nowrap">
                        {formatDateTime(sub.submitted_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400 italic font-bold">
                      Chưa có sinh viên đăng ký phiếu này...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 bg-white rounded-3xl border border-gray-200 text-center space-y-2 shadow-sm">
            <ShieldAlert className="mx-auto text-amber-500" size={36} />
            <p className="text-sm font-bold text-slate-800">
              Bạn không có quyền xem danh sách chi tiết sinh viên đăng ký
            </p>
            <p className="text-xs text-gray-500 font-medium">
              Bạn cần được Người tạo phiếu cấp quyền "Xem danh sách SV" để truy cập thông tin này.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
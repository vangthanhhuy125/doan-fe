'use client';

import { useState, useEffect } from 'react';
import { FileSpreadsheet, ArrowLeft } from 'lucide-react';
import { RegistrationForm, FormPermission } from './types';
import FormList from './FormList';
import FormDetail from './FormDetail';
import EditFormModal from './EditFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import ShareFormModal from './ShareFormModal';

interface Props {
  forms: RegistrationForm[];
  onRefresh: () => Promise<void>;
  onBack: () => void;
}

const getAccountAndUserIds = (): { accountId: string; userId: string } => {
  let accountId = '';
  let userId = '';

  if (typeof window === 'undefined') return { accountId, userId };

  try {
    const token = localStorage.getItem('token');
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload._id) accountId = String(payload._id);
        if (payload.user_id) userId = String(payload.user_id);
      }
    }
  } catch (e) {}

  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (!accountId) accountId = String(u._id || '');
      if (!userId) userId = String(u.user_id || u.id || '');
    }
  } catch (e) {}

  return { accountId: accountId || userId, userId: userId || accountId };
};

export default function RegistrationManager({ forms, onRefresh, onBack }: Props) {
  const [selectedForm, setSelectedForm] = useState<RegistrationForm | null>(null);
  const [editTargetForm, setEditTargetForm] = useState<RegistrationForm | null>(null);
  const [shareTargetForm, setShareTargetForm] = useState<RegistrationForm | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [ids, setIds] = useState({ accountId: '', userId: '' });

  useEffect(() => {
    setIds(getAccountAndUserIds());
  }, []);

  const getFormId = (id: string | { $oid: string }): string => {
    if (typeof id === 'object' && id && '$oid' in id) {
      return id.$oid;
    }
    return String(id || '');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-forms/${deleteTargetId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': ids.accountId || ids.userId,
        },
        body: JSON.stringify({
          user_id: ids.accountId,
          account_id: ids.accountId,
          profile_user_id: ids.userId
        }),
      });

      if (res.ok) {
        await onRefresh();
        if (selectedForm && getFormId(selectedForm._id) === deleteTargetId) {
          setSelectedForm(null);
        }
      } else {
        alert('Có lỗi xảy ra khi xóa phiếu đăng ký!');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleSaveEditedForm = async (updatedForm: RegistrationForm) => {
    const formId = getFormId(updatedForm._id);
    const formCreatedBy = String((updatedForm as any).created_by || '');

    const effectiveUserId = formCreatedBy === ids.accountId 
      ? ids.accountId 
      : (formCreatedBy === ids.userId ? ids.userId : (ids.accountId || ids.userId));

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-forms/${formId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': effectiveUserId,
        },
        body: JSON.stringify({
          title: updatedForm.title,
          description: updatedForm.description,
          programs: updatedForm.programs,
          user_id: effectiveUserId,
          account_id: ids.accountId,
          profile_user_id: ids.userId,
          created_by: (updatedForm as any).created_by || effectiveUserId,
        }),
      });

      if (res.ok) {
        await onRefresh();
        const updatedData = await res.json();
        const finalForm = updatedData && updatedData._id ? updatedData : updatedForm;
        if (selectedForm && getFormId(selectedForm._id) === formId) {
          setSelectedForm(finalForm);
        }
        setEditTargetForm(null);
      } else {
        const err = await res.json();
        alert(err.message || 'Cập nhật phiếu đăng ký thất bại!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSavePermissions = async (updatedPermissions: FormPermission[]) => {
    if (!shareTargetForm) return;
    const formId = getFormId(shareTargetForm._id);
    const formCreatedBy = String((shareTargetForm as any).created_by || '');
    const effectiveUserId = formCreatedBy === ids.accountId 
      ? ids.accountId 
      : (formCreatedBy === ids.userId ? ids.userId : (ids.accountId || ids.userId));

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-forms/${formId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': effectiveUserId,
        },
        body: JSON.stringify({
          shared_permissions: updatedPermissions,
          user_id: effectiveUserId,
          account_id: ids.accountId,
          profile_user_id: ids.userId
        }),
      });

      if (res.ok) {
        await onRefresh();
        const updatedData = await res.json();
        if (selectedForm && getFormId(selectedForm._id) === formId) {
          setSelectedForm(updatedData);
        }
        setShareTargetForm(null);
      } else {
        alert('Lưu thông tin chia sẻ thất bại!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const currentSelectedForm = selectedForm 
    ? forms.find(f => getFormId(f._id) === getFormId(selectedForm._id)) || selectedForm 
    : null;

  return (
    <div className="space-y-6 text-black">
      <div className="flex items-center justify-between border-b-2 border-[#0054a5] pb-3 gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={currentSelectedForm ? () => setSelectedForm(null) : onBack}
            className="p-2 hover:bg-blue-50 text-[#0054a5] rounded-xl transition-all border-none bg-transparent cursor-pointer"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="p-2 bg-[#0054a5] rounded-xl text-white shadow-lg shadow-blue-100">
            <FileSpreadsheet size={24} />
          </div>
          <h2 className="text-2xl font-black uppercase text-[#0054a5] tracking-tight">
            {currentSelectedForm ? "Chi tiết phiếu đăng ký" : "Quản lý phiếu đăng ký chương trình"}
          </h2>
        </div>
      </div>

      {!currentSelectedForm ? (
        <FormList
          forms={forms}
          onSelectForm={setSelectedForm}
          onEditForm={setEditTargetForm}
          onDeleteForm={setDeleteTargetId}
          onOpenShareModal={setShareTargetForm}
        />
      ) : (
        <FormDetail
          form={currentSelectedForm}
          onEditForm={setEditTargetForm}
          onDeleteForm={setDeleteTargetId}
          onOpenShareModal={setShareTargetForm}
        />
      )}

      {editTargetForm && (
        <EditFormModal
          form={editTargetForm}
          onClose={() => setEditTargetForm(null)}
          onSave={handleSaveEditedForm}
        />
      )}

      {shareTargetForm && (
        <ShareFormModal
          form={shareTargetForm}
          onClose={() => setShareTargetForm(null)}
          onSavePermissions={handleSavePermissions}
        />
      )}

      {deleteTargetId && (
        <DeleteConfirmModal
          onClose={() => setDeleteTargetId(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
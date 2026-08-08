'use client';

import { useState, useEffect } from 'react';
import { FileSpreadsheet, ArrowLeft } from 'lucide-react';
import { RegistrationForm } from './types';
import FormList from './FormList';
import FormDetail from './FormDetail';
import EditFormModal from './EditFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';

interface Props {
  forms: RegistrationForm[];
  onRefresh: () => Promise<void>;
  onBack: () => void;
}

export default function RegistrationManager({ forms, onRefresh, onBack }: Props) {
  const [selectedForm, setSelectedForm] = useState<RegistrationForm | null>(null);
  const [editTargetForm, setEditTargetForm] = useState<RegistrationForm | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
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

  const getFormId = (id: string | { $oid: string }): string => {
    if (typeof id === 'object' && id && '$oid' in id) {
      return id.$oid;
    }
    return String(id || '');
  };

  // 📌 Xử lý xóa phiếu qua API
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-forms/${deleteTargetId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
        },
        body: JSON.stringify({ user_id: currentUserId }),
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
      console.error('Lỗi khi xóa phiếu:', error);
    } finally {
      setDeleteTargetId(null);
    }
  };

  // 📌 Xử lý cập nhật phiếu qua API
  const handleSaveEditedForm = async (updatedForm: RegistrationForm) => {
    const formId = getFormId(updatedForm._id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-forms/${formId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
        },
        body: JSON.stringify({
          title: updatedForm.title,
          description: updatedForm.description,
          programs: updatedForm.programs,
          user_id: currentUserId,
          created_by: (updatedForm as any).created_by,
        }),
      });

      if (res.ok) {
        await onRefresh();
        const updatedData = await res.json();
        if (selectedForm && getFormId(selectedForm._id) === formId) {
          setSelectedForm(updatedData);
        }
        setEditTargetForm(null);
      } else {
        alert('Cập nhật phiếu đăng ký thất bại!');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật phiếu:', error);
    }
  };

  // Đồng bộ thông tin selectedForm khi `forms` thay đổi từ API re-fetch
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
        />
      ) : (
        <FormDetail
          form={currentSelectedForm}
          onEditForm={setEditTargetForm}
          onDeleteForm={setDeleteTargetId}
        />
      )}

      {editTargetForm && (
        <EditFormModal
          form={editTargetForm}
          onClose={() => setEditTargetForm(null)}
          onSave={handleSaveEditedForm}
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
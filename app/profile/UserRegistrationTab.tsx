'use client';

import { useState, useEffect } from 'react';
import { FileCheck2, CheckCircle2, Clock, ChevronRight, Loader2, Calendar, Lock } from 'lucide-react';
import { RegistrationForm, ProgramConfig, Submission } from '../annual-programs/registration-forms/types';
import SubmitRegistrationModal from './SubmitRegistrationModal';

interface Props {
  userInfo: {
    student_id: string;
    full_name: string;
    class_name: string;
  };
  onRefreshCount?: () => void;
}

export default function UserRegistrationTab({ userInfo, onRefreshCount }: Props) {
  const [forms, setForms] = useState<RegistrationForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormToSubmit, setSelectedFormToSubmit] = useState<RegistrationForm | null>(null);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-forms`);
      if (res.ok) {
        const data = await res.json();
        setForms(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Lỗi lấy phiếu đăng ký:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const getFormId = (id: any) => typeof id === 'object' && id?.$oid ? id.$oid : String(id);

  const getUserSubmission = (form: RegistrationForm) => {
    return form.submissions?.find((sub: Submission) => sub.student_id === userInfo.student_id);
  };

  const handleFormSubmitted = () => {
    fetchForms();
    onRefreshCount?.();
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
          <FileCheck2 className="text-[#0054a5]" size={20} /> Danh sách phiếu đăng ký
        </h3>
        <span className="text-xs font-semibold text-gray-500">
          Tổng số: <strong className="text-[#0054a5]">{forms.length}</strong> phiếu
        </span>
      </div>

      {forms.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-12 text-center text-sm font-medium text-gray-400 italic">
          Hiện tại chưa có phiếu đăng ký chương trình nào.
        </div>
      ) : (
        <div className="space-y-4">
          {forms.map((form) => {
            const formId = getFormId(form._id);
            const userSub = getUserSubmission(form);
            const isSubmitted = !!userSub;
            const isLocked = !!form.is_locked;

            return (
              <div
                key={formId}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4 transition-all hover:border-[#0054a5]/40"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-bold text-gray-800 text-base">{form.title}</h4>
                      
                      {/* HIỂN THỊ BADGE TRẠNG THÁI PHIẾU */}
                      {isLocked ? (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-rose-200">
                          <Lock size={12} /> Đã khóa đăng ký
                        </span>
                      ) : isSubmitted ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-200">
                          <CheckCircle2 size={12} /> Đã đăng ký
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-amber-200">
                          <Clock size={12} /> Đang mở đăng ký
                        </span>
                      )}
                    </div>
                    {form.description && (
                      <p className="text-xs font-medium text-gray-500">{form.description}</p>
                    )}
                  </div>

                  {/* NÚT THAO TÁC */}
                  {isLocked ? (
                    <button
                      onClick={() => setSelectedFormToSubmit(form)}
                      className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition-all border-none bg-gray-100 text-gray-600 hover:bg-gray-200 shrink-0 self-start sm:self-auto"
                    >
                      <span>{isSubmitted ? 'Xem nguyện vọng' : 'Xem thông tin (Đã khóa)'}</span>
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedFormToSubmit(form)}
                      className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition-all border-none active:scale-95 shrink-0 self-start sm:self-auto ${
                        isSubmitted
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-[#0054a5] text-white hover:bg-blue-700'
                      }`}
                    >
                      <span>{isSubmitted ? 'Xem / Sửa nguyện vọng' : 'Đăng ký ngay'}</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase text-gray-500">Chương trình áp dụng:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {form.programs.map((prog: ProgramConfig) => {
                      const selectedDept = userSub?.choices?.[prog.program_id];
                      return (
                        <div key={prog.program_id} className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 text-xs">
                          <p className="font-bold text-gray-800">{prog.program_name}</p>
                          {selectedDept ? (
                            <p className="text-emerald-600 font-bold mt-1">
                              ✓ Đã chọn: <span className="underline">{selectedDept}</span>
                            </p>
                          ) : (
                            <p className="text-gray-400 font-medium mt-1">Chưa chọn Ban</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-xs font-medium text-gray-400 flex items-center gap-1 pt-1">
                  <Calendar size={14} className="text-[#0054a5]" />
                  <span>Ngày phát hành: {new Date(form.created_at || (form as any).createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedFormToSubmit && (
        <SubmitRegistrationModal
          form={selectedFormToSubmit}
          userInfo={userInfo}
          existingSubmission={getUserSubmission(selectedFormToSubmit)}
          onClose={() => setSelectedFormToSubmit(null)}
          onSubmitSuccess={handleFormSubmitted}
        />
      )}
    </div>
  );
}
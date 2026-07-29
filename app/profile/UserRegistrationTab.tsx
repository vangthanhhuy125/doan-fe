'use client';

import { useState, useEffect } from 'react';
import { FileCheck2, CheckCircle2, Clock, ChevronRight, Loader2, Calendar } from 'lucide-react';
import { RegistrationForm, ProgramConfig, Submission } from '../annual-programs/registration-forms/types';
import SubmitRegistrationModal from './SubmitRegistrationModal';

interface Props {
  userInfo: {
    student_id: string;
    full_name: string;
    class_name: string;
  };
}

export default function UserRegistrationTab({ userInfo }: Props) {
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

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h3 className="text-base font-black text-[#0054a5] uppercase tracking-wider flex items-center gap-2">
          <FileCheck2 size={18} /> Các phiếu đăng ký chương trình
        </h3>
        <span className="text-xs font-bold text-gray-400">
          Tổng số: <strong className="text-[#0054a5]">{forms.length}</strong> phiếu
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {forms.length > 0 ? (
          forms.map((form) => {
            const formId = getFormId(form._id);
            const userSub = getUserSubmission(form);
            const isSubmitted = !!userSub;

            return (
              <div
                key={formId}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-800 text-base">{form.title}</h4>
                      {isSubmitted ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-emerald-200">
                          <CheckCircle2 size={12} /> Đã đăng ký
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-amber-200">
                          <Clock size={12} /> Đang mở đăng ký
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{form.description}</p>
                  </div>

                  <button
                    onClick={() => setSelectedFormToSubmit(form)}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all border-none cursor-pointer shrink-0 ${
                      isSubmitted
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-[#0054a5] hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isSubmitted ? 'Xem / Sửa nguyện vọng' : 'Đăng ký ngay'}
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Chương trình áp dụng:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {form.programs.map((prog: ProgramConfig) => {
                      const selectedDept = userSub?.choices?.[prog.program_id];
                      return (
                        <div key={prog.program_id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                          <p className="font-bold text-slate-800">{prog.program_name}</p>
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

                <div className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                  <Calendar size={12} /> Ngày phát hành: {new Date(form.created_at).toLocaleDateString('vi-VN')}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-10 text-center text-gray-400 italic font-bold border border-gray-100 rounded-2xl">
            Hiện tại chưa có phiếu đăng ký chương trình nào.
          </div>
        )}
      </div>

      {selectedFormToSubmit && (
        <SubmitRegistrationModal
          form={selectedFormToSubmit}
          userInfo={userInfo}
          existingSubmission={getUserSubmission(selectedFormToSubmit)}
          onClose={() => setSelectedFormToSubmit(null)}
          onSubmitSuccess={fetchForms}
        />
      )}
    </div>
  );
}
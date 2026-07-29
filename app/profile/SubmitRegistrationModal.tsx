'use client';

import { useState } from 'react';
import { X, FileCheck2, User, Send } from 'lucide-react';
import { RegistrationForm, ProgramConfig } from '../annual-programs/registration-forms/types';

interface Props {
  form: RegistrationForm;
  userInfo: { student_id: string; full_name: string; class_name: string };
  existingSubmission?: any;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export default function SubmitRegistrationModal({ 
  form, 
  userInfo, 
  existingSubmission, 
  onClose, 
  onSubmitSuccess 
}: Props) {
  const [choices, setChoices] = useState<Record<string, string>>(
    existingSubmission?.choices || {}
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSelectDepartment = (programId: string, deptName: string) => {
    setChoices(prev => {
      const updated = { ...prev };
      if (updated[programId] === deptName) {
        delete updated[programId];
      } else {
        updated[programId] = deptName;
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Object.keys(choices).length === 0) {
      alert('Vui lòng chọn ít nhất 1 Ban tham gia cho ít nhất 1 chương trình!');
      return;
    }

    setSubmitting(true);
    try {
      const getFormId = (id: any) => typeof id === 'object' && id?.$oid ? id.$oid : String(id);
      const formId = getFormId(form._id);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: userInfo.student_id,
          full_name: userInfo.full_name,
          class_name: userInfo.class_name,
          choices: choices,
          submitted_at: new Date().toLocaleString('vi-VN'),
        })
      });

      if (res.ok) {
        alert(existingSubmission ? 'Cập nhật nguyện vọng thành công!' : 'Gửi phiếu đăng ký thành công!');
        onSubmitSuccess();
        onClose();
      } else {
        alert('Gửi phiếu thất bại, vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Lỗi nộp phiếu:', error);
      alert('Không thể kết nối đến máy chủ!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200 text-black">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 max-h-[90vh] flex flex-col">
        <div className="bg-[#0054a5] p-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <FileCheck2 size={20} />
            <h3 className="font-bold uppercase tracking-widest text-sm">
              {existingSubmission ? 'Chỉnh sửa nguyện vọng đăng ký' : 'Điền phiếu đăng ký chương trình'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-white border-none bg-transparent cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          <div className="space-y-2 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-black text-[#0054a5]">{form.title}</h2>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">{form.description}</p>
          </div>

          <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0054a5] uppercase">
              <User size={14} /> Thông tin người đăng ký
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-bold text-gray-700">
              <div><span className="text-gray-400 font-normal">Họ tên:</span> {userInfo.full_name}</div>
              <div><span className="text-gray-400 font-normal">MSSV:</span> {userInfo.student_id}</div>
              <div><span className="text-gray-400 font-normal">Lớp:</span> {userInfo.class_name}</div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                Chọn Ban tham gia (Không bắt buộc chọn tất cả)
              </h4>
              <span className="text-[11px] text-amber-600 font-semibold italic">
                * Nhấp lại vào Ban đã chọn để hủy chọn
              </span>
            </div>

            {form.programs.map((prog: ProgramConfig, idx: number) => (
              <div key={prog.program_id} className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
                <div className="border-b border-gray-100 pb-2">
                  <h5 className="font-black text-slate-800 text-sm">
                    {idx + 1}. {prog.program_name}
                  </h5>
                  {prog.description && (
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{prog.description}</p>
                  )}
                </div>

                <div className="space-y-2 pt-1">
                  <label className="text-[11px] font-bold text-[#0054a5] uppercase block">
                    Chọn 1 Ban bạn muốn ứng tuyển (Tùy chọn)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {prog.departments.map((dept: string) => {
                      const isSelected = choices[prog.program_id] === dept;
                      return (
                        <label
                          key={dept}
                          onClick={() => handleSelectDepartment(prog.program_id, dept)}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-blue-50 border-[#0054a5] text-[#0054a5] font-bold shadow-sm' 
                              : 'bg-gray-50 border-gray-200 text-gray-700 font-semibold hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`prog_${prog.program_id}`}
                            checked={isSelected}
                            onChange={() => {}}
                            className="accent-[#0054a5] w-4 h-4 cursor-pointer"
                          />
                          <span className="text-xs">{dept}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:bg-gray-100 text-xs uppercase border-none bg-transparent cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase shadow-lg border-none cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              <Send size={14} />
              {submitting ? 'Đang gửi...' : existingSubmission ? 'Cập nhật phiếu' : 'Gửi phiếu đăng ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
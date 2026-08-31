// SubmitRegistrationModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, FileCheck2, User, Send, UserCheck, Check, Loader2, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
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
  const isLocked = !!form.is_locked;

  const [choices, setChoices] = useState<Record<string, string>>(
    existingSubmission?.choices || {}
  );
  const [leadershipChoices, setLeadershipChoices] = useState<Record<string, string[]>>(
    existingSubmission?.leadership_choices || {}
  );
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (existingSubmission) {
      setChoices(existingSubmission.choices || {});
      setLeadershipChoices(existingSubmission.leadership_choices || {});
    }
  }, [existingSubmission]);

  const isLeadershipOptionAllowed = (selectedDept: string | undefined, option: string) => {
    if (!selectedDept) return false;
    const optLower = option.toLowerCase();
    const isException = 
      optLower.includes('tổ chức') || 
      optLower.includes('btc') || 
      optLower.includes('mentor') || 
      optLower.includes('cố vấn');

    if (isException) return true;

    const cleanDept = selectedDept.replace(/^Ban\s+/i, '').trim().toLowerCase();
    const cleanOption = option
      .replace(/^(Phó\s+trưởng|Trưởng|Phó)\s+(Ban\s+)?/i, '')
      .trim()
      .toLowerCase();

    return cleanDept === cleanOption || cleanOption === `ban ${cleanDept}`;
  };

  const handleSelectDepartment = (programId: string, deptName: string) => {
    if (isLocked) return;

    setChoices(prev => {
      const updated = { ...prev };
      let newDept: string | undefined;

      if (updated[programId] === deptName) {
        delete updated[programId];
        newDept = undefined;
      } else {
        updated[programId] = deptName;
        newDept = deptName;
      }

      setLeadershipChoices(lPrev => {
        const currentList = lPrev[programId] || [];
        const filteredList = currentList.filter(opt => isLeadershipOptionAllowed(newDept, opt));
        return {
          ...lPrev,
          [programId]: filteredList
        };
      });

      return updated;
    });
  };

  const handleSelectLeadership = (programId: string, option: string) => {
    if (isLocked) return;

    const selectedDept = choices[programId];
    const isAllowed = isLeadershipOptionAllowed(selectedDept, option);

    if (!isAllowed) {
      if (!selectedDept) {
        showToast('Bạn cần chọn 1 Ban ứng tuyển ở trên trước khi đăng ký vị trí này!', 'error');
      } else {
        showToast(`Bạn đang chọn "${selectedDept}" nên chỉ có thể ứng cử vị trí của Ban này, các vị trí Ban Tổ chức hoặc Mentor/Cố vấn!`, 'error');
      }
      return;
    }

    setLeadershipChoices(prev => {
      const currentList = prev[programId] || [];
      const exists = currentList.includes(option);
      const updatedList = exists
        ? currentList.filter(item => item !== option)
        : [...currentList, option];

      return {
        ...prev,
        [programId]: updatedList
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    
    if (Object.keys(choices).length === 0 && Object.keys(leadershipChoices).length === 0) {
      showToast('Vui lòng chọn ít nhất 1 Ban tham gia hoặc 1 vị trí ứng cử!', 'error');
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
          leadership_choices: leadershipChoices,
          submitted_at: new Date().toLocaleString('vi-VN'),
        })
      });

      if (res.ok) {
        showToast(existingSubmission ? 'Cập nhật nguyện vọng thành công!' : 'Gửi phiếu đăng ký thành công!', 'success');
        setTimeout(() => {
          onSubmitSuccess();
          onClose();
        }, 1200);
      } else {
        const err = await res.json();
        showToast(err.message || 'Gửi phiếu thất bại, vui lòng thử lại!', 'error');
      }
    } catch (error) {
      console.error('Lỗi nộp phiếu:', error);
      showToast('Không thể kết nối đến máy chủ!', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200 text-black">
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold animate-in slide-in-from-top-4 duration-300 text-white ${
          toastMessage.type === 'success' ? 'bg-emerald-600' : toastMessage.type === 'error' ? 'bg-rose-600' : 'bg-[#0054a5]'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 max-h-[90vh] flex flex-col">
        <div className="bg-[#0054a5] p-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <FileCheck2 size={20} />
            <h3 className="font-bold uppercase tracking-widest text-sm">
              {isLocked ? 'Chi tiết nguyện vọng đã khóa' : existingSubmission ? 'Chỉnh sửa nguyện vọng đăng ký' : 'Điền phiếu đăng ký chương trình'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-white border-none bg-transparent cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {isLocked && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-bold">
              <Lock size={18} className="shrink-0" />
              <span>Phiếu đăng ký này đã được BTC khóa. Bạn chỉ có thể xem lại nguyện vọng và không thể chỉnh sửa!</span>
            </div>
          )}

          <div className="space-y-2 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-black text-[#0054a5]">{form.title}</h2>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">{form.description}</p>
          </div>

          <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0054a5] uppercase">
              <User size={14} /> Thông tin người đăng ký
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold text-gray-700">
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
              {!isLocked && (
                <span className="text-[11px] text-amber-600 font-semibold italic">
                  * Nhấp lại vào Ban đã chọn để hủy chọn
                </span>
              )}
            </div>

            {form.programs.map((prog: ProgramConfig, idx: number) => {
              const selectedDept = choices[prog.program_id];
              const selectedLeaderships = leadershipChoices[prog.program_id] || [];

              return (
                <div key={prog.program_id} className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <div className="border-b border-gray-100 pb-2">
                    <h5 className="font-black text-slate-800 text-sm">
                      {idx + 1}. {prog.program_name}
                    </h5>
                    {prog.description && (
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{prog.description}</p>
                    )}
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {prog.departments.map((dept: string) => {
                        const isSelected = selectedDept === dept;
                        return (
                          <div
                            key={dept}
                            onClick={() => handleSelectDepartment(prog.program_id, dept)}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                              isLocked
                                ? isSelected
                                  ? 'bg-blue-50 border-[#0054a5] text-[#0054a5] font-bold opacity-80 cursor-not-allowed'
                                  : 'bg-gray-50/50 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed'
                                : isSelected 
                                ? 'bg-blue-50 border-[#0054a5] text-[#0054a5] font-bold shadow-sm cursor-pointer' 
                                : 'bg-gray-50 border-gray-200 text-gray-700 font-semibold hover:bg-gray-100 cursor-pointer'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`prog_${prog.program_id}`}
                              checked={isSelected}
                              disabled={isLocked}
                              onChange={() => {}}
                              className="accent-[#0054a5] w-4 h-4"
                            />
                            <span className="text-xs">{dept}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {prog.enable_leadership_survey && (
                    <div className="pt-3 border-t border-gray-100 space-y-2.5">
                      <label className="text-[11px] font-bold uppercase text-amber-700 tracking-wider flex items-center gap-1">
                        <UserCheck size={14} /> {prog.leadership_title || 'Đăng ký nguyện vọng ứng cử vị trí Trưởng / Phó Ban:'}
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(prog.leadership_options || []).map((option: string) => {
                          const isChecked = selectedLeaderships.includes(option);
                          const isAllowed = !isLocked && isLeadershipOptionAllowed(selectedDept, option);

                          return (
                            <div
                              key={option}
                              onClick={() => handleSelectLeadership(prog.program_id, option)}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all select-none ${
                                isLocked
                                  ? isChecked
                                    ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500 opacity-80 cursor-not-allowed'
                                    : 'bg-gray-100/50 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed'
                                  : !isAllowed
                                  ? 'bg-gray-100/60 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                  : isChecked
                                  ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500 cursor-pointer'
                                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                  isLocked || !isAllowed
                                    ? isChecked
                                      ? 'border-amber-600 bg-amber-600 text-white'
                                      : 'border-gray-300 bg-gray-200'
                                    : isChecked
                                    ? 'border-amber-600 bg-amber-600 text-white'
                                    : 'border-gray-300 bg-white'
                                }`}
                              >
                                {isChecked && <Check size={12} strokeWidth={3} />}
                              </div>
                              <span
                                className={`text-xs font-bold ${
                                  isLocked || !isAllowed
                                    ? isChecked
                                      ? 'text-amber-800'
                                      : 'text-gray-400'
                                    : isChecked
                                    ? 'text-amber-800'
                                    : 'text-gray-700'
                                }`}
                              >
                                {option}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:bg-gray-100 text-xs uppercase border-none bg-transparent cursor-pointer"
            >
              {isLocked ? 'Đóng' : 'Hủy'}
            </button>
            {!isLocked && (
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase shadow-lg border-none cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                <span>{submitting ? 'Đang gửi...' : existingSubmission ? 'Cập nhật phiếu' : 'Gửi phiếu đăng ký'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
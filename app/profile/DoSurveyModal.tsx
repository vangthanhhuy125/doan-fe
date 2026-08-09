'use client';

import { useState } from 'react';
import { X, Send, Loader2, ChevronRight, ChevronLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SurveyForm, Question } from './SurveyTab';

interface Props {
  survey: SurveyForm;
  userInfo: { student_id: string; full_name: string };
  existingResponse?: any;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export default function DoSurveyModal({ survey, userInfo, existingResponse, onClose, onSubmitSuccess }: Props) {
  const isSubmitted = !!existingResponse;
  const isLocked = !!survey.is_locked;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quản lý phần/trang hiện tại
  const sections = survey.sections && survey.sections.length > 0
    ? survey.sections
    : [{ id: 'default', title: survey.title, description: survey.description }];

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const currentSec = sections[currentSectionIndex];

  // Lọc câu hỏi thuộc phần hiện tại
  const currentQuestions = (survey.questions || []).filter(
    q => !q.section_id || q.section_id === currentSec.id || sections.length === 1
  );

  // Khởi tạo giá trị đáp án cũ (nếu có)
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    if (existingResponse?.answers) {
      existingResponse.answers.forEach((ans: any) => {
        initial[ans.question_id] = ans.value;
      });
    }
    return initial;
  });

  const handleTextChange = (qId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleCheckboxChange = (qId: string, optText: string, checked: boolean) => {
    const currentList: string[] = Array.isArray(answers[qId]) ? answers[qId] : [];
    if (checked) {
      setAnswers((prev) => ({ ...prev, [qId]: [...currentList, optText] }));
    } else {
      setAnswers((prev) => ({ ...prev, [qId]: currentList.filter((item) => item !== optText) }));
    }
  };

  // 🟢 CHUYỂN PHẦN KHI BẤM "TIẾP TỤC" (KHÔNG SUBMIT FORM)
  const handleNextSection = (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn chặn tuyệt đối hành vi submit form
    e.stopPropagation();

    // Validate các câu hỏi bắt buộc ở phần hiện tại
    for (const q of currentQuestions) {
      if (q.required) {
        const val = answers[q.id];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          alert(`Vui lòng trả lời câu hỏi bắt buộc: "${q.text}"`);
          return;
        }
      }
    }

    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  // 🟢 QUAY LẠI PHẦN TRƯỚC (KHÔNG SUBMIT FORM)
  const handlePrevSection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  // 🟢 HÀM NỘP PHIẾU (CHỈ KÍCH HOẠT Ở PHẦN CUỐI CÙNG)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || isSubmitting) return;

    // Validate toàn bộ câu hỏi bắt buộc trong tất cả các phần
    for (const q of survey.questions) {
      if (q.required) {
        const val = answers[q.id];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          alert(`Vui lòng trả lời câu hỏi bắt buộc: "${q.text}"`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
        question_id: qId,
        value: val,
      }));

      const getFormId = (id: any) => typeof id === 'object' && id?.$oid ? id.$oid : String(id);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/surveys/${getFormId(survey._id)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: userInfo.student_id,
          full_name: userInfo.full_name,
          answers: formattedAnswers,
        }),
      });

      if (res.ok) {
        alert(isSubmitted ? 'Cập nhật câu trả lời thành công!' : 'Nộp phiếu khảo sát thành công!');
        onSubmitSuccess();
        onClose();
      } else {
        const err = await res.json();
        alert(err.message || 'Nộp phiếu khảo sát thất bại!');
      }
    } catch (e) {
      console.error(e);
      alert('Không thể kết nối máy chủ!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200 text-black">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 max-h-[90vh] flex flex-col">
        {/* HEADER MODAL */}
        <div className="bg-[#0054a5] p-5 flex items-center justify-between text-white shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">
                Phần {currentSectionIndex + 1} / {sections.length}
              </span>
              <h3 className="font-bold uppercase tracking-widest text-sm">{survey.title}</h3>
              {isSubmitted && (
                <span className="bg-emerald-500/80 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Đã thực hiện
                </span>
              )}
            </div>
            {currentSec.description && <p className="text-xs text-blue-100 mt-1">{currentSec.description}</p>}
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-white border-none bg-transparent cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* THÔNG BÁO TỪNG NỘP PHIẾU */}
        {isSubmitted && (
          <div className="bg-emerald-50 p-3 px-6 border-b border-emerald-100 text-xs text-emerald-800 font-semibold flex items-center justify-between">
            <span>✓ Bạn đã nộp phiếu này trước đây. Bạn có thể thay đổi đáp án và gửi lại!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {currentQuestions.map((q: Question, idx: number) => {
            const val = answers[q.id];

            return (
              <div key={q.id} className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-800 block leading-relaxed">
                  {idx + 1}. {q.text} {q.required && <span className="text-red-500">*</span>}
                </label>

                {/* ẢNH CÂU HỎI */}
                {q.image_url && (
                  <div className="rounded-xl overflow-hidden border border-gray-200 max-w-md bg-white">
                    <img src={q.image_url} alt="Minh họa" className="w-full max-h-60 object-contain p-2" />
                  </div>
                )}

                {/* INPUTS */}
                {q.type === 'short_text' && (
                  <input
                    type="text"
                    disabled={isLocked}
                    value={val || ''}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    placeholder="Câu trả lời của bạn..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0054a5] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                )}

                {q.type === 'paragraph' && (
                  <textarea
                    rows={3}
                    disabled={isLocked}
                    value={val || ''}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    placeholder="Câu trả lời của bạn..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0054a5] resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                )}

                {q.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    {q.options?.map((opt) => (
                      <label key={opt.id} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="radio"
                          name={q.id}
                          disabled={isLocked}
                          checked={val === opt.text}
                          onChange={() => handleTextChange(q.id, opt.text)}
                          className="w-4 h-4 accent-[#0054a5] disabled:cursor-not-allowed"
                        />
                        <span>{opt.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'checkboxes' && (
                  <div className="space-y-2">
                    {q.options?.map((opt) => {
                      const isChecked = Array.isArray(val) && val.includes(opt.text);
                      return (
                        <label key={opt.id} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            disabled={isLocked}
                            checked={isChecked}
                            onChange={(e) => handleCheckboxChange(q.id, opt.text, e.target.checked)}
                            className="w-4 h-4 accent-[#0054a5] rounded disabled:cursor-not-allowed"
                          />
                          <span>{opt.text}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {q.type === 'dropdown' && (
                  <select
                    disabled={isLocked}
                    value={val || ''}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0054a5] cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Chọn đáp án --</option>
                    {q.options?.map((opt) => (
                      <option key={opt.id} value={opt.text}>
                        {opt.text}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}

          {/* CỤM NÚT ĐIỀU HƯỚNG BẮT BỘC PHẢI CÓ type="button" CHO CÁC NÚT KHÔNG PHẢI NỘP BÀI */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
            {currentSectionIndex > 0 ? (
              <button
                type="button"
                onClick={handlePrevSection}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 font-bold text-xs uppercase text-gray-700 rounded-xl transition-all border-none cursor-pointer"
              >
                <ChevronLeft size={16} /> Quay lại
              </button>
            ) : <div />}

            {currentSectionIndex < sections.length - 1 ? (
              <button
                type="button"
                onClick={handleNextSection}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase shadow-md transition-all border-none cursor-pointer"
              >
                <span>Tiếp tục</span> <ChevronRight size={16} />
              </button>
            ) : (
              !isLocked && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center justify-center gap-2 px-6 py-2.5 text-white font-bold rounded-xl text-xs uppercase shadow-lg border-none cursor-pointer transition-all active:scale-95 disabled:opacity-50 ${
                    isSubmitted ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-100' : 'bg-[#0054a5] hover:bg-blue-700 shadow-blue-100'
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : isSubmitted ? (
                    <RefreshCw size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                  <span>{isSubmitted ? 'Cập nhật / Gửi lại phiếu' : 'Gửi phiếu khảo sát'}</span>
                </button>
              )
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
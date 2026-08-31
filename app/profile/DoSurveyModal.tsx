'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  X, Send, Loader2, ChevronRight, ChevronLeft, RefreshCw, 
  CheckCircle2, Bold, Italic, Underline, AlertCircle, BookmarkCheck 
} from 'lucide-react';
import { SurveyForm, Question } from './SurveyTab';

interface Props {
  survey: SurveyForm;
  userInfo: { student_id: string; full_name: string };
  existingResponse?: any;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

// 🟢 COMPONENT Ô NHẬP LIỆU PHONG CÁCH NOTION (INTEGRATED TOOLBAR)
function FormattingTextarea({
  value,
  onChange,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(120, textareaRef.current.scrollHeight)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  const applyFormatting = (formatType: 'bold' | 'italic' | 'underline') => {
    const textarea = textareaRef.current;
    if (!textarea || disabled) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let prefix = '';
    let suffix = '';

    if (formatType === 'bold') {
      prefix = '**';
      suffix = '**';
    } else if (formatType === 'italic') {
      prefix = '*';
      suffix = '*';
    } else if (formatType === 'underline') {
      prefix = '<u>';
      suffix = '</u>';
    }

    const replacement = selectedText ? `${prefix}${selectedText}${suffix}` : `${prefix}nội_dung${suffix}`;
    const newValue = text.substring(0, start) + replacement + text.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + (selectedText ? selectedText.length : 8);
      textarea.setSelectionRange(start + prefix.length, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && !disabled) {
      const key = e.key.toLowerCase();
      if (key === 'b') {
        e.preventDefault();
        applyFormatting('bold');
      } else if (key === 'i') {
        e.preventDefault();
        applyFormatting('italic');
      } else if (key === 'u') {
        e.preventDefault();
        applyFormatting('underline');
      }
    }
  };

  return (
    <div className={`group relative border border-slate-200 focus-within:border-[#0054a5] focus-within:ring-4 focus-within:ring-[#0054a5]/10 rounded-2xl bg-white overflow-hidden transition-all duration-200 shadow-sm ${disabled ? 'bg-slate-50 cursor-not-allowed opacity-75' : ''}`}>
      {!disabled && (
        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50/80 border-b border-slate-100 text-slate-500 select-none">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => applyFormatting('bold')}
              className="p-1.5 hover:bg-slate-200/70 hover:text-slate-900 rounded-lg transition-colors border-none cursor-pointer bg-transparent"
              title="In đậm (Ctrl+B)"
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('italic')}
              className="p-1.5 hover:bg-slate-200/70 hover:text-slate-900 rounded-lg transition-colors border-none cursor-pointer bg-transparent"
              title="In nghiêng (Ctrl+I)"
            >
              <Italic size={15} />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('underline')}
              className="p-1.5 hover:bg-slate-200/70 hover:text-slate-900 rounded-lg transition-colors border-none cursor-pointer bg-transparent"
              title="Gạch chân (Ctrl+U)"
            >
              <Underline size={15} />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <span>Dùng</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-mono shadow-xs text-slate-600">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-mono shadow-xs text-slate-600">B</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-mono shadow-xs text-slate-600">I</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-mono shadow-xs text-slate-600">U</kbd>
          </div>
        </div>
      )}

      <textarea
        ref={textareaRef}
        disabled={disabled}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          adjustHeight();
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full p-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none resize-none leading-relaxed transition-all min-h-[120px]"
      />
    </div>
  );
}

export default function DoSurveyModal({ survey, userInfo, existingResponse, onClose, onSubmitSuccess }: Props) {
  const isSubmitted = !!existingResponse;
  const isLocked = !!survey.is_locked;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getSurveyId = (id: any) => typeof id === 'object' && id?.$oid ? id.$oid : String(id);
  const draftKey = `survey_draft_${getSurveyId(survey._id)}_${userInfo.student_id}`;

  const sections = survey.sections && survey.sections.length > 0
    ? survey.sections
    : [{ id: 'default', title: survey.title, description: survey.description }];

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const currentSec = sections[currentSectionIndex];

  const currentQuestions = (survey.questions || []).filter(
    q => !q.section_id || q.section_id === currentSec.id || sections.length === 1
  );

  // 🟢 1. KHỞI TẠO ĐÁP ÁN: ƯU TIÊN BẢN NHÁP TRƯỚC ĐÓ -> ĐÁP ÁN ĐÃ LƯU TRÊN SERVER
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    if (typeof window !== 'undefined') {
      const draft = localStorage.getItem(draftKey);
      if (draft) {
        try {
          return JSON.parse(draft);
        } catch (e) {}
      }
    }

    const initial: Record<string, any> = {};
    if (existingResponse?.answers) {
      existingResponse.answers.forEach((ans: any) => {
        initial[ans.question_id] = ans.value;
      });
    }
    return initial;
  });

  // 🟢 2. TỰ ĐỘNG LƯU NHÁP VÀO LOCALSTORAGE KHI CÓ THAY ĐỔI
  useEffect(() => {
    if (Object.keys(answers).length > 0 && !isLocked) {
      localStorage.setItem(draftKey, JSON.stringify(answers));
    }
  }, [answers, draftKey, isLocked]);

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

  const handleNextSection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    for (const q of currentQuestions) {
      if (q.required) {
        const val = answers[q.id];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          showToast(`Vui lòng trả lời câu hỏi bắt buộc: "${q.text}"`, 'error');
          return;
        }
      }
    }

    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const handlePrevSection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || isSubmitting) return;

    for (const q of survey.questions) {
      if (q.required) {
        const val = answers[q.id];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          showToast(`Vui lòng trả lời câu hỏi bắt buộc: "${q.text}"`, 'error');
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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/surveys/${getSurveyId(survey._id)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: userInfo.student_id,
          full_name: userInfo.full_name,
          answers: formattedAnswers,
        }),
      });

      if (res.ok) {
        localStorage.removeItem(draftKey); // 🟢 Xóa bản nháp khi nộp thành công
        showToast(isSubmitted ? 'Cập nhật câu trả lời thành công!' : 'Nộp phiếu khảo sát thành công!', 'success');
        setTimeout(() => {
          onSubmitSuccess();
          onClose();
        }, 1200);
      } else {
        const err = await res.json();
        showToast(err.message || 'Nộp phiếu khảo sát thất bại!', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Không thể kết nối máy chủ!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-2 sm:p-6 text-black animate-in fade-in duration-200">
      
      {/* TOAST THÔNG BÁO THAY THẾ ALERT */}
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold animate-in slide-in-from-top-4 duration-300 text-white ${
          toastMessage.type === 'success' ? 'bg-emerald-600' : toastMessage.type === 'error' ? 'bg-rose-600' : 'bg-[#0054a5]'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* KHUNG MODAL RỘNG 2/3 MÀN HÌNH (lg:w-2/3 max-w-5xl) */}
      <div className="bg-white w-full h-full sm:h-auto lg:w-2/3 max-w-5xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 sm:max-h-[90vh] flex flex-col">
        
        {/* HEADER MODAL */}
        <div className="bg-gradient-to-r from-[#004282] to-[#0054a5] p-5 sm:p-6 text-white shrink-0 shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white/15 text-blue-100 border border-white/20 px-3 py-0.5 rounded-full text-xs font-bold tracking-wide backdrop-blur-xs">
                  Phần {currentSectionIndex + 1} / {sections.length}
                </span>
                {isSubmitted ? (
                  <span className="bg-emerald-500/90 text-white px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs">
                    <CheckCircle2 size={13} /> Đã thực hiện
                  </span>
                ) : (
                  <span className="bg-white/15 text-blue-100 px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                    <BookmarkCheck size={13} /> Tự động lưu nháp
                  </span>
                )}
              </div>

              <h3 className="font-extrabold uppercase tracking-wide text-base sm:text-lg leading-snug text-white pt-1">
                {survey.title}
              </h3>

              {currentSec.description && (
                <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal pt-1">
                  {currentSec.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/15 rounded-full text-white/80 hover:text-white transition-all border-none bg-transparent cursor-pointer shrink-0"
              title="Đóng (Không mất nội dung đã điền)"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* THÔNG BÁO ĐÃ NỘP BÀI */}
        {isSubmitted && (
          <div className="bg-emerald-50/80 p-3.5 px-6 border-b border-emerald-100 text-xs sm:text-sm text-emerald-800 font-semibold flex items-center justify-between shrink-0">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              Bạn đã nộp phiếu này trước đây. Có thể chỉnh sửa câu trả lời và gửi lại.
            </span>
          </div>
        )}

        {/* NỘI DUNG CÂU HỎI */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1 text-left bg-slate-50/50">
          {currentQuestions.map((q: Question, idx: number) => {
            const val = answers[q.id];

            return (
              <div key={q.id} className="p-6 sm:p-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4 hover:border-slate-300 transition-all">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-blue-50 text-[#0054a5] font-black text-xs sm:text-sm shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <label className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed block flex-1">
                    {q.text} {q.required && <span className="text-rose-500 font-bold ml-0.5">*</span>}
                  </label>
                </div>

                {q.image_url && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-w-lg bg-slate-50">
                    <img src={q.image_url} alt="Minh họa" className="w-full max-h-72 object-contain p-2" />
                  </div>
                )}

                {q.type === 'short_text' && (
                  <input
                    type="text"
                    disabled={isLocked}
                    value={val || ''}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    placeholder="Câu trả lời của bạn..."
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium outline-none focus:border-[#0054a5] focus:ring-4 focus:ring-[#0054a5]/10 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all shadow-xs"
                  />
                )}

                {q.type === 'paragraph' && (
                  <FormattingTextarea
                    disabled={isLocked}
                    value={val || ''}
                    onChange={(newVal) => handleTextChange(q.id, newVal)}
                    placeholder="Nhập câu trả lời chi tiết của bạn..."
                  />
                )}

                {q.type === 'multiple_choice' && (
                  <div className="space-y-2.5 pt-1">
                    {q.options?.map((opt) => (
                      <label 
                        key={opt.id} 
                        className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl border cursor-pointer text-xs sm:text-sm font-semibold transition-all ${
                          val === opt.text 
                            ? 'bg-blue-50/60 border-[#0054a5]/40 text-[#0054a5]' 
                            : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          disabled={isLocked}
                          checked={val === opt.text}
                          onChange={() => handleTextChange(q.id, opt.text)}
                          className="w-4 h-4 accent-[#0054a5] disabled:cursor-not-allowed shrink-0"
                        />
                        <span className="leading-snug">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'checkboxes' && (
                  <div className="space-y-2.5 pt-1">
                    {q.options?.map((opt) => {
                      const isChecked = Array.isArray(val) && val.includes(opt.text);
                      return (
                        <label 
                          key={opt.id} 
                          className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl border cursor-pointer text-xs sm:text-sm font-semibold transition-all ${
                            isChecked 
                              ? 'bg-blue-50/60 border-[#0054a5]/40 text-[#0054a5]' 
                              : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={isLocked}
                            checked={isChecked}
                            onChange={(e) => handleCheckboxChange(q.id, opt.text, e.target.checked)}
                            className="w-4 h-4 accent-[#0054a5] rounded-md disabled:cursor-not-allowed shrink-0"
                          />
                          <span className="leading-snug">{opt.text}</span>
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
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold outline-none focus:border-[#0054a5] focus:ring-4 focus:ring-[#0054a5]/10 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed shadow-xs"
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

          <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between shrink-0 gap-2">
            {currentSectionIndex > 0 ? (
              <button
                type="button"
                onClick={handlePrevSection}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-100 hover:bg-slate-200/80 font-bold text-xs uppercase text-slate-700 rounded-xl transition-all border-none cursor-pointer"
              >
                <ChevronLeft size={16} /> Quay lại
              </button>
            ) : <div />}

            {currentSectionIndex < sections.length - 1 ? (
              <button
                type="button"
                onClick={handleNextSection}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase shadow-md shadow-blue-500/10 transition-all border-none cursor-pointer active:scale-95 ml-auto"
              >
                <span>Tiếp tục</span> <ChevronRight size={16} />
              </button>
            ) : (
              !isLocked && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center justify-center gap-2 px-7 py-3 text-white font-bold rounded-xl text-xs uppercase shadow-lg border-none cursor-pointer transition-all active:scale-95 disabled:opacity-50 ml-auto ${
                    isSubmitted 
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20' 
                      : 'bg-gradient-to-r from-[#004282] to-[#0054a5] hover:brightness-110 shadow-blue-500/25'
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : isSubmitted ? (
                    <RefreshCw size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                  <span>{isSubmitted ? 'Cập nhật / Gửi lại' : 'Gửi phiếu khảo sát'}</span>
                </button>
              )
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
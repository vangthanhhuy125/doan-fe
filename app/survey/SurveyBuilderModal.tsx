'use client';

import { useState } from 'react';
import { 
  X, Plus, Copy, Trash2, Save, Lock, Unlock, 
  Loader2, MessageSquareText, Image as ImageIcon, Split,
  FileSpreadsheet, Users, User, Hash, CheckSquare, List
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { SurveyForm, Question, QuestionType, Section } from './types';

interface Props {
  survey: SurveyForm | null;
  currentUserId: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function SurveyBuilderModal({ survey, currentUserId, onClose, onSaved }: Props) {
  const [activeTab, setActiveTab] = useState<'editor' | 'responses'>('editor');
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState(survey?.title || 'Mẫu khảo sát chưa có tiêu đề');
  const [description, setDescription] = useState(survey?.description || '');
  const [isLocked, setIsLocked] = useState(!!survey?.is_locked);

  // 📑 DANH SÁCH CÁC PHẦN / TRANG (SECTIONS)
  const [sections, setSections] = useState<Section[]>(
    survey?.sections && survey.sections.length > 0
      ? survey.sections
      : [{ id: 'sec_default', title: 'Mục chưa có tiêu đề', description: '' }]
  );

  // ❓ DANH SÁCH CÂU HỎI
  const [questions, setQuestions] = useState<Question[]>(
    survey?.questions && survey.questions.length > 0 
      ? survey.questions 
      : [{
          id: 'q_' + Date.now(),
          text: 'Câu hỏi chưa có tiêu đề',
          type: 'multiple_choice',
          required: false,
          section_id: 'sec_default',
          options: [
            { id: 'opt_1', text: 'Tùy chọn 1' },
            { id: 'opt_2', text: 'Tùy chọn 2' }
          ]
        }]
  );

  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(questions[0]?.id || null);
  const responses = survey?.responses || [];

  // Thêm câu hỏi
  const handleAddQuestion = (targetSectionId?: string) => {
    const secId = targetSectionId || sections[sections.length - 1].id;
    const newQ: Question = {
      id: 'q_' + Date.now(),
      text: 'Câu hỏi chưa có tiêu đề',
      type: 'multiple_choice',
      required: false,
      section_id: secId,
      options: [{ id: 'opt_1', text: 'Tùy chọn 1' }]
    };
    setQuestions([...questions, newQ]);
    setActiveQuestionId(newQ.id);
  };

  // Tách phần / Tách trang (Section Break)
  const handleAddSection = () => {
    const newSec: Section = {
      id: 'sec_' + Date.now(),
      title: 'Mục chưa có tiêu đề',
      description: ''
    };
    setSections([...sections, newSec]);
    handleAddQuestion(newSec.id);
  };

  // Xóa phần
  const handleRemoveSection = (secId: string) => {
    if (sections.length <= 1) {
      alert('Biểu mẫu phải có ít nhất 1 phần!');
      return;
    }
    setSections(sections.filter(s => s.id !== secId));
    const fallbackSecId = sections[0].id;
    setQuestions(prev => prev.map(q => q.section_id === secId ? { ...q, section_id: fallbackSecId } : q));
  };

  const handleSectionChange = (secId: string, field: keyof Section, val: string) => {
    setSections(prev => prev.map(s => s.id === secId ? { ...s, [field]: val } : s));
  };

  // Nhân bản câu hỏi
  const handleDuplicateQuestion = (qToDup: Question) => {
    const duplicated: Question = {
      ...qToDup,
      id: 'q_' + Date.now(),
      options: qToDup.options?.map(o => ({ ...o, id: 'opt_' + Math.random().toString(36).substr(2, 5) }))
    };
    const index = questions.findIndex(q => q.id === qToDup.id);
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, duplicated);
    setQuestions(newQuestions);
    setActiveQuestionId(duplicated.id);
  };

  // Xóa câu hỏi
  const handleRemoveQuestion = (id: string) => {
    if (questions.length === 1) {
      alert('Phiếu khảo sát phải có ít nhất 1 câu hỏi!');
      return;
    }
    const filtered = questions.filter(q => q.id !== id);
    setQuestions(filtered);
    if (activeQuestionId === id) {
      setActiveQuestionId(filtered[0]?.id || null);
    }
  };

  const handleQuestionChange = (id: string, field: keyof Question, value: any) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  // Thêm/Upload hình ảnh vào câu hỏi
  const handleImageUpload = (qId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Dung lượng ảnh tối đa 3MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleQuestionChange(qId, 'image_url', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Quản lý options đáp án
  const handleAddOption = (qId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        const opts = q.options || [];
        return {
          ...q,
          options: [...opts, { id: 'opt_' + Date.now(), text: `Tùy chọn ${opts.length + 1}` }]
        };
      }
      return q;
    }));
  };

  const handleOptionTextChange = (qId: string, optId: string, text: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          options: (q.options || []).map(o => o.id === optId ? { ...o, text } : o)
        };
      }
      return q;
    }));
  };

  const handleRemoveOption = (qId: string, optId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        if ((q.options || []).length <= 1) {
          alert('Câu hỏi phải có ít nhất 1 tùy chọn đáp án!');
          return q;
        }
        return { ...q, options: (q.options || []).filter(o => o.id !== optId) };
      }
      return q;
    }));
  };

  // Lưu biểu mẫu
  const handleSave = async () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề phiếu khảo sát!');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        voucherNo: survey?.voucherNo,
        title,
        description,
        is_locked: isLocked,
        created_by: currentUserId,
        sections,
        questions
      };

      const url = survey?._id
        ? `${process.env.NEXT_PUBLIC_API_URL}/surveys/${survey._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/surveys`;

      const method = survey?._id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Đã lưu phiếu khảo sát thành công!');
        onSaved();
        onClose();
      } else {
        alert('Lưu phiếu khảo sát thất bại!');
      }
    } catch (e) {
      console.error(e);
      alert('Không thể kết nối đến máy chủ!');
    } finally {
      setIsSaving(false);
    }
  };

  const exportResponsesToExcel = () => {
    if (!responses || responses.length === 0) {
      alert('Chưa có lượt nộp bài khảo sát nào!');
      return;
    }

    const headers = ['STT', 'MSSV', 'Họ và tên', ...questions.map(q => q.text), 'Thời gian nộp'];
    const rows = responses.map((resp, idx) => {
      const answerMap: Record<string, string> = {};
      (resp.answers || []).forEach((a: any) => {
        answerMap[a.question_id] = Array.isArray(a.value) ? a.value.join(', ') : String(a.value || '');
      });

      const qAnswers = questions.map(q => answerMap[q.id] || '');
      return [
        idx + 1,
        resp.student_id || '',
        resp.full_name || '',
        ...qAnswers,
        new Date(resp.submitted_at).toLocaleString('vi-VN')
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kết quả');
    XLSX.writeFile(workbook, `Khao_sat_${survey?.voucherNo || 'Detail'}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#f0f4f9] flex flex-col overflow-hidden text-black animate-in fade-in duration-200">
      {/* HEADER TOP FIXED */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 h-16 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0054a5] rounded-xl text-white shadow-md">
            <MessageSquareText size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-[#0054a5] font-black text-[10px] px-2 py-0.5 rounded-md">
                {survey?.voucherNo || 'TẠO MỚI'}
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-bold text-base text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#0054a5] outline-none px-1 py-0.5 transition-all truncate max-w-md"
              />
            </div>
          </div>
        </div>

        {/* TAB GOOGLE FORMS */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-5 py-1.5 rounded-lg font-bold text-xs uppercase transition-all border-none cursor-pointer ${
              activeTab === 'editor' 
                ? 'bg-[#0054a5] text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-800 bg-transparent'
            }`}
          >
            Câu hỏi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('responses')}
            className={`px-5 py-1.5 rounded-lg font-bold text-xs uppercase transition-all border-none cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'responses' 
                ? 'bg-[#0054a5] text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-800 bg-transparent'
            }`}
          >
            <span>Câu trả lời</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'responses' ? 'bg-white text-[#0054a5]' : 'bg-gray-200 text-gray-700'
            }`}>
              {responses.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg border-none cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Lưu biểu mẫu</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors border-none bg-transparent cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>
      </header>

      {/* 🟢 VIEW 1: TRÌNH THIẾT KẾ CÂU HỎI (EDITOR) */}
      {activeTab === 'editor' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6 relative pb-24">
            
            {/* THẺ TÊN BIỂU MẪU CHÍNH */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden border-t-8 border-t-[#0054a5]">
              <div className="p-6 space-y-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tiêu đề biểu mẫu"
                  className="w-full text-2xl font-black text-gray-900 border-b border-transparent hover:border-gray-200 focus:border-[#0054a5] outline-none pb-1 transition-all"
                />
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chi tiết biểu mẫu..."
                  className="w-full text-xs font-semibold text-gray-600 border-b border-transparent hover:border-gray-200 focus:border-[#0054a5] outline-none resize-none transition-all"
                />
              </div>
            </div>

            {/* LẶP QUA TỪNG PHẦN (SECTIONS) */}
            {sections.map((sec, secIdx) => {
              const secQuestions = questions.filter(q => (q.section_id || sections[0].id) === sec.id);

              return (
                <div key={sec.id} className="space-y-4">
                  {/* HEADER BADGE PHẦN */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden border-l-8 border-l-[#0054a5]">
                    <div className="bg-[#0054a5] text-white px-4 py-1.5 inline-block font-black text-xs uppercase rounded-br-xl">
                      Phần {secIdx + 1} / {sections.length}
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => handleSectionChange(sec.id, 'title', e.target.value)}
                          placeholder="Mục không có tiêu đề"
                          className="w-full text-lg font-bold text-gray-800 border-b border-transparent hover:border-gray-200 focus:border-[#0054a5] outline-none transition-all"
                        />
                        {sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(sec.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg border-none bg-transparent cursor-pointer"
                            title="Xóa phần này"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={sec.description || ''}
                        onChange={(e) => handleSectionChange(sec.id, 'description', e.target.value)}
                        placeholder="Mô tả (không bắt buộc)"
                        className="w-full text-xs text-gray-500 border-b border-transparent hover:border-gray-200 focus:border-[#0054a5] outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* CÁC CÂU HỎI THUỘC PHẦN NÀY */}
                  {secQuestions.map((q) => {
                    const isActive = activeQuestionId === q.id;

                    return (
                      <div
                        key={q.id}
                        onClick={() => setActiveQuestionId(q.id)}
                        className={`bg-white rounded-2xl border shadow-sm transition-all relative ${
                          isActive 
                            ? 'border-gray-300 ring-2 ring-[#0054a5]/30 border-l-8 border-l-[#0054a5] p-6 space-y-5' 
                            : 'border-gray-200 hover:border-gray-300 p-5 space-y-3 cursor-pointer'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <input
                            type="text"
                            value={q.text}
                            onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)}
                            placeholder="Nội dung câu hỏi"
                            className="w-full sm:flex-1 p-3 bg-gray-50 focus:bg-white border-b-2 border-transparent focus:border-[#0054a5] text-sm font-bold text-gray-800 outline-none transition-all rounded-lg"
                          />

                          {isActive && (
                            <select
                              value={q.type}
                              onChange={(e) => handleQuestionChange(q.id, 'type', e.target.value as QuestionType)}
                              className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-[#0054a5] cursor-pointer"
                            >
                              <option value="short_text">Trả lời ngắn</option>
                              <option value="paragraph">Đoạn văn</option>
                              <option value="multiple_choice">Trắc nghiệm (1 chọn)</option>
                              <option value="checkboxes">Hộp kiểm (nhiều chọn)</option>
                              <option value="dropdown">Menu thả xuống</option>
                            </select>
                          )}
                        </div>

                        {/* KHU VỰC HIỂN THỊ ẢNH CÂU HỎI */}
                        {q.image_url && (
                          <div className="relative group max-w-md rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                            <img src={q.image_url} alt="Ảnh câu hỏi" className="w-full max-h-64 object-contain" />
                            {isActive && (
                              <button
                                type="button"
                                onClick={() => handleQuestionChange(q.id, 'image_url', '')}
                                className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700 border-none cursor-pointer"
                                title="Xóa ảnh"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        )}

                        <div className="pt-2">
                          {q.type === 'short_text' && (
                            <div className="p-3 border-b border-dashed border-gray-300 text-xs text-gray-400 font-medium max-w-xs">
                              Văn bản câu trả lời ngắn
                            </div>
                          )}

                          {q.type === 'paragraph' && (
                            <div className="p-3 border-b border-dashed border-gray-300 text-xs text-gray-400 font-medium max-w-md">
                              Văn bản câu trả lời dài
                            </div>
                          )}

                          {['multiple_choice', 'checkboxes', 'dropdown'].includes(q.type) && (
                            <div className="space-y-3">
                              {(q.options || []).map((opt, optIdx) => (
                                <div key={opt.id} className="flex items-center gap-3">
                                  {q.type === 'multiple_choice' && <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />}
                                  {q.type === 'checkboxes' && <div className="w-4 h-4 rounded border-2 border-gray-300 shrink-0" />}
                                  {q.type === 'dropdown' && <span className="text-xs font-bold text-gray-400 shrink-0">{optIdx + 1}.</span>}

                                  <input
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) => handleOptionTextChange(q.id, opt.id, e.target.value)}
                                    className="flex-1 p-1.5 border-b border-transparent hover:border-gray-200 focus:border-[#0054a5] text-xs font-semibold text-gray-800 outline-none transition-all"
                                  />

                                  {isActive && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveOption(q.id, opt.id)}
                                      className="p-1 text-gray-400 hover:text-red-500 rounded-full border-none bg-transparent cursor-pointer"
                                    >
                                      <X size={16} />
                                    </button>
                                  )}
                                </div>
                              ))}

                              {isActive && (
                                <div className="flex items-center gap-2 pt-1">
                                  <div className="w-4 h-4 rounded-full border-2 border-transparent shrink-0" />
                                  <button
                                    type="button"
                                    onClick={() => handleAddOption(q.id)}
                                    className="text-xs font-bold text-[#0054a5] hover:underline border-none bg-transparent cursor-pointer"
                                  >
                                    + Thêm tùy chọn
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {isActive && (
                          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 text-gray-500">
                            <label className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" title="Chèn ảnh vào câu hỏi">
                              <ImageIcon size={18} className="text-[#0054a5]" />
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(q.id, e)} />
                            </label>

                            <button
                              type="button"
                              onClick={() => handleDuplicateQuestion(q)}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors border-none bg-transparent cursor-pointer"
                              title="Nhân bản câu hỏi"
                            >
                              <Copy size={18} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(q.id)}
                              className="p-2 hover:bg-gray-100 hover:text-red-500 rounded-full transition-colors border-none bg-transparent cursor-pointer"
                              title="Xóa câu hỏi"
                            >
                              <Trash2 size={18} />
                            </button>

                            <div className="h-6 w-px bg-gray-200" />

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <span className="text-xs font-bold text-gray-600">Bắt buộc</span>
                              <input
                                type="checkbox"
                                checked={q.required}
                                onChange={(e) => handleQuestionChange(q.id, 'required', e.target.checked)}
                                className="w-4 h-4 accent-[#0054a5] rounded cursor-pointer"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {secIdx < sections.length - 1 && (
                    <div className="p-3 bg-white/80 rounded-xl border border-dashed border-gray-300 text-xs font-bold text-gray-500 text-center">
                      Sau phần {secIdx + 1}: Tiếp tục tới phần tiếp theo (Phần {secIdx + 2})
                    </div>
                  )}
                </div>
              );
            })}

            {/* THANH CÔNG CỤ NỔI (+ | =) */}
            <div className="fixed bottom-8 right-8 bg-white rounded-2xl border border-gray-200 shadow-2xl p-2 flex flex-col items-center gap-3 z-30">
              <button
                type="button"
                onClick={() => handleAddQuestion()}
                className="p-3 bg-[#0054a5] text-white hover:bg-blue-700 rounded-xl transition-transform hover:scale-105 shadow-md border-none cursor-pointer"
                title="Thêm câu hỏi mới"
              >
                <Plus size={20} />
              </button>

              <button
                type="button"
                onClick={handleAddSection}
                className="p-3 bg-gray-100 text-gray-700 hover:bg-[#0054a5] hover:text-white rounded-xl transition-all border-none cursor-pointer"
                title="Tách phần / Tách trang (=)"
              >
                <Split size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 VIEW 2: QUẢN LÝ & BẢN TÓM TẮT CÂU TRẢ LỜI (GOOGLE FORMS SUMMARY) */}
      {activeTab === 'responses' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-5 pb-24">
            
            {/* THẺ TỔNG SỐ LƯỢNG VÀ NÚT TẢI EXCEL */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {responses.length} câu trả lời
                  </h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">
                    Bản tóm tắt kết quả khảo sát tổng hợp từ hệ thống
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={exportResponsesToExcel}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all border-none cursor-pointer"
                  >
                    <FileSpreadsheet size={16} /> Xuất file Excel
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLocked(!isLocked)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border-none cursor-pointer transition-all ${
                      isLocked ? 'bg-rose-100 text-rose-700' : 'bg-blue-50 text-[#0054a5]'
                    }`}
                  >
                    {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                    <span>{isLocked ? 'Đã khóa nhận bài' : 'Đang mở nhận bài'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-[#0054a5] bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                <Users size={16} />
                <span>Số người tham gia thực hiện khảo sát: {responses.length} sinh viên</span>
              </div>
            </div>

            {/* Render TỔNG HỢP CÂU TRẢ LỜI CHO TỪNG CÂU HỎI */}
            {responses.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-gray-400 font-medium italic">
                Chưa có lượt phản hồi nào cho bài khảo sát này.
              </div>
            ) : (
              questions.map((q, idx) => {
                // Lọc danh sách câu trả lời của câu hỏi q này
                const answerList = responses
                  .map(r => {
                    const found = (r.answers || []).find((a: any) => a.question_id === q.id);
                    return {
                      student_id: r.student_id,
                      full_name: r.full_name,
                      val: found ? found.value : null
                    };
                  })
                  .filter(item => item.val !== null && item.val !== undefined && item.val !== '');

                const totalAnswersForQ = answerList.length;

                return (
                  <div key={q.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <div className="border-b border-gray-100 pb-3">
                      <h3 className="font-bold text-gray-800 text-sm">
                        {idx + 1}. {q.text}
                      </h3>
                      <p className="text-[11px] font-semibold text-gray-400 mt-1">
                        {totalAnswersForQ} câu trả lời
                      </p>
                    </div>

                    {/* A. DẠNG TRẢ LỜI NGẮN Hoặc ĐOẠN VĂN */}
                    {['short_text', 'paragraph'].includes(q.type) && (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {answerList.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">Chưa có câu trả lời.</p>
                        ) : (
                          answerList.map((item, aIdx) => (
                            <div key={aIdx} className="p-3 bg-[#f8f9fa] rounded-xl border border-gray-100 text-xs text-gray-700 font-medium space-y-1">
                              <p className="font-bold text-gray-800">{String(item.val)}</p>
                              {(item.student_id || item.full_name) && (
                                <p className="text-[10px] text-gray-400 font-semibold">
                                  — {item.full_name || 'Sinh viên'} ({item.student_id || 'MSSV'})
                                </p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* B. DẠNG TRẮC NGHIỆM / HỘP KIỂM / DROPDOWN (BẢN TÓM TẮT PHẦN TRĂM) */}
                    {['multiple_choice', 'checkboxes', 'dropdown'].includes(q.type) && (
                      <div className="space-y-3">
                        {(q.options || []).map((opt) => {
                          // Đếm số người chọn tùy chọn opt
                          const count = answerList.filter(item => {
                            if (Array.isArray(item.val)) {
                              return item.val.includes(opt.text);
                            }
                            return String(item.val) === opt.text;
                          }).length;

                          const percentage = totalAnswersForQ > 0 
                            ? ((count / totalAnswersForQ) * 100).toFixed(1) 
                            : '0';

                          return (
                            <div key={opt.id} className="space-y-1">
                              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                                <span>{opt.text}</span>
                                <span className="text-[#0054a5]">
                                  {count} lượt ({percentage}%)
                                </span>
                              </div>
                              {/* Thanh tỉ lệ % đắp nền */}
                              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div
                                  className="bg-[#0054a5] h-3 rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
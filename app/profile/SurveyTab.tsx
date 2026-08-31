'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, Clock, ChevronRight, Loader2, Calendar, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import DoSurveyModal from './DoSurveyModal';

export interface Section {
  id: string;
  title: string;
  description?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'short_text' | 'paragraph' | 'multiple_choice' | 'checkboxes' | 'dropdown';
  required: boolean;
  options?: QuestionOption[];
  image_url?: string;
  section_id?: string;
}

export interface SurveyForm {
  _id: string | { $oid: string };
  voucherNo?: string;
  title: string;
  description?: string;
  created_by: string;
  created_at: string;
  is_locked?: boolean;
  sections?: Section[];
  questions: Question[];
  responses: any[];
}

interface Props {
  userInfo: {
    student_id: string;
    full_name: string;
  };
  onRefreshCount?: () => void;
}

function ExpandableDescription({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = text.length > 160 || text.split('\n').length > 3;

  return (
    <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
      <p className={`text-xs sm:text-sm font-normal text-slate-700 leading-relaxed whitespace-pre-wrap transition-all ${!isExpanded && isLong ? 'line-clamp-3' : ''}`}>
        {text}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-xs font-bold text-[#0054a5] hover:text-blue-700 flex items-center gap-1 border-none bg-transparent cursor-pointer p-0 transition-colors"
        >
          <span>{isExpanded ? 'Thu gọn mô tả' : 'Xem thêm mô tả...'}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}
    </div>
  );
}

export default function SurveyTab({ userInfo, onRefreshCount }: Props) {
  const [surveys, setSurveys] = useState<SurveyForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyForm | null>(null);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/surveys`);
      if (res.ok) {
        const data = await res.json();
        setSurveys(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Lỗi lấy danh sách phiếu khảo sát:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const getFormId = (id: any) => typeof id === 'object' && id?.$oid ? id.$oid : String(id);

  const getUserResponse = (survey: SurveyForm) => {
    return (survey.responses || []).find((r: any) => r.student_id === userInfo.student_id);
  };

  const handleSubmitted = () => {
    fetchSurveys();
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
    <div className="p-4 sm:p-6 space-y-6 text-black">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
          <ClipboardList className="text-[#0054a5]" size={20} /> Danh sách phiếu khảo sát
        </h3>
        <span className="text-xs font-semibold text-gray-500">
          Tổng số: <strong className="text-[#0054a5]">{surveys.length}</strong> phiếu
        </span>
      </div>

      {surveys.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-12 text-center text-sm font-medium text-gray-400 italic">
          Hiện tại chưa có phiếu khảo sát nào.
        </div>
      ) : (
        <div className="space-y-5">
          {surveys.map((survey) => {
            const surveyId = getFormId(survey._id);
            const userResp = getUserResponse(survey);
            const isSubmitted = !!userResp;
            const isLocked = !!survey.is_locked;

            return (
              <div
                key={surveyId}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs hover:border-[#0054a5]/50 hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div className="space-y-2 flex-1 pr-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug">
                        {survey.title}
                      </h4>
                      
                      {isLocked ? (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-200/80">
                          <Lock size={12} /> Đã khóa
                        </span>
                      ) : isSubmitted ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200/80">
                          <CheckCircle2 size={12} /> Đã thực hiện
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200/80">
                          <Clock size={12} /> Đang mở khảo sát
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedSurvey(survey)}
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold shadow-sm transition-all border-none active:scale-95 shrink-0 w-full sm:w-auto ${
                      isSubmitted || isLocked
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-[#0054a5] text-white hover:bg-blue-700 shadow-blue-500/20'
                    }`}
                  >
                    <span>{isSubmitted ? 'Xem / Chỉnh sửa khảo sát' : isLocked ? 'Xem câu hỏi (Khóa)' : 'Thực hiện khảo sát'}</span>
                    <ChevronRight size={15} />
                  </button>
                </div>

                {survey.description && (
                  <ExpandableDescription text={survey.description} />
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#0054a5]" />
                    <span>Ngày tạo: {new Date(survey.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <span>{(survey.questions || []).length} câu hỏi</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedSurvey && (
        <DoSurveyModal
          survey={selectedSurvey}
          userInfo={userInfo}
          existingResponse={getUserResponse(selectedSurvey)}
          onClose={() => setSelectedSurvey(null)}
          onSubmitSuccess={handleSubmitted}
        />
      )}
    </div>
  );
}
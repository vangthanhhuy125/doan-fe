'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, Clock, ChevronRight, Loader2, Calendar, Lock } from 'lucide-react';
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
    <div className="p-6 space-y-6 text-black">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
          <ClipboardList className="text-[#0054a5]" size={20} /> Danh sách phiếu khảo sát
        </h3>
        <span className="text-xs font-semibold text-gray-500">
          Tổng số: <strong className="text-[#0054a5]">{surveys.length}</strong> phiếu
        </span>
      </div>

      {surveys.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-12 text-center text-sm font-medium text-gray-400 italic">
          Hiện tại chưa có phiếu khảo sát nào.
        </div>
      ) : (
        <div className="space-y-4">
          {surveys.map((survey) => {
            const surveyId = getFormId(survey._id);
            const userResp = getUserResponse(survey);
            const isSubmitted = !!userResp;
            const isLocked = !!survey.is_locked;

            return (
              <div
                key={surveyId}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3 hover:border-[#0054a5]/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-bold text-gray-800 text-base">{survey.title}</h4>
                      
                      {isLocked ? (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-rose-200">
                          <Lock size={12} /> Đã khóa
                        </span>
                      ) : isSubmitted ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-200">
                          <CheckCircle2 size={12} /> Đã thực hiện khảo sát
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-amber-200">
                          <Clock size={12} /> Đang mở khảo sát
                        </span>
                      )}
                    </div>
                    {survey.description && (
                      <p className="text-xs font-medium text-gray-500">{survey.description}</p>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedSurvey(survey)}
                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition-all border-none active:scale-95 shrink-0 ${
                      isSubmitted || isLocked
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-[#0054a5] text-white hover:bg-blue-700'
                    }`}
                  >
                    <span>{isSubmitted ? 'Xem / Chỉnh sửa khảo sát' : isLocked ? 'Xem câu hỏi (Khóa)' : 'Thực hiện khảo sát'}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                  <div className="flex items-center gap-1">
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
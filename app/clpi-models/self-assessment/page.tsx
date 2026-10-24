'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Award, CheckCircle2, AlertCircle, Send, 
  Save, Loader2, Sparkles, HelpCircle, ArrowRight
} from 'lucide-react';

interface IndicatorConfig {
  code: 'WPI' | 'LEI' | 'CEI' | 'SDI';
  name: string;
  subTitle: string;
  description: string;
  weight: number; // Tỷ lệ %
  explanationPlaceholder: string;
}

// Cấu hình 4 nhóm chỉ số năng lực theo BRD
const INDICATORS: IndicatorConfig[] = [
  {
    code: 'WPI',
    name: 'Chỉ số Hoàn thành nhiệm vụ (Work Performance Index)',
    subTitle: 'Đánh giá số lượng, tiến độ và chất lượng các công việc được giao.',
    description: 'Đánh giá dựa trên tỷ lệ hoàn thành công việc, mức độ đúng hạn và sản phẩm đầu ra thực tế.',
    weight: 40,
    explanationPlaceholder: 'VD: Đã hoàn thành 100% công việc trong quý đúng thời hạn. Có 1 nhiệm vụ vượt chỉ tiêu học viên...',
  },
  {
    code: 'LEI',
    name: 'Chỉ số Năng lực điều hành, phối hợp (Leadership & Execution)',
    subTitle: 'Khả năng quản lý nhóm, phân công việc và giải quyết vướng mắc.',
    description: 'Đánh giá khả năng chủ động điều phối, tinh thần làm việc nhóm và xử lý các vấn đề phát sinh.',
    weight: 25,
    explanationPlaceholder: 'VD: Phối hợp nhịp nhàng với các Bí thư Chi đoàn bạn. Lãnh đạo Ban Tổ chức hoạt động chu đáo...',
  },
  {
    code: 'CEI',
    name: 'Chỉ số Tương tác tổ chức (Community Engagement)',
    subTitle: 'Mức độ tương tác với hội viên và tham gia phong trào Đoàn.',
    description: 'Đánh giá mức độ hiện diện, kết nối với đoàn viên, thanh niên và hưởng ứng các hoạt động cấp khoa/trường.',
    weight: 20,
    explanationPlaceholder: 'VD: Tham gia đầy đủ 100% các cuộc họp giao ban BTV và các buổi sinh hoạt Chi đoàn chủ điểm...',
  },
  {
    code: 'SDI',
    name: 'Chỉ số Phát triển cá nhân (Self-Development Index)',
    subTitle: 'Ý thức học tập, nâng cao trình độ chuyên môn và kỹ năng mềm.',
    description: 'Đánh giá tinh thần cầu tiến, tham gia tập huấn, chứng chỉ chuyên môn và phong cách công tác cán bộ.',
    weight: 15,
    explanationPlaceholder: 'VD: Đã hoàn thành chứng chỉ Kỹ năng Lãnh đạo Cán bộ Trẻ do Trường Đại học CNTT cấp...',
  },
];

// Thang phân loại xếp loại theo BRD
const getClassification = (score: number) => {
  if (score >= 90) return { label: 'Xuất sắc', style: 'bg-emerald-500 text-white' };
  if (score >= 80) return { label: 'Tốt', style: 'bg-blue-600 text-white' };
  if (score >= 65) return { label: 'Đạt', style: 'bg-amber-500 text-white' };
  if (score >= 50) return { label: 'Cần hỗ trợ', style: 'bg-orange-500 text-white' };
  return { label: 'Chưa đạt', style: 'bg-rose-600 text-white' };
};

export default function SelfAssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRevisionMode = searchParams.get('mode') === 'revision';

  const [loading, setLoading] = useState(true);
  const [cycleName, setCycleName] = useState('Quý II/2026');
  const [evaluationId, setEvaluationId] = useState('eval_current');
  const [revisionReason, setRevisionReason] = useState<string | null>(null);

  // State lưu điểm (0-100) và nội dung giải trình của 4 chỉ số
  const [scores, setScores] = useState<Record<string, number | ''>>({
    WPI: 94,
    LEI: 92,
    CEI: 91,
    SDI: 93,
  });

  const [explanations, setExplanations] = useState<Record<string, string>>({
    WPI: 'Đã hoàn thành 100% công việc trong quý đúng thời hạn. Có 1 nhiệm vụ vượt chỉ tiêu học viên.',
    LEI: 'Phối hợp nhịp nhàng với các Bí thư Chi đoàn bạn. Lãnh đạo Ban Tổ chức hoạt động chu đáo.',
    CEI: 'Tham gia đầy đủ 100% các cuộc họp giao ban BTV và các buổi sinh hoạt Chi đoàn chủ điểm.',
    SDI: 'Đã hoàn thành chứng chỉ Kỹ năng Lãnh đạo Cán bộ Trẻ do Trường Đại học CNTT cấp.',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clpi/self-assessment/current`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          if (data.cycleName) setCycleName(data.cycleName);
          if (data.evaluationId) setEvaluationId(data.evaluationId);
          if (data.scores) setScores(data.scores);
          if (data.explanations) setExplanations(data.explanations);
          if (data.revisionReason) setRevisionReason(data.revisionReason);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingData();
  }, []);

  // Tính tổng điểm CLPI dự kiến theo trọng số realtime
  const calculatedClpi = useMemo(() => {
    let total = 0;
    INDICATORS.forEach((ind) => {
      const s = typeof scores[ind.code] === 'number' ? (scores[ind.code] as number) : 0;
      total += (s * ind.weight) / 100;
    });
    return Math.round(total * 10) / 10;
  }, [scores]);

  const classification = getClassification(calculatedClpi);

  const handleScoreChange = (code: string, valStr: string) => {
    if (valStr === '') {
      setScores((prev) => ({ ...prev, [code]: '' }));
      return;
    }
    const val = parseInt(valStr, 10);
    if (!isNaN(val)) {
      const clamped = Math.max(0, Math.min(100, val));
      setScores((prev) => ({ ...prev, [code]: clamped }));
    }
  };

  const handleExplanationChange = (code: string, text: string) => {
    setExplanations((prev) => ({ ...prev, [code]: text }));
    if (validationErrors[code]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[code];
        return next;
      });
    }
  };

  // Kiểm tra tính hợp lệ trước khi nộp
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    INDICATORS.forEach((ind) => {
      const s = scores[ind.code];
      const exp = (explanations[ind.code] || '').trim();

      if (s === '' || typeof s !== 'number' || s < 0 || s > 100) {
        errors[`${ind.code}_score`] = `Vui lòng nhập điểm tự chấm hợp lệ (0-100) cho ${ind.code}!`;
      }

      if (!exp || exp.length < 20) {
        errors[ind.code] = `Vui lòng nhập nội dung giải thích cho ${ind.code} (tối thiểu 20 ký tự)!`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmModal(true);
    } else {
      showToast('Vui lòng kiểm tra lại điểm và nội dung giải trình các chỉ số!', 'error');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const payload = {
        scores,
        explanations,
        calculatedClpi,
        isRevision: isRevisionMode,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clpi/self-assessment/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast('Nộp hồ sơ tự đánh giá CLPI thành công!', 'success');
        setTimeout(() => {
          router.push(`/clpi-models/evaluations/${evaluationId}`);
        }, 1200);
      } else {
        const err = await res.json();
        showToast(err.message || 'Nộp hồ sơ thất bại!', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ!', 'error');
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center bg-white rounded-3xl border border-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28 text-slate-800 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[160] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold text-white animate-in slide-in-from-top-4 ${
          toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Cảnh báo BTV yêu cầu bổ sung nếu đang ở Revision Mode */}
      {isRevisionMode && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-3xl text-xs font-bold text-amber-900 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="uppercase tracking-wider">Hồ sơ cần bổ sung theo yêu cầu của Ban Thường vụ:</p>
            <p className="font-normal text-amber-800">
              {revisionReason || 'Vui lòng bổ sung minh chứng và giải trình rõ hơn kết quả các chỉ số chưa đạt.'}
            </p>
          </div>
        </div>
      )}

      {/* 1. Tiêu đề trang & Thẻ Dự kiến tổng điểm góc trên phải */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Tự đánh giá CLPI – {cycleName}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Nhập điểm tự chấm và đính kèm giải trình cho 4 bộ chỉ số năng lực.
          </p>
        </div>

        {/* Numeric Summary Card */}
        <div className="p-3.5 px-6 bg-white border border-blue-200 rounded-2xl shadow-xs text-center shrink-0 self-start sm:self-auto">
          <p className="text-[10px] font-extrabold uppercase text-slate-400">Dự kiến tổng điểm CLPI</p>
          <div className="text-2xl font-black text-[#0054a5]">
            {calculatedClpi.toFixed(1)} <span className="text-xs font-semibold text-slate-400">/ 100</span>
          </div>
        </div>
      </div>

      {/* 2. Danh sách 4 Khối Chỉ số (WPI, LEI, CEI, SDI) */}
      <form onSubmit={handleOpenConfirm} className="space-y-5">
        {INDICATORS.map((ind) => {
          const scoreVal = scores[ind.code];
          const expVal = explanations[ind.code] || '';
          const hasScoreError = Boolean(validationErrors[`${ind.code}_score`]);
          const hasExpError = Boolean(validationErrors[ind.code]);

          return (
            <div
              key={ind.code}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-7 space-y-4 hover:border-[#0054a5]/30 transition-all"
            >
              {/* Header Khối: Mã chỉ số, Tên, Mô tả & Trọng số */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-blue-50 text-[#0054a5] border border-blue-200 font-mono">
                      {ind.code}
                    </span>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                      {ind.name}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {ind.subTitle}
                  </p>
                </div>

                <span className="text-xs font-extrabold text-slate-500 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200 shrink-0">
                  Trọng số: {ind.weight}%
                </span>
              </div>

              {/* Vùng nhập Giải thích & Điểm tự chấm */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-1">
                {/* Cột trái (8 cols): Textarea Giải thích */}
                <div className="md:col-span-8 space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500 flex items-center justify-between">
                    <span>Giải thích kết quả tự đánh giá {ind.code}: *</span>
                    <span className="text-[10px] text-slate-400 font-normal">{expVal.length} / 2000 ký tự</span>
                  </label>
                  <textarea
                    rows={4}
                    value={expVal}
                    onChange={(e) => handleExplanationChange(ind.code, e.target.value)}
                    placeholder={ind.explanationPlaceholder}
                    className={`w-full p-4 bg-slate-50/80 border rounded-2xl text-xs sm:text-sm font-medium outline-none focus:bg-white resize-none leading-relaxed transition-all ${
                      hasExpError
                        ? 'border-rose-400 focus:border-rose-500'
                        : 'border-slate-200 focus:border-[#0054a5]'
                    }`}
                  />
                  {hasExpError && (
                    <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                      <AlertCircle size={13} /> {validationErrors[ind.code]}
                    </p>
                  )}
                </div>

                {/* Cột phải (4 cols): Numeric Input Điểm tự chấm (0-100) */}
                <div className="md:col-span-4 p-4 bg-slate-50/60 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center text-center space-y-2">
                  <span className="text-[11px] font-bold uppercase text-slate-500">
                    Điểm tự chấm (0-100)
                  </span>

                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={scoreVal}
                    onChange={(e) => handleScoreChange(ind.code, e.target.value)}
                    className={`w-28 text-center py-2.5 bg-white border rounded-2xl text-2xl font-black text-[#0054a5] outline-none shadow-xs transition-all ${
                      hasScoreError
                        ? 'border-rose-400 focus:border-rose-500'
                        : 'border-blue-200 focus:border-[#0054a5]'
                    }`}
                  />

                  {hasScoreError && (
                    <p className="text-[10px] font-bold text-rose-600">
                      {validationErrors[`${ind.code}_score`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* 3. Thanh tổng kết dưới cùng cố định (Bottom Summary Panel) */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 text-white border-t border-slate-800 shadow-2xl p-4 sm:px-8">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs text-slate-400 font-semibold">Dự kiến CLPI tự đánh giá:</span>
                <span className="text-xl font-black text-white">{calculatedClpi.toFixed(1)} điểm</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${classification.style}`}>
                  {classification.label}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                * Đây là điểm tự chấm, kết quả chính thức do BTV Đoàn Khoa phê duyệt.
              </p>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 bg-[#1d92ff] hover:bg-[#0054a5] text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <Send size={15} />
              <span>{isRevisionMode ? 'Nộp lại hồ sơ tự đánh giá' : 'Nộp hồ sơ tự đánh giá'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Modal xác nhận nộp hồ sơ */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0054a5] flex items-center justify-center mx-auto">
              <Award size={24} />
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-base text-slate-900">Xác nhận nộp hồ sơ tự đánh giá?</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Sau khi nộp hồ sơ, bạn sẽ không thể chỉnh sửa cho đến khi BTV yêu cầu bổ sung. Bạn có chắc chắn muốn nộp?
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-[#0054a5] flex justify-around">
              <span>WPI: {scores.WPI}</span>
              <span>LEI: {scores.LEI}</span>
              <span>CEI: {scores.CEI}</span>
              <span>SDI: {scores.SDI}</span>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold border-none cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider border-none cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                <span>Xác nhận nộp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
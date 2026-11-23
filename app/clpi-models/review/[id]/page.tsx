'use client';

import { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Link as LinkIcon,
  User,
  Send,
  Check,
  ExternalLink,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

interface EvidenceReviewItem {
  id: string;
  fileName: string;
  fileSize?: string;
  type: 'file' | 'url';
  url?: string;
  reviewerNote?: string;
}

interface AssessmentDetail {
  id: string;
  fullName: string;
  positionName: string;
  unitBranch: string;
  avatarUrl?: string;
  cycleName: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'NEEDS_REVISION' | 'RESUBMITTED' | 'APPROVED' | 'FINALIZED';
  selfScores: {
    WPI: number;
    LEI: number;
    CEI: number;
    SDI: number;
  };
  reviewerScores?: {
    WPI: number;
    LEI: number;
    CEI: number;
    SDI: number;
  };
  reviewerComment?: string;
  evidences: EvidenceReviewItem[];
}

const getClassification = (score: number) => {
  if (score >= 90) return { label: 'Xuất sắc', style: 'bg-emerald-500 text-white' };
  if (score >= 80) return { label: 'Tốt', style: 'bg-blue-600 text-white' };
  if (score >= 65) return { label: 'Đạt', style: 'bg-amber-500 text-white' };
  if (score >= 50) return { label: 'Cần hỗ trợ', style: 'bg-orange-500 text-white' };
  return { label: 'Chưa đạt', style: 'bg-rose-600 text-white' };
};

export default function ReviewEvaluationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const evaluationId = resolvedParams.id;
  const router = useRouter();

  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [weights, setWeights] = useState({ WPI: 40, LEI: 25, CEI: 20, SDI: 15 });
  const [loading, setLoading] = useState(true);

  const [reviewerScores, setReviewerScores] = useState<Record<string, number | ''>>({
    WPI: '',
    LEI: '',
    CEI: '',
    SDI: '',
  });
  const [reviewerComment, setReviewerComment] = useState('');

  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const [revisionDeadline, setRevisionDeadline] = useState('');
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getHeaders = () => {
    const token = localStorage.getItem('token') || '';
    let userId = '';
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        const u = parsed.user || parsed;
        userId = String(u._id || u.id || u.user_id || '').trim();
      }
    } catch {}
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (userId) headers['x-user-id'] = userId;
    return headers;
  };

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
        const headers = getHeaders();

        const [res, indRes] = await Promise.all([
          fetch(`${apiUrl}/clpi/review/${evaluationId}`, { headers }),
          fetch(`${apiUrl}/clpi/indicators`, { headers }).catch(() => null),
        ]);

        if (indRes && indRes.ok) {
          const indData = await indRes.json();
          if (indData?.weights) setWeights(indData.weights);
        }

        if (res.ok) {
          const data = await res.json();
          const self = {
            WPI: Number(data.selfScores?.WPI ?? data.wpiScore ?? 0),
            LEI: Number(data.selfScores?.LEI ?? data.leiScore ?? 0),
            CEI: Number(data.selfScores?.CEI ?? data.ceiScore ?? 0),
            SDI: Number(data.selfScores?.SDI ?? data.sdiScore ?? 0),
          };

          setAssessment({
            id: String(data.id || data._id || evaluationId),
            fullName: data.fullName || '',
            positionName: data.positionName || '',
            unitBranch: data.unitBranch || data.unitName || '',
            avatarUrl: data.avatarUrl || '',
            cycleName: data.cycleName || '',
            status: data.status || 'SUBMITTED',
            selfScores: self,
            reviewerScores: data.reviewerScores,
            reviewerComment: data.reviewerComment || '',
            evidences: Array.isArray(data.evidences) ? data.evidences : [],
          });

          const initialScores = data.reviewerScores || data.draftReviewerScores || self;
          setReviewerScores({
            WPI: initialScores.WPI ?? self.WPI,
            LEI: initialScores.LEI ?? self.LEI,
            CEI: initialScores.CEI ?? self.CEI,
            SDI: initialScores.SDI ?? self.SDI,
          });
          setReviewerComment(data.reviewerComment || '');
        } else {
          setAssessment(null);
        }
      } catch {
        setAssessment(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [evaluationId]);

  const calculatedReviewerClpi = useMemo(() => {
    const wpi = typeof reviewerScores.WPI === 'number' ? reviewerScores.WPI : 0;
    const lei = typeof reviewerScores.LEI === 'number' ? reviewerScores.LEI : 0;
    const cei = typeof reviewerScores.CEI === 'number' ? reviewerScores.CEI : 0;
    const sdi = typeof reviewerScores.SDI === 'number' ? reviewerScores.SDI : 0;

    const total =
      (wpi * weights.WPI + lei * weights.LEI + cei * weights.CEI + sdi * weights.SDI) / 100;

    return Math.round(total * 10) / 10;
  }, [reviewerScores, weights]);

  const classification = getClassification(calculatedReviewerClpi);

  const getDifference = (code: 'WPI' | 'LEI' | 'CEI' | 'SDI') => {
    if (!assessment) return 0;
    const selfVal = assessment.selfScores[code] || 0;
    const revVal = typeof reviewerScores[code] === 'number' ? (reviewerScores[code] as number) : 0;
    return revVal - selfVal;
  };

  const handleScoreChange = (code: string, valStr: string) => {
    if (valStr === '') {
      setReviewerScores((prev) => ({ ...prev, [code]: '' }));
      return;
    }
    const val = parseInt(valStr, 10);
    if (!isNaN(val)) {
      setReviewerScores((prev) => ({ ...prev, [code]: Math.max(0, Math.min(100, val)) }));
    }
  };

  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionReason.trim()) {
      showToast('Vui lòng nhập lý do yêu cầu bổ sung!', 'error');
      return;
    }

    setIsSubmittingRevision(true);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const res = await fetch(`${apiUrl}/clpi/review/${evaluationId}/request-revision`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          reason: revisionReason.trim(),
          dueDate: revisionDeadline,
          draftScores: reviewerScores,
        }),
      });

      if (res.ok) {
        showToast('Đã gửi yêu cầu bổ sung hồ sơ cho cán bộ thành công!', 'success');
        setIsRevisionModalOpen(false);
        setTimeout(() => {
          router.push('/clpi-models/review');
        }, 1200);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Gửi yêu cầu bổ sung thất bại!', 'error');
      }
    } catch {
      showToast('Lỗi kết nối máy chủ!', 'error');
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  const handleConfirmApprove = async () => {
    const hasEmptyScore = Object.values(reviewerScores).some((v) => v === '' || typeof v !== 'number');
    if (hasEmptyScore) {
      showToast('Vui lòng nhập đầy đủ điểm thẩm định cho cả 4 chỉ số!', 'error');
      setIsApproveModalOpen(false);
      return;
    }

    const hasDifference = ['WPI', 'LEI', 'CEI', 'SDI'].some(
      (code) => getDifference(code as 'WPI' | 'LEI' | 'CEI' | 'SDI') !== 0
    );
    if (hasDifference && (!reviewerComment.trim() || reviewerComment.trim().length < 20)) {
      showToast(
        'Có chênh lệch điểm so với tự chấm, vui lòng ghi rõ lý do điều chỉnh (tối thiểu 20 ký tự)!',
        'error'
      );
      setIsApproveModalOpen(false);
      return;
    }

    setIsApproving(true);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const res = await fetch(`${apiUrl}/clpi/review/${evaluationId}/approve`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          scores: reviewerScores,
          finalScore: calculatedReviewerClpi,
          comment: reviewerComment.trim(),
          classification: classification.label,
        }),
      });

      if (res.ok) {
        showToast('Đã phê duyệt kết quả CLPI chính thức thành công!', 'success');
        setIsApproveModalOpen(false);
        setTimeout(() => {
          router.push('/clpi-models/review');
        }, 1200);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Phê duyệt kết quả thất bại!', 'error');
      }
    } catch {
      showToast('Lỗi kết nối máy chủ!', 'error');
    } finally {
      setIsApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center bg-white rounded-3xl border border-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="max-w-3xl mx-auto p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <AlertCircle size={32} className="text-slate-400 mx-auto" />
        <h2 className="text-lg font-black text-slate-800">Không tìm thấy hồ sơ cần thẩm định</h2>
        <Link
          href="/clpi-models/review"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0054a5] text-white text-xs font-bold rounded-2xl no-underline"
        >
          <ArrowLeft size={14} /> Quay lại hàng đợi thẩm định
        </Link>
      </div>
    );
  }

  const isApprovedAlready = assessment.status === 'APPROVED' || assessment.status === 'FINALIZED';

  return (
    <div className="space-y-6 pb-16 text-slate-800 animate-in fade-in duration-200">
      {toastMessage && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[160] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold text-white animate-in slide-in-from-top-4 ${
            toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Link
              href="/clpi-models/review"
              className="text-slate-500 hover:text-[#0054a5] flex items-center gap-1 no-underline"
            >
              <ArrowLeft size={13} /> Quay lại hàng đợi
            </Link>
            <span>/</span>
            <span className="text-slate-700">Thẩm định hồ sơ cán bộ {assessment.fullName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            So sánh Tự chấm & Đánh giá của Reviewer
          </h1>
        </div>

        {!isApprovedAlready ? (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setIsRevisionModalOpen(true)}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-2xl text-xs uppercase tracking-wider border border-amber-200 transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw size={15} /> Yêu cầu bổ sung
            </button>

            <button
              type="button"
              onClick={() => setIsApproveModalOpen(true)}
              className="flex items-center gap-1.5 px-5 sm:px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 transition-all border-none cursor-pointer active:scale-95"
            >
              <Check size={16} /> Phê duyệt kết quả
            </button>
          </div>
        ) : (
          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck size={16} /> Hồ sơ đã được phê duyệt chính thức
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-[#0054a5] flex items-center justify-center font-black text-xl text-[#0054a5] shrink-0 overflow-hidden">
              {assessment.avatarUrl ? (
                <img src={assessment.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={26} />
              )}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{assessment.fullName}</h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {assessment.positionName} {assessment.unitBranch ? `• ${assessment.unitBranch}` : ''}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              ĐIỂM TỰ CHẤM CỦA CÁN BỘ
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400">WPI</span>
                <p className="text-xl font-black text-[#0054a5]">{assessment.selfScores.WPI.toFixed(1)}</p>
              </div>

              <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400">LEI</span>
                <p className="text-xl font-black text-emerald-700">{assessment.selfScores.LEI.toFixed(1)}</p>
              </div>

              <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-100 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400">CEI</span>
                <p className="text-xl font-black text-amber-700">{assessment.selfScores.CEI.toFixed(1)}</p>
              </div>

              <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400">SDI</span>
                <p className="text-xl font-black text-purple-700">{assessment.selfScores.SDI.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              MINH CHỨNG VÀ BÁO CÁO
            </h3>

            <div className="space-y-3">
              {assessment.evidences.map((evi, index) => (
                <div
                  key={evi.id}
                  className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-bold text-slate-400">{index + 1}.</span>
                      <div className="text-slate-600 shrink-0">
                        {evi.type === 'file' ? <FileText size={16} /> : <LinkIcon size={16} />}
                      </div>
                      {evi.type === 'url' ? (
                        <a
                          href={evi.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[#0054a5] hover:underline truncate block"
                        >
                          {evi.fileName}
                        </a>
                      ) : (
                        <span className="text-xs font-bold text-slate-800 truncate block">
                          {evi.fileName}
                        </span>
                      )}
                    </div>

                    {evi.type === 'url' ? (
                      <a
                        href={evi.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-[#0054a5] rounded-lg transition-colors"
                        title="Mở liên kết"
                      >
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">{evi.fileSize}</span>
                    )}
                  </div>

                  {evi.reviewerNote && (
                    <p className="text-[11px] text-slate-500 font-medium pl-6 italic">
                      {evi.reviewerNote}
                    </p>
                  )}
                </div>
              ))}

              {assessment.evidences.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400 italic">
                  Không có minh chứng nào được đính kèm.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
          <h3 className="text-xs font-black uppercase text-[#0054a5] tracking-wider">
            BẢNG ĐÁNH GIÁ CỦA REVIEWER
          </h3>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">WPI - Hoàn thành NV ({weights.WPI}%)</span>
              <span className="text-slate-400 text-[11px]">Tự chấm: {assessment.selfScores.WPI}</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={100}
                disabled={isApprovedAlready}
                value={reviewerScores.WPI}
                onChange={(e) => handleScoreChange('WPI', e.target.value)}
                className="w-24 p-2.5 text-center bg-slate-50 border border-slate-300 rounded-xl text-lg font-black text-slate-900 outline-none focus:border-[#0054a5] focus:bg-white transition-all disabled:bg-slate-100"
              />
              {getDifference('WPI') !== 0 && (
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                    getDifference('WPI') > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {getDifference('WPI') > 0 ? `+${getDifference('WPI')}` : getDifference('WPI')}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">LEI - Điều hành ({weights.LEI}%)</span>
              <span className="text-slate-400 text-[11px]">Tự chấm: {assessment.selfScores.LEI}</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={100}
                disabled={isApprovedAlready}
                value={reviewerScores.LEI}
                onChange={(e) => handleScoreChange('LEI', e.target.value)}
                className="w-24 p-2.5 text-center bg-slate-50 border border-slate-300 rounded-xl text-lg font-black text-slate-900 outline-none focus:border-[#0054a5] focus:bg-white transition-all disabled:bg-slate-100"
              />
              {getDifference('LEI') !== 0 && (
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                    getDifference('LEI') > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {getDifference('LEI') > 0 ? `+${getDifference('LEI')}` : getDifference('LEI')}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-700 truncate">CEI ({weights.CEI}%)</span>
                <span className="text-slate-400">TC: {assessment.selfScores.CEI}</span>
              </div>
              <input
                type="number"
                min={0}
                max={100}
                disabled={isApprovedAlready}
                value={reviewerScores.CEI}
                onChange={(e) => handleScoreChange('CEI', e.target.value)}
                className="w-full p-2.5 text-center bg-slate-50 border border-slate-300 rounded-xl text-lg font-black text-slate-900 outline-none focus:border-[#0054a5] focus:bg-white transition-all disabled:bg-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-700 truncate">SDI ({weights.SDI}%)</span>
                <span className="text-slate-400">TC: {assessment.selfScores.SDI}</span>
              </div>
              <input
                type="number"
                min={0}
                max={100}
                disabled={isApprovedAlready}
                value={reviewerScores.SDI}
                onChange={(e) => handleScoreChange('SDI', e.target.value)}
                className="w-full p-2.5 text-center bg-slate-50 border border-slate-300 rounded-xl text-lg font-black text-slate-900 outline-none focus:border-[#0054a5] focus:bg-white transition-all disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-[11px] font-bold uppercase text-slate-500 block">
              Nhận xét & Lý do điều chỉnh điểm:
            </label>
            <textarea
              rows={4}
              disabled={isApprovedAlready}
              value={reviewerComment}
              onChange={(e) => setReviewerComment(e.target.value)}
              placeholder="Ghi rõ lý do tăng/giảm điểm so với tự chấm và nhận xét ưu điểm, hướng phát triển..."
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium outline-none focus:border-[#0054a5] focus:bg-white resize-none leading-relaxed transition-all disabled:bg-slate-100"
            />
          </div>

          <div className="bg-[#0b1e36] text-white rounded-3xl p-5 text-center space-y-2 shadow-lg">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-200">
              KẾT QUẢ CLPI CHÍNH THỨC DỰ KIẾN
            </span>
            <div className="text-4xl font-black text-white">
              {calculatedReviewerClpi.toFixed(1)}
            </div>
            <div>
              <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-black ${classification.style}`}>
                {classification.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-slate-800">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-100 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">Yêu cầu bổ sung hồ sơ</h3>
              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full border-none bg-transparent cursor-pointer text-slate-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRevision} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Lý do yêu cầu bổ sung: *
                </label>
                <textarea
                  rows={4}
                  required
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  placeholder="Nhập nội dung minh chứng hoặc giải trình cần cán bộ bổ sung..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium outline-none focus:border-[#0054a5] focus:bg-white resize-none leading-relaxed transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Hạn hoàn thành bổ sung: *
                </label>
                <input
                  type="date"
                  required
                  value={revisionDeadline}
                  onChange={(e) => setRevisionDeadline(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-[#0054a5] focus:bg-white cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold border-none cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRevision}
                  className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider border-none cursor-pointer shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingRevision ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  <span>Gửi yêu cầu →</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isApproveModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-slate-800">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={26} />
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-base text-slate-900">Xác nhận phê duyệt kết quả CLPI?</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Sau khi phê duyệt, kết quả sẽ được khóa và sử dụng làm kết quả CLPI chính thức của cán bộ trong chu kỳ này.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span>Điểm CLPI chính thức dự kiến:</span>
                <span className="text-emerald-700 text-sm font-black">
                  {calculatedReviewerClpi.toFixed(1)} ({classification.label})
                </span>
              </div>
              <div className="grid grid-cols-4 text-center text-[11px] pt-1 text-slate-500">
                <div>WPI: {reviewerScores.WPI}</div>
                <div>LEI: {reviewerScores.LEI}</div>
                <div>CEI: {reviewerScores.CEI}</div>
                <div>SDI: {reviewerScores.SDI}</div>
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold border-none cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isApproving}
                onClick={handleConfirmApprove}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider border-none cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
              >
                {isApproving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                <span>Xác nhận duyệt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
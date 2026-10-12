'use client';

import { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, RotateCcw, CheckCircle2, AlertCircle, 
  FileText, Link as LinkIcon, User, Send, Check, 
  Calendar, ExternalLink, Download, Loader2, ShieldCheck
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
  evidences: EvidenceReviewItem[];
}

const INDICATOR_WEIGHTS = {
  WPI: 40,
  LEI: 25,
  CEI: 20,
  SDI: 15,
};

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
  const [loading, setLoading] = useState(true);

  // Điểm Reviewer chấm (mặc định lấy điểm đã lưu hoặc khởi tạo)
  const [reviewerScores, setReviewerScores] = useState<Record<string, number | ''>>({
    WPI: 90,
    LEI: 90,
    CEI: 89,
    SDI: 90,
  });

  const [reviewerComment, setReviewerComment] = useState(
    'Cán bộ có tinh thần trách nhiệm tốt, tuy nhiên một số minh chứng chuyên môn cần điều chỉnh lại sĩ số tham gia cho khớp với báo cáo.'
  );

  // Modal Yêu cầu bổ sung
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionReason, setRevisionReason] = useState('Minh chứng hoạt động GamApp chưa có xác nhận sĩ số hội viên.');
  const [revisionDeadline, setRevisionDeadline] = useState('2026-08-25');
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);

  // Modal Phê duyệt kết quả
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Mock dữ liệu chuẩn xác theo mockup màn hình 9 của BRD
  const mockAssessmentData: AssessmentDetail = {
    id: evaluationId || 'eval_01',
    fullName: 'Nguyễn Văn A',
    positionName: 'Bí thư Chi đoàn',
    unitBranch: 'KTPM2025.1',
    cycleName: 'Quý II/2026',
    status: 'SUBMITTED',
    selfScores: {
      WPI: 94.0,
      LEI: 92.0,
      CEI: 91.0,
      SDI: 93.0,
    },
    evidences: [
      {
        id: 'evi_01',
        fileName: 'Kế_hoạch_Tập_huấn_GamApp_2026.pdf',
        fileSize: '2.4 MB',
        type: 'file',
        reviewerNote: 'Thẩm định: Minh chứng đầy đủ, có xác nhận của Cố vấn học tập.',
      },
      {
        id: 'evi_02',
        fileName: 'https://drive.google.com/folderview?id=gamapp_2026_uit',
        type: 'url',
        url: 'https://drive.google.com/folderview?id=gamapp_2026_uit',
        reviewerNote: 'Thẩm định: Thư mục chứa tài liệu bài giảng và danh sách điểm danh 3 buổi.',
      },
    ],
  };

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clpi/review/${evaluationId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          setAssessment(data);
          if (data.reviewerScores) setReviewerScores(data.reviewerScores);
          if (data.reviewerComment) setReviewerComment(data.reviewerComment);
        } else {
          setAssessment(mockAssessmentData);
        }
      } catch (e) {
        setAssessment(mockAssessmentData);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [evaluationId]);

  // Tính tổng điểm Reviewer CLPI dự kiến theo trọng số realtime
  const calculatedReviewerClpi = useMemo(() => {
    const wpi = typeof reviewerScores.WPI === 'number' ? reviewerScores.WPI : 0;
    const lei = typeof reviewerScores.LEI === 'number' ? reviewerScores.LEI : 0;
    const cei = typeof reviewerScores.CEI === 'number' ? reviewerScores.CEI : 0;
    const sdi = typeof reviewerScores.SDI === 'number' ? reviewerScores.SDI : 0;

    const total = 
      (wpi * INDICATOR_WEIGHTS.WPI +
       lei * INDICATOR_WEIGHTS.LEI +
       cei * INDICATOR_WEIGHTS.CEI +
       sdi * INDICATOR_WEIGHTS.SDI) / 100;

    return Math.round(total * 10) / 10;
  }, [reviewerScores]);

  const classification = getClassification(calculatedReviewerClpi);

  // Tính độ lệch chênh lệch điểm (Reviewer Score - Self Score)
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

  // Xử lý gửi Yêu cầu bổ sung hồ sơ
  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionReason.trim()) {
      showToast('Vui lòng nhập lý do yêu cầu bổ sung!', 'error');
      return;
    }

    setIsSubmittingRevision(true);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clpi/review/${evaluationId}/request-revision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
        const err = await res.json();
        showToast(err.message || 'Gửi yêu cầu bổ sung thất bại!', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ!', 'error');
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  // Xử lý Phê duyệt kết quả chính thức
  const handleConfirmApprove = async () => {
    // Kiểm tra đủ điểm 4 nhóm chỉ số
    const hasEmptyScore = Object.values(reviewerScores).some((v) => v === '' || typeof v !== 'number');
    if (hasEmptyScore) {
      showToast('Vui lòng nhập đầy đủ điểm thẩm định cho cả 4 chỉ số!', 'error');
      setIsApproveModalOpen(false);
      return;
    }

    // Kiểm tra bắt buộc có nhận xét khi có chênh lệch điểm
    const hasDifference = ['WPI', 'LEI', 'CEI', 'SDI'].some(
      (code) => getDifference(code as any) !== 0
    );
    if (hasDifference && (!reviewerComment.trim() || reviewerComment.trim().length < 20)) {
      showToast('Có chênh lệch điểm so với tự chấm, vui lòng ghi rõ lý do điều chỉnh (tối thiểu 20 ký tự)!', 'error');
      setIsApproveModalOpen(false);
      return;
    }

    setIsApproving(true);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clpi/review/${evaluationId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
        const err = await res.json();
        showToast(err.message || 'Phê duyệt kết quả thất bại!', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ!', 'error');
    } finally {
      setIsApproving(false);
    }
  };

  if (loading || !assessment) {
    return (
      <div className="flex h-72 items-center justify-center bg-white rounded-3xl border border-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
      </div>
    );
  }

  const isApprovedAlready = assessment.status === 'APPROVED' || assessment.status === 'FINALIZED';

  return (
    <div className="space-y-6 pb-16 text-slate-800 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[160] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold text-white animate-in slide-in-from-top-4 ${
          toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. Header: Breadcrumb điều hướng & 2 Nút hành động chính */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Link href="/clpi-models/review" className="text-slate-500 hover:text-[#0054a5] flex items-center gap-1 no-underline">
              <ArrowLeft size={13} /> Quay lại hàng đợi
            </Link>
            <span>/</span>
            <span className="text-slate-700">Thẩm định hồ sơ cán bộ {assessment.fullName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            So sánh Tự chấm & Đánh giá của Reviewer
          </h1>
        </div>

        {/* 2 Nút: Yêu cầu bổ sung & Phê duyệt kết quả */}
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

      {/* 2. Bố cục 2 Cột: Đối chiếu hồ sơ (Trái - 7 cols) & Bảng đánh giá của Reviewer (Phải - 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI (7 cols): Thông tin cán bộ, Điểm tự chấm & Minh chứng */}
        <div className="lg:col-span-7 space-y-6">
          {/* Thông tin cán bộ */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-[#0054a5] flex items-center justify-center font-black text-xl text-[#0054a5] shrink-0">
              <User size={26} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{assessment.fullName}</h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {assessment.positionName} {assessment.unitBranch ? `• ${assessment.unitBranch}` : ''}
              </p>
            </div>
          </div>

          {/* ĐIỂM TỰ CHẤM CỦA CÁN BỘ (Read-only) */}
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

          {/* MINH CHỨNG VÀ BÁO CÁO */}
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

        {/* CỘT PHẢI (5 cols): BẢNG ĐÁNH GIÁ CỦA REVIEWER */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
          <h3 className="text-xs font-black uppercase text-[#0054a5] tracking-wider">
            BẢNG ĐÁNH GIÁ CỦA REVIEWER
          </h3>

          {/* 1. WPI Reviewer (40%) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">WPI - Hoàn thành NV (40%)</span>
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
                <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                  getDifference('WPI') > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {getDifference('WPI') > 0 ? `+${getDifference('WPI')}` : getDifference('WPI')}
                </span>
              )}
            </div>
          </div>

          {/* 2. LEI Reviewer (25%) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">LEI - Điều hành (25%)</span>
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
                <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                  getDifference('LEI') > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {getDifference('LEI') > 0 ? `+${getDifference('LEI')}` : getDifference('LEI')}
                </span>
              )}
            </div>
          </div>

          {/* 3 & 4. CEI Reviewer & SDI Reviewer (Grid 2 cột) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 block truncate">CEI Reviewer</span>
              <div className="flex items-center gap-2">
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
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 block truncate">SDI Reviewer</span>
              <div className="flex items-center gap-2">
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
          </div>

          {/* Nhận xét & Lý do điều chỉnh điểm */}
          <div className="space-y-1.5 pt-2">
            <label className="text-[11px] font-bold uppercase text-slate-500 block">
              Nhận xét & Lý do điều chỉnh điểm:
            </label>
            <textarea
              rows={4}
              disabled={isApprovedAlready}
              value={reviewerComment}
              onChange={(e) => setReviewerComment(e.target.value)}
              placeholder="Ghi rõ lý do tăng/giảm điểm so với tự chấm..."
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium outline-none focus:border-[#0054a5] focus:bg-white resize-none leading-relaxed transition-all disabled:bg-slate-100"
            />
          </div>

          {/* Banner Tối: KẾT QUẢ CLPI CHÍNH THỨC DỰ KIẾN */}
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

      {/* MODAL 1: YÊU CẦU BỔ SUNG HỒ SƠ */}
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
                  placeholder="Minh chứng hoạt động GamApp chưa có xác nhận sĩ số hội viên."
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium outline-none focus:border-[#0054a5] focus:bg-white resize-none leading-relaxed transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Deadline hoàn thành bổ sung: *
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

      {/* MODAL 2: XÁC NHẬN PHÊ DUYỆT KẾT QUẢ */}
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

            {/* Bảng tóm tắt kết quả trước khi duyệt */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span>Điểm CLPI chính thức dự kiến:</span>
                <span className="text-emerald-700 text-sm font-black">{calculatedReviewerClpi.toFixed(1)} ({classification.label})</span>
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
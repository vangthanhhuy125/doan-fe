'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Download,
  CheckCircle2,
  AlertCircle,
  User,
  ArrowRight,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

interface TimelineStep {
  id: number;
  label: string;
  timeStr: string;
  status: 'completed' | 'current' | 'pending' | 'warning';
  subText?: string;
}

interface EvaluationRecord {
  id: string;
  cycleName: string;
  officerCode: string;
  fullName: string;
  positionName: string;
  unitName: string;
  avatarUrl?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'RESUBMITTED' | 'UNDER_REVIEW' | 'NEEDS_REVISION' | 'APPROVED' | 'FINALIZED';
  submittedAt: string;
  wpiScore: number;
  leiScore: number;
  ceiScore: number;
  sdiScore: number;
  totalSelfClpi: number;
  selfClassification: string;
  selfAssessmentText: string;
  difficultiesAndProposalText: string;
  revisionReason?: string;
  timeline: TimelineStep[];
}

const STATUS_BADGES: Record<string, { label: string; style: string }> = {
  DRAFT: { label: 'ĐANG SOẠN THẢO', style: 'bg-slate-100 text-slate-700 border-slate-200' },
  SUBMITTED: { label: 'ĐÃ NỘP HỒ SƠ', style: 'bg-blue-50 text-[#0054a5] border-blue-200' },
  RESUBMITTED: { label: 'ĐÃ NỘP LẠI HỒ SƠ', style: 'bg-blue-50 text-[#0054a5] border-blue-200' },
  UNDER_REVIEW: { label: 'BTV ĐANG THẨM ĐỊNH', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  NEEDS_REVISION: { label: 'CẦN BỔ SUNG HỒ SƠ', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  APPROVED: { label: 'ĐÃ PHÊ DUYỆT', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  FINALIZED: { label: 'HOÀN TẤT & CÔNG BỐ', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export default function SubmittedEvaluationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const evaluationId = resolvedParams.id;

  const [evaluation, setEvaluation] = useState<EvaluationRecord | null>(null);
  const [weights, setWeights] = useState({ WPI: 40, LEI: 25, CEI: 20, SDI: 15 });
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
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

        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (userId) headers['x-user-id'] = userId;

        const [res, indRes] = await Promise.all([
          fetch(`${apiUrl}/clpi/evaluations/${evaluationId}`, { headers }),
          fetch(`${apiUrl}/clpi/indicators`, { headers }).catch(() => null),
        ]);

        if (indRes && indRes.ok) {
          const indData = await indRes.json();
          if (indData?.weights) setWeights(indData.weights);
        }

        if (res.ok) {
          const data = await res.json();
          if (data?.weights) setWeights(data.weights);
          setEvaluation({
            id: String(data.id || data._id || evaluationId),
            cycleName: data.cycleName || '',
            officerCode: data.officerCode || '',
            fullName: data.fullName || '',
            positionName: data.positionName || '',
            unitName: data.unitName || data.unitBranch || '',
            avatarUrl: data.avatarUrl || '',
            status: data.status || 'SUBMITTED',
            submittedAt: data.submittedAt || '',
            wpiScore: Number(data.wpiScore ?? data.selfScores?.WPI ?? 0),
            leiScore: Number(data.leiScore ?? data.selfScores?.LEI ?? 0),
            ceiScore: Number(data.ceiScore ?? data.selfScores?.CEI ?? 0),
            sdiScore: Number(data.sdiScore ?? data.selfScores?.SDI ?? 0),
            totalSelfClpi: Number(data.totalSelfClpi || 0),
            selfClassification: data.selfClassification || '',
            selfAssessmentText: data.selfAssessmentText || '',
            difficultiesAndProposalText: data.difficultiesAndProposalText || '',
            revisionReason: data.revisionReason || '',
            timeline: Array.isArray(data.timeline) ? data.timeline : [],
          });
        } else {
          setEvaluation(null);
        }
      } catch {
        setEvaluation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [evaluationId]);

  const handleExportPdf = () => {
    setExportingPdf(true);
    setTimeout(() => {
      setExportingPdf(false);
      window.print();
    }, 300);
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center bg-white rounded-3xl border border-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="max-w-3xl mx-auto p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <AlertCircle size={28} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-800">Không tìm thấy hồ sơ đánh giá CLPI</h2>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Bạn chưa nộp hồ sơ tự đánh giá cho chu kỳ này hoặc mã hồ sơ không tồn tại.
          </p>
        </div>
        <Link
          href="/clpi-models/self-assessment"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0054a5] text-white text-xs font-bold rounded-2xl no-underline"
        >
          <ArrowLeft size={14} /> Đi tới Tự đánh giá CLPI
        </Link>
      </div>
    );
  }

  const badgeInfo = STATUS_BADGES[evaluation.status] || STATUS_BADGES.SUBMITTED;

  return (
    <div className="space-y-6 pb-16 text-slate-800 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Biểu mẫu Đánh giá CLPI {evaluation.cycleName}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Hồ sơ tự đánh giá đã được tiếp nhận và lưu trữ trên hệ thống CLPI.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportPdf}
          disabled={exportingPdf}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all border-none cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
        >
          {exportingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          <span>Xuất PDF</span>
        </button>
      </div>

      {evaluation.status === 'NEEDS_REVISION' && (
        <div className="p-5 bg-amber-50 border border-amber-300 rounded-3xl text-xs font-bold text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="uppercase tracking-wider">Hồ sơ cần bổ sung theo yêu cầu của Ban Thường vụ</p>
              <p className="font-normal text-amber-800">
                {evaluation.revisionReason || 'Vui lòng kiểm tra lại minh chứng và cập nhật lại hồ sơ.'}
              </p>
            </div>
          </div>
          <Link
            href="/clpi-models/self-assessment?mode=revision"
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all no-underline shrink-0 text-center"
          >
            Bổ sung hồ sơ →
          </Link>
        </div>
      )}

      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-[#0054a5] flex items-center justify-center font-black text-xl text-[#0054a5] shrink-0">
            {evaluation.avatarUrl ? (
              <img src={evaluation.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
              <User size={30} />
            )}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">{evaluation.fullName}</h2>
            <p className="text-xs text-slate-500 font-medium">
              {evaluation.positionName}
              {evaluation.officerCode && (
                <>
                  {' '}• Mã cán bộ: <strong className="text-slate-700">{evaluation.officerCode}</strong>
                </>
              )}
            </p>
            <p className="text-xs text-slate-400">Đơn vị: {evaluation.unitName}</p>
          </div>
        </div>

        <div className="text-right self-start md:self-auto space-y-1">
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-wider ${badgeInfo.style}`}>
            {badgeInfo.label}
          </span>
          {evaluation.submittedAt && (
            <p className="text-[11px] text-slate-400 font-semibold">
              Thời gian nộp: {evaluation.submittedAt}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
              TỔNG HỢP ĐIỂM TỰ CHẤM CLPI
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400">WPI ({weights.WPI}%)</span>
                <p className="text-2xl font-black text-[#0054a5]">{evaluation.wpiScore.toFixed(1)}</p>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400">LEI ({weights.LEI}%)</span>
                <p className="text-2xl font-black text-emerald-700">{evaluation.leiScore.toFixed(1)}</p>
              </div>

              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400">CEI ({weights.CEI}%)</span>
                <p className="text-2xl font-black text-amber-700">{evaluation.ceiScore.toFixed(1)}</p>
              </div>

              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400">SDI ({weights.SDI}%)</span>
                <p className="text-2xl font-black text-purple-700">{evaluation.sdiScore.toFixed(1)}</p>
              </div>
            </div>

            <div className="p-4 px-6 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-4 font-black">
              <span className="text-xs uppercase tracking-wider text-slate-300">
                Tổng điểm tự đánh giá quy đổi:
              </span>
              <span className="text-lg text-emerald-400">
                {evaluation.totalSelfClpi.toFixed(1)} / 100
                {evaluation.selfClassification ? ` (${evaluation.selfClassification})` : ''}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
              NỘI DUNG BIỂU MẪU ĐÃ NỘP
            </h3>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-2">
                <p className="font-extrabold text-slate-800">Tự đánh giá kết quả công tác:</p>
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                  {evaluation.selfAssessmentText || 'Chưa có nội dung báo cáo công tác tháng đính kèm.'}
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-extrabold text-slate-800">Khó khăn & Đề xuất:</p>
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                  {evaluation.difficultiesAndProposalText || 'Không có nội dung ghi nhận.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
          <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
            TIẾN TRÌNH XỬ LÝ HỒ SƠ
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {evaluation.timeline.map((step) => {
              const isCompleted = step.status === 'completed';
              const isCurrent = step.status === 'current';
              const isWarning = step.status === 'warning';

              return (
                <div key={step.id} className="relative space-y-1">
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isWarning
                        ? 'bg-amber-500 text-white'
                        : isCurrent
                        ? 'bg-[#0054a5] text-white'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={13} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>

                  <p
                    className={`text-xs font-extrabold leading-tight ${
                      isWarning ? 'text-amber-700' : isCurrent ? 'text-[#0054a5]' : 'text-slate-800'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {step.timeStr}
                  </p>
                </div>
              );
            })}
          </div>

          {['APPROVED', 'FINALIZED'].includes(evaluation.status) && (
            <Link
              href={`/clpi-models/evaluations/${evaluation.id}/result`}
              className="w-full py-3 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all no-underline block text-center shadow-md shadow-blue-500/20"
            >
              <span>Xem kết quả chính thức</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
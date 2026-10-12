'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  FileText, Download, CheckCircle2, Clock, 
  AlertCircle, ChevronRight, User, Shield, 
  ArrowRight, Loader2, Award
} from 'lucide-react';

interface TimelineStep {
  id: number;
  label: string;
  timeStr: string;
  status: 'completed' | 'current' | 'pending';
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
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'NEEDS_REVISION' | 'APPROVED' | 'FINALIZED';
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

export default function SubmittedEvaluationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const evaluationId = resolvedParams.id;

  const [evaluation, setEvaluation] = useState<EvaluationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Mock dữ liệu chuẩn hóa theo mockup BRD
  const mockEvaluation: EvaluationRecord = {
    id: evaluationId || 'eval_current',
    cycleName: 'Quý II/2026',
    officerCode: 'CB-2025-014',
    fullName: 'Nguyễn Văn A',
    positionName: 'Bí thư Chi đoàn KTPM2025.1',
    unitName: 'Đoàn Khoa Công nghệ Phần mềm',
    status: 'SUBMITTED',
    submittedAt: '14:20 15/08/2026',
    wpiScore: 94.0,
    leiScore: 92.0,
    ceiScore: 91.0,
    sdiScore: 93.0,
    totalSelfClpi: 93.0,
    selfClassification: 'Xuất sắc',
    selfAssessmentText: 'Trong tháng 08/2026, tôi đã chủ động hoàn thành các công việc được BTV giao đúng tiến độ, phối hợp tốt với Ban Học thuật tổ chức lớp tập huấn GamApp đạt chất lượng cao.',
    difficultiesAndProposalText: 'Thời gian trùng lịch thi cuối kỳ. Đề xuất hỗ trợ thêm kinh phí in tài liệu đợt tới.',
    timeline: [
      { id: 1, label: 'Khởi tạo biểu mẫu', timeStr: '01/06/2026 08:00', status: 'completed' },
      { id: 2, label: 'Cán bộ nộp tự đánh giá', timeStr: '15/08/2026 14:20', status: 'completed' },
      { id: 3, label: 'BTV đang thẩm định', timeStr: 'Đang thực hiện (Hạn: 25/08)', status: 'current' },
      { id: 4, label: 'Phê duyệt & Công bố', timeStr: 'Chờ hoàn tất', status: 'pending' },
    ],
  };

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clpi/evaluations/${evaluationId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          setEvaluation(data);
        } else {
          setEvaluation(mockEvaluation);
        }
      } catch (e) {
        setEvaluation(mockEvaluation);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [evaluationId]);

  // Xuất file PDF hồ sơ tự đánh giá
  const handleExportPdf = () => {
    setExportingPdf(true);
    setTimeout(() => {
      setExportingPdf(false);
      window.print();
    }, 800);
  };

  if (loading || !evaluation) {
    return (
      <div className="flex h-72 items-center justify-center bg-white rounded-3xl border border-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 text-slate-800 animate-in fade-in duration-200">
      {/* 1. Header: Tiêu đề & Nút Xuất PDF */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Biểu mẫu Đánh giá CLPI {evaluation.cycleName}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Hồ sơ tự đánh giá đã được tiếp nhận và đang trong tiến trình thẩm định.
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

      {/* Cảnh báo BTV yêu cầu bổ sung nếu có */}
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

      {/* 2. Khối thông tin cán bộ & Status Badge */}
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
              {evaluation.positionName} • Mã cán bộ: <strong className="text-slate-700">{evaluation.officerCode}</strong>
            </p>
            <p className="text-xs text-slate-400">Đơn vị: {evaluation.unitName}</p>
          </div>
        </div>

        <div className="text-right self-start md:self-auto space-y-1">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black bg-blue-50 text-[#0054a5] border border-blue-200 uppercase tracking-wider">
            {evaluation.status === 'SUBMITTED' ? 'ĐÃ NỘP HỒ SƠ' : evaluation.status}
          </span>
          <p className="text-[11px] text-slate-400 font-semibold">
            Thời gian nộp: {evaluation.submittedAt}
          </p>
        </div>
      </div>

      {/* 3. Nội dung 2 cột: Bảng điểm tự chấm (Trái) & Tiến trình xử lý hồ sơ (Phải) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cột trái (8 cols): Điểm tự chấm & Nội dung snapshot */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tổng hợp điểm tự chấm CLPI */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
              TỔNG HỢP ĐIỂM TỰ CHẤM CLPI
            </h3>

            {/* 4 Card Điểm */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400">WPI (40%)</span>
                <p className="text-2xl font-black text-[#0054a5]">{evaluation.wpiScore.toFixed(1)}</p>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400">LEI (25%)</span>
                <p className="text-2xl font-black text-emerald-700">{evaluation.leiScore.toFixed(1)}</p>
              </div>

              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400">CEI (20%)</span>
                <p className="text-2xl font-black text-amber-700">{evaluation.ceiScore.toFixed(1)}</p>
              </div>

              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400">SDI (15%)</span>
                <p className="text-2xl font-black text-purple-700">{evaluation.sdiScore.toFixed(1)}</p>
              </div>
            </div>

            {/* Banner Đen: Tổng điểm tự đánh giá quy đổi */}
            <div className="p-4 px-6 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-4 font-black">
              <span className="text-xs uppercase tracking-wider text-slate-300">
                Tổng điểm tự đánh giá quy đổi:
              </span>
              <span className="text-lg text-emerald-400">
                {evaluation.totalSelfClpi.toFixed(1)} / 100 ({evaluation.selfClassification})
              </span>
            </div>
          </div>

          {/* Nội dung biểu mẫu đã nộp (Snapshot read-only) */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
              NỘI DUNG BIỂU MẪU ĐÃ NỘP
            </h3>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-2">
                <p className="font-extrabold text-slate-800">Tự đánh giá kết quả công tác:</p>
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                  {evaluation.selfAssessmentText}
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-extrabold text-slate-800">Khó khăn & Đề xuất:</p>
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                  {evaluation.difficultiesAndProposalText}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải (4 cols): Tiến trình xử lý hồ sơ (Vertical Stepper Timeline) */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
          <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
            TIẾN TRÌNH XỬ LÝ HỒ SƠ
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {evaluation.timeline.map((step) => {
              const isCompleted = step.status === 'completed';
              const isCurrent = step.status === 'current';

              return (
                <div key={step.id} className="relative space-y-1">
                  {/* Icon Point */}
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-[#0054a5] text-white'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={13} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>

                  <p className={`text-xs font-extrabold leading-tight ${isCurrent ? 'text-[#0054a5]' : 'text-slate-800'}`}>
                    {step.label}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {step.timeStr}
                  </p>
                </div>
              );
            })}
          </div>

          {evaluation.status === 'FINALIZED' && (
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
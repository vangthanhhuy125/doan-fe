'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  Award, ThumbsUp, Compass, User, 
  ArrowLeft, FileText, CheckCircle2, AlertCircle, Loader2 
} from 'lucide-react';

interface FinalClpiResult {
  id: string;
  cycleName: string;
  fullName: string;
  positionName: string;
  unitName: string;
  avatarUrl?: string;
  approvedBy: string;
  approvedAt: string;
  finalClpiScore: number;
  finalClassification: string;
  wpiFinalScore: number;
  leiFinalScore: number;
  ceiFinalScore: number;
  sdiFinalScore: number;
  strengths: string;
  developmentRecommendation: string;
  isPublished: boolean;
}

const getClassificationStyle = (score: number) => {
  if (score >= 90) return 'bg-emerald-500 text-white';
  if (score >= 80) return 'bg-blue-600 text-white';
  if (score >= 65) return 'bg-amber-500 text-white';
  if (score >= 50) return 'bg-orange-500 text-white';
  return 'bg-rose-600 text-white';
};

export default function IndividualClpiResultPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const evaluationId = resolvedParams.id;

  const [result, setResult] = useState<FinalClpiResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock dữ liệu chuẩn xác theo mockup màn hình 7 của BRD
  const mockResultData: FinalClpiResult = {
    id: evaluationId || 'eval_current',
    cycleName: 'Quý II/2026',
    fullName: 'Nguyễn Văn A',
    positionName: 'Bí thư Chi đoàn KTPM2025.1',
    unitName: 'Đoàn Khoa Công nghệ Phần mềm',
    approvedBy: 'Ban Thường vụ Đoàn Khoa CNPM',
    approvedAt: '28/06/2026',
    finalClpiScore: 93.0,
    finalClassification: 'Xuất sắc',
    wpiFinalScore: 94.0,
    leiFinalScore: 92.0,
    ceiFinalScore: 91.0,
    sdiFinalScore: 93.0,
    strengths: 'Đồng chí hoàn thành xuất sắc công tác chuyên môn học thuật, có sáng kiến hay trong hoạt động Mùa Hè Xanh. Tương tác tích cực với đoàn viên.',
    developmentRecommendation: 'Khuyến khích tiếp tục đăng ký tham gia các khóa đào tạo Lãnh đạo Cấp cao Đoàn Trường để nâng cao thêm chỉ số SDI.',
    isPublished: true,
  };

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clpi/evaluations/${evaluationId}/result`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          setResult(data);
        } else {
          setResult(mockResultData);
        }
      } catch (e) {
        setResult(mockResultData);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [evaluationId]);

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center bg-white rounded-3xl border border-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
      </div>
    );
  }

  if (!result || !result.isPublished) {
    return (
      <div className="max-w-3xl mx-auto p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle size={28} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-800">Kết quả CLPI chưa được công bố</h2>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Hồ sơ đánh giá của chu kỳ này hiện đang trong quá trình thẩm định hoặc chờ Ban Thường vụ phê duyệt chính thức.
          </p>
        </div>
        <Link
          href={`/clpi-models/evaluations/${evaluationId}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0054a5] text-white text-xs font-bold rounded-2xl no-underline"
        >
          <ArrowLeft size={14} /> Quay lại xem hồ sơ đã nộp
        </Link>
      </div>
    );
  }

  const badgeClass = getClassificationStyle(result.finalClpiScore);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 text-slate-800 animate-in fade-in duration-200">
      {/* 1. Header Card: Thông tin cán bộ, Người phê duyệt & Thẻ Điểm chính thức */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-18 h-18 rounded-full bg-blue-50 border-2 border-[#0054a5] flex items-center justify-center font-black text-2xl text-[#0054a5] shrink-0 overflow-hidden">
            {result.avatarUrl ? (
              <img src={result.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={34} />
            )}
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Kết quả CLPI Cá nhân — {result.cycleName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold">
              Cán bộ: <strong className="text-slate-900">{result.fullName}</strong> • {result.positionName}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
              Phê duyệt bởi: {result.approvedBy} ngày {result.approvedAt}
            </p>
          </div>
        </div>

        {/* Khối Điểm chính thức (Final Score Box - Góc phải) */}
        <div className="w-full md:w-48 bg-[#002855] text-white rounded-3xl p-5 text-center space-y-2 shrink-0 shadow-lg shadow-blue-900/20">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-200">
            ĐIỂM CHÍNH THỨC
          </span>
          <div className="text-5xl font-black tracking-tight text-white">
            {result.finalClpiScore.toFixed(1)}
          </div>
          <div>
            <span className={`inline-block px-4 py-1 rounded-full text-xs font-black shadow-xs ${badgeClass}`}>
              {result.finalClassification}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Hàng 4 Card chỉ số năng lực: WPI, LEI, CEI, SDI (Final Scores) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* WPI Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            WPI - Hoàn thành nhiệm vụ
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0054a5]">
              {result.wpiFinalScore.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400">(40%)</span>
          </div>
        </div>

        {/* LEI Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            LEI - Điều hành & Phối hợp
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">
              {result.leiFinalScore.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400">(25%)</span>
          </div>
        </div>

        {/* CEI Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            CEI - Tương tác tổ chức
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">
              {result.ceiFinalScore.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400">(20%)</span>
          </div>
        </div>

        {/* SDI Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            SDI - Phát triển cá nhân
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-600">
              {result.sdiFinalScore.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400">(15%)</span>
          </div>
        </div>
      </div>

      {/* 3. Khối Nhận xét của Ban Thường vụ & Hướng phát triển */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
        <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
          NHẬN XÉT CỦA BAN THƯỜNG VỤ & HƯỚNG PHÁT TRIỂN
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ưu điểm nổi bật */}
          <div className="p-5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wide">
              <ThumbsUp size={16} />
              <span>Ưu điểm nổi bật</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
              {result.strengths || 'Chưa có nhận xét.'}
            </p>
          </div>

          {/* Nội dung cần phát triển thêm */}
          <div className="p-5 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-[#0054a5] font-extrabold text-xs uppercase tracking-wide">
              <Compass size={16} />
              <span>Nội dung cần phát triển thêm</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-950 leading-relaxed font-medium">
              {result.developmentRecommendation || 'Chưa có đề xuất phát triển thêm.'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Link chuyển hướng xem lại bản tự đánh giá ban đầu */}
      <div className="flex justify-start">
        <Link
          href={`/clpi-models/evaluations/${evaluationId}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#0054a5] hover:underline no-underline"
        >
          <FileText size={15} /> Xem lại hồ sơ tự đánh giá và tiến trình xử lý
        </Link>
      </div>
    </div>
  );
}
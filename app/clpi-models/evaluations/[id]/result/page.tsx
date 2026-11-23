'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ThumbsUp,
  Compass,
  User,
  ArrowLeft,
  FileText,
  AlertCircle,
  Loader2,
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
  weights?: { WPI: number; LEI: number; CEI: number; SDI: number };
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
  const [weights, setWeights] = useState({ WPI: 40, LEI: 25, CEI: 20, SDI: 15 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
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
          fetch(`${apiUrl}/clpi/evaluations/${evaluationId}/result`, { headers }),
          fetch(`${apiUrl}/clpi/indicators`, { headers }).catch(() => null),
        ]);

        if (indRes && indRes.ok) {
          const indData = await indRes.json();
          if (indData?.weights) setWeights(indData.weights);
        }

        if (res.ok) {
          const data = await res.json();
          if (data?.weights) setWeights(data.weights);
          setResult({
            id: String(data.id || data._id || evaluationId),
            cycleName: data.cycleName || '',
            fullName: data.fullName || '',
            positionName: data.positionName || '',
            unitName: data.unitName || data.unitBranch || '',
            avatarUrl: data.avatarUrl || '',
            approvedBy: data.approvedBy || '',
            approvedAt: data.approvedAt || '',
            finalClpiScore: Number(data.finalClpiScore || 0),
            finalClassification: data.finalClassification || '',
            wpiFinalScore: Number(data.wpiFinalScore || 0),
            leiFinalScore: Number(data.leiFinalScore || 0),
            ceiFinalScore: Number(data.ceiFinalScore || 0),
            sdiFinalScore: Number(data.sdiFinalScore || 0),
            strengths: data.strengths || '',
            developmentRecommendation: data.developmentRecommendation || '',
            isPublished: Boolean(data.isPublished || ['APPROVED', 'FINALIZED', 'PUBLISHED'].includes(data.status)),
          });
        } else {
          setResult(null);
        }
      } catch {
        setResult(null);
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
            Hồ sơ đánh giá của chu kỳ này hiện chưa có dữ liệu hoặc đang chờ Ban Thường vụ phê duyệt chính thức.
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
            {result.approvedBy && (
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                Phê duyệt bởi: {result.approvedBy} {result.approvedAt ? `ngày ${result.approvedAt}` : ''}
              </p>
            )}
          </div>
        </div>

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            WPI - Hoàn thành nhiệm vụ
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0054a5]">
              {result.wpiFinalScore.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400">({weights.WPI}%)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            LEI - Điều hành & Phối hợp
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">
              {result.leiFinalScore.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400">({weights.LEI}%)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            CEI - Tương tác tổ chức
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">
              {result.ceiFinalScore.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400">({weights.CEI}%)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            SDI - Phát triển cá nhân
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-600">
              {result.sdiFinalScore.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400">({weights.SDI}%)</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
        <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
          NHẬN XÉT CỦA BAN THƯỜNG VỤ & HƯỚNG PHÁT TRIỂN
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wide">
              <ThumbsUp size={16} />
              <span>Ưu điểm nổi bật</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
              {result.strengths || 'Chưa có nhận xét.'}
            </p>
          </div>

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
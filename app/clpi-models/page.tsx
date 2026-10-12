'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, CheckCircle2, Clock, AlertTriangle, 
  Award, Calendar, Check, UserCheck, 
  BarChart3, ListTodo, FileSpreadsheet, Loader2,
  Sparkles
} from 'lucide-react';

const getClassification = (score: number) => {
  if (score >= 90) return { label: 'Xuất sắc', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (score >= 80) return { label: 'Tốt', color: 'bg-blue-50 text-blue-700 border-blue-200' };
  if (score >= 65) return { label: 'Đạt', color: 'bg-amber-50 text-amber-700 border-amber-200' };
  if (score >= 50) return { label: 'Cần hỗ trợ', color: 'bg-orange-50 text-orange-700 border-orange-200' };
  return { label: 'Chưa đạt', color: 'bg-rose-50 text-rose-700 border-rose-200' };
};

const PRIORITY_BADGES: Record<string, { label: string; style: string }> = {
  high: { label: 'Cao', style: 'bg-rose-50 text-rose-700 border-rose-200' },
  medium: { label: 'Trung bình', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  normal: { label: 'Bình thường', style: 'bg-blue-50 text-blue-700 border-blue-200' },
  low: { label: 'Thấp', style: 'bg-slate-50 text-slate-600 border-slate-200' },
};

export default function OfficerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [officerName, setOfficerName] = useState<string>('Nguyễn Văn A');
  const [cycleInfo, setCycleInfo] = useState({
    name: 'Chu kỳ CLPI Quý II/2026',
    deadline: '30/06/2026',
    isActive: true
  });

  const [evaluationStatus, setEvaluationStatus] = useState<string>('SUBMITTED');
  const [evaluationId, setEvaluationId] = useState<string>('eval_current');

  const [kpi, setKpi] = useState({
    activeTasks: 5,
    upcomingTasksCount: 1,
    overdueTasks: 0,
    ontimeRate: 100,
    pendingMonthlyReports: 1,
    pendingMonthLabel: 'Tháng 08/2026 (Chờ gửi)',
    clpiStatusLabel: 'Đã nộp tự đánh giá',
    clpiNextStep: 'Chờ BTV Đoàn Khoa duyệt'
  });

  const [processSteps, setProcessSteps] = useState([
    { id: 1, label: 'Khởi tạo', status: 'completed' },
    { id: 2, label: 'Cập nhật CV', status: 'completed' },
    { id: 3, label: 'Báo cáo tháng', status: 'completed' },
    { id: 4, label: 'Tự đánh giá', status: 'completed' },
    { id: 5, label: 'Đã nộp', status: 'current' },
    { id: 6, label: 'BTV kiểm tra', status: 'pending' },
    { id: 7, label: 'Phê duyệt', status: 'pending' }
  ]);

  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([
    {
      id: 'task_01',
      title: 'Tổ chức Tập huấn Lập trình GamApp 2026',
      activityName: 'Mùa Hè Xanh 2026',
      priority: 'high',
      progress: 80,
      deadline: '20/08/2026',
    },
    {
      id: 'task_02',
      title: 'Tổng hợp Minh chứng Hoạt động Học thuật Q2',
      activityName: 'Công tác Đoàn',
      priority: 'medium',
      progress: 45,
      deadline: '25/08/2026',
    }
  ]);

  const [lastResult, setLastResult] = useState<any>({
    cycleName: 'Kết quả Quý I/2026',
    clpiScore: 93.0,
    hasResult: true,
    indicators: [
      { code: 'WPI', name: 'Nhiệm vụ', weight: 40, score: 94.0 },
      { code: 'LEI', name: 'Điều hành', weight: 25, score: 92.0 },
      { code: 'CEI', name: 'Tương tác', weight: 20, score: 91.0 },
      { code: 'SDI', name: 'Phát triển', weight: 15, score: 93.0 }
    ],
    trends: [
      { cycle: 'Q3/2025', score: 88.5 },
      { cycle: 'Q4/2025', score: 90.2 },
      { cycle: 'Q1/2026', score: 93.0 }
    ]
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          if (u.full_name || u.displayName || u.name) {
            setOfficerName(u.full_name || u.displayName || u.name);
          }
        }

        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clpi/dashboard`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (res.ok) {
          const data = await res.json();
          if (data.officerName) setOfficerName(data.officerName);
          if (data.cycle) setCycleInfo(data.cycle);
          if (data.evaluationStatus) setEvaluationStatus(data.evaluationStatus);
          if (data.evaluationId) setEvaluationId(data.evaluationId);
          if (data.kpi) setKpi(data.kpi);
          if (data.processSteps) setProcessSteps(data.processSteps);
          if (data.upcomingTasks) setUpcomingTasks(data.upcomingTasks);
          if (data.lastResult) setLastResult(data.lastResult);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getSelfAssessmentButton = () => {
    switch (evaluationStatus) {
      case 'DRAFT':
        return { label: 'Tiếp tục tự đánh giá', href: '/clpi-models/self-assessment' };
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return { label: 'Xem hồ sơ đã nộp', href: `/clpi-models/evaluations/${evaluationId}` };
      case 'NEEDS_REVISION':
        return { label: 'Bổ sung hồ sơ', href: `/clpi-models/self-assessment?mode=revision` };
      case 'FINALIZED':
        return { label: 'Xem kết quả CLPI', href: `/clpi-models/evaluations/${evaluationId}/result` };
      default:
        return { label: 'Tự đánh giá CLPI', href: '/clpi-models/self-assessment' };
    }
  };

  const primaryBtn = getSelfAssessmentButton();
  const classification = getClassification(lastResult.clpiScore);

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center bg-white rounded-3xl border border-slate-200">
        <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 text-slate-800 animate-in fade-in duration-200">
      {/* 1. SECTION HEADER CHUẨN PHONG CÁCH ĐOÀN KHOA[cite: 7] */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0054a5] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Xin chào, {officerName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {cycleInfo.isActive ? (
                <>
                  {cycleInfo.name} đang diễn ra. Hạn nộp báo cáo tự đánh giá: <strong className="text-[#0054a5] font-bold">{cycleInfo.deadline}</strong>.
                </>
              ) : (
                'Hiện chưa có chu kỳ CLPI đang diễn ra.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Link
            href="/clpi-models/monthly-report"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all no-underline"
          >
            <FileText size={16} /> Báo cáo tháng
          </Link>

          <Link
            href={primaryBtn.href}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 active:scale-95 transition-all no-underline"
          >
            <Award size={16} /> {primaryBtn.label}
          </Link>
        </div>
      </div>

      {/* 2. 4 THẺ KPI CARD DẠNG SQUIRCLE BADGE[cite: 7] */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <Link
          href="/clpi-models/tasks?status=active"
          className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0054a5]/40 hover:shadow-md transition-all no-underline flex flex-col justify-between group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đang thực hiện</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2">
                {String(kpi.activeTasks).padStart(2, '0')}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0054a5] flex items-center justify-center group-hover:scale-105 transition-transform">
              <ListTodo size={22} />
            </div>
          </div>
          <p className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-3">
            <Clock size={13} /> {String(kpi.upcomingTasksCount).padStart(2, '0')} nhiệm vụ sắp đến hạn
          </p>
        </Link>

        {/* KPI 2 */}
        <Link
          href="/clpi-models/tasks?status=overdue"
          className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all no-underline flex flex-col justify-between group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tiến độ công việc</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-2">
                {kpi.ontimeRate}%
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 size={22} />
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-3">
            Quá hạn: <strong className="text-rose-600">{kpi.overdueTasks} việc</strong>
          </p>
        </Link>

        {/* KPI 3 */}
        <Link
          href="/clpi-models/monthly-report"
          className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-amber-300 hover:shadow-md transition-all no-underline flex flex-col justify-between group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Báo cáo tháng</p>
              <h3 className="text-3xl font-black text-amber-600 mt-2">
                {String(kpi.pendingMonthlyReports).padStart(2, '0')}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileSpreadsheet size={22} />
            </div>
          </div>
          <p className="text-xs font-semibold text-amber-600 flex items-center gap-1 mt-3">
            <AlertTriangle size={13} /> {kpi.pendingMonthLabel}
          </p>
        </Link>

        {/* KPI 4 */}
        <Link
          href={`/clpi-models/evaluations/${evaluationId}`}
          className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-purple-300 hover:shadow-md transition-all no-underline flex flex-col justify-between group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái CLPI</p>
              <h3 className="text-base font-black text-[#0054a5] mt-2">
                {kpi.clpiStatusLabel}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserCheck size={22} />
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-3 truncate">
            {kpi.clpiNextStep}
          </p>
        </Link>
      </div>

      {/* 3. STEPPER TIẾN TRÌNH THỰC HIỆN ĐÁNH GIÁ CLPI */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-black text-[#0054a5] uppercase tracking-wider">
            Tiến độ thực hiện đánh giá Chu kỳ {cycleInfo.name.replace('Chu kỳ CLPI ', '')}
          </h2>
          <Link
            href={`/clpi-models/evaluations/${evaluationId}`}
            className="text-xs font-bold text-[#0054a5] hover:underline flex items-center gap-1 no-underline"
          >
            Hồ sơ chi tiết →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
          {processSteps.map((step) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            const isWarning = step.status === 'warning';

            return (
              <div
                key={step.id}
                className={`flex items-center gap-2 p-2.5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                    : isCurrent
                    ? 'bg-blue-50/90 border-[#0054a5] text-[#0054a5] font-bold'
                    : isWarning
                    ? 'bg-amber-50/80 border-amber-300 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-[#0054a5] text-white'
                      : isWarning
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check size={13} strokeWidth={3} /> : step.id}
                </div>
                <span className="text-xs font-bold truncate">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. CỘT CÔNG VIỆC SẮP ĐẾN HẠN & KẾT QUẢ CLPI GẦN NHẤT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Công việc sắp đến hạn
            </h2>
            <Link href="/clpi-models/tasks" className="text-xs font-bold text-[#0054a5] hover:underline no-underline">
              Tất cả ({kpi.activeTasks})
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingTasks.map((t) => (
              <div
                key={t.id}
                className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0054a5]/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    {t.activityName && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 bg-blue-50 text-[#0054a5] rounded-md border border-blue-200">
                        {t.activityName}
                      </span>
                    )}
                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                      <Link href={`/clpi-models/tasks/${t.id}`} className="hover:text-[#0054a5] transition-colors no-underline text-slate-900">
                        {t.title}
                      </Link>
                    </h3>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${PRIORITY_BADGES[t.priority]?.style || 'bg-slate-100 text-slate-600'}`}>
                    {PRIORITY_BADGES[t.priority]?.label || t.priority}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Tiến độ</span>
                    <span className="text-[#0054a5]">{t.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#0054a5] to-[#1d92ff] h-full rounded-full transition-all duration-500"
                      style={{ width: `${t.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-xs">
                  <span className="text-slate-400 flex items-center gap-1 font-semibold">
                    <Calendar size={13} /> Hạn: {t.deadline}
                  </span>
                  <Link
                    href={`/clpi-models/tasks/${t.id}`}
                    className="font-bold text-[#0054a5] hover:underline flex items-center gap-0.5 no-underline"
                  >
                    Chi tiết →
                  </Link>
                </div>
              </div>
            ))}

            {upcomingTasks.length === 0 && (
              <div className="p-8 bg-white rounded-3xl border border-dashed border-slate-200 text-center text-xs text-slate-400 italic">
                Hiện không có nhiệm vụ nào sắp đến hạn cần xử lý.
              </div>
            )}
          </div>
        </div>

        {/* Cột phải: CLPI Kỳ gần nhất (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            CLPI Kỳ gần nhất
          </h2>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="p-6 bg-gradient-to-b from-blue-50/70 to-white rounded-2xl border border-blue-100 text-center space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {lastResult.cycleName}
              </span>
              <div className="text-5xl font-black text-[#0054a5] tracking-tight">
                {Number(lastResult.clpiScore).toFixed(1)}
              </div>
              <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-extrabold border ${classification.color}`}>
                {classification.label}
              </span>
            </div>

            {/* 4 Nhóm chỉ số Squircle */}
            <div className="grid grid-cols-2 gap-3">
              {lastResult.indicators.map((ind: any) => (
                <div key={ind.code} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400">{ind.code} ({ind.weight}%)</span>
                  <div className="text-xl font-black text-slate-900">
                    {Number(ind.score).toFixed(1)}
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold truncate">{ind.name}</p>
                </div>
              ))}
            </div>

            {/* Biểu đồ xu hướng 3 quý gần nhất */}
            {lastResult.trends && lastResult.trends.length > 0 && (
              <div className="p-4 bg-slate-50/60 rounded-2xl border border-slate-100 space-y-2">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase">Xu hướng 3 quý gần nhất</p>
                <div className="flex items-end justify-between gap-3 h-20 pt-2">
                  {lastResult.trends.map((tr: any) => {
                    const heightPct = Math.max(20, Math.min(100, tr.score));
                    return (
                      <div key={tr.cycle} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className="text-[10px] font-bold text-[#0054a5]">{tr.score}</span>
                        <div className="w-full bg-slate-200 rounded-t-md h-full max-h-12 flex items-end">
                          <div
                            className="w-full bg-[#1d92ff] rounded-t-md transition-all duration-500"
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold">{tr.cycle}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Link
              href={`/clpi-models/evaluations/${evaluationId}/result`}
              className="w-full py-3 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all no-underline block text-center shadow-md shadow-blue-500/20"
            >
              <BarChart3 size={15} /> Xem bảng phân tích chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
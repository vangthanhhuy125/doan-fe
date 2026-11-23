'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
} from 'lucide-react';

interface MonthlyTaskSnapshot {
  taskId: string;
  title: string;
  progress: number;
  result: string;
}

const getLastDayOfReportingMonth = (monthYear: string): string => {
  const parts = String(monthYear || '').split('/');
  if (parts.length === 2) {
    const month = parseInt(parts[0], 10);
    const year = parseInt(parts[1], 10);
    if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
      const lastDay = new Date(year, month, 0).getDate();
      return `${String(lastDay).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    }
  }
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return `${String(lastDay).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}/${now.getFullYear()}`;
};

export default function MonthlyReportPage() {
  const now = new Date();
  const defaultMonth = `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  const [loading, setLoading] = useState(true);
  const [reportId, setReportId] = useState<string>('');
  const [reportingMonth, setReportingMonth] = useState<string>(defaultMonth);
  const [cycleName, setCycleName] = useState<string>('');
  const [unitName] = useState<string>('Đoàn Khoa Công nghệ Phần mềm');
  const [officerName, setOfficerName] = useState<string>('');
  const [positionName, setPositionName] = useState<string>('');
  const [unitBranch, setUnitBranch] = useState<string>('');
  const [deadline, setDeadline] = useState<string>(getLastDayOfReportingMonth(defaultMonth));

  const [status, setStatus] = useState<'DRAFT' | 'SUBMITTED' | 'NEEDS_REVISION'>('DRAFT');
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [revisionComment, setRevisionComment] = useState<string | null>(null);

  const [tasksSnapshot, setTasksSnapshot] = useState<MonthlyTaskSnapshot[]>([]);
  const [selfAssessment, setSelfAssessment] = useState<string>('');
  const [difficulties, setDifficulties] = useState<string>('');
  const [supportProposal, setSupportProposal] = useState<string>('');

  const [lastSavedAt, setLastSavedAt] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  const isReadOnly = status === 'SUBMITTED';

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
        const res = await fetch(`${apiUrl}/clpi/monthly-reports/current`, {
          headers: getHeaders(),
        });

        if (res.ok) {
          const data = await res.json();
          const rMonth = data.reportingMonth || defaultMonth;
          setReportId(String(data.id || data._id || ''));
          setReportingMonth(rMonth);
          setCycleName(data.cycleName || '');
          setOfficerName(data.officerName || '');
          setPositionName(data.positionName || '');
          setUnitBranch(data.unitBranch || '');

          // Ưu tiên monthlyDeadline riêng; nếu deadline từ DB không thuộc tháng báo cáo thì tự tính ngày cuối tháng báo cáo
          const rawDeadline = String(data.monthlyDeadline || data.deadline || '');
          const isSameMonthYear = rawDeadline.endsWith(`/${rMonth}`);
          setDeadline(isSameMonthYear ? rawDeadline : getLastDayOfReportingMonth(rMonth));

          if (data.status) setStatus(data.status);
          setSelfAssessment(data.selfAssessment || '');
          setDifficulties(data.difficulties || '');
          setSupportProposal(data.supportProposal || '');
          setTasksSnapshot(Array.isArray(data.tasksSnapshot) ? data.tasksSnapshot : []);
          setLastSavedAt(data.lastSavedAt || '');
          setSubmittedAt(data.submittedAt || null);
          setRevisionComment(data.revisionComment || null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const triggerAutoSave = () => {
    if (isReadOnly || !reportId) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(async () => {
      await handleSaveDraft(true);
    }, 4000);
  };

  const handleSaveDraft = async (isAuto = false) => {
    if (isReadOnly || isSaving || !reportId) return;
    setIsSaving(true);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const nowStr =
        new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' hôm nay';

      const res = await fetch(`${apiUrl}/clpi/monthly-reports/${reportId}/draft`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          selfAssessment,
          difficulties,
          supportProposal,
          lastSavedAt: nowStr,
        }),
      });

      if (res.ok) {
        setLastSavedAt(nowStr);
        if (!isAuto) showToast('Đã lưu bản nháp thành công!', 'success');
      } else if (!isAuto) {
        showToast('Lưu bản nháp thất bại!', 'error');
      }
    } catch {
      if (!isAuto) showToast('Lưu bản nháp thất bại!', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmSubmit = async () => {
    setValidationError(null);
    const cleanSelf = selfAssessment.trim();

    if (!cleanSelf || cleanSelf.length < 20) {
      setValidationError('Nội dung tự đánh giá kết quả công tác phải có ít nhất 20 ký tự!');
      setShowSubmitModal(false);
      return;
    }

    if (!reportId) return;

    setIsSubmitting(true);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const res = await fetch(`${apiUrl}/clpi/monthly-reports/${reportId}/submit`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          selfAssessment: cleanSelf,
          difficulties: difficulties.trim(),
          supportProposal: supportProposal.trim(),
          tasksSnapshot,
        }),
      });

      if (res.ok) {
        setStatus('SUBMITTED');
        setSubmittedAt(new Date().toLocaleString('vi-VN'));
        setShowSubmitModal(false);
        showToast('Nộp báo cáo công tác tháng thành công!', 'success');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Nộp báo cáo thất bại!', 'error');
      }
    } catch {
      showToast('Lỗi kết nối máy chủ!', 'error');
    } finally {
      setIsSubmitting(false);
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
    <div className="max-w-4xl mx-auto space-y-6 pb-16 text-slate-800 animate-in fade-in duration-200">
      {toastMessage && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold text-white animate-in slide-in-from-top-4 ${
            toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {status === 'NEEDS_REVISION' && revisionComment && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-3xl text-xs font-bold text-amber-900 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="uppercase tracking-wider">Yêu cầu bổ sung từ Ban Thường vụ:</p>
            <p className="font-normal text-amber-800">{revisionComment}</p>
          </div>
        </div>
      )}

      {/* Tiêu đề báo cáo & Trạng thái */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Báo cáo công tác tháng {reportingMonth}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {unitName} {cycleName ? `— ${cycleName}` : ''}
          </p>
        </div>

        <div>
          {status === 'DRAFT' && (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-3.5 py-1 rounded-full text-xs font-bold">
              Đang soạn thảo
            </span>
          )}
          {status === 'SUBMITTED' && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1 rounded-full text-xs font-bold">
              <CheckCircle2 size={13} /> Đã nộp {submittedAt ? `(${submittedAt})` : ''}
            </span>
          )}
          {status === 'NEEDS_REVISION' && (
            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 border border-rose-200 px-3.5 py-1 rounded-full text-xs font-bold">
              Cần bổ sung
            </span>
          )}
        </div>
      </div>

      {/* Thông tin cán bộ */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase text-slate-400">Cán bộ:</p>
          <p className="text-xs sm:text-sm font-extrabold text-slate-800 mt-1">{officerName || '---'}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase text-slate-400">Chức vụ:</p>
          <p className="text-xs sm:text-sm font-extrabold text-slate-800 mt-1">{positionName || '---'}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase text-slate-400">Đơn vị:</p>
          <p className="text-xs sm:text-sm font-extrabold text-slate-800 mt-1">{unitBranch || '---'}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase text-slate-400">Hạn nộp:</p>
          <p className="text-xs sm:text-sm font-black text-rose-600 mt-1">{deadline}</p>
        </div>
      </div>

      {/* Phần 1: Nhiệm vụ trong tháng */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
          PHẦN 1: NHIỆM VỤ TRONG THÁNG (TỰ ĐỘNG ĐỒNG BỘ)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Công việc</th>
                <th className="py-3 px-4 w-28 text-center">Tiến độ</th>
                <th className="py-3 px-4 w-60">Kết quả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasksSnapshot.map((t) => (
                <tr key={t.taskId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    <Link
                      href={`/clpi-models/tasks/${t.taskId}`}
                      className="hover:text-[#0054a5] no-underline text-slate-900"
                    >
                      {t.title}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-center font-black text-[#0054a5]">
                    {t.progress}%
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600">
                    {t.result || 'Chưa cập nhật'}
                  </td>
                </tr>
              ))}

              {tasksSnapshot.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400 italic">
                    Không có nhiệm vụ được ghi nhận trong tháng này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phần 2: Tự đánh giá kết quả công tác */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
        <label className="text-xs font-black uppercase text-slate-700 tracking-wider block">
          PHẦN 2: TỰ ĐÁNH GIÁ KẾT QUẢ CÔNG TÁC *
        </label>
        <textarea
          rows={4}
          disabled={isReadOnly}
          value={selfAssessment}
          onChange={(e) => {
            setSelfAssessment(e.target.value);
            triggerAutoSave();
          }}
          placeholder="Mô tả mức độ hoàn thành nhiệm vụ, chất lượng, tinh thần trách nhiệm trong tháng (tối thiểu 20 ký tự)..."
          className="w-full p-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium outline-none focus:border-[#0054a5] focus:bg-white resize-none leading-relaxed disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed transition-all"
        />
        {validationError && (
          <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
            <AlertCircle size={13} /> {validationError}
          </p>
        )}
      </div>

      {/* Phần 3: Khó khăn, vướng mắc */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
        <label className="text-xs font-black uppercase text-slate-700 tracking-wider block">
          PHẦN 3: KHÓ KHĂN, VƯỚNG MẮC
        </label>
        <textarea
          rows={3}
          disabled={isReadOnly}
          value={difficulties}
          onChange={(e) => {
            setDifficulties(e.target.value);
            triggerAutoSave();
          }}
          placeholder="Nêu các khó khăn, vướng mắc phát sinh trong quá trình thực hiện nhiệm vụ (nếu có)..."
          className="w-full p-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium outline-none focus:border-[#0054a5] focus:bg-white resize-none leading-relaxed disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed transition-all"
        />
      </div>

      {/* Phần 4: Đề xuất hỗ trợ */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
        <label className="text-xs font-black uppercase text-slate-700 tracking-wider block">
          PHẦN 4: ĐỀ XUẤT HỖ TRỢ
        </label>
        <textarea
          rows={3}
          disabled={isReadOnly}
          value={supportProposal}
          onChange={(e) => {
            setSupportProposal(e.target.value);
            triggerAutoSave();
          }}
          placeholder="Đề xuất Đoàn Khoa hoặc cấp ủy hỗ trợ về nhân sự, kinh phí, chuyên môn..."
          className="w-full p-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium outline-none focus:border-[#0054a5] focus:bg-white resize-none leading-relaxed disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed transition-all"
        />
      </div>

      {/* Thanh thao tác cuối trang */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-400">
          {lastSavedAt ? (
            <>
              Lần lưu nháp gần nhất: <strong>{lastSavedAt}</strong>
            </>
          ) : (
            'Chưa có bản nháp nào được lưu'
          )}
        </span>

        {!isReadOnly ? (
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={isSaving || !reportId}
              onClick={() => handleSaveDraft(false)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all border-none cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu nháp'}
            </button>

            <button
              type="button"
              disabled={!reportId}
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 active:scale-95 transition-all border-none cursor-pointer disabled:opacity-50"
            >
              <span>{status === 'NEEDS_REVISION' ? 'Nộp lại báo cáo →' : 'Nộp báo cáo →'}</span>
            </button>
          </div>
        ) : (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 size={15} /> Báo cáo đã nộp thành công, đang ở chế độ chỉ xem.
          </span>
        )}
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0054a5] flex items-center justify-center mx-auto">
              <Send size={22} />
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-base text-slate-900">Xác nhận nộp báo cáo công tác?</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Sau khi nộp báo cáo, bạn sẽ không thể chỉnh sửa cho đến khi báo cáo được yêu cầu bổ sung. Bạn có chắc chắn muốn nộp?
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold border-none cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSubmit}
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
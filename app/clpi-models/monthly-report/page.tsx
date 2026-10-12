'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  FileText, Calendar, Clock, CheckCircle2, 
  AlertCircle, Send, Save, Loader2, ArrowRight
} from 'lucide-react';

interface MonthlyTaskSnapshot {
  taskId: string;
  title: string;
  progress: number;
  result: string;
}

export default function MonthlyReportPage() {
  const [loading, setLoading] = useState(true);
  const [reportId, setReportId] = useState<string>('report_08_2026');
  const [reportingMonth, setReportingMonth] = useState<string>('08/2026');
  const [cycleName, setCycleName] = useState<string>('Chu kỳ CLPI Quý II/2026');
  const [unitName, setUnitName] = useState<string>('Đoàn Khoa Công nghệ Phần mềm');
  const [officerName, setOfficerName] = useState<string>('Nguyễn Văn A');
  const [positionName, setPositionName] = useState<string>('Bí thư Chi đoàn');
  const [unitBranch, setUnitBranch] = useState<string>('Chi đoàn KTPM2025.1');
  const [deadline, setDeadline] = useState<string>('28/08/2026');
  const [deadlineIso, setDeadlineIso] = useState<string>('2026-08-28');

  // Trạng thái: DRAFT (Đang soạn thảo) | SUBMITTED (Đã nộp) | NEEDS_REVISION (Cần bổ sung)
  const [status, setStatus] = useState<'DRAFT' | 'SUBMITTED' | 'NEEDS_REVISION'>('DRAFT');
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [revisionComment, setRevisionComment] = useState<string | null>(null);

  // Section 1: Task snapshot
  const [tasksSnapshot, setTasksSnapshot] = useState<MonthlyTaskSnapshot[]>([
    {
      taskId: 'task_01',
      title: 'Tập huấn Lập trình GamApp 2026',
      progress: 80,
      result: 'Hoàn thành 2/3 buổi học'
    },
    {
      taskId: 'task_04',
      title: 'Thiết kế Backdrop Ngày hội Tân SV',
      progress: 100,
      result: 'Đã in ấn & nghiệm thu'
    }
  ]);

  // Section 2, 3, 4: Nội dung người dùng nhập
  const [selfAssessment, setSelfAssessment] = useState<string>(
    'Trong tháng 08/2026, tôi đã chủ động hoàn thành các công việc được BTV giao đúng tiến độ, phối hợp tốt với Ban Học thuật tổ chức lớp tập huấn GamApp đạt chất lượng cao.'
  );
  const [difficulties, setDifficulties] = useState<string>(
    'Thời gian tổ chức tập huấn trùng với lịch thi cuối kỳ của một số cán bộ hỗ trợ nên công tác điểm danh còn chậm.'
  );
  const [supportProposal, setSupportProposal] = useState<string>(
    'Đề xuất Đoàn Khoa hỗ trợ thêm kinh phí in ấn tài liệu cho học viên trong các đợt tiếp theo.'
  );

  const [lastSavedAt, setLastSavedAt] = useState<string>('16:45 hôm nay');
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

  const isReadOnly = status === 'SUBMITTED';

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clpi/monthly-reports/current`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (res.ok) {
          const data = await res.json();
          if (data.id) setReportId(data.id);
          if (data.reportingMonth) setReportingMonth(data.reportingMonth);
          if (data.status) setStatus(data.status);
          if (data.selfAssessment) setSelfAssessment(data.selfAssessment);
          if (data.difficulties) setDifficulties(data.difficulties);
          if (data.supportProposal) setSupportProposal(data.supportProposal);
          if (data.tasksSnapshot) setTasksSnapshot(data.tasksSnapshot);
          if (data.lastSavedAt) setLastSavedAt(data.lastSavedAt);
          if (data.submittedAt) setSubmittedAt(data.submittedAt);
          if (data.revisionComment) setRevisionComment(data.revisionComment);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  // Cơ chế Auto-Save debounce 4 giây
  const triggerAutoSave = () => {
    if (isReadOnly) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(async () => {
      await handleSaveDraft(true);
    }, 4000);
  };

  const handleSaveDraft = async (isAuto = false) => {
    if (isReadOnly || isSaving) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token') || '';
      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' hôm nay';

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clpi/monthly-reports/${reportId}/draft`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          selfAssessment,
          difficulties,
          supportProposal,
          lastSavedAt: nowStr
        })
      });

      if (res.ok || !isAuto) {
        setLastSavedAt(nowStr);
        if (!isAuto) showToast('Đã lưu bản nháp thành công!', 'success');
      }
    } catch (e) {
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

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clpi/monthly-reports/${reportId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          selfAssessment: cleanSelf,
          difficulties: difficulties.trim(),
          supportProposal: supportProposal.trim(),
          tasksSnapshot
        })
      });

      if (res.ok) {
        setStatus('SUBMITTED');
        setSubmittedAt(new Date().toLocaleString('vi-VN'));
        setShowSubmitModal(false);
        showToast('Nộp báo cáo công tác tháng thành công!', 'success');
      } else {
        const err = await res.json();
        showToast(err.message || 'Nộp báo cáo thất bại!', 'error');
      }
    } catch (e) {
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
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold text-white animate-in slide-in-from-top-4 ${
          toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Cảnh báo nếu báo cáo bị trả về cần bổ sung */}
      {status === 'NEEDS_REVISION' && revisionComment && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-3xl text-xs font-bold text-amber-900 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="uppercase tracking-wider">Yêu cầu bổ sung từ Ban Thường vụ:</p>
            <p className="font-normal text-amber-800">{revisionComment}</p>
          </div>
        </div>
      )}

      {/* 1. Header: Tiêu đề báo cáo & Badge trạng thái */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Báo cáo công tác tháng {reportingMonth}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {unitName} — {cycleName}
          </p>
        </div>

        {/* Badge trạng thái */}
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

      {/* 2. Thông tin cán bộ (Read-only) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase text-slate-400">Cán bộ:</p>
          <p className="text-xs sm:text-sm font-extrabold text-slate-800 mt-1">{officerName}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase text-slate-400">Chức vụ:</p>
          <p className="text-xs sm:text-sm font-extrabold text-slate-800 mt-1">{positionName}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase text-slate-400">Đơn vị:</p>
          <p className="text-xs sm:text-sm font-extrabold text-slate-800 mt-1">{unitBranch}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase text-slate-400">Hạn nộp:</p>
          <p className="text-xs sm:text-sm font-black text-rose-600 mt-1">{deadline}</p>
        </div>
      </div>

      {/* 3. SECTION 1: Nhiệm vụ trong tháng (Tự động đồng bộ) */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
          SECTION 1: NHIỆM VỤ TRONG THÁNG (TỰ ĐỘNG ĐỒNG BỘ)
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
                    <Link href={`/clpi-models/tasks/${t.taskId}`} className="hover:text-[#0054a5] no-underline text-slate-900">
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

      {/* 4. SECTION 2: Tự đánh giá kết quả công tác */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
        <label className="text-xs font-black uppercase text-slate-700 tracking-wider block">
          SECTION 2: TỰ ĐÁNH GIÁ KẾT QUẢ CÔNG TÁC *
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

      {/* 5. SECTION 3: Khó khăn, vướng mắc */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
        <label className="text-xs font-black uppercase text-slate-700 tracking-wider block">
          SECTION 3: KHÓ KHĂN, VƯỚNG MẮC
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

      {/* 6. SECTION 4: Đề xuất hỗ trợ */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
        <label className="text-xs font-black uppercase text-slate-700 tracking-wider block">
          SECTION 4: ĐỀ XUẤT HỖ TRỢ
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

      {/* 7. Bottom Bar: Lần lưu nháp gần nhất & Action Buttons */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-400">
          Lần lưu nháp gần nhất: <strong>{lastSavedAt}</strong>
        </span>

        {!isReadOnly ? (
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveDraft(false)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all border-none cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu nháp'}
            </button>

            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 active:scale-95 transition-all border-none cursor-pointer"
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

      {/* Modal Xác nhận nộp báo cáo */}
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
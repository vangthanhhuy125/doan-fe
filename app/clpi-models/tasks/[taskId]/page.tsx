'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Save,
  FileText,
  Link as LinkIcon,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import CreateEvidenceModal from '../components/CreateEvidenceModal';

interface EvidenceItem {
  id: string;
  title: string;
  type: 'file' | 'url';
  url?: string;
  fileSize?: string;
  createdAt: string;
}

interface TaskDetail {
  id: string;
  taskNumber?: string;
  title: string;
  activityName?: string;
  shortDescription?: string;
  assignedBy: string;
  primaryAssignee: string;
  deadline: string;
  indicators: string[];
  progress: number;
  description: string;
  expectedOutputs: string[];
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  evidences: EvidenceItem[];
}

const formatDisplayDate = (val?: string): string => {
  if (!val) return '—';
  const trimmed = String(val).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) return trimmed;
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const [y, m, d] = trimmed.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }
  return trimmed;
};

const normalizeStatus = (val?: string): TaskDetail['status'] => {
  const lower = String(val || 'not_started').toLowerCase();
  if (lower === 'in_progress' || lower === 'completed' || lower === 'cancelled') return lower;
  return 'not_started';
};

export default function TaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  const resolvedParams = use(params);
  const taskId = resolvedParams.taskId;

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [progressVal, setProgressVal] = useState<number>(0);
  const [initialProgress, setInitialProgress] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidenceToDelete, setEvidenceToDelete] = useState<EvidenceItem | null>(null);

  const getHeaders = (withJson = false) => {
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
    if (withJson) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (userId) headers['x-user-id'] = userId;
    return headers;
  };

  const fetchTaskDetail = async () => {
    setLoading(true);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const res = await fetch(`${apiUrl}/clpi/tasks/${taskId}`, {
        headers: getHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        const prog = Number(data.progress || 0);
        setTask({
          id: String(data.id || data._id || taskId),
          taskNumber: data.taskNumber || '',
          title: data.title || '',
          activityName: data.activityName || '',
          shortDescription: data.shortDescription || '',
          assignedBy: data.assignedBy || data.assignedByName || 'Ban Thường vụ Đoàn Khoa',
          primaryAssignee: data.primaryAssignee || data.primaryAssigneeName || '—',
          deadline: formatDisplayDate(data.deadline || data.deadlineIso),
          indicators: Array.isArray(data.indicators) ? data.indicators : [],
          progress: prog,
          description: data.description || '',
          expectedOutputs: Array.isArray(data.expectedOutputs) ? data.expectedOutputs : [],
          status: normalizeStatus(data.status),
          evidences: Array.isArray(data.evidences)
            ? data.evidences.map((e: any) => ({
                id: String(e.id || e._id),
                title: e.title || '',
                type: e.type || 'file',
                url: e.url || '',
                fileSize: e.fileSize || '',
                createdAt: e.createdAt || '',
              }))
            : [],
        });
        setProgressVal(prog);
        setInitialProgress(prog);
      } else {
        setTask(null);
      }
    } catch {
      setTask(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetail();
  }, [taskId]);

  const hasProgressChanged = progressVal !== initialProgress;

  const handleSaveProgress = async () => {
    if (!task || !hasProgressChanged || saving) return;

    if (progressVal === 100 && task.status !== 'completed') {
      const confirmComplete = confirm(
        'Tiến độ đạt 100%. Bạn có muốn đánh dấu công việc này là "Hoàn thành" không?'
      );
      if (!confirmComplete) return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const nextStatus =
        progressVal === 100 ? 'COMPLETED' : progressVal > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';

      const res = await fetch(`${apiUrl}/clpi/tasks/${task.id}/progress`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({
          progress: progressVal,
          status: nextStatus,
        }),
      });

      if (res.ok) {
        setInitialProgress(progressVal);
        setTask({
          ...task,
          progress: progressVal,
          status: normalizeStatus(nextStatus),
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.message || 'Lưu tiến độ thất bại!');
      }
    } catch {
      setErrorMsg('Không thể kết nối đến máy chủ!');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvidence = async (evidence: EvidenceItem) => {
    if (!task) return;
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const res = await fetch(`${apiUrl}/clpi/evidences/${evidence.id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (res.ok) {
        setTask({
          ...task,
          evidences: task.evidences.filter((e) => e.id !== evidence.id),
        });
        setEvidenceToDelete(null);
      } else {
        alert('Gỡ minh chứng thất bại!');
      }
    } catch {
      alert('Lỗi kết nối máy chủ!');
    }
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center bg-white rounded-3xl border border-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-3xl mx-auto p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <AlertCircle size={32} className="text-slate-400 mx-auto" />
        <h2 className="text-lg font-black text-slate-800">Không tìm thấy thông tin công việc</h2>
        <Link
          href="/clpi-models/tasks"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0054a5] text-white text-xs font-bold rounded-2xl no-underline"
        >
          <ArrowLeft size={14} /> Quay lại danh sách công việc
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 text-slate-800 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
        <Link
          href="/clpi-models/tasks"
          className="text-slate-500 hover:text-[#0054a5] transition-colors no-underline"
        >
          Công việc của tôi
        </Link>
        <ChevronRight size={14} />
        <span className="text-slate-900">
          Chi tiết nhiệm vụ {task.taskNumber ? `#${task.taskNumber}` : ''}
        </span>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Đã lưu cập nhật tiến độ công việc thành công!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 flex items-center gap-2 animate-in slide-in-from-top-2">
          <AlertCircle size={16} className="text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          {task.activityName && (
            <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-[#0054a5] border border-blue-200">
              {task.activityName}
            </span>
          )}
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {task.title}
          </h1>
          {task.shortDescription && (
            <p className="text-xs sm:text-sm text-slate-500 font-medium">{task.shortDescription}</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSaveProgress}
          disabled={!hasProgressChanged || saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 active:scale-95 transition-all border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 self-start md:self-auto"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>Lưu thay đổi</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase text-slate-400">Người giao</p>
          <p className="text-sm font-extrabold text-slate-800 mt-1">{task.assignedBy}</p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase text-slate-400">Cán bộ chính</p>
          <p className="text-sm font-extrabold text-slate-800 mt-1">{task.primaryAssignee}</p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase text-slate-400">Hạn hoàn thành</p>
          <p className="text-sm font-black text-rose-600 mt-1">{task.deadline}</p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase text-slate-400">Chỉ số liên quan</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {task.indicators.length > 0 ? (
              task.indicators.map((ind) => (
                <span
                  key={ind}
                  className="px-2 py-0.5 rounded-md text-[11px] font-black bg-blue-50 text-[#0054a5] border border-blue-200"
                >
                  {ind}
                </span>
              ))
            ) : (
              <span className="text-xs font-semibold text-slate-400">—</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase text-slate-700 tracking-wider">
            Cập nhật tiến độ hoàn thành:
          </label>
          <span className="text-2xl font-black text-[#0054a5]">{progressVal}%</span>
        </div>

        <div className="relative pt-1">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={progressVal}
            onChange={(e) => setProgressVal(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0054a5]"
          />
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-0.5">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
            Mô tả công việc & Yêu cầu
          </h3>
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
            {task.description || 'Chưa có mô tả chi tiết.'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
            Sản phẩm đầu ra dự kiến
          </h3>
          {task.expectedOutputs.length > 0 ? (
            <ul className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2 list-disc list-inside text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              {task.expectedOutputs.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs text-slate-400 italic">
              Chưa liệt kê sản phẩm đầu ra cụ thể.
            </div>
          )}
        </div>
      </div>

      <div
        id="evidences"
        className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
            Minh chứng đã đính kèm ({task.evidences.length})
          </h3>

          <button
            type="button"
            onClick={() => setIsEvidenceModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-[#0054a5] text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all border-none cursor-pointer active:scale-95"
          >
            <Plus size={14} /> Thêm minh chứng
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {task.evidences.map((evi) => (
            <div
              key={evi.id}
              className="p-4 bg-slate-50/80 hover:bg-blue-50/40 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-[#0054a5]">
                  {evi.type === 'file' ? <FileText size={20} /> : <LinkIcon size={20} />}
                </div>
                <div className="min-w-0">
                  {evi.type === 'url' ? (
                    <a
                      href={evi.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#0054a5] hover:underline truncate block"
                    >
                      {evi.title}
                    </a>
                  ) : (
                    <p className="text-xs font-bold text-slate-800 truncate">{evi.title}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {evi.fileSize || 'Tài liệu'} {evi.createdAt ? `• ${evi.createdAt}` : ''}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEvidenceToDelete(evi)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer shrink-0"
                title="Gỡ minh chứng này"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {task.evidences.length === 0 && (
            <div className="col-span-2 py-8 text-center text-xs text-slate-400 font-semibold italic">
              Chưa có minh chứng nào được liên kết với nhiệm vụ này.
            </div>
          )}
        </div>
      </div>

      {isEvidenceModalOpen && (
        <CreateEvidenceModal
          tasks={[{ id: task.id, title: task.title, activityName: task.activityName }]}
          preselectedTaskId={task.id}
          onClose={() => setIsEvidenceModalOpen(false)}
          onCreated={fetchTaskDetail}
        />
      )}

      {evidenceToDelete && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">Xác nhận gỡ minh chứng?</h4>
              <p className="text-xs text-slate-500 mt-1 font-medium truncate">
                {evidenceToDelete.title}
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEvidenceToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold border-none cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleDeleteEvidence(evidenceToDelete)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer shadow-md shadow-rose-200"
              >
                Xác nhận gỡ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
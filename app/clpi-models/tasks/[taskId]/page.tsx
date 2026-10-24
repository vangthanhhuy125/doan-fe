'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Save, Calendar, User, Clock, 
  FileText, Link as LinkIcon, Trash2, Plus, 
  CheckCircle2, AlertCircle, Loader2, ExternalLink, Download
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
  taskNumber: string;
  title: string;
  activityName?: string;
  shortDescription?: string;
  assignedBy: string;
  primaryAssignee: string;
  deadline: string;
  indicators: string[]; // WPI, LEI, CEI, SDI
  progress: number;
  description: string;
  expectedOutputs: string[];
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  evidences: EvidenceItem[];
}

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

  // Modal tạo minh chứng & xóa minh chứng
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidenceToDelete, setEvidenceToDelete] = useState<EvidenceItem | null>(null);

  // Mock dữ liệu chuẩn theo mockup BRD
  const mockTaskData: TaskDetail = {
    id: taskId || 'task_01',
    taskNumber: '3',
    title: 'Tổ chức Tập huấn Lập trình GamApp 2026',
    activityName: 'Mùa Hè Xanh 2026',
    shortDescription: 'Phụ trách nội dung giảng dạy và tài liệu chuyên môn cho học viên.',
    assignedBy: 'Bí thư Đoàn Khoa',
    primaryAssignee: 'Nguyễn Văn A',
    deadline: '20/08/2026',
    indicators: ['WPI', 'LEI'],
    progress: 80,
    description: 'Xây dựng chương trình 03 buổi tập huấn lập trình Game Mini bằng React & Canvas cho hội viên. Chuẩn bị slide, code mẫu và chấm bài tập cuối khóa.',
    expectedOutputs: [
      'Bộ tài liệu giảng dạy 3 buổi bài giảng',
      'Đường dẫn Google Drive tổng hợp bài nộp',
      'Báo cáo sĩ số và kết quả đánh giá học viên'
    ],
    status: 'in_progress',
    evidences: [
      {
        id: 'evi_01',
        title: 'Kế_hoạch_Tập_huấn_GamApp_2026.pdf',
        type: 'file',
        fileSize: '2.4 MB',
        createdAt: '12/08/2026'
      },
      {
        id: 'evi_02',
        title: 'https://drive.google.com/folderview?id=gamapp_2026_uit',
        type: 'url',
        url: 'https://drive.google.com/folderview?id=gamapp_2026_uit',
        fileSize: 'Google Drive',
        createdAt: '14/08/2026'
      }
    ]
  };

  const fetchTaskDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clpi/tasks/${taskId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const data = await res.json();
        setTask(data);
        setProgressVal(data.progress || 0);
        setInitialProgress(data.progress || 0);
      } else {
        setTask(mockTaskData);
        setProgressVal(mockTaskData.progress);
        setInitialProgress(mockTaskData.progress);
      }
    } catch (e) {
      setTask(mockTaskData);
      setProgressVal(mockTaskData.progress);
      setInitialProgress(mockTaskData.progress);
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
      const confirmComplete = confirm('Tiến độ đạt 100%. Bạn có muốn đánh dấu công việc này là "Hoàn thành" không?');
      if (!confirmComplete) return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clpi/tasks/${task.id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          progress: progressVal,
          status: progressVal === 100 ? 'completed' : task.status
        })
      });

      if (res.ok) {
        setInitialProgress(progressVal);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const err = await res.json();
        setErrorMsg(err.message || 'Lưu tiến độ thất bại!');
      }
    } catch (e) {
      setErrorMsg('Không thể kết nối đến máy chủ!');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvidence = async (evidence: EvidenceItem) => {
    if (!task) return;
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clpi/evidences/${evidence.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.ok) {
        setTask({
          ...task,
          evidences: task.evidences.filter(e => e.id !== evidence.id)
        });
        setEvidenceToDelete(null);
      } else {
        alert('Gỡ minh chứng thất bại!');
      }
    } catch (e) {
      alert('Lỗi kết nối máy chủ!');
    }
  };

  if (loading || !task) {
    return (
      <div className="flex h-72 items-center justify-center bg-white rounded-3xl border border-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 text-slate-800 animate-in fade-in duration-200">
      {/* 1. Breadcrumb điều hướng */}
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
        <Link href="/clpi-models/tasks" className="text-slate-500 hover:text-[#0054a5] transition-colors no-underline">
          Công việc của tôi
        </Link>
        <ChevronRight size={14} />
        <span className="text-slate-900">Chi tiết nhiệm vụ #{task.taskNumber || task.id}</span>
      </div>

      {/* Thông báo lưu thành công / Lỗi */}
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

      {/* 2. Tiêu đề nhiệm vụ, Tag chương trình & Nút Lưu thay đổi */}
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
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {task.shortDescription}
            </p>
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

      {/* 3. Khối thông tin nhiệm vụ (Read-only) */}
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
          <div className="flex items-center gap-1.5 mt-1">
            {task.indicators.map((ind) => (
              <span key={ind} className="px-2 py-0.5 rounded-md text-[11px] font-black bg-blue-50 text-[#0054a5] border border-blue-200">
                {ind}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Cập nhật tiến độ hoàn thành (Slider 0-100%) */}
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

      {/* 5. Hai khối: Mô tả công việc & Sản phẩm đầu ra dự kiến */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mô tả công việc & Yêu cầu */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
            Mô tả công việc & Yêu cầu
          </h3>
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {task.description}
          </div>
        </div>

        {/* Sản phẩm đầu ra dự kiến */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
            Sản phẩm đầu ra dự kiến
          </h3>
          <ul className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2 list-disc list-inside text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
            {task.expectedOutputs.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 6. Minh chứng đã đính kèm (N) + Nút Thêm minh chứng */}
      <div id="evidences" className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
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

        {/* Danh sách thẻ minh chứng */}
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
                    {evi.fileSize || 'Tài liệu'} • {evi.createdAt}
                  </p>
                </div>
              </div>

              {/* Nút xóa minh chứng */}
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

      {/* Modal Thêm minh chứng */}
      {isEvidenceModalOpen && (
        <CreateEvidenceModal
          tasks={[{ id: task.id, title: task.title, activityName: task.activityName }]}
          preselectedTaskId={task.id}
          onClose={() => setIsEvidenceModalOpen(false)}
          onCreated={fetchTaskDetail}
        />
      )}

      {/* Modal xác nhận gỡ minh chứng */}
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
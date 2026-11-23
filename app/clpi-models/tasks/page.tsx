'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Paperclip,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import CreateEvidenceModal from './components/CreateEvidenceModal';

export interface TaskItem {
  id: string;
  title: string;
  activityId?: string;
  activityName?: string;
  priority: 'high' | 'medium' | 'normal' | 'low';
  deadline: string; // dd/MM/yyyy
  deadlineIso?: string;
  progress: number; // 0 - 100
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  evidenceCount: number;
}

const PRIORITY_CONFIG = {
  high: { label: 'Độ ưu tiên: Cao', style: 'text-rose-600' },
  medium: { label: 'Độ ưu tiên: Trung bình', style: 'text-amber-600' },
  normal: { label: 'Độ ưu tiên: Bình thường', style: 'text-blue-600' },
  low: { label: 'Độ ưu tiên: Thấp', style: 'text-slate-500' },
};

const STATUS_CONFIG = {
  not_started: { label: 'Chưa bắt đầu', style: 'bg-slate-100 text-slate-700 border-slate-200' },
  in_progress: { label: 'Đang thực hiện', style: 'bg-blue-50 text-blue-700 border-blue-200' },
  completed: { label: 'Hoàn thành', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  overdue: { label: 'Quá hạn', style: 'bg-rose-50 text-rose-700 border-rose-200' },
  cancelled: { label: 'Đã hủy', style: 'bg-slate-100 text-slate-400 border-slate-200' },
};

const normalizePriority = (val?: string): TaskItem['priority'] => {
  const lower = String(val || 'normal').toLowerCase();
  if (lower === 'high' || lower === 'medium' || lower === 'low') return lower;
  return 'normal';
};

const normalizeStatus = (val?: string): TaskItem['status'] => {
  const lower = String(val || 'not_started').toLowerCase();
  if (lower === 'in_progress' || lower === 'completed' || lower === 'cancelled') return lower;
  return 'not_started';
};

const formatDisplayDate = (val?: string): string => {
  if (!val) return '---';
  const trimmed = String(val).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) return trimmed;
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const [y, m, d] = trimmed.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }
  return trimmed;
};

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
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

      const res = await fetch(`${apiUrl}/clpi/tasks`, { headers });

      if (res.ok) {
        const data = await res.json();
        const mapped: TaskItem[] = (Array.isArray(data) ? data : []).map((t: any) => {
          const rawDeadline = t.deadline || t.deadlineIso || '';
          const iso =
            t.deadlineIso ||
            (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDeadline)
              ? rawDeadline.split('/').reverse().join('-')
              : String(rawDeadline).slice(0, 10));

          return {
            id: String(t.id || t._id),
            title: t.title || '',
            activityId: t.activityId || '',
            activityName: t.activityName || '',
            priority: normalizePriority(t.priority),
            deadline: formatDisplayDate(rawDeadline),
            deadlineIso: iso,
            progress: Number(t.progress || 0),
            status: normalizeStatus(t.status),
            evidenceCount: Number(t.evidenceCount || 0),
          };
        });
        setTasks(mapped);
      } else {
        setTasks([]);
      }
    } catch (e) {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const isTaskOverdue = (task: TaskItem) => {
    if (task.status === 'completed' || task.status === 'cancelled') return false;
    if (!task.deadlineIso) return false;
    const today = new Date().toISOString().split('T')[0];
    return task.deadlineIso < today;
  };

  const kpiStats = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter(
      (t) => (t.status === 'in_progress' || t.status === 'not_started') && !isTaskOverdue(t)
    ).length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const overdue = tasks.filter((t) => isTaskOverdue(t)).length;
    return { total, inProgress, completed, overdue };
  }, [tasks]);

  const programOptions = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((t) => {
      if (t.activityId && t.activityName) {
        map.set(t.activityId, t.activityName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        const s = searchTerm.toLowerCase().trim();
        const matchSearch =
          !s ||
          t.title.toLowerCase().includes(s) ||
          (t.activityName || '').toLowerCase().includes(s);

        const matchProgram = selectedProgram === 'ALL' || t.activityId === selectedProgram;

        let matchStatus = true;
        const overdue = isTaskOverdue(t);
        if (selectedStatus === 'overdue') {
          matchStatus = overdue;
        } else if (selectedStatus !== 'ALL') {
          matchStatus = !overdue && t.status === selectedStatus;
        }

        return matchSearch && matchProgram && matchStatus;
      })
      .sort((a, b) => (a.deadlineIso || '').localeCompare(b.deadlineIso || ''));
  }, [tasks, searchTerm, selectedProgram, selectedStatus]);

  const hasFilter = searchTerm !== '' || selectedProgram !== 'ALL' || selectedStatus !== 'ALL';

  return (
    <div className="space-y-6 text-slate-800 animate-in fade-in duration-200">
      {/* 1. Header màn hình & Nút Tạo minh chứng */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Công việc của tôi</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Quản lý và cập nhật tiến độ công việc được giao trong các chương trình Đoàn Khoa.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEvidenceModalOpen(true)}
          disabled={tasks.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 active:scale-95 transition-all border-none cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <Plus size={16} /> Tạo minh chứng công việc
        </button>
      </div>

      {/* 2. Hàng 4 Thẻ KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng công việc</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">
            {String(kpiStats.total).padStart(2, '0')}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đang thực hiện</p>
          <h3 className="text-3xl font-black text-[#0054a5] mt-2">
            {String(kpiStats.inProgress).padStart(2, '0')}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hoàn thành</p>
          <h3 className="text-3xl font-black text-emerald-600 mt-2">
            {String(kpiStats.completed).padStart(2, '0')}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quá hạn</p>
          <h3 className="text-3xl font-black text-rose-600 mt-2">
            {String(kpiStats.overdue).padStart(2, '0')}
          </h3>
        </div>
      </div>

      {/* 3. Thanh tìm kiếm và Bộ lọc kết hợp */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tên công việc, chương trình..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="p-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer focus:border-[#0054a5]"
          >
            <option value="ALL">Tất cả chương trình</option>
            {programOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer focus:border-[#0054a5]"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="not_started">Chưa bắt đầu</option>
            <option value="in_progress">Đang thực hiện</option>
            <option value="completed">Hoàn thành</option>
            <option value="overdue">Quá hạn</option>
          </select>

          {hasFilter && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedProgram('ALL');
                setSelectedStatus('ALL');
              }}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl border-none bg-transparent cursor-pointer transition-colors"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 4. Bảng danh sách công việc */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-6">CÔNG VIỆC</th>
                  <th className="py-4 px-4 w-40">CHƯƠNG TRÌNH</th>
                  <th className="py-4 px-4 w-32">DEADLINE</th>
                  <th className="py-4 px-4 w-44">TIẾN ĐỘ</th>
                  <th className="py-4 px-4 w-36 text-center">TRẠNG THÁI</th>
                  <th className="py-4 px-4 w-28 text-center">MINH CHỨNG</th>
                  <th className="py-4 px-6 w-28 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => {
                  const overdue = isTaskOverdue(task);
                  const effectiveStatusKey = overdue ? 'overdue' : task.status;
                  const statusObj = STATUS_CONFIG[effectiveStatusKey] || STATUS_CONFIG.not_started;
                  const priorityObj = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.normal;

                  return (
                    <tr key={task.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-4 px-6">
                        <Link
                          href={`/clpi-models/tasks/${task.id}`}
                          className="font-extrabold text-sm text-slate-900 hover:text-[#0054a5] transition-colors leading-snug no-underline block"
                        >
                          {task.title}
                        </Link>
                        <span className={`text-[11px] font-semibold block mt-0.5 ${priorityObj.style}`}>
                          {priorityObj.label}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-600">
                        {task.activityName || '—'}
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-600 whitespace-nowrap">
                        <span className={overdue ? 'text-rose-600 font-bold' : ''}>
                          {task.deadline}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                task.progress === 100 ? 'bg-emerald-500' : 'bg-[#0054a5]'
                              }`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="font-extrabold text-slate-700 min-w-7">
                            {task.progress}%
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border ${statusObj.style}`}
                        >
                          {statusObj.label}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <Link
                          href={`/clpi-models/tasks/${task.id}#evidences`}
                          className="inline-flex items-center gap-1 font-bold text-slate-500 hover:text-[#0054a5] bg-slate-50 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-all no-underline"
                        >
                          <Paperclip size={13} />
                          <span>{task.evidenceCount}</span>
                        </Link>
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <Link
                          href={`/clpi-models/tasks/${task.id}`}
                          className="font-bold text-[#0054a5] hover:underline flex items-center justify-end gap-1 no-underline"
                        >
                          <span>Chi tiết →</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold italic">
                      {tasks.length === 0
                        ? 'Bạn chưa có công việc nào được phân công.'
                        : 'Không tìm thấy công việc phù hợp với điều kiện tìm kiếm.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isEvidenceModalOpen && (
        <CreateEvidenceModal
          tasks={tasks.map((t) => ({ id: t.id, title: t.title, activityName: t.activityName }))}
          onClose={() => setIsEvidenceModalOpen(false)}
          onCreated={fetchTasks}
        />
      )}
    </div>
  );
}
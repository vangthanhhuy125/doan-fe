'use client';

import { useState } from 'react';
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  RotateCcw,
  Eye,
  Edit3,
  Ban,
  Calendar,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  tasks: any[];
  personnelList: any[];
  programsList: any[];
  cyclesList: any[];
  isLoading: boolean;
  onOpenModal: (mode: 'add' | 'edit' | 'view', data?: any) => void;
  onCancelTask: (task: any) => void;
}

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: 'bg-rose-50 text-rose-600 border-rose-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  NORMAL: 'bg-blue-50 text-[#0054a5] border-blue-200',
  LOW: 'bg-slate-100 text-slate-600 border-slate-200',
};

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: 'Cao',
  MEDIUM: 'Trung bình',
  NORMAL: 'Bình thường',
  LOW: 'Thấp',
};

const INDICATOR_COLORS: Record<string, string> = {
  WPI: 'bg-blue-50 text-blue-700 border-blue-200',
  LEI: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CEI: 'bg-amber-50 text-amber-700 border-amber-200',
  SDI: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function AssignTaskBoard({
  tasks = [],
  personnelList = [],
  programsList = [],
  cyclesList = [],
  isLoading,
  onOpenModal,
  onCancelTask,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCycle, setFilterCycle] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterIndicator, setFilterIndicator] = useState('');

  const getEffectiveStatus = (task: any) => {
    if (task.status === 'CANCELLED') return 'CANCELLED';
    if (task.status === 'COMPLETED') return 'COMPLETED';
    if (task.deadline) {
      const deadlineDate = new Date(task.deadline);
      deadlineDate.setHours(23, 59, 59, 999);
      if (deadlineDate < new Date()) return 'OVERDUE';
    }
    return task.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'NOT_STARTED';
  };

  const formatDate = (val?: string) => {
    if (!val) return '---';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}/${d.getFullYear()}`;
  };

  const validTasks = tasks.filter((t) => t.status !== 'CANCELLED');
  const totalCount = validTasks.length;
  const inProgressCount = validTasks.filter((t) =>
    ['NOT_STARTED', 'IN_PROGRESS', 'OVERDUE'].includes(getEffectiveStatus(t))
  ).length;
  const completedCount = validTasks.filter((t) => getEffectiveStatus(t) === 'COMPLETED').length;
  const overdueCount = validTasks.filter((t) => getEffectiveStatus(t) === 'OVERDUE').length;

  const filteredTasks = tasks.filter((task) => {
    const effectiveStatus = getEffectiveStatus(task);
    const q = searchTerm.toLowerCase().trim();
    const titleMatch = (task.title || '').toLowerCase().includes(q);
    const programNameMatch = (task.activityName || '').toLowerCase().includes(q);
    const assigneeNameMatch = (task.primaryAssigneeName || '').toLowerCase().includes(q);

    const cycleMatch = !filterCycle || String(task.cycleId) === String(filterCycle);
    const assigneeMatch =
      !filterAssignee || String(task.primaryAssigneeId) === String(filterAssignee);
    const programMatch = !filterProgram || String(task.activityId) === String(filterProgram);
    const statusMatch = !filterStatus || effectiveStatus === filterStatus;
    const indicatorMatch =
      !filterIndicator ||
      (Array.isArray(task.indicators) && task.indicators.includes(filterIndicator));

    return (
      (!q || titleMatch || programNameMatch || assigneeNameMatch) &&
      cycleMatch &&
      assigneeMatch &&
      programMatch &&
      statusMatch &&
      indicatorMatch
    );
  });

  const resetFilters = () => {
    setSearchTerm('');
    setFilterCycle('');
    setFilterAssignee('');
    setFilterProgram('');
    setFilterStatus('');
    setFilterIndicator('');
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Hoàn thành
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#0054a5] border border-blue-200">
            Đang thực hiện
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
            Quá hạn
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Chưa bắt đầu
          </span>
        );
    }
  };

  return (
    <section className="space-y-6">
      {/* HEADER QUẢN TRỊ BTV */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#0054a5] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0054a5] rounded-2xl text-white shadow-md shadow-blue-500/20 shrink-0">
            <ClipboardCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black uppercase text-[#0054a5] tracking-tight">
                Điều phối & Giao việc CLPI
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
                <ShieldCheck size={12} /> Ban Thường vụ / Quản trị
              </span>
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Phân công nhiệm vụ cho cán bộ BCH, gắn chỉ số đánh giá CLPI và giám sát tiến độ toàn khoa
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenModal('add')}
          className="bg-[#0054a5] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-95 border-none cursor-pointer shrink-0"
        >
          <Plus size={16} /> <span>Giao công việc mới</span>
        </button>
      </div>

      {/* 4 THẺ KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Tổng việc đã giao</p>
            <p className="text-2xl font-black text-slate-800 mt-1">
              {String(totalCount).padStart(2, '0')}
            </p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <Layers size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Đang triển khai</p>
            <p className="text-2xl font-black text-[#0054a5] mt-1">
              {String(inProgressCount).padStart(2, '0')}
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-[#0054a5] rounded-xl">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Đã hoàn thành</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {String(completedCount).padStart(2, '0')}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Trễ hạn xử lý</p>
            <p className="text-2xl font-black text-rose-600 mt-1">
              {String(overdueCount).padStart(2, '0')}
            </p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* BỘ LỌC */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tên việc, cán bộ..."
            className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0054a5]"
          />
        </div>

        <div className="relative">
          <Filter
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <select
            value={filterCycle}
            onChange={(e) => setFilterCycle(e.target.value)}
            className="w-full pl-10 pr-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0054a5] cursor-pointer"
          >
            <option value="">Tất cả chu kỳ CLPI</option>
            {cyclesList.map((c: any) => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Filter
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="w-full pl-10 pr-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0054a5] cursor-pointer"
          >
            <option value="">Tất cả cán bộ chính</option>
            {personnelList.map((p: any) => (
              <option key={p._id || p.id} value={p._id || p.id}>
                {p.full_name || p.name} ({p.student_id || p.mssv})
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Filter
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="w-full pl-10 pr-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0054a5] cursor-pointer"
          >
            <option value="">Tất cả chương trình</option>
            {programsList.map((prog: any) => (
              <option key={prog._id || prog.id} value={prog._id || prog.id}>
                {prog.title || prog.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Filter
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <select
            value={filterIndicator}
            onChange={(e) => setFilterIndicator(e.target.value)}
            className="w-full pl-10 pr-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0054a5] cursor-pointer"
          >
            <option value="">Tất cả chỉ số CLPI</option>
            <option value="WPI">WPI - Hoàn thành NV</option>
            <option value="LEI">LEI - Điều hành, phối hợp</option>
            <option value="CEI">CEI - Tương tác tổ chức</option>
            <option value="SDI">SDI - Phát triển cá nhân</option>
          </select>
        </div>

        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0054a5] cursor-pointer"
          >
            <option value="">Trạng thái</option>
            <option value="NOT_STARTED">Chưa bắt đầu</option>
            <option value="IN_PROGRESS">Đang thực hiện</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="OVERDUE">Quá hạn</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>

          {(searchTerm ||
            filterCycle ||
            filterAssignee ||
            filterProgram ||
            filterStatus ||
            filterIndicator) && (
            <button
              type="button"
              onClick={resetFilters}
              title="Đặt lại bộ lọc"
              className="p-2.5 bg-white text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 cursor-pointer shrink-0"
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>
      </div>

      {/* BẢNG DANH SÁCH CÔNG VIỆC */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
            <thead className="bg-[#0054a5] text-white font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-4 px-4 w-12 text-center">STT</th>
                <th className="py-4 px-4">Nhiệm vụ & Chương trình</th>
                <th className="py-4 px-4">Cán bộ thực hiện</th>
                <th className="py-4 px-4 text-center">Chỉ số CLPI</th>
                <th className="py-4 px-4 text-center">Deadline</th>
                <th className="py-4 px-4 w-36">Tiến độ</th>
                <th className="py-4 px-4 text-center">Trạng thái</th>
                <th className="py-4 px-4 text-center">Minh chứng</th>
                <th className="py-4 px-4 w-32 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [1, 2, 3].map((n) => (
                  <tr key={n}>
                    <td colSpan={9} className="p-4">
                      <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map((task, idx) => {
                  const status = getEffectiveStatus(task);
                  const progress = Number(task.progress || 0);
                  const evidenceCount = Array.isArray(task.evidences) ? task.evidences.length : 0;
                  const collabCount = Array.isArray(task.collaborators)
                    ? task.collaborators.length
                    : 0;

                  return (
                    <tr
                      key={task._id || task.id || idx}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4 max-w-[270px]">
                        <div className="flex flex-wrap gap-1 mb-1">
                          {task.cycleName && (
                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-[#0054a5] border border-blue-100">
                              {task.cycleName}
                            </span>
                          )}
                          {task.activityName && (
                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {task.activityName}
                            </span>
                          )}
                        </div>
                        <p
                          onClick={() => onOpenModal('view', task)}
                          className="font-extrabold text-slate-800 hover:text-[#0054a5] cursor-pointer leading-snug"
                        >
                          {task.title}
                        </p>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                            PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.NORMAL
                          }`}
                        >
                          Ưu tiên: {PRIORITY_LABELS[task.priority] || 'Bình thường'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">
                          {task.primaryAssigneeName || '---'}
                        </p>
                        {collabCount > 0 && (
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                            + {collabCount} cán bộ phối hợp
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {(task.indicators || []).map((ind: string) => (
                            <span
                              key={ind}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                                INDICATOR_COLORS[ind] || 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {ind}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-600 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={13} className="text-slate-400" />
                          {formatDate(task.deadline)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                progress === 100 ? 'bg-emerald-500' : 'bg-[#0054a5]'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="font-black text-[11px] text-slate-700 w-9 text-right">
                            {progress}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">{renderStatusBadge(status)}</td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                          <Paperclip size={12} /> {evidenceCount}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenModal('view', task)}
                            title="Xem chi tiết nhiệm vụ"
                            className="p-2 text-[#0054a5] hover:bg-blue-100 rounded-xl border-none bg-transparent cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>

                          {status !== 'CANCELLED' && (
                            <button
                              type="button"
                              onClick={() => onOpenModal('edit', task)}
                              title="Chỉnh sửa giao việc"
                              className="p-2 text-amber-600 hover:bg-amber-100 rounded-xl border-none bg-transparent cursor-pointer"
                            >
                              <Edit3 size={15} />
                            </button>
                          )}

                          {status !== 'CANCELLED' && status !== 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => onCancelTask(task)}
                              title="Hủy công việc"
                              className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl border-none bg-transparent cursor-pointer"
                            >
                              <Ban size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-400 italic font-bold">
                    {tasks.length === 0
                      ? 'Chưa có công việc CLPI nào được giao. Nhấn "+ Giao công việc mới" để bắt đầu.'
                      : 'Không tìm thấy công việc phù hợp với điều kiện lọc.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
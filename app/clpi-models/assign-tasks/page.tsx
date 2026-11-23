'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import AssignTaskBoard from './components/AssignTaskBoard';
import AssignTaskModal from './components/AssignTaskModal';

export default function ClpiAssignTasksAdminPage() {
  const router = useRouter();
  const { isLoading: isPermLoading, isAdmin, canCreate, canEdit } = usePermissions('mo-hinh-clb');

  // Chỉ BTV / Quản trị / Người có quyền tạo hoặc sửa trong phân hệ CLPI mới được truy cập
  const canManageTasks = isAdmin || canCreate || canEdit;

  const [tasks, setTasks] = useState<any[]>([]);
  const [personnelList, setPersonnelList] = useState<any[]>([]);
  const [programsList, setProgramsList] = useState<any[]>([]);
  const [cyclesList, setCyclesList] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [modal, setModal] = useState<{
    open: boolean;
    mode: 'add' | 'edit' | 'view';
    data: any;
  }>({ open: false, mode: 'add', data: null });

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

  const fetchAllData = async () => {
    setIsLoadingData(true);
    try {
      const [tasksRes, usersRes, programsRes, cyclesRes] = await Promise.all([
        fetch(`${apiUrl}/clpi-tasks`).catch(() => null),
        fetch(`${apiUrl}/nhan-su`).catch(() => null),
        fetch(`${apiUrl}/annual-programs`).catch(() => null),
        fetch(`${apiUrl}/clpi-cycles`).catch(() => null),
      ]);

      if (tasksRes && tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(Array.isArray(data) ? data : []);
      }
      if (usersRes && usersRes.ok) {
        const data = await usersRes.json();
        setPersonnelList(Array.isArray(data) ? data : []);
      }
      if (programsRes && programsRes.ok) {
        const data = await programsRes.json();
        setProgramsList(Array.isArray(data) ? data : []);
      }
      if (cyclesRes && cyclesRes.ok) {
        const data = await cyclesRes.json();
        setCyclesList(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu điều phối công việc CLPI:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (!isPermLoading && canManageTasks) {
      fetchAllData();
    }
  }, [isPermLoading, canManageTasks]);

  if (isPermLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-[#0054a5] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-400">Đang xác thực quyền Ban Thường vụ / Quản trị...</span>
      </div>
    );
  }

  // Chặn cán bộ thường đi thẳng bằng URL /clpi-models/assign-tasks
  if (!canManageTasks) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-rose-100 shadow-xl px-6 py-8 sm:px-10 text-center space-y-5">
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
            <ShieldAlert size={40} />
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3.5 py-1 bg-rose-50 text-rose-600 text-[11px] font-black uppercase tracking-widest rounded-full">
              Khu vực Ban Thường vụ & Quản trị
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 sm:whitespace-nowrap">
              Bạn không có quyền giao và điều phối công việc
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-medium">
              Chức năng này chỉ dành cho Ban Thường vụ, Trưởng đơn vị hoặc Quản trị viên CLPI.
              Vui lòng truy cập mục Công việc của tôi để xem các nhiệm vụ được giao.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/clpi-models/tasks')}
              className="flex-1 py-3 px-4 bg-[#0054a5] hover:bg-blue-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border-none cursor-pointer shadow-md shadow-blue-200 transition-all"
            >
              <ArrowLeft size={15} /> Về Công việc của tôi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleOpenModal = (mode: 'add' | 'edit' | 'view', data: any = null) => {
    setModal({ open: true, mode, data });
  };

  const handleSaveTask = async (payload: any) => {
    const isAdd = modal.mode === 'add';
    const taskId = payload._id || payload.id;
    const url = isAdd ? `${apiUrl}/clpi-tasks` : `${apiUrl}/clpi-tasks/${taskId}`;

    const res = await fetch(url, {
      method: isAdd ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error('Không thể lưu công việc. Vui lòng kiểm tra kết nối máy chủ.');
    }

    setModal({ open: false, mode: 'add', data: null });
    await fetchAllData();
  };

  const handleCancelTask = async (task: any) => {
    const confirmed = window.confirm(
      `Xác nhận hủy công việc "${task.title}"? Nhiệm vụ đã hủy sẽ không tính vào điểm CLPI.`
    );
    if (!confirmed) return;

    const taskId = task._id || task.id;
    try {
      const res = await fetch(`${apiUrl}/clpi-tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: 'CANCELLED' }),
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch {
      alert('Không thể hủy công việc lúc này.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-black">
      <AssignTaskBoard
        tasks={tasks}
        personnelList={personnelList}
        programsList={programsList}
        cyclesList={cyclesList}
        isLoading={isLoadingData}
        onOpenModal={handleOpenModal}
        onCancelTask={handleCancelTask}
      />

      {modal.open && (
        <AssignTaskModal
          mode={modal.mode}
          data={modal.data}
          personnelList={personnelList}
          programsList={programsList}
          cyclesList={cyclesList}
          onClose={() => setModal({ ...modal, open: false })}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}
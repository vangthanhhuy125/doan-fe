'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CycleItem, UnitOption, WeightProfileOption, formatDateVN } from './types';
import CyclesTableSection from './components/CyclesTableSection';
import CreateCycleWizardModal from './components/CreateCycleWizardModal';
import CycleDetailModal from './components/CycleDetailModal';

export default function CyclesManagementPage() {
  const [cycles, setCycles] = useState<CycleItem[]>([]);
  const [availableUnits, setAvailableUnits] = useState<UnitOption[]>([]);
  const [weightProfiles, setWeightProfiles] = useState<WeightProfileOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [detailCycle, setDetailCycle] = useState<CycleItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
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

  const fetchCyclesAndUnits = async () => {
    setLoading(true);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const headers = getHeaders();

      const [cyclesRes, personnelRes, indicatorsRes] = await Promise.all([
        fetch(`${apiUrl}/clpi/cycles`, { headers }),
        fetch(`${apiUrl}/clpi/personnel`, { headers }),
        fetch(`${apiUrl}/clpi/indicators`, { headers }).catch(() => null),
      ]);

      let unitList: UnitOption[] = [];
      let totalUsersCount = 0;

      if (personnelRes.ok) {
        const users = await personnelRes.json();
        const validUsers = Array.isArray(users) ? users : [];
        totalUsersCount = validUsers.length;
        const map = new Map<string, number>();
        validUsers.forEach((u: any) => {
          const unitName = String(u.unit || '').trim() || 'Đoàn Khoa CNPM';
          map.set(unitName, (map.get(unitName) || 0) + 1);
        });
        unitList = Array.from(map.entries()).map(([name, officers], idx) => ({
          id: `unit_${idx}`,
          name,
          officers,
        }));
        setAvailableUnits(unitList);
      }

      if (indicatorsRes && indicatorsRes.ok) {
        const indData = await indicatorsRes.json();
        const dbProfiles: WeightProfileOption[] = Array.isArray(indData?.profiles)
          ? indData.profiles
          : [];
        if (dbProfiles.length > 0) {
          setWeightProfiles(dbProfiles);
        } else {
          setWeightProfiles([
            {
              id: 'current_active',
              title: 'Cấu hình trọng số đang áp dụng của hệ thống',
              weights: indData?.weights || { WPI: 40, LEI: 25, CEI: 20, SDI: 15 },
            },
          ]);
        }
      }

      if (cyclesRes.ok) {
        const data = await cyclesRes.json();
        const mapped: CycleItem[] = (Array.isArray(data) ? data : []).map((c: any) => {
          const cycleUnits: string[] = Array.isArray(c.units) ? c.units : [];
          const officersInUnits =
            cycleUnits.length > 0
              ? unitList
                  .filter((u) => cycleUnits.includes(u.name))
                  .reduce((sum, u) => sum + u.officers, 0)
              : totalUsersCount;

          return {
            id: String(c.id || c._id),
            name: c.name || '',
            quarter: c.quarter || '',
            year: Number(c.year || new Date().getFullYear()),
            startDate: formatDateVN(c.startDate || ''),
            endDate: formatDateVN(c.endDate || ''),
            selfDeadline: formatDateVN(c.selfDeadline || ''),
            reviewDeadline: formatDateVN(c.reviewDeadline || ''),
            totalOfficers: Number(c.totalOfficers ?? officersInUnits),
            units: cycleUnits,
            weights: c.weights || { WPI: 40, LEI: 25, CEI: 20, SDI: 15 },
            status: c.status || 'OPEN',
          };
        });
        setCycles(mapped);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCyclesAndUnits();
  }, []);

  const handleCreateCycle = async (payload: any) => {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
    const res = await fetch(`${apiUrl}/clpi/cycles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error('Không thể khởi tạo chu kỳ đánh giá.');
    }

    setIsWizardOpen(false);
    await fetchCyclesAndUnits();
    showToast(`Đã khởi tạo và mở "${payload.name}" thành công!`);
  };

  const handleLockCycle = async (cycle: CycleItem) => {
    if (
      !confirm(
        `Bạn có chắc chắn muốn khóa "${cycle.name}"? Sau khi khóa, cán bộ không thể chỉnh sửa hồ sơ của kỳ này.`
      )
    ) {
      return;
    }
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const res = await fetch(`${apiUrl}/clpi/cycles/${cycle.id}/lock`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      if (res.ok) {
        await fetchCyclesAndUnits();
        showToast(`Đã khóa ${cycle.name}!`);
      }
    } catch {
      alert('Không thể khóa chu kỳ lúc này.');
    }
  };

  const handleDeleteCycle = async (cycle: CycleItem) => {
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn "${cycle.name}"? Hành động này không thể hoàn tác.`
      )
    ) {
      return;
    }
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const res = await fetch(`${apiUrl}/clpi/cycles/${cycle.id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        await fetchCyclesAndUnits();
        showToast(`Đã xóa ${cycle.name}!`);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Không thể xóa chu kỳ này.');
      }
    } catch {
      alert('Lỗi kết nối máy chủ khi xóa chu kỳ.');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 text-slate-800">
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[160] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold text-white bg-emerald-600 animate-in slide-in-from-top-4">
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      <CyclesTableSection
        cycles={cycles}
        loading={loading}
        onOpenCreate={() => setIsWizardOpen(true)}
        onViewDetail={(cycle) => setDetailCycle(cycle)}
        onLockCycle={handleLockCycle}
        onDeleteCycle={handleDeleteCycle}
      />

      {isWizardOpen && (
        <CreateCycleWizardModal
          availableUnits={availableUnits}
          weightProfiles={weightProfiles}
          onClose={() => setIsWizardOpen(false)}
          onSubmit={handleCreateCycle}
        />
      )}

      {detailCycle && (
        <CycleDetailModal cycle={detailCycle} onClose={() => setDetailCycle(null)} />
      )}
    </div>
  );
}
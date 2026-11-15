'use client';

import { useState } from 'react';
import { 
  PlusCircle, Lock, Search, X, Check, 
  ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2,
  Calendar, Users, Layers, AlertCircle
} from 'lucide-react';

interface CycleItem {
  id: string;
  name: string;
  quarter: string;
  year: number;
  startDate: string;
  endDate: string;
  selfDeadline: string;
  reviewDeadline: string;
  totalOfficers: number;
  units?: string[];
  weights?: { WPI: number; LEI: number; CEI: number; SDI: number };
  status: 'OPEN' | 'REVIEWING' | 'COMPLETED' | 'LOCKED';
}

const AVAILABLE_UNITS = [
  { id: 'ktpm2025_1', name: 'Chi đoàn KTPM2025.1', officers: 6 },
  { id: 'ktpm2024_1', name: 'Chi đoàn KTPM2024.1', officers: 8 },
  { id: 'ban_hocthuat', name: 'Ban Học thuật', officers: 10 },
  { id: 'ban_phongtrao', name: 'Ban Phong trào', officers: 9 },
  { id: 'clb_gamapp', name: 'CLB GamApp', officers: 9 },
];

const WEIGHT_PROFILES = [
  {
    id: 'default_faculty',
    name: 'Bộ trọng số Chuẩn Đoàn Khoa (Khuyên dùng)',
    weights: { WPI: 40, LEI: 25, CEI: 20, SDI: 15 },
  },
  {
    id: 'branch_leaders',
    name: 'Bộ trọng số Bí thư Chi đoàn',
    weights: { WPI: 35, LEI: 30, CEI: 25, SDI: 10 },
  },
  {
    id: 'academic_team',
    name: 'Bộ trọng số Ban Học thuật & Kỹ thuật',
    weights: { WPI: 45, LEI: 20, CEI: 15, SDI: 20 },
  },
];

const formatDateVN = (isoDate: string) => {
  if (!isoDate || !isoDate.includes('-')) return isoDate;
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
};

export default function CyclesManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cycles, setCycles] = useState<CycleItem[]>([
    {
      id: 'cycle_q2_2026',
      name: 'Chu kỳ CLPI Quý II/2026',
      quarter: 'Quý II',
      year: 2026,
      startDate: '01/04/2026',
      endDate: '30/06/2026',
      selfDeadline: '30/06/2026',
      reviewDeadline: '10/07/2026',
      totalOfficers: 42,
      units: ['Chi đoàn KTPM2025.1', 'Chi đoàn KTPM2024.1', 'Ban Học thuật', 'Ban Phong trào', 'CLB GamApp'],
      weights: { WPI: 40, LEI: 25, CEI: 20, SDI: 15 },
      status: 'OPEN',
    },
    {
      id: 'cycle_q1_2026',
      name: 'Chu kỳ CLPI Quý I/2026',
      quarter: 'Quý I',
      year: 2026,
      startDate: '01/01/2026',
      endDate: '31/03/2026',
      selfDeadline: '31/03/2026',
      reviewDeadline: '10/04/2026',
      totalOfficers: 40,
      units: ['Chi đoàn KTPM2025.1', 'Chi đoàn KTPM2024.1', 'Ban Học thuật', 'Ban Phong trào'],
      weights: { WPI: 40, LEI: 25, CEI: 20, SDI: 15 },
      status: 'LOCKED',
    },
    {
      id: 'cycle_q4_2025',
      name: 'Chu kỳ CLPI Quý IV/2025',
      quarter: 'Quý IV',
      year: 2025,
      startDate: '01/10/2025',
      endDate: '31/12/2025',
      selfDeadline: '31/12/2025',
      reviewDeadline: '10/01/2026',
      totalOfficers: 38,
      units: ['Chi đoàn KTPM2024.1', 'Ban Học thuật', 'Ban Phong trào'],
      weights: { WPI: 40, LEI: 25, CEI: 20, SDI: 15 },
      status: 'LOCKED',
    },
  ]);

  // State Pop-up Thiết lập chu kỳ mới
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [wizardError, setWizardError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: 'Chu kỳ CLPI Quý III/2026',
    quarter: 'Quý III',
    year: 2026,
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    selfDeadline: '2026-09-30',
    reviewDeadline: '2026-10-10',
    weightProfileId: 'default_faculty',
    selectedUnitIds: AVAILABLE_UNITS.map((u) => u.id),
  });

  // State Pop-up Chi tiết chu kỳ & Toast thông báo
  const [detailCycle, setDetailCycle] = useState<CycleItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const openWizardModal = () => {
    setStep(1);
    setWizardError(null);
    setIsWizardOpen(true);
  };

  const toggleUnit = (unitId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedUnitIds: prev.selectedUnitIds.includes(unitId)
        ? prev.selectedUnitIds.filter((id) => id !== unitId)
        : [...prev.selectedUnitIds, unitId],
    }));
  };

  const handleNextStep = () => {
    setWizardError(null);
    if (step === 1) {
      if (!formData.name.trim()) {
        setWizardError('Vui lòng nhập tên chu kỳ đánh giá!');
        return;
      }
      if (!formData.startDate || !formData.endDate || !formData.selfDeadline || !formData.reviewDeadline) {
        setWizardError('Vui lòng chọn đầy đủ các mốc thời gian của chu kỳ!');
        return;
      }
      if (formData.endDate < formData.startDate) {
        setWizardError('Ngày kết thúc quý không được nhỏ hơn ngày bắt đầu!');
        return;
      }
    }
    if (step === 2 && formData.selectedUnitIds.length === 0) {
      setWizardError('Vui lòng chọn ít nhất 01 đơn vị tham gia chu kỳ đánh giá!');
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const handlePrevStep = () => {
    setWizardError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleFinishWizard = () => {
    const chosenUnits = AVAILABLE_UNITS.filter((u) => formData.selectedUnitIds.includes(u.id));
    const totalOfficers = chosenUnits.reduce((sum, u) => sum + u.officers, 0);
    const chosenProfile = WEIGHT_PROFILES.find((p) => p.id === formData.weightProfileId) || WEIGHT_PROFILES[0];

    const newCycle: CycleItem = {
      id: `cycle_${Date.now()}`,
      name: formData.name.trim(),
      quarter: formData.quarter,
      year: Number(formData.year),
      startDate: formatDateVN(formData.startDate),
      endDate: formatDateVN(formData.endDate),
      selfDeadline: formatDateVN(formData.selfDeadline),
      reviewDeadline: formatDateVN(formData.reviewDeadline),
      totalOfficers,
      units: chosenUnits.map((u) => u.name),
      weights: chosenProfile.weights,
      status: 'OPEN',
    };

    setCycles((prev) => [newCycle, ...prev]);
    setIsWizardOpen(false);
    showToast(`Đã khởi tạo và mở "${newCycle.name}" thành công!`);
  };

  const handleLockCycle = (cycle: CycleItem) => {
    if (!confirm(`Bạn có chắc chắn muốn khóa "${cycle.name}"? Sau khi khóa, cán bộ không thể chỉnh sửa hồ sơ của kỳ này.`)) {
      return;
    }
    setCycles((prev) =>
      prev.map((c) => (c.id === cycle.id ? { ...c, status: 'LOCKED' } : c))
    );
    showToast(`Đã khóa ${cycle.name}!`);
  };

  const getStatusBadge = (status: CycleItem['status']) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
            Đang diễn ra
          </span>
        );
      case 'REVIEWING':
        return (
          <span className="inline-block px-3 py-1 bg-blue-50 text-[#0054a5] border border-blue-200 rounded-full text-xs font-bold">
            Đang thẩm định
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-bold">
            Đã công bố
          </span>
        );
      case 'LOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-bold">
            <Lock size={12} /> Đã khóa
          </span>
        );
    }
  };

  const filtered = cycles.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedWeightProfile = WEIGHT_PROFILES.find((p) => p.id === formData.weightProfileId) || WEIGHT_PROFILES[0];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 text-slate-800">
      {/* Toast thông báo */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[160] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold text-white bg-emerald-600 animate-in slide-in-from-top-4">
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Chu kỳ Đánh giá</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Thiết lập mốc thời gian, đối tượng tham gia và điều phối trạng thái chu kỳ CLPI.
          </p>
        </div>

        <button
          type="button"
          onClick={openWizardModal}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all border-none cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <PlusCircle size={16} /> Thiết lập chu kỳ mới
        </button>
      </div>

      {/* Bảng danh sách các chu kỳ */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm chu kỳ theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0054a5]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="text-[11px] text-slate-400 font-bold uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="py-4 px-6">TÊN CHU KỲ</th>
                <th className="py-4 px-4">THỜI GIAN ĐÁNH GIÁ</th>
                <th className="py-4 px-4">HẠN TỰ CHẤM</th>
                <th className="py-4 px-4 text-center">CÁN BỘ</th>
                <th className="py-4 px-4 text-center">TRẠNG THÁI</th>
                <th className="py-4 px-6 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((cycle) => (
                <tr key={cycle.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-extrabold text-sm text-slate-900 leading-snug">{cycle.name}</p>
                    <span className="text-[11px] text-slate-400">
                      Năm học: {cycle.year} - {cycle.year + 1}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-semibold">
                    {cycle.startDate} — {cycle.endDate}
                  </td>
                  <td className="py-4 px-4 font-bold text-rose-600">
                    {cycle.selfDeadline}
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-slate-800">
                    {cycle.totalOfficers}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {getStatusBadge(cycle.status)}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setDetailCycle(cycle)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border-none cursor-pointer transition-colors"
                    >
                      Chi tiết
                    </button>
                    {cycle.status === 'OPEN' && (
                      <button
                        type="button"
                        onClick={() => handleLockCycle(cycle)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 cursor-pointer transition-colors"
                      >
                        Khóa chu kỳ
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POP-UP MODAL: THIẾT LẬP CHU KỲ ĐÁNH GIÁ MỚI (WIZARD 4 BƯỚC) */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="bg-[#0054a5] px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Thiết lập Chu kỳ Đánh giá mới
                </h2>
                <p className="text-[11px] text-blue-100 font-medium mt-0.5">
                  Cấu hình 4 bước theo quy trình kiểm soát chu kỳ CLPI của Ban Thường vụ
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsWizardOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-full text-white border-none bg-transparent cursor-pointer transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Thanh Stepper 4 bước */}
            <div className="bg-slate-50/90 border-b border-slate-200/80 px-6 py-3.5 shrink-0">
              <div className="flex items-center justify-between gap-2">
                {[
                  { id: 1, label: 'Thời gian & Tên' },
                  { id: 2, label: 'Đơn vị tham gia' },
                  { id: 3, label: 'Trọng số áp dụng' },
                  { id: 4, label: 'Xác nhận & Mở' },
                ].map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                        step > s.id
                          ? 'bg-emerald-600 text-white'
                          : step === s.id
                          ? 'bg-[#0054a5] text-white ring-4 ring-blue-100'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {step > s.id ? <Check size={13} strokeWidth={3} /> : s.id}
                    </div>
                    <span
                      className={`text-xs font-bold hidden sm:inline ${
                        step === s.id ? 'text-[#0054a5]' : step > s.id ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Thân Modal (Cuộn độc lập) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-left">
              {wizardError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{wizardError}</span>
                </div>
              )}

              {/* BƯỚC 1: Thời gian & Tên */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                    Bước 1: Thông tin cơ bản & Thời hạn chu kỳ
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-600">Tên chu kỳ đánh giá *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="VD: Chu kỳ CLPI Quý III/2026"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0054a5] focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Ngày bắt đầu quý *</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5] focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Ngày kết thúc quý *</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5] focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Hạn chót tự đánh giá (Self-score) *</label>
                      <input
                        type="date"
                        value={formData.selfDeadline}
                        onChange={(e) => setFormData({ ...formData, selfDeadline: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5] focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Hạn chót BTV thẩm định & phê duyệt *</label>
                      <input
                        type="date"
                        value={formData.reviewDeadline}
                        onChange={(e) => setFormData({ ...formData, reviewDeadline: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* BƯỚC 2: Đơn vị tham gia */}
              {step === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Bước 2: Chọn Đơn vị & Phạm vi cán bộ tham gia
                    </h3>
                    <span className="text-xs font-bold text-[#0054a5]">
                      Đã chọn {formData.selectedUnitIds.length}/{AVAILABLE_UNITS.length} đơn vị
                    </span>
                  </div>

                  <div className="space-y-2">
                    {AVAILABLE_UNITS.map((u) => {
                      const checked = formData.selectedUnitIds.includes(u.id);
                      return (
                        <label
                          key={u.id}
                          className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all select-none ${
                            checked
                              ? 'bg-blue-50/60 border-[#0054a5] text-slate-900'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleUnit(u.id)}
                              className="w-4 h-4 accent-[#0054a5] cursor-pointer"
                            />
                            <span className="text-xs font-extrabold">{u.name}</span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-400">
                            {u.officers} cán bộ
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* BƯỚC 3: Trọng số áp dụng */}
              {step === 3 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                    Bước 3: Chọn Hồ sơ Trọng số CLPI áp dụng
                  </h3>
                  <div className="space-y-3">
                    {WEIGHT_PROFILES.map((profile) => {
                      const isSelected = formData.weightProfileId === profile.id;
                      return (
                        <div
                          key={profile.id}
                          onClick={() => setFormData({ ...formData, weightProfileId: profile.id })}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2.5 ${
                            isSelected
                              ? 'border-[#0054a5] bg-blue-50/30 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-blue-200'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className={`font-extrabold text-xs ${isSelected ? 'text-[#0054a5]' : 'text-slate-700'}`}>
                              {profile.name}
                            </span>
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              Tổng 100%
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                            <div className="bg-white p-2 rounded-xl border border-slate-200">WPI: {profile.weights.WPI}%</div>
                            <div className="bg-white p-2 rounded-xl border border-slate-200">LEI: {profile.weights.LEI}%</div>
                            <div className="bg-white p-2 rounded-xl border border-slate-200">CEI: {profile.weights.CEI}%</div>
                            <div className="bg-white p-2 rounded-xl border border-slate-200">SDI: {profile.weights.SDI}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* BƯỚC 4: Xác nhận & Mở */}
              {step === 4 && (
                <div className="space-y-4 py-2">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <ShieldCheck size={28} />
                    </div>
                    <h3 className="text-base font-black text-slate-900">Xác nhận Khởi tạo & Mở Chu kỳ</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      Hệ thống sẽ áp dụng snapshot trọng số và gửi thông báo đến các Trưởng đơn vị và Cán bộ tham gia chu kỳ.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Tên chu kỳ:</span>
                      <span className="font-extrabold text-slate-900">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Thời gian quý:</span>
                      <span className="font-bold text-slate-700">
                        {formatDateVN(formData.startDate)} — {formatDateVN(formData.endDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Hạn tự đánh giá:</span>
                      <span className="font-bold text-rose-600">{formatDateVN(formData.selfDeadline)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Phạm vi áp dụng:</span>
                      <span className="font-bold text-[#0054a5]">
                        {formData.selectedUnitIds.length} đơn vị ({AVAILABLE_UNITS.filter((u) => formData.selectedUnitIds.includes(u.id)).reduce((s, u) => s + u.officers, 0)} cán bộ)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Hồ sơ trọng số:</span>
                      <span className="font-bold text-slate-700">{selectedWeightProfile.name}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs uppercase border border-slate-200 cursor-pointer transition-colors"
                >
                  <ArrowLeft size={14} /> Quay lại
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-slate-600 font-bold rounded-xl text-xs uppercase border-none bg-transparent cursor-pointer"
                >
                  Hủy bỏ
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase border-none cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Tiếp tục <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishWizard}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase border-none cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <CheckCircle2 size={16} /> Mở chu kỳ chính thức
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POP-UP MODAL: CHI TIẾT CẤU HÌNH CHU KỲ */}
      {detailCycle && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-black text-sm sm:text-base">{detailCycle.name}</h3>
              <button
                type="button"
                onClick={() => setDetailCycle(null)}
                className="p-1 hover:bg-white/20 rounded-full text-white border-none bg-transparent cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 font-semibold block">Thời gian đánh giá</span>
                  <strong className="text-slate-800 mt-0.5 block">{detailCycle.startDate} — {detailCycle.endDate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Hạn tự đánh giá</span>
                  <strong className="text-rose-600 mt-0.5 block">{detailCycle.selfDeadline}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Hạn BTV thẩm định</span>
                  <strong className="text-[#0054a5] mt-0.5 block">{detailCycle.reviewDeadline}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Tổng cán bộ tham gia</span>
                  <strong className="text-slate-800 mt-0.5 block">{detailCycle.totalOfficers} cán bộ</strong>
                </div>
              </div>

              {detailCycle.weights && (
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-500 uppercase text-[11px] flex items-center gap-1">
                    <Layers size={13} className="text-[#0054a5]" /> Snapshot trọng số chu kỳ
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center font-black text-[#0054a5]">
                    <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100">WPI: {detailCycle.weights.WPI}%</div>
                    <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100">LEI: {detailCycle.weights.LEI}%</div>
                    <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100">CEI: {detailCycle.weights.CEI}%</div>
                    <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100">SDI: {detailCycle.weights.SDI}%</div>
                  </div>
                </div>
              )}

              {detailCycle.units && detailCycle.units.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-500 uppercase text-[11px] flex items-center gap-1">
                    <Users size={13} className="text-[#0054a5]" /> Đơn vị trực thuộc tham gia
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {detailCycle.units.map((u) => (
                      <span key={u} className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg">
                        {u}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setDetailCycle(null)}
                  className="px-5 py-2 bg-[#0054a5] text-white font-bold rounded-xl border-none cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
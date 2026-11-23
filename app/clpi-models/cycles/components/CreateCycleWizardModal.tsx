'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { UnitOption, WeightProfileOption, formatDateVN } from '../types';

interface Props {
  availableUnits: UnitOption[];
  weightProfiles: WeightProfileOption[];
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
}

const FALLBACK_PROFILE: WeightProfileOption = {
  id: 'default',
  title: 'Bộ trọng số mặc định (40-25-20-15)',
  weights: { WPI: 40, LEI: 25, CEI: 20, SDI: 15 },
};

export default function CreateCycleWizardModal({
  availableUnits,
  weightProfiles,
  onClose,
  onSubmit,
}: Props) {
  const profiles = weightProfiles.length > 0 ? weightProfiles : [FALLBACK_PROFILE];

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [wizardError, setWizardError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    quarter: 'Quý I',
    year: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    selfDeadline: '',
    reviewDeadline: '',
    weightProfileId: profiles[0].id,
    selectedUnitNames: availableUnits.map((u) => u.name),
  });

  const toggleUnit = (unitName: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedUnitNames: prev.selectedUnitNames.includes(unitName)
        ? prev.selectedUnitNames.filter((name) => name !== unitName)
        : [...prev.selectedUnitNames, unitName],
    }));
  };

  const handleNextStep = () => {
    setWizardError(null);
    if (step === 1) {
      if (!formData.name.trim()) {
        setWizardError('Vui lòng nhập tên chu kỳ đánh giá!');
        return;
      }
      if (
        !formData.startDate ||
        !formData.endDate ||
        !formData.selfDeadline ||
        !formData.reviewDeadline
      ) {
        setWizardError('Vui lòng chọn đầy đủ các mốc thời gian của chu kỳ!');
        return;
      }
      if (formData.endDate < formData.startDate) {
        setWizardError('Ngày kết thúc quý không được nhỏ hơn ngày bắt đầu!');
        return;
      }
    }
    if (step === 2 && availableUnits.length > 0 && formData.selectedUnitNames.length === 0) {
      setWizardError('Vui lòng chọn ít nhất 01 đơn vị tham gia chu kỳ đánh giá!');
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const handlePrevStep = () => {
    setWizardError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleFinish = async () => {
    if (submitting) return;
    setSubmitting(true);
    setWizardError(null);
    try {
      const chosenProfile =
        profiles.find((p) => p.id === formData.weightProfileId) || profiles[0];

      await onSubmit({
        name: formData.name.trim(),
        quarter: formData.quarter,
        year: Number(formData.year),
        startDate: formatDateVN(formData.startDate),
        endDate: formatDateVN(formData.endDate),
        selfDeadline: formatDateVN(formData.selfDeadline),
        reviewDeadline: formatDateVN(formData.reviewDeadline),
        units: formData.selectedUnitNames,
        weightProfile: chosenProfile.id,
        weights: chosenProfile.weights,
      });
    } catch (err: any) {
      setWizardError(err?.message || 'Lỗi kết nối máy chủ khi tạo chu kỳ.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedWeightProfile =
    profiles.find((p) => p.id === formData.weightProfileId) || profiles[0];

  const selectedOfficersCount = availableUnits
    .filter((u) => formData.selectedUnitNames.includes(u.name))
    .reduce((s, u) => s + u.officers, 0);

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
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
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full text-white border-none bg-transparent cursor-pointer transition-colors"
          >
            <X size={20} />
          </button>
        </div>

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
                    step === s.id
                      ? 'text-[#0054a5]'
                      : step > s.id
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-left">
          {wizardError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{wizardError}</span>
            </div>
          )}

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
                    placeholder="VD: Chu kỳ CLPI Quý I/2027"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0054a5] focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Quý đánh giá *</label>
                  <select
                    value={formData.quarter}
                    onChange={(e) => setFormData({ ...formData, quarter: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0054a5] focus:bg-white cursor-pointer"
                  >
                    <option value="Quý I">Quý I</option>
                    <option value="Quý II">Quý II</option>
                    <option value="Quý III">Quý III</option>
                    <option value="Quý IV">Quý IV</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Năm đánh giá *</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0054a5] focus:bg-white"
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
                  <label className="text-xs font-bold text-slate-600">
                    Hạn chót tự đánh giá (Self-score) *
                  </label>
                  <input
                    type="date"
                    value={formData.selfDeadline}
                    onChange={(e) => setFormData({ ...formData, selfDeadline: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5] focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">
                    Hạn chót BTV thẩm định & phê duyệt *
                  </label>
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

          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Bước 2: Chọn Đơn vị & Phạm vi cán bộ tham gia
                </h3>
                <span className="text-xs font-bold text-[#0054a5]">
                  Đã chọn {formData.selectedUnitNames.length}/{availableUnits.length} đơn vị
                </span>
              </div>

              {availableUnits.length > 0 ? (
                <div className="space-y-2">
                  {availableUnits.map((u) => {
                    const checked = formData.selectedUnitNames.includes(u.name);
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
                            onChange={() => toggleUnit(u.name)}
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
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl">
                  Hệ thống chưa ghi nhận đơn vị/chi đoàn nào trong danh sách nhân sự. Bạn có thể
                  tiếp tục sang bước tiếp theo.
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Bước 3: Chọn Hồ sơ Trọng số CLPI áp dụng
                </h3>
                <Link
                  href="/clpi-models/indicators"
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0054a5] hover:underline no-underline"
                >
                  Quản lý bộ trọng số <ExternalLink size={12} />
                </Link>
              </div>
              <div className="space-y-3">
                {profiles.map((profile) => {
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
                        <span
                          className={`font-extrabold text-xs ${
                            isSelected ? 'text-[#0054a5]' : 'text-slate-700'
                          }`}
                        >
                          {profile.title}
                        </span>
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Tổng 100%
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          WPI: {profile.weights.WPI}%
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          LEI: {profile.weights.LEI}%
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          CEI: {profile.weights.CEI}%
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          SDI: {profile.weights.SDI}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 py-2">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Xác nhận Khởi tạo & Mở Chu kỳ
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Hệ thống sẽ áp dụng snapshot trọng số và mở chu kỳ đánh giá trên hệ thống.
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
                  <span className="font-bold text-rose-600">
                    {formatDateVN(formData.selfDeadline)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Phạm vi áp dụng:</span>
                  <span className="font-bold text-[#0054a5]">
                    {formData.selectedUnitNames.length} đơn vị ({selectedOfficersCount} cán bộ)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Hồ sơ trọng số:</span>
                  <span className="font-bold text-slate-700">{selectedWeightProfile.title}</span>
                </div>
              </div>
            </div>
          )}
        </div>

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
              onClick={onClose}
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
              disabled={submitting}
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase border-none cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <CheckCircle2 size={16} /> {submitting ? 'Đang mở...' : 'Mở chu kỳ chính thức'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
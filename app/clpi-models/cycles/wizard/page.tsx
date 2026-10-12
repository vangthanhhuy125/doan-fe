'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Check, ArrowRight, ArrowLeft, Calendar, 
  Layers, Users, ShieldCheck, CheckCircle2 
} from 'lucide-react';

export default function CycleWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    name: 'Chu kỳ CLPI Quý III/2026',
    quarter: 'Quý III',
    year: '2026',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    selfDeadline: '2026-09-30',
    reviewDeadline: '2026-10-10',
    weightProfile: 'default_faculty',
    units: ['KTPM2025.1', 'KTPM2024.1', 'Ban Học thuật', 'Ban Phong trào', 'CLB GamApp'],
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleFinish = () => {
    alert('Khởi tạo và mở chu kỳ CLPI thành công!');
    router.push('/clpi-models/cycles');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Thiết lập Chu kỳ Đánh giá mới
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Cấu hình 4 bước theo quy trình kiểm soát chu kỳ CLPI của Ban Thường vụ.
        </p>
      </div>

      {/* Stepper Wizard */}
      <div className="flex items-center justify-between max-w-2xl mx-auto py-2">
        {[
          { id: 1, label: 'Thời gian & Tên' },
          { id: 2, label: 'Đơn vị tham gia' },
          { id: 3, label: 'Trọng số áp dụng' },
          { id: 4, label: 'Xác nhận & Mở' },
        ].map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step > s.id
                  ? 'bg-emerald-600 text-white'
                  : step === s.id
                  ? 'bg-[#0054a5] text-white ring-4 ring-blue-100'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step > s.id ? <Check size={14} /> : s.id}
            </div>
            <span className={`text-xs font-bold hidden sm:inline ${step === s.id ? 'text-[#0054a5]' : 'text-slate-400'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Nội dung từng bước */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              Bước 1: Thông tin cơ bản & Thời hạn chu kỳ
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-600">Tên chu kỳ đánh giá *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Ngày bắt đầu quý *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Ngày kết thúc quý *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Hạn chót tự đánh giá (Self-score) *</label>
                <input
                  type="date"
                  value={formData.selfDeadline}
                  onChange={(e) => setFormData({ ...formData, selfDeadline: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Hạn chót BTV thẩm định & phê duyệt *</label>
                <input
                  type="date"
                  value={formData.reviewDeadline}
                  onChange={(e) => setFormData({ ...formData, reviewDeadline: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5]"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              Bước 2: Chọn Đơn vị & Phạm vi cán bộ tham gia
            </h2>
            <div className="space-y-2">
              {['Chi đoàn KTPM2025.1', 'Chi đoàn KTPM2024.1', 'Ban Học thuật', 'Ban Phong trào', 'CLB GamApp'].map((u) => (
                <label key={u} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-blue-50/40">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0054a5]" />
                  <span className="text-xs font-extrabold text-slate-800">{u}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              Bước 3: Chọn Hồ sơ Trọng số CLPI áp dụng
            </h2>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl border-2 border-[#0054a5] bg-blue-50/30 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-xs text-[#0054a5]">Bộ trọng số Chuẩn Đoàn Khoa (Khuyên dùng)</span>
                  <span className="text-xs font-black text-emerald-600">Tổng 100%</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold pt-1">
                  <div className="bg-white p-2 rounded-xl border border-slate-200">WPI: 40%</div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">LEI: 25%</div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">CEI: 20%</div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">SDI: 15%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-lg font-black text-slate-900">Xác nhận Khởi tạo & Mở Chu kỳ</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Hệ thống sẽ gửi thông báo đến các Trưởng đơn vị và Cán bộ về chu kỳ đánh giá mới. Sau khi mở, cán bộ có thể cập nhật công việc và làm báo cáo tháng.
            </p>
          </div>
        )}

        {/* Buttons điều hướng wizard */}
        <div className="flex justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs uppercase cursor-pointer border-none"
            >
              <ArrowLeft size={14} /> Quay lại
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#0054a5] text-white font-bold rounded-2xl text-xs uppercase cursor-pointer border-none shadow-md shadow-blue-500/20"
            >
              Tiếp tục <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs uppercase cursor-pointer border-none shadow-md shadow-emerald-500/20"
            >
              <CheckCircle2 size={16} /> Mở chu kỳ chính thức
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
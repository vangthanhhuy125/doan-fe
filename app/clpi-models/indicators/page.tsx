'use client';

import { useState } from 'react';
import { 
  Layers, Sliders, Save, CheckCircle2, 
  AlertCircle, ShieldCheck, Check, Sparkles 
} from 'lucide-react';

interface IndicatorInfo {
  code: 'WPI' | 'LEI' | 'CEI' | 'SDI';
  name: string;
  viName: string;
  desc: string;
  evidences: string[];
}

const INDICATORS_DATA: IndicatorInfo[] = [
  {
    code: 'WPI',
    name: 'Work Performance Index',
    viName: 'Chỉ số Hoàn thành nhiệm vụ',
    desc: 'Đo lường số lượng nhiệm vụ được phân công, mức độ hoàn thành đúng thời hạn và chất lượng sản phẩm đầu ra thực tế.',
    evidences: [
      'Kế hoạch & Đề án hoạt động đã duyệt',
      'File sản phẩm đầu ra (văn bản, thiết kế, mã nguồn)',
      'Biên bản nghiệm thu chương trình',
    ],
  },
  {
    code: 'LEI',
    name: 'Leadership & Execution Index',
    viName: 'Chỉ số Năng lực điều hành, phối hợp',
    desc: 'Đánh giá khả năng chủ động điều phối nhóm, phân bổ nguồn lực, tinh thần làm việc nhóm và giải quyết vướng mắc phát sinh.',
    evidences: [
      'Bảng phân công nhiệm vụ thành viên Ban Tổ chức',
      'Biên bản họp giao ban định kỳ',
      'Đánh giá chéo từ Trưởng đơn vị / Ban Thường vụ',
    ],
  },
  {
    code: 'CEI',
    name: 'Community Engagement Index',
    viName: 'Chỉ số Tương tác tổ chức',
    desc: 'Đánh giá mức độ hiện diện, khả năng kết nối với đoàn viên, thanh niên và sự hưởng ứng các hoạt động cấp khoa/trường.',
    evidences: [
      'Sĩ số tham gia các buổi sinh hoạt Chi đoàn chủ điểm',
      'Hình ảnh tương tác hoạt động phong trào thực tế',
      'Kết quả đánh giá điểm rèn luyện và phong trào thi đua',
    ],
  },
  {
    code: 'SDI',
    name: 'Self-Development Index',
    viName: 'Chỉ số Phát triển cá nhân',
    desc: 'Đánh giá tinh thần cầu tiến, thái độ công tác, tham gia các lớp tập huấn cán bộ Đoàn và tích lũy chứng chỉ kỹ năng.',
    evidences: [
      'Giấy chứng nhận tập huấn kỹ năng cán bộ Đoàn',
      'Chứng chỉ chuyên môn, ngoại ngữ, kỹ năng mềm',
      'Bản tự kiểm điểm rèn luyện cán bộ định kỳ',
    ],
  },
];

const PRESET_PROFILES = [
  {
    id: 'faculty_default',
    title: 'Bộ Chuẩn Đoàn Khoa (Mặc định)',
    weights: { WPI: 40, LEI: 25, CEI: 20, SDI: 15 },
  },
  {
    id: 'branch_leaders',
    title: 'Cán bộ Bí thư Chi đoàn',
    weights: { WPI: 35, LEI: 30, CEI: 25, SDI: 10 },
  },
  {
    id: 'academic_team',
    title: 'Ban Học thuật & Kỹ thuật',
    weights: { WPI: 45, LEI: 20, CEI: 15, SDI: 20 },
  },
];

export default function IndicatorsAndWeightsPage() {
  const [weights, setWeights] = useState({
    WPI: 40,
    LEI: 25,
    CEI: 20,
    SDI: 15,
  });

  const [selectedPreset, setSelectedPreset] = useState('faculty_default');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const total = weights.WPI + weights.LEI + weights.CEI + weights.SDI;
  const isValid = total === 100;

  const handleWeightChange = (key: keyof typeof weights, val: string) => {
    const num = parseInt(val, 10);
    setWeights((prev) => ({
      ...prev,
      [key]: isNaN(num) ? 0 : Math.max(0, Math.min(100, num)),
    }));
  };

  const handleApplyPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const found = PRESET_PROFILES.find((p) => p.id === presetId);
    if (found) {
      setWeights(found.weights);
    }
  };

  const handleSave = () => {
    if (!isValid) return;
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 text-slate-800">
      {/* 1. Header Trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Bộ Chỉ số & Trọng số Đánh giá CLPI
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Định nghĩa 4 nhóm năng lực cốt lõi và điều chỉnh tỷ trọng phần trăm trong công thức CLPI.
          </p>
        </div>

        <button
          type="button"
          disabled={!isValid}
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all border-none cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 self-start sm:self-auto"
        >
          <Save size={16} /> Lưu cấu hình trọng số
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>Đã lưu thành công cấu hình Bộ chỉ số & Trọng số CLPI!</span>
        </div>
      )}

      {/* 2. KHỐI 1: CẤU HÌNH TRỌNG SỐ (WEIGHT CONFIGURATION) */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0054a5] flex items-center justify-center font-black">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                BẢNG PHÂN BỔ TRỌNG SỐ ÁP DỤNG
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Công thức: CLPI = (WPI × w₁) + (LEI × w₂) + (CEI × w₃) + (SDI × w₄)
              </p>
            </div>
          </div>

          {/* Badge kiểm tra tổng trọng số */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Tổng trọng số:</span>
            <span
              className={`text-sm font-black px-3 py-1 rounded-xl border ${
                isValid
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {total}% / 100%
            </span>
          </div>
        </div>

        {!isValid && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>Tổng trọng số hiện tại là {total}%. Vui lòng điều chỉnh để tổng chính xác bằng 100%!</span>
          </div>
        )}

        {/* Lựa chọn hồ sơ trọng số mẫu */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase text-slate-400">
            Chọn bộ trọng số đề xuất theo nhóm đối tượng:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {PRESET_PROFILES.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-[#0054a5] text-[#0054a5] ring-2 ring-blue-100'
                      : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-xs font-extrabold">{preset.title}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    W:{preset.weights.WPI}% | L:{preset.weights.LEI}% | C:{preset.weights.CEI}% | S:{preset.weights.SDI}%
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Ô Input điều chỉnh phần trăm trọng số */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {(['WPI', 'LEI', 'CEI', 'SDI'] as const).map((code) => {
            const val = weights[code];
            return (
              <div
                key={code}
                className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 flex flex-col justify-between space-y-2 hover:border-[#0054a5]/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-xs px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[#0054a5]">
                    {code}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Trọng số</span>
                </div>

                <div className="flex items-center justify-center gap-1.5 py-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={val}
                    onChange={(e) => handleWeightChange(code, e.target.value)}
                    className="w-20 p-2 text-center bg-white border border-slate-300 rounded-xl text-2xl font-black text-[#0054a5] outline-none focus:border-[#0054a5] shadow-xs"
                  />
                  <span className="text-lg font-black text-slate-400">%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. KHỐI 2: CHI TIẾT 4 CHỈ SỐ NĂNG LỰC (INDICATOR DEFINITION & EVIDENCES) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Layers size={18} className="text-[#0054a5]" />
          <h2 className="text-xs font-black uppercase text-slate-700 tracking-wider">
            ĐỊNH NGHĨA VÀ TIÊU CHUẨN MINH CHỨNG CỦA TỪNG CHỈ SỐ
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INDICATORS_DATA.map((ind) => {
            const currentWeight = weights[ind.code];

            return (
              <div
                key={ind.code}
                className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between hover:border-[#0054a5]/30 transition-all"
              >
                <div className="space-y-3">
                  {/* Header Card: Mã + Tên + Badge Trọng số */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black px-2.5 py-0.5 bg-blue-50 text-[#0054a5] rounded-lg border border-blue-200">
                          {ind.code}
                        </span>
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                          {ind.viName}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                        {ind.name}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block text-xs font-black text-[#0054a5] bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                        {currentWeight}%
                      </span>
                    </div>
                  </div>

                  {/* Mô tả nghiệp vụ */}
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {ind.desc}
                  </p>
                </div>

                {/* Danh sách minh chứng yêu cầu */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Căn cứ minh chứng yêu cầu khi thẩm định:
                  </span>
                  <ul className="space-y-1.5 m-0 p-0 list-none">
                    {ind.evidences.map((evi, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 font-medium">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{evi}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
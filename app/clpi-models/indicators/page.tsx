'use client';

import { useState, useEffect } from 'react';
import {
  Layers,
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PlusCircle,
  Trash2,
  X,
} from 'lucide-react';

interface IndicatorInfo {
  code: 'WPI' | 'LEI' | 'CEI' | 'SDI';
  name: string;
  viName: string;
  desc: string;
  evidences: string[];
}

interface WeightProfileItem {
  id: string;
  title: string;
  weights: { WPI: number; LEI: number; CEI: number; SDI: number };
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

export default function IndicatorsAndWeightsPage() {
  const [weights, setWeights] = useState({ WPI: 0, LEI: 0, CEI: 0, SDI: 0 });
  const [profiles, setProfiles] = useState<WeightProfileItem[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [newProfileError, setNewProfileError] = useState<string | null>(null);
  const [newProfile, setNewProfile] = useState({
    title: '',
    WPI: 0,
    LEI: 0,
    CEI: 0,
    SDI: 0,
  });

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

  const fetchConfig = async () => {
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const res = await fetch(`${apiUrl}/clpi/indicators`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        const loadedWeights = data?.weights || { WPI: 0, LEI: 0, CEI: 0, SDI: 0 };
        const loadedProfiles: WeightProfileItem[] = Array.isArray(data?.profiles)
          ? data.profiles
          : [];

        setWeights(loadedWeights);
        setProfiles(loadedProfiles);

        const matched = loadedProfiles.find(
          (p) =>
            p.weights.WPI === loadedWeights.WPI &&
            p.weights.LEI === loadedWeights.LEI &&
            p.weights.CEI === loadedWeights.CEI &&
            p.weights.SDI === loadedWeights.SDI
        );
        setSelectedPreset(matched ? matched.id : '');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const total = weights.WPI + weights.LEI + weights.CEI + weights.SDI;
  const isValid = total === 100;

  const newProfileTotal = newProfile.WPI + newProfile.LEI + newProfile.CEI + newProfile.SDI;
  const isNewProfileValid = newProfileTotal === 100 && newProfile.title.trim().length > 0;

  const handleWeightChange = (key: keyof typeof weights, val: string) => {
    const num = parseInt(val, 10);
    setSelectedPreset('');
    setWeights((prev) => ({
      ...prev,
      [key]: isNaN(num) ? 0 : Math.max(0, Math.min(100, num)),
    }));
  };

  const handleApplyPreset = (profile: WeightProfileItem) => {
    setSelectedPreset(profile.id);
    setWeights({ ...profile.weights });
  };

  const handleSave = async () => {
    if (!isValid || saving) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const res = await fetch(`${apiUrl}/clpi/indicators/weights`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(weights),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Không thể lưu cấu hình trọng số.');
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      setErrorMsg(e?.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNewProfileValid || creatingProfile) return;
    setCreatingProfile(true);
    setNewProfileError(null);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const res = await fetch(`${apiUrl}/clpi/indicators/profiles`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title: newProfile.title.trim(),
          WPI: newProfile.WPI,
          LEI: newProfile.LEI,
          CEI: newProfile.CEI,
          SDI: newProfile.SDI,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Không thể tạo bộ trọng số.');
      }
      const created = await res.json();
      setIsCreateModalOpen(false);
      setNewProfile({ title: '', WPI: 0, LEI: 0, CEI: 0, SDI: 0 });
      await fetchConfig();
      if (created?.id) {
        setSelectedPreset(created.id);
        setWeights(created.weights);
      }
    } catch (e: any) {
      setNewProfileError(e?.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setCreatingProfile(false);
    }
  };

  const handleDeleteProfile = async (e: React.MouseEvent, profile: WeightProfileItem) => {
    e.stopPropagation();
    if (!confirm(`Xóa bộ trọng số "${profile.title}"?`)) return;
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const res = await fetch(`${apiUrl}/clpi/indicators/profiles/${profile.id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        if (selectedPreset === profile.id) setSelectedPreset('');
        await fetchConfig();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err?.message || 'Không thể xóa bộ trọng số này.');
      }
    } catch {
      alert('Lỗi kết nối máy chủ khi xóa.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0054a5]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Bộ Chỉ số & Trọng số Đánh giá CLPI
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Định nghĩa 4 nhóm năng lực cốt lõi và quản lý các bộ tỷ trọng phần trăm trong công thức CLPI.
          </p>
        </div>

        <button
          type="button"
          disabled={!isValid || saving}
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all border-none cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 self-start sm:self-auto"
        >
          <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu cấu hình trọng số'}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>Đã lưu thành công cấu hình Bộ chỉ số & Trọng số CLPI vào hệ thống!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

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
            <span>
              Tổng trọng số hiện tại là {total}%. Vui lòng điều chỉnh để tổng chính xác bằng 100%!
            </span>
          </div>
        )}

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase text-slate-400">
              Danh sách bộ trọng số đã thiết lập ({profiles.length}):
            </label>
            <button
              type="button"
              onClick={() => {
                setNewProfileError(null);
                setNewProfile({ title: '', WPI: 0, LEI: 0, CEI: 0, SDI: 0 });
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0054a5] font-bold rounded-xl text-xs border border-blue-200 cursor-pointer transition-colors"
            >
              <PlusCircle size={14} /> Tạo bộ trọng số mới
            </button>
          </div>

          {profiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {profiles.map((preset) => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-50/70 border-[#0054a5] text-[#0054a5] ring-2 ring-blue-100'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold truncate">{preset.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        W:{preset.weights.WPI}% | L:{preset.weights.LEI}% | C:{preset.weights.CEI}% | S:{preset.weights.SDI}%
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteProfile(e, preset)}
                      title="Xóa bộ trọng số này"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border-none bg-transparent cursor-pointer shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center text-xs text-slate-400 font-medium">
              Chưa có bộ trọng số nào được tạo. Nhấn{' '}
              <strong className="text-[#0054a5]">"Tạo bộ trọng số mới"</strong> để thiết lập các bộ tỷ trọng riêng cho từng nhóm cán bộ.
            </div>
          )}
        </div>

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
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{ind.name}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block text-xs font-black text-[#0054a5] bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                        {currentWeight}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{ind.desc}</p>
                </div>

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

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-[#0054a5] px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-wider">
                Tạo bộ trọng số mới
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full text-white border-none bg-transparent cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProfile} className="p-6 space-y-4 text-xs">
              {newProfileError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-bold">
                  {newProfileError}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-600">Tên bộ trọng số *</label>
                <input
                  type="text"
                  required
                  value={newProfile.title}
                  onChange={(e) => setNewProfile({ ...newProfile, title: e.target.value })}
                  placeholder="Nhập tên bộ trọng số..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#0054a5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(['WPI', 'LEI', 'CEI', 'SDI'] as const).map((code) => (
                  <div key={code} className="space-y-1">
                    <label className="font-bold text-slate-600">{code} (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={newProfile[code]}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        setNewProfile({
                          ...newProfile,
                          [code]: isNaN(v) ? 0 : Math.max(0, Math.min(100, v)),
                        });
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-[#0054a5] outline-none focus:border-[#0054a5]"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-slate-500">Tổng tỷ trọng:</span>
                <span
                  className={`font-black px-2.5 py-1 rounded-lg border ${
                    newProfileTotal === 100
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {newProfileTotal}% / 100%
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl border-none cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!isNewProfileValid || creatingProfile}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#0054a5] text-white font-bold rounded-xl border-none cursor-pointer disabled:opacity-40"
                >
                  <CheckCircle2 size={14} /> {creatingProfile ? 'Đang tạo...' : 'Lưu bộ trọng số'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
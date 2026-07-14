'use client';

import { useState } from "react";
import { X, Save, Link as LinkIcon, FileText, DollarSign, Award, Calendar } from "lucide-react";

interface ProgramFormProps {
  mode: 'add' | 'edit' | 'view';
  data?: any;
  systemConfig: {
    years: string[];
    academicYears: string[];
    semesters: string[];
  };
  onClose: () => void;
  onSave?: (formData: any) => void;
}

export default function ProgramForm({ mode, data, systemConfig, onClose, onSave }: ProgramFormProps) {
  const isView = mode === 'view';
  const isAdd = mode === 'add';

  const [formData, setFormData] = useState({
    _id: data?._id || undefined,
    program_name: data?.program_name || "",
    stakeholders: data?.stakeholders || "",
    month: data?.month || "01",
    year: data?.year || systemConfig?.years[0] || "",
    semester: data?.semester || systemConfig?.semesters[0] || "",
    academic_year: data?.academic_year || systemConfig?.academicYears[0] || "",
    source_url: data?.source_url || "",
    plan_url: data?.plan_url || "",
    budget_url: data?.budget_url || "",
    training_score_list_url: data?.training_score_list_url || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
    onClose();
  };

  const headerBg = isView ? "bg-[#0054a5]" : isAdd ? "bg-[#1d92ff]" : "bg-amber-500";
  const btnBg = isAdd ? "bg-[#1d92ff] hover:bg-[#0054a5]" : "bg-amber-500 hover:bg-amber-600";
  const ringColor = isView ? "focus:border-[#0054a5]" : isAdd ? "focus:border-[#1d92ff]" : "focus:border-amber-500";
  const labelColor = isView ? "text-gray-400" : isAdd ? "text-[#1d92ff]" : "text-amber-500";

  const LinkBox = ({ label, icon, href, colorClass }: any) => (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase text-gray-400">{label}</p>
      <a
        href={href || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2 p-3 rounded-xl border border-transparent ${colorClass} transition-all hover:scale-[1.02] active:scale-95 shadow-sm`}
      >
        {icon}
        <span className="text-xs font-bold truncate">Xem tài liệu chi tiết</span>
      </a>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 text-black">
        
        <div className={`${headerBg} p-6 flex items-center justify-between text-white transition-colors`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><FileText size={20} /></div>
            <h3 className="font-bold uppercase tracking-widest text-sm text-white">
              {isView ? 'Thông tin chi tiết' : isAdd ? 'Thêm chương trình mới' : 'Chỉnh sửa chương trình'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white border-none bg-transparent outline-none">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[85vh] text-left">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Tên chương trình</label>
              <input
                disabled={isView}
                required
                value={formData.program_name}
                onChange={(e) => setFormData({ ...formData, program_name: e.target.value })}
                className={`w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm font-bold ${ringColor}`}
                placeholder="Nhập tên chương trình..."
              />
            </div>

            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Stakeholder (Người phụ trách/Trưởng Ban Tổ chức)</label>
              <input
                disabled={isView}
                value={formData.stakeholders}
                onChange={(e) => setFormData({ ...formData, stakeholders: e.target.value })}
                className={`w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm font-bold ${ringColor}`}
                placeholder="VD: Đoàn trường, Khoa CNPM..."
              />
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
            <div className={`flex items-center gap-2 font-bold text-xs uppercase border-b border-slate-200 pb-2 ${isView ? 'text-[#0054a5]' : isAdd ? 'text-[#1d92ff]' : 'text-amber-600'}`}>
              <Calendar size={14} /> Phân loại thời gian
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Tháng</label>
                <select
                  disabled={isView}
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none text-sm font-bold focus:border-[#1d92ff] cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const val = (i + 1).toString().padStart(2, '0');
                    return <option key={val} value={val}>Tháng {val}</option>;
                  })}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Năm</label>
                <select
                  disabled={isView}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none text-sm font-bold focus:border-[#1d92ff] cursor-pointer"
                >
                  {systemConfig.years.map((y: string, idx: number) => (
                    <option key={idx} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Học kỳ</label>
                <select
                  disabled={isView}
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none text-sm font-bold focus:border-[#1d92ff] cursor-pointer"
                >
                  {systemConfig.semesters.map((s: string, idx: number) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Năm học</label>
                <select
                  disabled={isView}
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none text-sm font-bold focus:border-[#1d92ff] cursor-pointer"
                >
                  {systemConfig.academicYears.map((ay: string, idx: number) => (
                    <option key={idx} value={ay}>{ay}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {isView ? (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <LinkBox label="Tài liệu" icon={<LinkIcon size={16} />} href={formData.source_url} colorClass="bg-blue-50 text-blue-600 border-blue-100" />
              <LinkBox label="Kế hoạch" icon={<FileText size={16} />} href={formData.plan_url} colorClass="bg-emerald-50 text-emerald-600 border-emerald-100" />
              <LinkBox label="Dự kiến kinh phí" icon={<DollarSign size={16} />} href={formData.budget_url} colorClass="bg-amber-50 text-amber-600 border-amber-100" />
              <LinkBox label="Danh sách RL" icon={<Award size={16} />} href={formData.training_score_list_url} colorClass="bg-purple-50 text-purple-600 border-purple-100" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-blue-500 flex items-center gap-1"><LinkIcon size={12} /> Link Tài liệu</label>
                <input
                  value={formData.source_url}
                  onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                  className="w-full p-3 bg-blue-50/50 rounded-xl border border-blue-100 outline-none text-xs focus:bg-white"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-emerald-500 flex items-center gap-1"><FileText size={12} /> Link Kế hoạch</label>
                <input
                  value={formData.plan_url}
                  onChange={(e) => setFormData({ ...formData, plan_url: e.target.value })}
                  className="w-full p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 outline-none text-xs focus:bg-white"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-amber-500 flex items-center gap-1"><DollarSign size={12} /> Link Dự kiến KP</label>
                <input
                  value={formData.budget_url}
                  onChange={(e) => setFormData({ ...formData, budget_url: e.target.value })}
                  className="w-full p-3 bg-amber-50/50 rounded-xl border border-amber-100 outline-none text-xs focus:bg-white"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-purple-500 flex items-center gap-1"><Award size={12} /> Link Danh sách RL</label>
                <input
                  value={formData.training_score_list_url}
                  onChange={(e) => setFormData({ ...formData, training_score_list_url: e.target.value })}
                  className="w-full p-3 bg-purple-50/50 rounded-xl border border-purple-100 outline-none text-xs focus:bg-white"
                  placeholder="https://drive.google.com/..."
                />
              </div>
            </div>
          )}

          {!isView && (
            <div className="pt-6 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all text-xs tracking-widest uppercase border-none bg-transparent outline-none">
                Hủy bỏ
              </button>
              <button type="submit" className={`px-10 py-3 text-white rounded-2xl font-bold shadow-lg transition-all text-xs tracking-widest uppercase border-none outline-none ${btnBg}`}>
                {isAdd ? 'Lưu' : 'Cập nhật'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
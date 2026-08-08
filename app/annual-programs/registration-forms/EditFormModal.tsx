'use client';

import { useState } from 'react';
import { X, Edit3, UserCheck, Loader2 } from 'lucide-react';
import { RegistrationForm, ProgramConfig } from './types';

interface Props {
  form: RegistrationForm;
  onClose: () => void;
  onSave: (updated: RegistrationForm) => void | Promise<void>;
}

const BADGE_COLOR_PALETTES = [
  'bg-rose-50 text-rose-700 border-rose-200',
  'bg-cyan-50 text-cyan-700 border-cyan-200',
  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'bg-pink-50 text-pink-700 border-pink-200',
  'bg-teal-50 text-teal-700 border-teal-200',
  'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  'bg-orange-50 text-orange-700 border-orange-200',
  'bg-violet-50 text-violet-700 border-violet-200',
  'bg-sky-50 text-sky-700 border-sky-200',
  'bg-red-50 text-red-700 border-red-200',
  'bg-lime-50 text-lime-700 border-lime-200'
];

const getDeptBadgeStyle = (dept: string) => {
  const name = dept.trim();
  if (name === 'Ban Nội dung') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (name === 'Ban Truyền thông') return 'bg-purple-50 text-purple-700 border-purple-200';
  if (name === 'Ban Hậu cần') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (name === 'Ban Tổ chức') return 'bg-emerald-50 text-emerald-700 border-emerald-200';

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BADGE_COLOR_PALETTES.length;
  return BADGE_COLOR_PALETTES[index];
};

const getLeadershipName = (deptName: string) => {
  const trimmed = deptName.trim();
  if (trimmed.startsWith("Trưởng ")) return trimmed;
  return `Trưởng ${trimmed}`;
};

export default function EditFormModal({ form, onClose, onSave }: Props) {
  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [programs, setPrograms] = useState<ProgramConfig[]>(() => {
    return (form.programs || []).map(p => {
      const depts = p.departments || [];
      const existingOpts = p.leadership_options || [];

      const syncedOpts = [...existingOpts];
      depts.forEach(d => {
        const leadTitle = getLeadershipName(d);
        if (!syncedOpts.includes(leadTitle)) {
          syncedOpts.push(leadTitle);
        }
      });
      if (!syncedOpts.includes("Trưởng Ban Tổ chức")) {
        syncedOpts.unshift("Trưởng Ban Tổ chức");
      }

      return {
        ...p,
        description: p.description || "",
        departments: depts,
        enable_leadership_survey: p.enable_leadership_survey ?? false,
        leadership_title: p.leadership_title || "Đăng ký nguyện vọng ứng cử vị trí Trưởng / Phó Ban:",
        leadership_options: syncedOpts
      };
    });
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      let currentUserId = '';
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            currentUserId = user._id || user.user_id || user.id || '';
          } catch (err) {
            console.error('Lỗi đọc user:', err);
          }
        }
      }

      const updatedForm: RegistrationForm = {
        ...form,
        title,
        description,
        created_by: (form as any).created_by || currentUserId,
        programs,
      } as any;

      const getFormId = (id: any) => typeof id === 'object' && id?.$oid ? id.$oid : String(id);
      const formId = getFormId(form._id);
      const token = localStorage.getItem('token') || '';

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-forms/${formId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': currentUserId
        },
        body: JSON.stringify(updatedForm)
      });

      if (res.ok) {
        const savedData = await res.json();
        await onSave(savedData);
      } else {
        const err = await res.json();
        alert(err.message || 'Cập nhật thất bại!');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật phiếu:', error);
      setIsSubmitting(false);
    }
  };

  const handleConfigChange = (idx: number, field: string, value: any) => {
    setPrograms(prev => prev.map((item, pIdx) => pIdx === idx ? { ...item, [field]: value } : item));
  };

  const handleAddDept = (idx: number, deptName: string) => {
    const trimmedDept = deptName.trim();
    if (!trimmedDept) return;

    setPrograms(prev => prev.map((config, pIdx) => {
      if (pIdx !== idx) return config;

      const newDepts = config.departments.includes(trimmedDept)
        ? config.departments
        : [...config.departments, trimmedDept];

      const leadershipTitle = getLeadershipName(trimmedDept);
      const currentLeadership = config.leadership_options || [];
      const newLeadership = currentLeadership.includes(leadershipTitle)
        ? currentLeadership
        : [...currentLeadership, leadershipTitle];

      return {
        ...config,
        departments: newDepts,
        leadership_options: newLeadership
      };
    }));
  };

  const handleRemoveDept = (pIdx: number, deptName: string) => {
    const trimmedDept = deptName.trim();

    setPrograms(prev => prev.map((config, idx) => {
      if (idx !== pIdx) return config;

      const newDepts = config.departments.filter(d => d !== trimmedDept);
      const leadershipTitle = getLeadershipName(trimmedDept);
      const newLeadership = (config.leadership_options || []).filter(
        o => o !== leadershipTitle && o !== trimmedDept
      );

      return {
        ...config,
        departments: newDepts,
        leadership_options: newLeadership
      };
    }));
  };

  const handleAddLeadershipOption = (idx: number, optionName: string) => {
    const trimmed = optionName.trim();
    if (!trimmed) return;

    setPrograms(prev => prev.map((config, pIdx) => {
      if (pIdx !== idx) return config;

      const currentOptions = config.leadership_options || [];
      const newOptions = currentOptions.includes(trimmed)
        ? currentOptions
        : [...currentOptions, trimmed];

      return {
        ...config,
        leadership_options: newOptions
      };
    }));
  };

  const handleRemoveLeadershipOption = (pIdx: number, optionName: string) => {
    setPrograms(prev => prev.map((config, idx) => {
      if (idx !== pIdx) return config;

      return {
        ...config,
        leadership_options: (config.leadership_options || []).filter(o => o !== optionName)
      };
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200 text-black">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 max-h-[90vh] flex flex-col">
        <div className="bg-amber-500 p-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <Edit3 size={20} />
            <h3 className="font-bold uppercase tracking-widest text-sm">Chỉnh sửa phiếu đăng ký</h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="p-1.5 hover:bg-white/10 rounded-full text-white border-none bg-transparent cursor-pointer disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          <div className="space-y-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-amber-600 ml-1">Tiêu đề phiếu</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-white rounded-xl border border-slate-200 font-bold text-sm outline-none focus:border-amber-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-amber-600 ml-1">Mô tả phiếu</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-amber-500 resize-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-amber-600 uppercase text-xs tracking-wider">
              Các chương trình & Ban tuyển chọn
            </h4>
            {programs.map((config, idx) => (
              <div key={config.program_id} className="p-5 bg-white rounded-2xl border border-amber-100 space-y-4 shadow-sm">
                <span className="font-black text-slate-800 text-sm block border-b border-amber-100 pb-2">
                  {idx + 1}. {config.program_name}
                </span>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-amber-600 ml-1">Mô tả chương trình</label>
                  <input
                    type="text"
                    value={config.description}
                    onChange={(e) => handleConfigChange(idx, 'description', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-amber-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-amber-600 ml-1 block">Danh sách Ban tuyển chọn</label>
                  <div className="flex flex-wrap gap-2">
                    {config.departments.map((dept) => (
                      <span key={dept} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${getDeptBadgeStyle(dept)}`}>
                        {dept}
                        <X size={12} className="cursor-pointer hover:text-red-500 ml-1" onClick={() => handleRemoveDept(idx, dept)} />
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Nhập tên Ban chuyên môn và nhấn Enter..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-amber-500 mt-2 transition-all"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDept(idx, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>

                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enable_leadership_survey || false}
                      onChange={(e) => handleConfigChange(idx, 'enable_leadership_survey', e.target.checked)}
                      className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                      <UserCheck size={14} /> Khảo sát nguyện vọng ứng cử vị trí Trưởng ban / Phó ban
                    </span>
                  </label>

                  {config.enable_leadership_survey && (
                    <div className="space-y-3 pl-6 border-l-2 border-amber-400 pt-1">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-amber-700">Tiêu đề nội dung ứng cử</label>
                        <input
                          type="text"
                          value={config.leadership_title || ''}
                          onChange={(e) => handleConfigChange(idx, 'leadership_title', e.target.value)}
                          placeholder="VD: Đăng ký nguyện vọng ứng cử vị trí Trưởng / Phó Ban:"
                          className="w-full p-2 bg-white rounded-lg border border-amber-200 text-xs font-bold outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-amber-700 block">Danh sách chức danh ứng cử</label>
                        <div className="flex flex-wrap gap-2">
                          {(config.leadership_options || []).map((opt) => (
                            <span key={opt} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${getDeptBadgeStyle(opt.replace(/^Trưởng\s+|^Phó\s+trưởng\s+|^Phó\s+/i, ''))}`}>
                              ✓ {opt}
                              <X size={12} className="cursor-pointer hover:text-red-500 ml-1" onClick={() => handleRemoveLeadershipOption(idx, opt)} />
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Nhập chức danh ứng cử (VD: Trưởng Ban Nội dung) và nhấn Enter..."
                          className="w-full p-2 bg-white border border-amber-200 rounded-lg text-xs font-medium outline-none focus:border-amber-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddLeadershipOption(idx, (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:bg-gray-100 text-xs uppercase border-none bg-transparent cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs uppercase shadow-lg shadow-amber-100 border-none cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <span>Cập nhật phiếu</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
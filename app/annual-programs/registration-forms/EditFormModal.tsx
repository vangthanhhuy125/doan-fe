'use client';

import { useState } from 'react';
import { X, Edit3 } from 'lucide-react';
import { RegistrationForm, ProgramConfig } from './types';

interface Props {
  form: RegistrationForm;
  onClose: () => void;
  onSave: (updated: RegistrationForm) => void;
}

export default function EditFormModal({ form, onClose, onSave }: Props) {
  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description);
  const [programs, setPrograms] = useState<ProgramConfig[]>(form.programs);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      title,
      description,
      programs,
    });
  };

  const handleConfigChange = (idx: number, field: string, value: any) => {
    const updated = [...programs];
    updated[idx] = { ...updated[idx], [field]: value };
    setPrograms(updated);
  };

  const handleAddDept = (idx: number, deptName: string) => {
    if (!deptName.trim()) return;
    const updated = [...programs];
    if (!updated[idx].departments.includes(deptName.trim())) {
      updated[idx].departments.push(deptName.trim());
      setPrograms(updated);
    }
  };

  const handleRemoveDept = (pIdx: number, deptName: string) => {
    const updated = [...programs];
    updated[pIdx].departments = updated[pIdx].departments.filter(d => d !== deptName);
    setPrograms(updated);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200 text-black">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 max-h-[90vh] flex flex-col">
        {/* HEADER MÀU CAM */}
        <div className="bg-amber-500 p-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <Edit3 size={20} />
            <h3 className="font-bold uppercase tracking-widest text-sm">Chỉnh sửa phiếu đăng ký</h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/10 rounded-full text-white border-none bg-transparent cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {/* TIÊU ĐỀ & MÔ TẢ PHIẾU */}
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

          {/* DANH SÁCH CHƯƠNG TRÌNH */}
          <div className="space-y-4">
            <h4 className="font-bold text-amber-600 uppercase text-xs tracking-wider">
              Cấu hình chương trình & Ban tuyển chọn
            </h4>

            {programs.map((config, idx) => (
              <div key={config.program_id} className="p-5 bg-white rounded-2xl border border-amber-100 space-y-3 shadow-sm">
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
                      <span key={dept} className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-xs font-bold border border-amber-200">
                        {dept}
                        <X size={12} className="cursor-pointer hover:text-red-500 ml-1" onClick={() => handleRemoveDept(idx, dept)} />
                      </span>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Nhập tên Ban mới và nhấn Enter..."
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
              </div>
            ))}
          </div>

          {/* FOOTER NÚT BẤM */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:bg-gray-100 text-xs uppercase border-none bg-transparent cursor-pointer"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs uppercase shadow-lg shadow-amber-100 border-none cursor-pointer transition-all active:scale-95"
            >
              Cập nhật phiếu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
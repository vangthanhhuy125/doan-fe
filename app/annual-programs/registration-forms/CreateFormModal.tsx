'use client';

import { useState } from 'react';
import { X, FileCheck2 } from 'lucide-react';
import { Program, ProgramConfig, RegistrationForm } from './types';

interface Props {
  selectedPrograms: Program[];
  onClose: () => void;
  onSave: (newForm: RegistrationForm) => void;
}

export default function CreateFormModal({ selectedPrograms, onClose, onSave }: Props) {
  const getProgramId = (p: Program): string => {
    if (!p?._id) return '';
    return typeof p._id === 'object' && p._id.$oid ? p._id.$oid : String(p._id);
  };

  const [title, setTitle] = useState(`PHIẾU ĐĂNG KÝ THAM GIA CHƯƠNG TRÌNH - ${new Date().getFullYear()}`);
  const [description, setDescription] = useState("Thân mời các đồng chí Đoàn viên, Sinh viên đăng ký tham gia các Ban điều hành chương trình.");
  const [configs, setConfigs] = useState<ProgramConfig[]>(
    selectedPrograms.map(p => ({
      program_id: getProgramId(p),
      program_name: p.program_name || '',
      description: "",
      departments: ["Ban Tổ chức", "Ban Truyền thông", "Ban Hậu cần", "Ban Nội dung"]
    }))
  );

  const handleConfigChange = (idx: number, field: string, value: any) => {
    const updated = [...configs];
    updated[idx] = { ...updated[idx], [field]: value };
    setConfigs(updated);
  };

  const handleAddDepartment = (idx: number, deptName: string) => {
    if (!deptName.trim()) return;
    const updated = [...configs];
    if (!updated[idx].departments.includes(deptName.trim())) {
      updated[idx].departments.push(deptName.trim());
      setConfigs(updated);
    }
  };

  const handleRemoveDepartment = (pIdx: number, deptName: string) => {
    const updated = [...configs];
    updated[pIdx].departments = updated[pIdx].departments.filter(d => d !== deptName);
    setConfigs(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newForm: RegistrationForm = {
      _id: Date.now().toString(),
      title,
      description,
      created_at: new Date().toISOString(),
      programs: configs,
      submissions: []
    };
    onSave(newForm);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200 text-black">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 max-h-[90vh] flex flex-col">
        <div className="bg-[#0054a5] p-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <FileCheck2 size={20} />
            <h3 className="font-bold uppercase tracking-widest text-sm">Tạo phiếu đăng ký chương trình</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-white border-none bg-transparent cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400">Tiêu đề phiếu</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-white rounded-xl border border-slate-200 font-bold text-sm outline-none focus:border-[#1d92ff]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400">Mô tả phiếu</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#1d92ff] resize-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-[#0054a5] uppercase text-xs tracking-wider">
              Danh sách chương trình áp dụng ({configs.length})
            </h4>

            {configs.map((config, idx) => (
              <div key={config.program_id} className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                <span className="font-black text-slate-800 text-sm block border-b border-slate-100 pb-2">
                  {idx + 1}. {config.program_name}
                </span>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Mô tả chương trình</label>
                  <input
                    type="text"
                    placeholder="Nhập mô tả chi tiết chương trình..."
                    value={config.description}
                    onChange={(e) => handleConfigChange(idx, 'description', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#1d92ff]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-gray-400 block">Các Ban tuyển chọn</label>
                  <div className="flex flex-wrap gap-2">
                    {config.departments.map((dept) => (
                      <span key={dept} className="inline-flex items-center gap-1.5 bg-blue-50 text-[#0054a5] px-3 py-1 rounded-lg text-xs font-bold border border-blue-100">
                        <input type="radio" readOnly checked className="accent-[#0054a5]" />
                        {dept}
                        <X size={12} className="cursor-pointer hover:text-red-500 ml-1" onClick={() => handleRemoveDepartment(idx, dept)} />
                      </span>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Nhập tên Ban mới và nhấn Enter..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-[#1d92ff] mt-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDepartment(idx, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:bg-gray-100 text-xs uppercase border-none bg-transparent cursor-pointer">
              Hủy
            </button>
            <button type="submit" className="px-6 py-2.5 bg-[#0054a5] text-white font-bold rounded-xl text-xs uppercase shadow-lg hover:bg-blue-700 border-none cursor-pointer">
              Tạo phiếu đăng ký
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from "react";
import { Plus, X, School, Users, ChevronDown } from "lucide-react";

interface Props {
  onClose: () => void;
  onSave: (payload: any) => void;
}

export default function AddBranchLCHModal({ onClose, onSave }: Props) {
  const [type, setType] = useState<'CHIHOI' | 'TAPTHE'>('CHIHOI');
  const [userList, setUserList] = useState<any[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>({
    ten: "",
    khoa: "",
    chiHoiTruong: "",
    chiHoiPho: "",
    uvbch: ["", "", ""],
    member: [
      { role: "Chủ nhiệm", name: "" },
      { role: "Phó Chủ nhiệm", name: "" },
      { role: "Phó Chủ nhiệm", name: "" }
    ]
  });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/nhan-su`)
      .then(res => res.json())
      .then(users => {
        if (Array.isArray(users)) {
          setUserList(users);
          const classes = Array.from(new Set(users.map((u: any) => u.class))).filter(Boolean).sort() as string[];
          setAvailableClasses(classes);
        }
      })
      .catch(() => {});
  }, []);

  const filteredUsers = userList.filter(u => u.class === formData.ten);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      unitType: type,
      scope: 'HOI',
      group_name: formData.ten,
      intake: formData.khoa
    });
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-3 sm:p-4 text-black">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-sky-700 to-[#0054a5] p-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl">
              <Plus size={18} />
            </div>
            <h3 className="font-extrabold uppercase tracking-wide text-xs sm:text-sm">
              Thêm Đơn vị Trực thuộc LCH
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/15 rounded-full text-white border-none bg-transparent cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="flex p-1 bg-slate-100 m-5 mb-0 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => setType('CHIHOI')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-xs border-none cursor-pointer ${
              type === 'CHIHOI' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 bg-transparent'
            }`}
          >
            <School size={16} /> Chi hội
          </button>
          <button
            type="button"
            onClick={() => setType('TAPTHE')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-xs border-none cursor-pointer ${
              type === 'TAPTHE' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 bg-transparent'
            }`}
          >
            <Users size={16} /> CLB / Đội
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {type === 'CHIHOI' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Tên Chi hội</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.ten}
                      onChange={(e) => setFormData({...formData, ten: e.target.value, chiHoiTruong: "", chiHoiPho: "", uvbch: ["", "", ""]})}
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 appearance-none font-bold pr-8"
                    >
                      <option value="" disabled>-- Chọn Chi hội --</option>
                      {availableClasses.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Khóa</label>
                  <input
                    required
                    placeholder="VD: 2024"
                    value={formData.khoa}
                    onChange={(e) => setFormData({...formData, khoa: e.target.value})}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-sky-700 ml-1">Chi hội trưởng</label>
                  <div className="relative">
                    <select
                      required
                      disabled={!formData.ten}
                      value={formData.chiHoiTruong}
                      onChange={(e) => setFormData({...formData, chiHoiTruong: e.target.value})}
                      className="w-full p-3 bg-sky-50/50 rounded-xl border border-sky-100 text-xs sm:text-sm text-slate-800 appearance-none font-bold pr-8 disabled:opacity-50"
                    >
                      <option value="">-- Chọn cán bộ --</option>
                      {filteredUsers.map((u: any) => (
                        <option key={u._id || u.id} value={u.full_name || u.name}>{u.full_name || u.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-teal-700 ml-1">Chi hội phó</label>
                  <div className="relative">
                    <select
                      required
                      disabled={!formData.ten}
                      value={formData.chiHoiPho}
                      onChange={(e) => setFormData({...formData, chiHoiPho: e.target.value})}
                      className="w-full p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-xs sm:text-sm text-slate-800 appearance-none font-bold pr-8 disabled:opacity-50"
                    >
                      <option value="">-- Chọn cán bộ --</option>
                      {filteredUsers.map((u: any) => (
                        <option key={u._id || u.id} value={u.full_name || u.name}>{u.full_name || u.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <label className="text-[10px] font-bold uppercase text-cyan-700 ml-1">Ủy viên BCH Chi hội</label>
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="relative">
                    <select
                      disabled={!formData.ten}
                      value={formData.uvbch[idx] || ""}
                      onChange={(e) => {
                        const newUv = [...formData.uvbch];
                        newUv[idx] = e.target.value;
                        setFormData({...formData, uvbch: newUv});
                      }}
                      className="w-full p-2.5 bg-cyan-50/40 rounded-xl border border-cyan-100 text-xs text-slate-800 appearance-none font-bold pr-8 disabled:opacity-50"
                    >
                      <option value="">-- Chọn UV BCH {idx + 1} (Tùy chọn) --</option>
                      {filteredUsers.map((u: any) => (
                        <option key={u._id || u.id} value={u.full_name || u.name}>{u.full_name || u.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Tên CLB / Đội trực thuộc LCH</label>
                <input
                  required
                  placeholder="VD: Đội Công tác Xã hội"
                  value={formData.ten}
                  onChange={(e) => setFormData({...formData, ten: e.target.value})}
                  className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800"
                />
              </div>
              <div className="space-y-3 border-t border-slate-100 pt-3">
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Ban Chủ nhiệm</label>
                {formData.member.map((m: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-2 gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      disabled
                      value={m.role}
                      className="p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-600"
                    />
                    <input
                      required
                      placeholder="Họ và tên..."
                      value={m.name}
                      onChange={(e) => {
                        const newMembers = [...formData.member];
                        newMembers[idx].name = e.target.value;
                        setFormData({...formData, member: newMembers});
                      }}
                      className="p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-800"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3 border-t border-slate-100 shrink-0">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 text-xs uppercase border-none cursor-pointer">
              Hủy
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-sky-600 text-white hover:bg-sky-700 rounded-xl font-bold shadow-md text-xs uppercase border-none cursor-pointer">
              Lưu đơn vị
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
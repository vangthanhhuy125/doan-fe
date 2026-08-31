'use client';

import { useState, useEffect } from "react";
import { Plus, X, School, Users, ChevronDown } from "lucide-react";

interface AddUnitModalProps {
  onClose: () => void;
  onSave: (newUnit: any) => void;
}

let cachedUsersForAddUnit: any[] | null = null;

export default function AddUnitModal({ onClose, onSave }: AddUnitModalProps) {
  const [type, setType] = useState<'CHIDOAN' | 'TAPTHE'>('CHIDOAN');
  const [userList, setUserList] = useState<any[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>({
    ten: "",
    group_name: "",
    khoa: "",
    intake: "",
    biThu: "",
    phoBiThu: "",
    uvbch: ["", "", ""],
    member: [
      { role: "Chủ nhiệm", name: "" },
      { role: "Phó Chủ nhiệm", name: "" },
      { role: "Ủy viên", name: "" }
    ]
  });

  const leaderRoles = ["Chủ nhiệm", "Trưởng ban", "Đội trưởng"];
  const subRoles = ["Phó Chủ nhiệm", "Phó ban", "Đội phó", "Ủy viên"];

  useEffect(() => {
    if (cachedUsersForAddUnit && cachedUsersForAddUnit.length > 0) {
      setUserList(cachedUsersForAddUnit);
      const uniqueClasses = Array.from(new Set(cachedUsersForAddUnit.map((u: any) => u.class)))
        .filter(Boolean)
        .sort() as string[];
      setAvailableClasses(uniqueClasses);
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nhan-su`);
        const data = await res.json();
        const users = Array.isArray(data) ? data : [];
        cachedUsersForAddUnit = users;
        setUserList(users);
        
        const uniqueClasses = Array.from(new Set(users.map((u: any) => u.class)))
          .filter(Boolean)
          .sort() as string[];
        setAvailableClasses(uniqueClasses);
      } catch (error) {
        if (!cachedUsersForAddUnit) {
          setUserList([]);
          setAvailableClasses([]);
        }
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = userList.filter(u => u.class === formData.ten);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { 
      ...formData, 
      unitType: type, 
      group_name: formData.ten,
      intake: formData.khoa 
    };
    onSave(payload);
  };

  const updateMember = (index: number, field: 'role' | 'name', value: string) => {
    const newMembers = [...formData.member];
    newMembers[index][field] = value;
    setFormData({ ...formData, member: newMembers });
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200 text-black">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-[#004282] to-[#0054a5] p-5 sm:p-6 flex items-center justify-between text-white shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl border border-white/20">
              <Plus size={18} />
            </div>
            <h3 className="font-extrabold uppercase tracking-wide text-xs sm:text-sm">
              Thêm đơn vị trực thuộc
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/15 rounded-full text-white transition-colors border-none bg-transparent cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex p-1.5 bg-slate-100 m-5 mb-0 rounded-2xl shrink-0">
          <button 
            type="button"
            onClick={() => setType('CHIDOAN')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all border-none cursor-pointer ${
              type === 'CHIDOAN' ? 'bg-white text-[#0054a5] shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-transparent'
            }`}
          >
            <School size={16} /> Chi đoàn
          </button>
          <button 
            type="button"
            onClick={() => setType('TAPTHE')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all border-none cursor-pointer ${
              type === 'TAPTHE' ? 'bg-white text-[#0054a5] shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-transparent'
            }`}
          >
            <Users size={16} /> CLB / Đội / Ban
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {type === 'CHIDOAN' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Tên Chi đoàn</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.ten}
                      onChange={(e) => setFormData({...formData, ten: e.target.value, biThu: "", phoBiThu: "", uvbch: ["", "", ""]})}
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#0054a5] outline-none text-xs sm:text-sm text-slate-800 appearance-none cursor-pointer pr-8 font-bold"
                    >
                      <option value="" disabled>-- Chọn Chi đoàn --</option>
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
                    placeholder="VD: 2023" 
                    value={formData.khoa} 
                    onChange={(e) => setFormData({...formData, khoa: e.target.value})} 
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#0054a5] outline-none text-xs sm:text-sm text-slate-800 font-bold" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-rose-600 ml-1">Bí thư</label>
                  <div className="relative">
                    <select
                      required
                      disabled={!formData.ten}
                      value={formData.biThu}
                      onChange={(e) => setFormData({...formData, biThu: e.target.value})}
                      className="w-full p-3 bg-rose-50/50 rounded-xl border border-rose-100 focus:bg-white outline-none text-xs sm:text-sm text-slate-800 appearance-none cursor-pointer pr-8 font-bold disabled:opacity-50"
                    >
                      <option value="">-- Chọn nhân sự --</option>
                      {filteredUsers.map((u: any) => (
                        <option key={u._id || u.id} value={u.full_name || u.name}>{u.full_name || u.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-amber-600 ml-1">Phó Bí thư</label>
                  <div className="relative">
                    <select
                      required
                      disabled={!formData.ten}
                      value={formData.phoBiThu}
                      onChange={(e) => setFormData({...formData, phoBiThu: e.target.value})}
                      className="w-full p-3 bg-amber-50/50 rounded-xl border border-amber-100 focus:bg-white outline-none text-xs sm:text-sm text-slate-800 appearance-none cursor-pointer pr-8 font-bold disabled:opacity-50"
                    >
                      <option value="">-- Chọn nhân sự --</option>
                      {filteredUsers.map((u: any) => (
                        <option key={u._id || u.id} value={u.full_name || u.name}>{u.full_name || u.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 border-t border-slate-100 pt-3">
                <label className="text-[10px] font-bold uppercase text-[#0054a5] ml-1">Ủy viên Ban Chấp hành Chi đoàn</label>
                
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
                      className="w-full p-2.5 bg-blue-50/40 rounded-xl border border-blue-100 focus:bg-white outline-none text-xs text-slate-800 appearance-none cursor-pointer pr-8 font-bold disabled:opacity-50"
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
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Tên CLB / Ban / Đội</label>
                <input 
                  required 
                  placeholder="VD: CLB GameApp" 
                  value={formData.ten} 
                  onChange={(e) => setFormData({...formData, ten: e.target.value})} 
                  className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#0054a5] outline-none text-xs sm:text-sm font-bold text-slate-800" 
                />
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-3">
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Ban điều hành / Trưởng ban</label>
                {formData.member.map((member: any, index: number) => (
                  <div key={index} className="grid grid-cols-2 gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="relative">
                      <select 
                        required 
                        value={member.role} 
                        onChange={(e) => updateMember(index, 'role', e.target.value)}
                        className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold outline-none focus:border-[#0054a5] appearance-none pr-7 cursor-pointer"
                      >
                        <option value="" disabled>-- Chức vụ --</option>
                        {(index === 0 ? leaderRoles : subRoles).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <input 
                      required 
                      placeholder="Họ và tên..." 
                      value={member.name} 
                      onChange={(e) => updateMember(index, 'name', e.target.value)}
                      className="p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold outline-none focus:border-[#0054a5]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3 border-t border-slate-100 shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all text-xs uppercase tracking-wider border-none cursor-pointer"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2.5 bg-[#0054a5] text-white hover:bg-blue-700 rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-none cursor-pointer active:scale-95"
            >
              Lưu đơn vị
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
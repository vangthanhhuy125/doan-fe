'use client';

import { useState, useEffect } from "react";
import { School, X, ChevronDown } from "lucide-react";

interface Props {
  unit: any;
  onClose: () => void;
  onSave: (updatedUnit: any) => void;
}

let cachedUsersForEditUnit: any[] | null = null;

export default function EditUnitModal({ unit, onClose, onSave }: Props) {
  const [userList, setUserList] = useState<any[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [formData, setFormData] = useState({ 
    ...unit, 
    ten: unit.ten || unit.group_name || "",
    member: Array.isArray(unit.member) ? unit.member : [],
    uvbch: Array.isArray(unit.uvbch) ? unit.uvbch : [],
    biThu: unit.biThu || "",
    phoBiThu: unit.phoBiThu || "",
    truongBan: unit.truongBan || "",
    phoBan1: unit.phoBan1 || "",
    phoBan2: unit.phoBan2 || ""
  });

  const isCLB = formData.ten?.toUpperCase().includes("CLB") || formData.unitType === 'TAPTHE';
  const isBan = formData.ten?.toUpperCase().includes("BAN");
  const isChiDoan = !isCLB && !isBan;
  const [hasThreeUV, setHasThreeUV] = useState(formData.uvbch?.length > 1 || !!unit.uvBch1);

  useEffect(() => {
    if (cachedUsersForEditUnit && cachedUsersForEditUnit.length > 0) {
      setUserList(cachedUsersForEditUnit);
      const uniqueClasses = Array.from(new Set(cachedUsersForEditUnit.map((u: any) => u.class)))
        .filter(Boolean)
        .sort() as string[];
      setAvailableClasses(uniqueClasses);
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nhan-su`);
        const data = await res.json();
        const users = Array.isArray(data) ? data : [];
        cachedUsersForEditUnit = users;
        setUserList(users);
        
        const uniqueClasses = Array.from(new Set(users.map((u: any) => u.class)))
          .filter(Boolean)
          .sort() as string[];
        setAvailableClasses(uniqueClasses);
      } catch (error) {
        if (!cachedUsersForEditUnit) {
          setUserList([]);
          setAvailableClasses([]);
        }
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = userList.filter(u => u.class === formData.ten);

  const getLabels = () => {
    if (isCLB) return ["Chủ nhiệm", "Phó Chủ nhiệm 1", "Phó Chủ nhiệm 2"];
    if (isBan) return ["Trưởng ban", "Phó ban 1", "Phó ban 2"];
    return hasThreeUV ? ["Bí thư", "Phó Bí thư", "UV BCH 1", "UV BCH 2", "UV BCH 3"] : ["Bí thư", "Phó Bí thư", "UV BCH"];
  };

  const labels = getLabels();

  const handleInputChange = (field: string, value: string) => {
    if (isCLB) {
      const fieldIndexMap: Record<string, number> = { "chuNhiem": 0, "phoChuNhiem1": 1, "phoChuNhiem2": 2 };
      const index = fieldIndexMap[field];
      if (index !== undefined) {
        const newMembers = [...formData.member];
        const roles = ["Chủ nhiệm", "Phó Chủ nhiệm", "Phó Chủ nhiệm"];
        newMembers[index] = { role: roles[index], name: value };
        setFormData({ ...formData, member: newMembers });
        return;
      }
    }

    if (field.startsWith('uvBch')) {
      const uvIndexMap: Record<string, number> = { "uvBch": 0, "uvBch1": 0, "uvBch2": 1, "uvBch3": 2 };
      const idx = uvIndexMap[field];
      const newUv = [...formData.uvbch];
      newUv[idx] = value;
      setFormData({ ...formData, uvbch: newUv, [field]: value });
      return;
    }

    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200 text-black">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-[#004282] to-[#0054a5] p-5 sm:p-6 flex items-center justify-between text-white shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl border border-white/20">
              <School size={18} />
            </div>
            <h3 className="font-extrabold uppercase tracking-wide text-xs sm:text-sm">
              Cập nhật thông tin đơn vị
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/15 rounded-full text-white transition-colors border-none bg-transparent cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave({...formData, group_name: formData.ten}); }} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Tên Chi đoàn / Tập thể</label>
            {isChiDoan ? (
              <div className="relative">
                <select
                  required
                  value={formData.ten}
                  onChange={(e) => setFormData({...formData, ten: e.target.value, biThu: "", phoBiThu: "", uvbch: []})}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#0054a5] outline-none text-xs sm:text-sm font-bold text-slate-800 appearance-none cursor-pointer pr-8"
                >
                  <option value="" disabled>-- Chọn Chi đoàn --</option>
                  {availableClasses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            ) : (
              <input 
                required 
                value={formData.ten} 
                onChange={(e) => setFormData({...formData, ten: e.target.value})} 
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#0054a5] outline-none text-xs sm:text-sm font-bold text-slate-800" 
              />
            )}
          </div>

          {isChiDoan && (
            <div className="flex items-center gap-2 px-1">
              <input 
                type="checkbox" 
                id="threeUV" 
                checked={hasThreeUV} 
                onChange={(e) => setHasThreeUV(e.target.checked)} 
                className="w-4 h-4 accent-[#0054a5] cursor-pointer" 
              />
              <label htmlFor="threeUV" className="text-[11px] font-bold text-slate-600 cursor-pointer select-none">
                Chi đoàn có 3 Ủy viên BCH
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 pt-1 border-t border-slate-100">
            {labels.map((label, idx) => {
              const fieldMap: Record<string, string> = {
                "Chủ nhiệm": "chuNhiem", "Phó Chủ nhiệm 1": "phoChuNhiem1", "Phó Chủ nhiệm 2": "phoChuNhiem2",
                "Trưởng ban": "truongBan", "Phó ban 1": "phoBan1", "Phó ban 2": "phoBan2",
                "Bí thư": "biThu", "Phó Bí thư": "phoBiThu", "UV BCH": "uvBch",
                "UV BCH 1": "uvBch1", "UV BCH 2": "uvBch2", "UV BCH 3": "uvBch3"
              };
              const field = fieldMap[label];
              let val = formData[field] || "";
              
              if (isCLB && ["chuNhiem", "phoChuNhiem1", "phoChuNhiem2"].includes(field)) {
                const i = ({ "chuNhiem": 0, "phoChuNhiem1": 1, "phoChuNhiem2": 2 } as Record<string, number>)[field];
                val = formData.member[i]?.name || "";
              }
              if (field.startsWith('uvBch')) {
                const i = ({ "uvBch": 0, "uvBch1": 0, "uvBch2": 1, "uvBch3": 2 } as Record<string, number>)[field];
                val = formData.uvbch[i] || "";
              }

              return (
                <div key={idx} className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{label}</label>
                  {isChiDoan ? (
                    <div className="relative">
                      <select
                        value={val}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#0054a5] outline-none text-xs font-bold text-slate-800 appearance-none cursor-pointer pr-8"
                      >
                        <option value="">-- Chọn nhân sự --</option>
                        {filteredUsers.map((u: any) => (
                          <option key={u._id || u.id} value={u.full_name || u.name}>{u.full_name || u.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  ) : (
                    <input 
                      value={val} 
                      onChange={(e) => handleInputChange(field, e.target.value)} 
                      className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#0054a5] outline-none text-xs font-bold text-slate-800" 
                    />
                  )}
                </div>
              );
            })}
          </div>

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
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
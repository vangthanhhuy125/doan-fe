'use client';

import { useState } from "react";
import { Plus, X, School, Users, ChevronDown } from "lucide-react";

interface AddUnitModalProps {
  onClose: () => void;
  onSave: (newUnit: any) => void;
}

export default function AddUnitModal({ onClose, onSave }: AddUnitModalProps) {
  const [type, setType] = useState<'CHIDOAN' | 'TAPTHE'>('CHIDOAN');
  const [formData, setFormData] = useState<any>({
    ten: "",
    group_name: "",
    khoa: "",
    intake: "",
    biThu: "",
    phoBiThu: "",
    uvbch: [],
    member: [
      { role: "", name: "" },
      { role: "", name: "" },
      { role: "", name: "" }
    ]
  });

  const leaderRoles = ["Chủ nhiệm", "Trưởng ban", "Đội trưởng"];
  const subRoles = ["Phó Chủ nhiệm", "Phó ban", "Đội phó"];

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
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in zoom-in duration-200 text-black">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-purple-100 max-h-[90vh] flex flex-col">
        <div className="bg-purple-600 p-6 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <Plus size={20} />
            <h3 className="font-bold uppercase tracking-widest text-xs">Thêm đơn vị trực thuộc</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="flex p-2 bg-slate-100 m-6 mb-0 rounded-2xl shrink-0">
          <button 
            type="button"
            onClick={() => setType('CHIDOAN')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${type === 'CHIDOAN' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <School size={16} /> Chi đoàn
          </button>
          <button 
            type="button"
            onClick={() => setType('TAPTHE')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${type === 'TAPTHE' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Users size={16} /> CLB / Ban / Đội
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          {type === 'CHIDOAN' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tên Chi đoàn</label>
                  <input required placeholder="PMCL2023.1" value={formData.ten} onChange={(e) => setFormData({...formData, ten: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:border-purple-400 outline-none text-sm text-slate-800" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Khóa</label>
                  <input required placeholder="2023" value={formData.khoa} onChange={(e) => setFormData({...formData, khoa: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:border-purple-400 outline-none text-sm text-slate-800" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-red-400 ml-1">Bí thư</label>
                  <input required value={formData.biThu} onChange={(e) => setFormData({...formData, biThu: e.target.value})} className="w-full p-3 bg-red-50/30 rounded-xl border border-red-50 focus:bg-white outline-none text-sm text-slate-800" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-amber-500 ml-1">Phó Bí thư</label>
                  <input required value={formData.phoBiThu} onChange={(e) => setFormData({...formData, phoBiThu: e.target.value})} className="w-full p-3 bg-amber-50/30 rounded-xl border border-amber-50 focus:bg-white outline-none text-sm text-slate-800" />
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <label className="text-[10px] font-black uppercase text-blue-500 ml-1">Ủy viên Ban Chấp hành</label>
                <input required placeholder="UV BCH 1" value={formData.uvbch[0] || ""} onChange={(e) => { const newUv = [...formData.uvbch]; newUv[0] = e.target.value; setFormData({...formData, uvbch: newUv}); }} className="w-full p-3 bg-blue-50/30 rounded-xl border border-blue-50 focus:bg-white outline-none text-sm text-slate-800" />
                <input placeholder="UV BCH 2" value={formData.uvbch[1] || ""} onChange={(e) => { const newUv = [...formData.uvbch]; newUv[1] = e.target.value; setFormData({...formData, uvbch: newUv}); }} className="w-full p-3 bg-blue-50/30 rounded-xl border border-blue-50 focus:bg-white outline-none text-sm text-slate-800" />
                <input placeholder="UV BCH 3" value={formData.uvbch[2] || ""} onChange={(e) => { const newUv = [...formData.uvbch]; newUv[2] = e.target.value; setFormData({...formData, uvbch: newUv}); }} className="w-full p-3 bg-blue-50/30 rounded-xl border border-blue-50 focus:bg-white outline-none text-sm text-slate-800" />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tên CLB / Ban / Đội</label>
                <input required placeholder="CLB GamApp" value={formData.ten} onChange={(e) => setFormData({...formData, ten: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-400 outline-none text-sm text-slate-800" />
              </div>

              <div className="space-y-4 border-t pt-4">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Cơ cấu nhân sự</label>
                {formData.member.map((member: any, index: number) => (
                  <div key={index} className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="relative">
                      <select 
                        required 
                        value={member.role} 
                        onChange={(e) => updateMember(index, 'role', e.target.value)}
                        className="w-full p-2.5 bg-white rounded-lg border border-slate-200 text-xs font-bold outline-none focus:border-purple-400 appearance-none pr-8 cursor-pointer" 
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
                      placeholder="Họ và tên" 
                      value={member.name} 
                      onChange={(e) => updateMember(index, 'name', e.target.value)}
                      className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs font-bold outline-none focus:border-purple-400" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3 shrink-0">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest text-black">Hủy</button>
            <button type="submit" className="flex-1 py-3 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
               Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
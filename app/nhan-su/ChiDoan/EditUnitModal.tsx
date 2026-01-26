'use client';

import { useState } from "react";
import { School, X, Save } from "lucide-react";

interface Props {
  unit: any;
  onClose: () => void;
  onSave: (updatedUnit: any) => void;
}

export default function EditUnitModal({ unit, onClose, onSave }: Props) {
  const [formData, setFormData] = useState({ ...unit });
  const isCLB = formData.ten?.toUpperCase().includes("CLB");
  const isBan = formData.ten?.toUpperCase().includes("BAN");
  const [hasThreeUV, setHasThreeUV] = useState(!!formData.uvBch1);

  const getLabels = () => {
    if (isCLB) return ["Chủ nhiệm", "Phó Chủ nhiệm 1", "Phó Chủ nhiệm 2"];
    if (isBan) return ["Trưởng ban", "Phó ban 1", "Phó ban 2"];
    return hasThreeUV ? ["Bí thư", "Phó Bí thư", "UV BCH 1", "UV BCH 2", "UV BCH 3"] : ["Bí thư", "Phó Bí thư", "UV BCH"];
  };

  const labels = getLabels();

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in zoom-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-purple-100 max-h-[90vh] flex flex-col">
        <div className="bg-purple-600 p-6 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <School size={20} />
            <h3 className="font-bold uppercase tracking-widest text-xs">Cập nhật tập thể</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-8 space-y-5 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tên Chi đoàn / Tập thể</label>
            <input required value={formData.ten} onChange={(e) => setFormData({...formData, ten: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-400 outline-none text-sm font-black text-slate-800" />
          </div>

          {!isCLB && !isBan && (
            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" id="threeUV" checked={hasThreeUV} onChange={(e) => setHasThreeUV(e.target.checked)} className="w-4 h-4 accent-purple-600" />
              <label htmlFor="threeUV" className="text-[10px] font-bold uppercase text-slate-500 cursor-pointer">Chi đoàn có 3 Ủy viên BCH</label>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {labels.map((label, idx) => {
              const fieldMap: any = {
                "Chủ nhiệm": "chuNhiem", "Phó Chủ nhiệm 1": "phoChuNhiem1", "Phó Chủ nhiệm 2": "phoChuNhiem2",
                "Trưởng ban": "truongBan", "Phó ban 1": "phoBan1", "Phó ban 2": "phoBan2",
                "Bí thư": "biThu", "Phó Bí thư": "phoBiThu", "UV BCH": "uvBch",
                "UV BCH 1": "uvBch1", "UV BCH 2": "uvBch2", "UV BCH 3": "uvBch3"
              };
              const field = fieldMap[label];
              return (
                <div key={idx} className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{label}</label>
                  <input required value={formData[field] || ""} onChange={(e) => setFormData({...formData, [field]: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:border-purple-400 outline-none text-sm font-bold text-slate-800" />
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex gap-3 shrink-0">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest text-black">Hủy</button>
            <button type="submit" className="flex-1 py-3 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
              <Save size={14} /> Lưu lại
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
'use client';

import { useState } from "react";
import { School, LayoutGrid, UserCircle, Edit, Trash2 } from "lucide-react";
import EditUnitModal from "./EditUnitModal";
import DeleteUnitConfirm from "./DeleteUnitConfirm";

interface Props {
  chiDoanTruocThuoc: any[];
}

export default function SectionChiDoan({ chiDoanTruocThuoc: initialData }: Props) {
  const [units, setUnits] = useState(initialData);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [deletingUnit, setDeletingUnit] = useState<any>(null);

  const handleSaveEdit = (updatedUnit: any) => {
    setUnits(units.map(u => u.ten === editingUnit.ten ? updatedUnit : u));
    setEditingUnit(null);
  };

  const handleConfirmDelete = () => {
    setUnits(units.filter(u => u.ten !== deletingUnit.ten));
    setDeletingUnit(null);
  };

  const renderPersonnel = (unit: any) => {
    const isCLB = unit.ten.toUpperCase().includes("CLB");
    const isBan = unit.ten.toUpperCase().includes("BAN");

    let members: any[] = [];

    if (isCLB) {
      members = [
        { role: "Chủ nhiệm", name: unit.chuNhiem, color: "bg-red-50/40 border-red-50 text-red-400" },
        { role: "Phó Chủ nhiệm 1", name: unit.phoChuNhiem1, color: "bg-amber-50/40 border-amber-50 text-amber-500" },
        { role: "Phó Chủ nhiệm 2", name: unit.phoChuNhiem2, color: "bg-blue-50/40 border-blue-50 text-blue-500" }
      ];
    } else if (isBan) {
      members = [
        { role: "Trưởng ban", name: unit.truongBan, color: "bg-red-50/40 border-red-50 text-red-400" },
        { role: "Phó ban 1", name: unit.phoBan1, color: "bg-amber-50/40 border-amber-50 text-amber-500" },
        { role: "Phó ban 2", name: unit.phoBan2, color: "bg-blue-50/40 border-blue-50 text-blue-500" }
      ];
    } else {
      // Cấu trúc Chi đoàn: Luôn có BT và PBT
      members = [
        { role: "Bí thư", name: unit.biThu, color: "bg-red-50/40 border-red-50 text-red-400" },
        { role: "Phó Bí thư", name: unit.phoBiThu, color: "bg-amber-50/40 border-amber-50 text-amber-500" },
      ];
      
      // Thêm UVBCH (1 hoặc 3 người)
      if (unit.uvBch1 && unit.uvBch2 && unit.uvBch3) {
        members.push(
          { role: "UV BCH 1", name: unit.uvBch1, color: "bg-blue-50/40 border-blue-50 text-blue-500" },
          { role: "UV BCH 2", name: unit.uvBch2, color: "bg-blue-50/40 border-blue-50 text-blue-500" },
          { role: "UV BCH 3", name: unit.uvBch3, color: "bg-blue-50/40 border-blue-50 text-blue-500" }
        );
      } else {
        members.push({ role: "UV BCH", name: unit.uvBch, color: "bg-blue-50/40 border-blue-50 text-blue-500" });
      }
    }

    return (
      <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-white text-black">
        {members.map((m, i) => (
          <div key={i} className={`p-4 rounded-[1.5rem] border relative overflow-hidden group/item ${m.color}`}>
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/item:scale-110 transition-transform">
              <UserCircle size={40} />
            </div>
            <p className="text-[10px] font-black uppercase mb-2 tracking-widest">{m.role}</p>
            <p className="text-sm font-black text-slate-800 truncate">{m.name || "Chưa cập nhật"}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="space-y-8 text-black">
      <div className="flex items-center gap-3 border-b-2 border-purple-600 pb-3">
        <div className="p-2 bg-purple-600 rounded-xl text-white shadow-lg shadow-purple-100">
          <LayoutGrid size={24} />
        </div>
        <h2 className="text-2xl font-black uppercase text-purple-600 tracking-tight">Chi đoàn & Tập thể trực thuộc</h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {units.map((unit, index) => (
          <div key={index} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="bg-gradient-to-r from-purple-50 to-white px-8 py-5 border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-200 group-hover:rotate-12 transition-transform duration-500">
                  <School size={20} />
                </div>
                <span className="font-black text-slate-800 text-base tracking-wide uppercase">{unit.ten}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingUnit(unit)} className="p-2 text-amber-500 hover:bg-amber-100 rounded-xl transition-all shadow-sm">
                  <Edit size={18} />
                </button>
                <button onClick={() => setDeletingUnit(unit)} className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-all shadow-sm">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            {renderPersonnel(unit)}
          </div>
        ))}
      </div>

      {editingUnit && (
        <EditUnitModal 
          unit={editingUnit} 
          onClose={() => setEditingUnit(null)} 
          onSave={handleSaveEdit} 
        />
      )}

      {deletingUnit && (
        <DeleteUnitConfirm 
          unitName={deletingUnit.ten} 
          onClose={() => setDeletingUnit(null)} 
          onConfirm={handleConfirmDelete} 
        />
      )}
    </section>
  );
}
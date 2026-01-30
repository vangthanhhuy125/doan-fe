'use client';

import { useState, useEffect } from "react";
import { School, LayoutGrid, UserCircle, Edit, Trash2, Plus } from "lucide-react";
import EditUnitModal from "./EditUnitModal";
import DeleteUnitConfirm from "./DeleteUnitConfirm";
import AddUnitModal from "./AddUnitModal";

interface Props {
  chiDoanTruocThuoc: any[];
}

export default function SectionChiDoan({ chiDoanTruocThuoc: initialData }: Props) {
  const [units, setUnits] = useState<any[]>([]);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [deletingUnit, setDeletingUnit] = useState<any>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const fetchUnits = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations`);
      const data = await res.json();
      
      const sortedData = Array.isArray(data) ? data.sort((a, b) => {
        if (a.unitType === 'CHIDOAN' && b.unitType !== 'CHIDOAN') return -1;
        if (a.unitType !== 'CHIDOAN' && b.unitType === 'CHIDOAN') return 1;
        return 0;
      }) : [];
      
      setUnits(sortedData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleSaveEdit = async (updatedUnit: any) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations/${updatedUnit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUnit),
      });
      if (res.ok) {
        await fetchUnits();
        setEditingUnit(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddUnit = async (newUnit: any) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUnit),
      });
      if (res.ok) {
        await fetchUnits();
        setIsAddOpen(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations/${deletingUnit._id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchUnits();
        setDeletingUnit(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderPersonnel = (unit: any) => {
    const isCLB = unit.ten?.toUpperCase().includes("CLB");
    const isBan = unit.ten?.toUpperCase().includes("BAN");

    let members: any[] = [];

    if (isCLB || unit.unitType === 'TAPTHE') {
      const sourceMembers = unit.member || [];
      members = [
        { role: sourceMembers[0]?.role || "Chủ nhiệm", name: sourceMembers[0]?.name || unit.chuNhiem, color: "bg-red-50/40 border-red-50 text-red-400" },
        { role: sourceMembers[1]?.role || "Phó Chủ nhiệm", name: sourceMembers[1]?.name || unit.phoChuNhiem1, color: "bg-amber-50/40 border-amber-50 text-amber-500" },
        { role: sourceMembers[2]?.role || "Phó Chủ nhiệm", name: sourceMembers[2]?.name || unit.phoChuNhiem2, color: "bg-blue-50/40 border-blue-50 text-blue-500" }
      ];
    } else if (isBan) {
      members = [
        { role: "Trưởng ban", name: unit.truongBan, color: "bg-red-50/40 border-red-50 text-red-400" },
        { role: "Phó ban", name: unit.phoBan1, color: "bg-amber-50/40 border-amber-50 text-amber-500" },
        { role: "Phó ban", name: unit.phoBan2, color: "bg-blue-50/40 border-blue-50 text-blue-500" }
      ];
    } else {
      members = [
        { role: "Bí thư", name: unit.biThu, color: "bg-red-50/40 border-red-50 text-red-400" },
        { role: "Phó Bí thư", name: unit.phoBiThu, color: "bg-amber-50/40 border-amber-50 text-amber-500" },
      ];
      
      const uvList = unit.uvbch || [];
      if (uvList.length > 0) {
        uvList.forEach((uv: string) => {
          members.push({ role: "UV BCH", name: uv, color: "bg-blue-50/40 border-blue-50 text-blue-500" });
        });
      } else {
        if (unit.uvBch1) members.push({ role: "UV BCH", name: unit.uvBch1, color: "bg-blue-50/40 border-blue-50 text-blue-500" });
        if (unit.uvBch2) members.push({ role: "UV BCH", name: unit.uvBch2, color: "bg-blue-50/40 border-blue-50 text-blue-500" });
        if (unit.uvBch3) members.push({ role: "UV BCH", name: unit.uvBch3, color: "bg-blue-50/40 border-blue-50 text-blue-500" });
      }
    }

    return (
      <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-white text-black">
        {members.map((m, i) => m.name && (
          <div key={i} className={`p-4 rounded-[1.5rem] border relative overflow-hidden group/item ${m.color}`}>
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/item:scale-110 transition-transform">
              <UserCircle size={40} />
            </div>
            <p className="text-[10px] font-black uppercase mb-2 tracking-widest">{m.role}</p>
            <p className="text-sm font-black text-slate-800 truncate">{m.name}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="space-y-8 text-black">
      <div className="flex items-center justify-between border-b-2 border-purple-600 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-xl text-white shadow-lg shadow-purple-100">
            <LayoutGrid size={24} />
          </div>
          <h2 className="text-2xl font-black uppercase text-purple-600 tracking-tight">Chi đoàn & Tập thể trực thuộc</h2>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-purple-700 transition-all active:scale-95 text-xs uppercase tracking-wider"
        >
          <Plus size={18} /> Thêm đơn vị
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {units.map((unit, index) => {
          const isChiDoan = unit.unitType === 'CHIDOAN';
          const headerBg = isChiDoan 
            ? "bg-gradient-to-r from-purple-50 to-white border-purple-100" 
            : "bg-gradient-to-r from-purple-100 to-white border-purple-200";
          const iconBg = isChiDoan ? "bg-purple-600" : "bg-purple-800";

          return (
            <div key={unit._id || index} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className={`${headerBg} px-8 py-5 border-b flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 ${iconBg} text-white rounded-2xl shadow-lg transition-transform duration-500 group-hover:rotate-12`}>
                    <School size={20} />
                  </div>
                  <span className="font-black text-slate-800 text-base tracking-wide uppercase">{unit.ten || unit.group_name}</span>
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
          );
        })}
      </div>

      {isAddOpen && (
        <AddUnitModal 
          onClose={() => setIsAddOpen(false)} 
          onSave={handleAddUnit} 
        />
      )}

      {editingUnit && (
        <EditUnitModal 
          unit={editingUnit} 
          onClose={() => setEditingUnit(null)} 
          onSave={handleSaveEdit} 
        />
      )}

      {deletingUnit && (
        <DeleteUnitConfirm 
          unitName={deletingUnit.ten || deletingUnit.group_name} 
          onClose={() => setDeletingUnit(null)} 
          onConfirm={handleConfirmDelete} 
        />
      )}
    </section>
  );
}
'use client';

import { useState, useEffect } from "react";
import { School, LayoutGrid, UserCircle, Edit, Trash2, Plus, Search, RotateCcw, Users } from "lucide-react";
import AddBranchLCHModal from "./AddBranchLCHModal";
import EditUnitModal from "../BranchYEC/EditUnitModal";
import DeleteUnitConfirm from "../BranchYEC/DeleteUnitConfirm";

export default function SectionChiHoi() {
  const [units, setUnits] = useState<any[]>([]);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [deletingUnit, setDeletingUnit] = useState<any>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");

  const fetchUnits = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations?scope=HOI`);
      const data = await res.json();
      const hoiOnly = Array.isArray(data) ? data.filter((u: any) => u.scope === 'HOI') : [];
      const sorted = hoiOnly.sort((a: any, b: any) => {
        const isClassA = a.unitType === 'CHIDOAN' || a.unitType === 'CHIHOI';
        const isClassB = b.unitType === 'CHIDOAN' || b.unitType === 'CHIHOI';
        if (isClassA && !isClassB) return -1;
        if (!isClassA && isClassB) return 1;

        const nameA = a.ten || a.group_name || '';
        const nameB = b.ten || b.group_name || '';
        return nameA.localeCompare(nameB, 'vi', { numeric: true });
      });
      setUnits(sorted);
    } catch {
      setUnits([]);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleAddUnit = async (newUnit: any) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newUnit, scope: 'HOI' }),
      });
      if (res.ok) {
        await fetchUnits();
        setIsAddOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async (updatedUnit: any) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations/${updatedUnit._id || updatedUnit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUnit),
      });
      if (res.ok) {
        await fetchUnits();
        setEditingUnit(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations/${deletingUnit._id || deletingUnit.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchUnits();
        setDeletingUnit(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUnits = units.filter((u) => {
    const unitName = (u.ten || u.group_name || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = unitName.includes(search);
    let matchesFilter = true;
    if (filterType === 'CHIHOI') {
      matchesFilter = u.unitType === 'CHIHOI' || u.unitType === 'CHIDOAN';
    } else if (filterType === 'TAPTHE') {
      matchesFilter = u.unitType !== 'CHIHOI' && u.unitType !== 'CHIDOAN';
    }
    return matchesSearch && matchesFilter;
  });

  const renderPersonnel = (unit: any) => {
    const isCLB = unit.unitType === 'TAPTHE' || unit.ten?.toUpperCase().includes("CLB");
    let members: any[] = [];

    if (isCLB) {
      const sourceMembers = unit.member || [];
      members = [
        { role: sourceMembers[0]?.role || "Chủ nhiệm", name: sourceMembers[0]?.name || unit.chuNhiem, color: "bg-rose-50/70 border-rose-200 text-rose-700" },
        { role: sourceMembers[1]?.role || "Phó Chủ nhiệm", name: sourceMembers[1]?.name || unit.phoChuNhiem1, color: "bg-amber-50/70 border-amber-200 text-amber-700" },
        { role: sourceMembers[2]?.role || "Phó Chủ nhiệm", name: sourceMembers[2]?.name || unit.phoChuNhiem2, color: "bg-sky-50/70 border-sky-200 text-sky-700" }
      ];
    } else {
      members = [
        { role: "Chi hội trưởng", name: unit.chiHoiTruong || "", color: "bg-sky-50/70 border-sky-200 text-sky-700" },
        { role: "Chi hội phó", name: unit.chiHoiPho || "", color: "bg-teal-50/70 border-teal-200 text-teal-700" },
      ];
      (unit.uvbch || []).forEach((uv: string) => {
        if (uv) members.push({ role: "Ủy viên BCH Chi hội", name: uv, color: "bg-cyan-50/70 border-cyan-200 text-cyan-700" });
      });
    }

    const validMembers = members.filter(m => m.name && m.name.trim() !== "");

    return (
      <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 bg-white text-black">
        {validMembers.length > 0 ? (
          validMembers.map((m, i) => (
            <div key={i} className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${m.color}`}>
              <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center font-bold text-xs shrink-0">
                <UserCircle size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-wider">{m.role}</p>
                <p className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">{m.name}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-4 text-center text-xs text-slate-400 italic">
            Chưa cập nhật danh sách cán bộ Chi hội
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="space-y-6 text-black">
      <div className="flex items-center justify-between border-b-2 border-sky-600 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-600 rounded-2xl text-white shadow-md shadow-sky-500/20">
            <LayoutGrid size={22} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-sky-800 tracking-tight">
              Chi hội & Tập thể trực thuộc LCH
            </h2>
            <p className="text-xs text-slate-400 font-semibold hidden sm:block">
              Quản lý danh sách các Chi hội sinh viên & CLB/Đội trực thuộc Hội
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-sky-500/20 transition-all text-xs uppercase tracking-wider border-none outline-none cursor-pointer"
        >
          <Plus size={16} /> <span>Thêm đơn vị</span>
        </button>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-3 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên Chi hội, CLB hoặc cán bộ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white rounded-xl text-xs sm:text-sm font-bold border border-slate-200 outline-none focus:border-sky-600 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
              filterType === 'ALL' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 bg-transparent hover:text-slate-900'
            }`}
          >
            Tất cả ({units.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('CHIHOI')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
              filterType === 'CHIHOI' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 bg-transparent hover:text-slate-900'
            }`}
          >
            Chi hội
          </button>
          <button
            type="button"
            onClick={() => setFilterType('TAPTHE')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
              filterType === 'TAPTHE' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 bg-transparent hover:text-slate-900'
            }`}
          >
            CLB / Đội
          </button>
        </div>
        {(searchTerm || filterType !== 'ALL') && (
          <button
            onClick={() => { setSearchTerm(""); setFilterType("ALL"); }}
            className="p-2.5 bg-white text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-all cursor-pointer shrink-0"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5">
        {filteredUnits.length > 0 ? (
          filteredUnits.map((unit, index) => {
            const isChiHoi = unit.unitType === 'CHIHOI' || unit.unitType === 'CHIDOAN';
            return (
              <div
                key={unit._id || index}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:border-sky-500/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-slate-50 to-sky-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl text-white shadow-xs ${isChiHoi ? 'bg-sky-600' : 'bg-indigo-600'}`}>
                      {isChiHoi ? <School size={18} /> : <Users size={18} />}
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-800 text-sm sm:text-base tracking-tight uppercase block">
                        {unit.ten || unit.group_name}
                      </span>
                      {unit.khoa && (
                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                          Khóa: {unit.khoa}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setEditingUnit(unit)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl border-none bg-transparent cursor-pointer">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => setDeletingUnit(unit)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border-none bg-transparent cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {renderPersonnel(unit)}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-xs font-bold text-slate-400 italic bg-white rounded-3xl border border-slate-200">
            Không tìm thấy đơn vị nào...
          </div>
        )}
      </div>

      {isAddOpen && (
        <AddBranchLCHModal
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
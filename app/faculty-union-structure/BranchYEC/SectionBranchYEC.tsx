'use client';

import { useState, useEffect } from "react";
import { School, LayoutGrid, UserCircle, Edit, Trash2, Plus, Search, Filter, RotateCcw, Users } from "lucide-react";
import EditUnitModal from "./EditUnitModal";
import DeleteUnitConfirm from "./DeleteUnitConfirm";
import AddUnitModal from "./AddUnitModal";

interface Props {
  chiDoanTruocThuoc: any[];
}

let memoryCachedUnits: any[] | null = null;

export default function SectionChiDoan({ chiDoanTruocThuoc: initialData }: Props) {
  const [units, setUnits] = useState<any[]>([]);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [deletingUnit, setDeletingUnit] = useState<any>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");

  const fetchUnits = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations`);
      const data = await res.json();
      
      const sortedData = Array.isArray(data) ? data.sort((a, b) => {
        if (a.unitType === 'CHIDOAN' && b.unitType !== 'CHIDOAN') return -1;
        if (a.unitType !== 'CHIDOAN' && b.unitType === 'CHIDOAN') return 1;
        
        const nameA = a.ten || a.group_name || "";
        const nameB = b.ten || b.group_name || "";
        return nameA.localeCompare(nameB, 'vi', { numeric: true });
      }) : [];
      
      memoryCachedUnits = sortedData;
      setUnits(sortedData);
      try {
        sessionStorage.setItem('cached_units_list', JSON.stringify(sortedData));
      } catch (e) {}
    } catch (error) {
      if (!memoryCachedUnits) setUnits([]);
    }
  };

  useEffect(() => {
    if (memoryCachedUnits && memoryCachedUnits.length > 0) {
      setUnits(memoryCachedUnits);
    } else {
      try {
        const local = sessionStorage.getItem('cached_units_list');
        if (local) {
          const parsed = JSON.parse(local);
          memoryCachedUnits = parsed;
          setUnits(parsed);
        }
      } catch (e) {}
    }

    fetchUnits();
  }, []);

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations/${deletingUnit._id || deletingUnit.id}`, {
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

  const filteredUnits = units.filter((u) => {
    const unitName = (u.ten || u.group_name || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const membersStr = JSON.stringify(u).toLowerCase();
    const matchesSearch = unitName.includes(search) || membersStr.includes(search);

    let matchesFilter = true;
    if (filterType === 'CHIDOAN') {
      matchesFilter = u.unitType === 'CHIDOAN';
    } else if (filterType === 'TAPTHE') {
      matchesFilter = u.unitType !== 'CHIDOAN';
    }

    return matchesSearch && matchesFilter;
  });

  const renderPersonnel = (unit: any) => {
    const isCLB = unit.ten?.toUpperCase().includes("CLB") || unit.unitType === 'TAPTHE';
    const isBan = unit.ten?.toUpperCase().includes("BAN");
    let members: any[] = [];

    if (isCLB || unit.unitType === 'TAPTHE') {
      const sourceMembers = unit.member || [];
      members = [
        { role: sourceMembers[0]?.role || "Chủ nhiệm", name: sourceMembers[0]?.name || unit.chuNhiem, color: "bg-rose-50/70 border-rose-200 text-rose-700" },
        { role: sourceMembers[1]?.role || "Phó Chủ nhiệm", name: sourceMembers[1]?.name || unit.phoChuNhiem1, color: "bg-amber-50/70 border-amber-200 text-amber-700" },
        { role: sourceMembers[2]?.role || "Phó Chủ nhiệm", name: sourceMembers[2]?.name || unit.phoChuNhiem2, color: "bg-blue-50/70 border-blue-200 text-[#0054a5]" }
      ];
    } else if (isBan) {
      members = [
        { role: "Trưởng ban", name: unit.truongBan, color: "bg-rose-50/70 border-rose-200 text-rose-700" },
        { role: "Phó ban", name: unit.phoBan1, color: "bg-amber-50/70 border-amber-200 text-amber-700" },
        { role: "Phó ban", name: unit.phoBan2, color: "bg-blue-50/70 border-blue-200 text-[#0054a5]" }
      ];
    } else {
      members = [
        { role: "Bí thư", name: unit.biThu, color: "bg-rose-50/70 border-rose-200 text-rose-700" },
        { role: "Phó Bí thư", name: unit.phoBiThu, color: "bg-amber-50/70 border-amber-200 text-amber-700" },
      ];
      
      const uvList = unit.uvbch || [];
      if (uvList.length > 0) {
        uvList.forEach((uv: string) => {
          if (uv) members.push({ role: "Ủy viên BCH", name: uv, color: "bg-blue-50/70 border-blue-200 text-[#0054a5]" });
        });
      } else {
        if (unit.uvBch1) members.push({ role: "Ủy viên BCH", name: unit.uvBch1, color: "bg-blue-50/70 border-blue-200 text-[#0054a5]" });
        if (unit.uvBch2) members.push({ role: "Ủy viên BCH", name: unit.uvBch2, color: "bg-blue-50/70 border-blue-200 text-[#0054a5]" });
        if (unit.uvBch3) members.push({ role: "Ủy viên BCH", name: unit.uvBch3, color: "bg-blue-50/70 border-blue-200 text-[#0054a5]" });
      }
    }

    const validMembers = members.filter(m => m.name && m.name.trim() !== "");

    return (
      <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 bg-white text-black">
        {validMembers.length > 0 ? (
          validMembers.map((m, i) => (
            <div key={i} className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${m.color}`}>
              <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
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
            Chưa cập nhật danh sách cán bộ quản lý
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="space-y-6 text-black">
      <div className="flex items-center justify-between border-b-2 border-[#0054a5] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0054a5] rounded-2xl text-white shadow-md shadow-blue-500/20">
            <LayoutGrid size={22} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-[#0054a5] tracking-tight">
              Chi đoàn & Tập thể trực thuộc
            </h2>
            <p className="text-xs text-slate-400 font-semibold hidden sm:block">
              Quản lý danh sách Chi đoàn các khóa và Câu lạc bộ, Đội, Nhóm
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-[#0054a5] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95 text-xs uppercase tracking-wider border-none outline-none cursor-pointer"
        >
          <Plus size={16} /> <span>Thêm đơn vị</span>
        </button>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-3 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm theo tên Chi đoàn, CLB hoặc tên cán bộ..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-11 pr-4 py-2.5 bg-white rounded-xl text-xs sm:text-sm font-bold border border-slate-200 outline-none focus:border-[#0054a5] focus:ring-2 ring-blue-100 transition-all" 
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
              filterType === 'ALL' ? 'bg-white text-[#0054a5] shadow-xs' : 'text-slate-600 bg-transparent hover:text-slate-900'
            }`}
          >
            Tất cả ({units.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('CHIDOAN')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
              filterType === 'CHIDOAN' ? 'bg-white text-[#0054a5] shadow-xs' : 'text-slate-600 bg-transparent hover:text-slate-900'
            }`}
          >
            Chi đoàn
          </button>
          <button
            type="button"
            onClick={() => setFilterType('TAPTHE')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
              filterType === 'TAPTHE' ? 'bg-white text-[#0054a5] shadow-xs' : 'text-slate-600 bg-transparent hover:text-slate-900'
            }`}
          >
            CLB / Đội
          </button>
        </div>

        {(searchTerm || filterType !== 'ALL') && (
          <button 
            onClick={() => {
              setSearchTerm("");
              setFilterType("ALL");
            }}
            className="p-2.5 bg-white text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-all cursor-pointer shrink-0"
            title="Xóa bộ lọc"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5">
        {filteredUnits.length > 0 ? (
          filteredUnits.map((unit, index) => {
            const isChiDoan = unit.unitType === 'CHIDOAN';

            return (
              <div 
                key={unit._id || index} 
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:border-[#0054a5]/40 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="bg-gradient-to-r from-slate-50 to-blue-50/40 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl text-white shadow-xs ${isChiDoan ? 'bg-[#0054a5]' : 'bg-indigo-600'}`}>
                      {isChiDoan ? <School size={18} /> : <Users size={18} />}
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
                    <button 
                      onClick={() => setEditingUnit(unit)} 
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => setDeletingUnit(unit)} 
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                      title="Xóa đơn vị"
                    >
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
            Không tìm thấy đơn vị nào phù hợp...
          </div>
        )}
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
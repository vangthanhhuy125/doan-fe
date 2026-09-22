'use client';

import { useState } from "react";
import { Flag, Award } from "lucide-react";
import SectionBanChapHanh from "./FacultyYEC/SectionFacultyYEC";
import SectionChiDoan from "./BranchYEC/SectionBranchYEC";
import SectionFacultyLCH from "./FacultyLCH/SectionFacultyLCH";
import SectionChiHoi from "./BranchLCH/SectionBranchLCH";

export default function FacultyUnionStructurePage() {
  const [activeTab, setActiveTab] = useState<'DOAN' | 'HOI'>('DOAN');

  const getRoleStylesDoan = (index: number) => {
    if (index === 0) return { text: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", circle: "bg-gradient-to-br from-rose-500 to-rose-600" };
    if (index === 1) return { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", circle: "bg-gradient-to-br from-amber-500 to-amber-600" };
    if (index < 5) return { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", circle: "bg-gradient-to-br from-emerald-500 to-emerald-600" };
    return { text: "text-[#0054a5]", bg: "bg-blue-50", border: "border-blue-200", circle: "bg-gradient-to-br from-[#0054a5] to-blue-600" };
  };

  const getRoleStylesHoi = (index: number) => {
    if (index === 0) return { text: "text-sky-800", bg: "bg-sky-50", border: "border-sky-300", circle: "bg-gradient-to-br from-sky-600 to-sky-700" };
    if (index < 3) return { text: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200", circle: "bg-gradient-to-br from-teal-500 to-teal-600" };
    return { text: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-200", circle: "bg-gradient-to-br from-cyan-600 to-blue-500" };
  };

  return (
    <div className="space-y-8 text-black pb-14 animate-in fade-in duration-300 max-w-7xl mx-auto px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 shadow-inner w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('DOAN')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
              activeTab === 'DOAN'
                ? 'bg-white text-[#0054a5] shadow-xs scale-[1.02]'
                : 'text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            <Flag size={14} className={activeTab === 'DOAN' ? 'text-[#0054a5]' : 'text-slate-400'} />
            <span>Tổ chức Đoàn Khoa</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HOI')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
              activeTab === 'HOI'
                ? 'bg-white text-sky-700 shadow-xs scale-[1.02]'
                : 'text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            <Award size={14} className={activeTab === 'HOI' ? 'text-sky-600' : 'text-slate-400'} />
            <span>Tổ chức Liên Chi hội</span>
          </button>
        </div>
        <span className="text-[11px] font-bold text-slate-400 hidden sm:inline-block">
          Cơ cấu: <span className="text-slate-700 font-extrabold">{activeTab === 'DOAN' ? 'Đoàn TNCS Hồ Chí Minh' : 'Hội Sinh viên Việt Nam'}</span>
        </span>
      </div>

      {activeTab === 'DOAN' ? (
        <div className="space-y-12 animate-in fade-in duration-200">
          <SectionBanChapHanh getRoleStyles={getRoleStylesDoan} />
          <SectionChiDoan chiDoanTruocThuoc={[]} />
        </div>
      ) : (
        <div className="space-y-12 animate-in fade-in duration-200">
          <SectionFacultyLCH getRoleStyles={getRoleStylesHoi} />
          <SectionChiHoi />
        </div>
      )}
    </div>
  );
}
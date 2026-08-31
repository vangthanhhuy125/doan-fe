'use client';

import SectionBanChapHanh from "./FacultyYEC/SectionFacultyYEC";
import SectionChiDoan from "./BranchYEC/SectionBranchYEC";

export default function ToChucDoanPage() {
  const getRoleStyles = (index: number) => {
    if (index === 0) return { text: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", shadow: "shadow-rose-100", circle: "bg-gradient-to-br from-rose-500 to-rose-600" };
    if (index === 1) return { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", shadow: "shadow-amber-100", circle: "bg-gradient-to-br from-amber-500 to-amber-600" };
    if (index < 5) return { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", shadow: "shadow-emerald-100", circle: "bg-gradient-to-br from-emerald-500 to-emerald-600" };
    return { text: "text-[#0054a5]", bg: "bg-blue-50", border: "border-blue-200", shadow: "shadow-blue-100", circle: "bg-gradient-to-br from-[#0054a5] to-blue-600" };
  };

  return (
    <div className="space-y-12 text-black pb-12 animate-in fade-in duration-300">
      <SectionBanChapHanh getRoleStyles={getRoleStyles} />
      <SectionChiDoan chiDoanTruocThuoc={[]} />
    </div>
  );
}
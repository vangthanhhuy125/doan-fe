'use client';

import SectionBanChapHanh from "./BCH/SectionBanChapHanh";
import SectionChiDoan from "./ChiDoan/SectionChiDoan";

const banThuongVu = [
  { name: "Nguyễn Văn A", role: "Bí thư Đoàn khoa" },
  { name: "Trần Thị B", role: "Phó Bí thư Đoàn khoa" },
  { name: "Lê Văn C", role: "Ủy viên Ban Thường vụ" },
  { name: "Phạm Thị D", role: "Ủy viên Ban Thường vụ" },
  { name: "Hoàng Văn E", role: "Ủy viên Ban Thường vụ" },
];

const chiDoanTruocThuoc = [
  { ten: "Chi đoàn PMCL2023.1", biThu: "Đặng Văn F", phoBiThu: "Lý Thị G" },
  { ten: "Chi đoàn SE114.O11", biThu: "Mai Văn H", phoBiThu: "Trịnh Thị I" },
  { ten: "Chi đoàn PMCL2022.2", biThu: "Bùi Văn K", phoBiThu: "Vũ Thị L" },
  { ten: "Câu lạc bộ Tin học", biThu: "Lê Văn M", phoBiThu: "Nguyễn Thị N" },
];

export default function NhanSuPage() {
  const getRoleStyles = (index: number) => {
    if (index === 0) return { text: "text-red-600", bg: "bg-red-50", border: "border-red-100", shadow: "shadow-red-100", circle: "bg-red-600" };
    if (index === 1) return { text: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100", shadow: "shadow-amber-100", circle: "bg-amber-500" };
    if (index < 5) return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", shadow: "shadow-emerald-100", circle: "bg-emerald-600" };
    return { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", shadow: "shadow-blue-100", circle: "bg-blue-600" };
  };

  return (
    <div className="space-y-12 text-black pb-10">
      <SectionBanChapHanh 
        banThuongVu={banThuongVu} 
        getRoleStyles={getRoleStyles} 
      />
      
      <SectionChiDoan 
        chiDoanTruocThuoc={chiDoanTruocThuoc} 
      />
    </div>
  );
}
'use client';

import { useState } from "react";
import SectionTaiLieu from "./SectionTaiLieu";
import TaiLieuModal from "./TaiLieuModal";

const initialTaiLieu = [
  { 
    id: 1, 
    name: "Nghị quyết Đại hội Đại biểu Đoàn khoa nhiệm kỳ 2024-2027", 
    category: "Văn kiện đoàn khoa", 
    semester: "Học kỳ 1",
    year: "2024-2025",
    link: "https://drive.google.com/file/d/1" 
  },
  { 
    id: 2, 
    name: "Thông báo tổ chức hội nghị kiện toàn nhân sự", 
    category: "Thông báo - Kế hoạch Đoàn trường", 
    semester: "Học kỳ 2",
    year: "2025-2026",
    link: "https://drive.google.com/file/d/2" 
  }
];

export default function TaiLieuPage() {
  const [taiLieuList, setTaiLieuList] = useState(initialTaiLieu);
  const [modal, setModal] = useState<any>({ open: false, mode: 'view', data: null });

  const handleOpenModal = (mode: string, data: any = null) => setModal({ open: true, mode, data });
  const handleCloseModal = () => setModal({ ...modal, open: false });
  const handleDeleteTaiLieu = (id: number) => setTaiLieuList(taiLieuList.filter(item => item.id !== id));

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <SectionTaiLieu taiLieuList={taiLieuList} onOpenModal={handleOpenModal} />
      {modal.open && (
        <TaiLieuModal 
          mode={modal.mode} 
          data={modal.data} 
          onClose={handleCloseModal}
          onConfirmDelete={handleDeleteTaiLieu}
        />
      )}
    </div>
  );
}
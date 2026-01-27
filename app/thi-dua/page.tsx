'use client';

import { useState } from "react";
import SectionBangDiem from "./bang-diem/SectionBangDiem";
import SectionMHGP from "./MHGP/SectionMHGP";
import SectionCTTN from "./CTTN/SectionCTTN";
import MHGPModal from "./MHGP/MHGPModal";
import BangDiemModal from "./bang-diem/BangDiemModal";
import CTTNModal from "./CTTN/CTTNModal";

const initialActivities = [
  { 
    id: 1, 
    name: "Chiến dịch Xuân Tình nguyện 2026", 
    plan: "KH số 01-KH/ĐK", 
    namHoc: "2025-2026",
    evidence: "https://facebook.com/post1", 
    content: "Hỗ trợ 100 phần quà cho trẻ em nghèo" 
  },
];

const initialMHGP = [
  { 
    id: 1, 
    name: "Số hóa quản lý đoàn viên khoa", 
    year: "2025-2026", 
    reason: "Lý do thực hiện nhằm tối ưu hóa quy trình...", 
    summary: "Tóm tắt về hệ thống quản lý trực tuyến...", 
    evaluation: "Giúp giảm 50% thời gian xử lý giấy tờ...", 
    budget: "0đ", 
    fileLink: "https://drive.google.com/..." 
  },
];

const initialCTTN = [
  {
    id: 1,
    name: "Sân chơi thiếu nhi từ vật liệu tái chế",
    unit: "Đoàn khoa Công nghệ Phần mềm",
    year: "2025-2026",
    content: "Xây dựng 01 khu vui chơi cho trẻ em tại địa phương..."
  }
];

export default function ThiDuaPage() {
  const [activities, setActivities] = useState(initialActivities);
  const [mhgpList, setMhgpList] = useState(initialMHGP);
  const [cttnList, setCttnList] = useState(initialCTTN);
  
  const [bdModal, setBdModal] = useState<any>({ open: false, mode: 'view', data: null });
  const [mhModal, setMhModal] = useState<any>({ open: false, mode: 'view', data: null });
  const [ctModal, setCtModal] = useState<any>({ open: false, mode: 'view', data: null });

  const handleOpenBangDiem = (mode: string, data: any = null) => {
    setBdModal({ open: true, mode, data });
  };

  const handleOpenMHGP = (mode: string, data: any = null) => {
    setMhModal({ open: true, mode, data });
  };

  const handleOpenCTTN = (mode: string, data: any = null) => {
    setCtModal({ open: true, mode, data });
  };

  const handleDeleteActivity = (id: number) => {
    setActivities(activities.filter(item => item.id !== id));
  };

  const handleDeleteMHGP = (id: number) => {
    setMhgpList(mhgpList.filter(item => item.id !== id));
  };

  const handleDeleteCTTN = (id: number) => {
    setCttnList(cttnList.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-16 pb-10">
      <SectionBangDiem 
        activities={activities} 
        onOpenModal={handleOpenBangDiem} 
      />

      <SectionMHGP 
        mhgpList={mhgpList} 
        onOpenModal={handleOpenMHGP} 
      />

      <SectionCTTN 
        cttnList={cttnList} 
        onOpenModal={handleOpenCTTN} 
      />

      {bdModal.open && (
        <BangDiemModal 
          mode={bdModal.mode} 
          data={bdModal.data} 
          onClose={() => setBdModal({ ...bdModal, open: false })}
          onConfirmDelete={handleDeleteActivity}
        />
      )}

      {mhModal.open && (
        <MHGPModal 
          mode={mhModal.mode} 
          data={mhModal.data} 
          onClose={() => setMhModal({ ...mhModal, open: false })}
          onConfirmDelete={handleDeleteMHGP}
        />
      )}

      {ctModal.open && (
        <CTTNModal 
          mode={ctModal.mode} 
          data={ctModal.data} 
          onClose={() => setCtModal({ ...ctModal, open: false })}
          onConfirmDelete={handleDeleteCTTN}
        />
      )}
    </div>
  );
}
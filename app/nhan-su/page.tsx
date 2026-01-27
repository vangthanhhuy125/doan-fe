'use client';

import { useState } from "react";
import SectionNhanSu from "./SectionNhanSu";
import NhanSuModal from "./NhanSuModal";

const initialNhanSu = [
  { 
    id: 1, 
    name: "Nguyễn Văn A", 
    mssv: "21520001", 
    class: "PMCL2021", 
    phone: "0901234567", 
    birthday: "2003-05-15" 
  },
  { 
    id: 2, 
    name: "Lê Thị B", 
    mssv: "22520002", 
    class: "KTPM2022", 
    phone: "0987654321", 
    birthday: "2004-12-20" 
  },
];

export default function NhanSuPage() {
  const [nhanSuList, setNhanSuList] = useState(initialNhanSu);
  const [modal, setModal] = useState<any>({ open: false, mode: 'view', data: null });

  const handleOpenModal = (mode: string, data: any = null) => setModal({ open: true, mode, data });
  const handleDelete = (id: number) => setNhanSuList(nhanSuList.filter(item => item.id !== id));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SectionNhanSu nhanSuList={nhanSuList} onOpenModal={handleOpenModal} />
      {modal.open && (
        <NhanSuModal 
          mode={modal.mode} 
          data={modal.data} 
          onClose={() => setModal({ ...modal, open: false })}
          onConfirmDelete={handleDelete}
        />
      )}
    </div>
  );
}
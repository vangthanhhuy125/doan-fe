// app/nhan-su/page.tsx
'use client';

import { useState, useEffect } from "react";
import SectionNhanSu from "./SectionNhanSu";
import NhanSuModal from "./NhanSuModal";

export default function NhanSuPage() {
  const [nhanSuList, setNhanSuList] = useState<any[]>([]);
  const [modal, setModal] = useState<any>({ open: false, mode: 'view', data: null });

  const fetchNhanSu = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nhan-su`);
      const data = await res.json();
      setNhanSuList(Array.isArray(data) ? data : []);
    } catch (error) {
      setNhanSuList([]);
    }
  };

  useEffect(() => {
    fetchNhanSu();
  }, []);

  const handleOpenModal = (mode: string, data: any = null) => setModal({ open: true, mode, data });

  const handleDelete = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nhan-su/${id}`, {
      method: 'DELETE',
    });
    fetchNhanSu();
  };

  const handleSave = async (payload: any) => {
    const isAdd = modal.mode === 'add';
    const url = isAdd 
      ? `${process.env.NEXT_PUBLIC_API_URL}/nhan-su` 
      : `${process.env.NEXT_PUBLIC_API_URL}/nhan-su/${payload._id}`;
    
    await fetch(url, {
      method: isAdd ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setModal({ open: false, mode: 'view', data: null });
    fetchNhanSu();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SectionNhanSu nhanSuList={nhanSuList} onOpenModal={handleOpenModal} />
      {modal.open && (
        <NhanSuModal 
          mode={modal.mode} 
          data={modal.data} 
          onClose={() => setModal({ ...modal, open: false })}
          onConfirmDelete={handleDelete}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
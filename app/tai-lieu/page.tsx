'use client';

import { useState, useEffect } from "react";
import SectionTaiLieu from "./SectionTaiLieu";
import TaiLieuModal from "./TaiLieuModal";

export default function TaiLieuPage() {
  const [taiLieuList, setTaiLieuList] = useState<any[]>([]);
  const [modal, setModal] = useState<any>({ open: false, mode: 'view', data: null });

  const fetchTaiLieu = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents`);
      const data = await res.json();
      setTaiLieuList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { fetchTaiLieu(); }, []);

  const handleOpenModal = (mode: string, data: any = null) => setModal({ open: true, mode, data });
  const handleCloseModal = () => setModal({ ...modal, open: false });

  const handleSave = async (formData: any) => {
    try {
      const isEdit = modal.mode === 'edit';
      const url = isEdit ? `${process.env.NEXT_PUBLIC_API_URL}/documents/${modal.data._id}` : `${process.env.NEXT_PUBLIC_API_URL}/documents`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchTaiLieu();
        handleCloseModal();
      }
    } catch (error) { console.error(error); }
  };

  const handleDeleteTaiLieu = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/${id}`, { method: 'DELETE' });
      if (res.ok) fetchTaiLieu();
    } catch (error) { console.error(error); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SectionTaiLieu taiLieuList={taiLieuList} onOpenModal={handleOpenModal} />
      {modal.open && (
        <TaiLieuModal 
          mode={modal.mode} 
          data={modal.data} 
          onClose={handleCloseModal}
          onConfirmDelete={handleDeleteTaiLieu}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
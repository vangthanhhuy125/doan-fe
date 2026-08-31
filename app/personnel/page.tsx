// app/personnel/page.tsx
'use client';

import { useState, useEffect } from "react";
import SectionNhanSu from "./SectionHuman Resources";
import NhanSuModal from "./HumanResourcesModal";

let memoryCachedNhanSu: any[] | null = null;

const sortPersonnel = (list: any[]) => {
  return [...list].sort((a, b) => {
    const classA = a.class || a.chi_doan || '';
    const classB = b.class || b.chi_doan || '';
    const classCompare = classA.localeCompare(classB, 'vi', { numeric: true });
    if (classCompare !== 0) return classCompare;

    const nameA = a.full_name || a.name || '';
    const nameB = b.full_name || b.name || '';
    return nameA.localeCompare(nameB, 'vi');
  });
};

export default function NhanSuPage() {
  const [nhanSuList, setNhanSuList] = useState<any[]>([]);
  const [modal, setModal] = useState<any>({ open: false, mode: 'view', data: null });

  const fetchNhanSu = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nhan-su`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const sorted = sortPersonnel(data);
        memoryCachedNhanSu = sorted;
        setNhanSuList(sorted);
        try {
          sessionStorage.setItem('cached_nhan_su', JSON.stringify(sorted));
        } catch (e) {}
      } else {
        setNhanSuList([]);
      }
    } catch (error) {
      if (!memoryCachedNhanSu) {
        setNhanSuList([]);
      }
    }
  };

  useEffect(() => {
    if (memoryCachedNhanSu && memoryCachedNhanSu.length > 0) {
      setNhanSuList(memoryCachedNhanSu);
    } else {
      try {
        const local = sessionStorage.getItem('cached_nhan_su');
        if (local) {
          const parsed = JSON.parse(local);
          memoryCachedNhanSu = parsed;
          setNhanSuList(parsed);
        }
      } catch (e) {}
    }

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
      : `${process.env.NEXT_PUBLIC_API_URL}/nhan-su/${payload._id || payload.id}`;
      
    return new Promise<void>(async (resolve, reject) => {
      try {
        const res = await fetch(url, {
          method: isAdd ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        if (res.ok) {
          setModal({ open: false, mode: 'view', data: null });
          fetchNhanSu();
          resolve();
        } else {
          reject(new Error("Lỗi khi cập nhật nhân sự"));
        }
      } catch (error) {
        reject(error);
      }
    });
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
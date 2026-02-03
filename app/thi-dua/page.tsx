'use client';

import { useState, useEffect } from "react";
import SectionBangDiem from "./bang-diem/SectionBangDiem";
import SectionMHGP from "./MHGP/SectionMHGP";
import SectionCTTN from "./CTTN/SectionCTTN";
import MHGPModal from "./MHGP/MHGPModal";
import BangDiemModal from "./bang-diem/BangDiemModal";
import CTTNModal from "./CTTN/CTTNModal";

export default function ThiDuaPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [mhgpList, setMhgpList] = useState<any[]>([]);
  const [cttnList, setCttnList] = useState<any[]>([]);
  
  const [bdModal, setBdModal] = useState<any>({ open: false, mode: 'view', data: null });
  const [mhModal, setMhModal] = useState<any>({ open: false, mode: 'view', data: null });
  const [ctModal, setCtModal] = useState<any>({ open: false, mode: 'view', data: null });

  const fetchData = async (endpoint: string, setter: Function) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`);
      const data = await res.json();
      setter(Array.isArray(data) ? data : []);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchData('performance', setActivities);
    fetchData('solution-models', setMhgpList);
    fetchData('youth-projects', setCttnList);
  }, []);

  const handleSaveCTTN = async (formData: any) => {
    try {
      const isEdit = ctModal.mode === 'edit';
      const url = isEdit 
        ? `${process.env.NEXT_PUBLIC_API_URL}/youth-projects/${ctModal.data._id}` 
        : `${process.env.NEXT_PUBLIC_API_URL}/youth-projects`;
      
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchData('youth-projects', setCttnList);
        setCtModal({ ...ctModal, open: false });
      }
    } catch (error) { console.error(error); }
  };

  const handleDeleteCTTN = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/youth-projects/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchData('youth-projects', setCttnList);
      setCtModal({ ...ctModal, open: false });
    } catch (error) { console.error(error); }
  };

  return (
    <div className="space-y-16 pb-10">
      <SectionBangDiem activities={activities} onOpenModal={(m, d) => setBdModal({ open: true, mode: m, data: d })} />
      <SectionMHGP mhgpList={mhgpList} onOpenModal={(m, d) => setMhModal({ open: true, mode: m, data: d })} />
      <SectionCTTN cttnList={cttnList} onOpenModal={(m, d) => setCtModal({ open: true, mode: m, data: d })} />

      {bdModal.open && (
        <BangDiemModal 
          mode={bdModal.mode} 
          data={bdModal.data} 
          onClose={() => setBdModal({ ...bdModal, open: false })}
          onConfirmDelete={async (id: string) => {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/performance/${id}`, { method: 'DELETE' });
            fetchData('performance', setActivities);
          }}
          onSave={async (fd: any) => {
             const method = bdModal.mode === 'edit' ? 'PUT' : 'POST';
             const url = bdModal.mode === 'edit' ? `${process.env.NEXT_PUBLIC_API_URL}/performance/${bdModal.data._id}` : `${process.env.NEXT_PUBLIC_API_URL}/performance`;
             await fetch(url, { method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(fd)});
             fetchData('performance', setActivities);
             setBdModal({ ...bdModal, open: false });
          }}
        />
      )}

      {mhModal.open && (
        <MHGPModal 
          mode={mhModal.mode} 
          data={mhModal.data} 
          onClose={() => setMhModal({ ...mhModal, open: false })}
          onConfirmDelete={async (id: string) => {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/solution-models/${id}`, { method: 'DELETE' });
            fetchData('solution-models', setMhgpList);
            setMhModal({ ...mhModal, open: false });
          }}
          onSave={async (fd: any) => {
            const method = mhModal.mode === 'edit' ? 'PUT' : 'POST';
            const url = mhModal.mode === 'edit' ? `${process.env.NEXT_PUBLIC_API_URL}/solution-models/${mhModal.data._id}` : `${process.env.NEXT_PUBLIC_API_URL}/solution-models`;
            await fetch(url, { method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(fd)});
            fetchData('solution-models', setMhgpList);
            setMhModal({ ...mhModal, open: false });
          }}
        />
      )}

      {ctModal.open && (
        <CTTNModal 
          mode={ctModal.mode} 
          data={ctModal.data} 
          onClose={() => setCtModal({ ...ctModal, open: false })}
          onConfirmDelete={handleDeleteCTTN}
          onSave={handleSaveCTTN}
        />
      )}
    </div>
  );
}
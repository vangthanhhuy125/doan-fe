'use client';

import { useState } from "react";
import { ShieldCheck, Star } from "lucide-react";
import MemberList from "./MemberList";
import MemberForm from "./MemberForm";
import ConfirmNoticeDelete from "../thong-bao/ConfirmNoticeDelete";

export default function PartyDevelopment() {
  const [dangVien, setDangVien] = useState([
    { id: 1, name: "Nguyễn Văn An", mssv: "23520001", chiDoan: "PMCL2023.1" },
    { id: 2, name: "Lê Thị Bình", mssv: "23520002", chiDoan: "SE114.O11" }
  ]);
  const [dvut, setDvut] = useState([
    { id: 3, name: "Phạm Minh Đức", mssv: "23520003", chiDoan: "PMCL2022.2" }
  ]);

  const [modal, setModal] = useState<{ open: boolean, type: 'DV' | 'UT' | null, data: any }>({ open: false, type: null, data: null });
  const [deleteItem, setDeleteItem] = useState<{ type: 'DV' | 'UT', item: any } | null>(null);

  const handleSave = (formData: any) => {
    const list = modal.type === 'DV' ? dangVien : dvut;
    const setList = modal.type === 'DV' ? setDangVien : setDvut;

    if (formData.id) {
      setList(list.map(i => i.id === formData.id ? formData : i));
    } else {
      setList([...list, { ...formData, id: Date.now() }]);
    }
    setModal({ open: false, type: null, data: null });
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    if (deleteItem.type === 'DV') setDangVien(dangVien.filter(i => i.id !== deleteItem.item.id));
    else setDvut(dvut.filter(i => i.id !== deleteItem.item.id));
    setDeleteItem(null);
  };

  return (
    <div className="space-y-4 pt-6 border-t border-slate-100 text-black">
      <div className="flex items-center gap-2 text-red-600 mb-2">
        <ShieldCheck size={20} />
        <h3 className="font-bold uppercase text-sm tracking-tight italic">Công tác phát triển Đảng</h3>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <MemberList 
          title="Đảng viên hiện tại" icon={<ShieldCheck size={18}/>} data={dangVien}
          colorClass="bg-red-600" iconClass="bg-red-50 text-red-600"
          onAdd={() => setModal({ open: true, type: 'DV', data: null })}
          onEdit={(item: any) => setModal({ open: true, type: 'DV', data: item })}
          onDelete={(item: any) => setDeleteItem({ type: 'DV', item })}
        />
        <MemberList 
          title="Đoàn viên ưu tú" icon={<Star size={18}/>} data={dvut}
          colorClass="bg-[#0054a5]" iconClass="bg-blue-50 text-blue-600"
          onAdd={() => setModal({ open: true, type: 'UT', data: null })}
          onEdit={(item: any) => setModal({ open: true, type: 'UT', data: item })}
          onDelete={(item: any) => setDeleteItem({ type: 'UT', item })}
        />
      </div>

      {modal.open && (
        <MemberForm 
          title={modal.type === 'DV' ? "Đảng viên" : "Đoàn viên ưu tú"}
          color={modal.type === 'DV' ? "bg-red-600" : "bg-[#0054a5]"}
          data={modal.data}
          onClose={() => setModal({ open: false, type: null, data: null })}
          onSave={handleSave}
        />
      )}

      {deleteItem && (
        <ConfirmNoticeDelete 
          title={deleteItem.item.name}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
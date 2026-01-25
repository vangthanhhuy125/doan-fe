'use client';

import { useState } from "react";
import { Briefcase, Plus } from "lucide-react";
import NoticeForm from "./thong-bao/NoticeForm";
import PartyDevelopment from "./dang/page";
import NotificationPage from "./thong-bao/page"; 

export default function CongTacPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSaveNotice = (newItem: any) => {
    console.log("Dữ liệu mới:", newItem);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-12 text-black pb-10">
      
      <div className="flex items-center justify-between border-b-2 border-[#0054a5] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0054a5] rounded-xl text-white shadow-lg shadow-blue-100">
            <Briefcase size={24} />
          </div>
          <h2 className="text-2xl font-black uppercase text-[#0054a5] tracking-tight">Công tác Đoàn - Đảng</h2>
        </div>
      </div>

      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <NotificationPage />
      </section>

      <section className="pt-6 border-t border-slate-100">
        <PartyDevelopment />
      </section>

      {isFormOpen && (
        <NoticeForm 
          onClose={() => setIsFormOpen(false)} 
          onSave={handleSaveNotice} 
        />
      )}
    </div>
  );
}
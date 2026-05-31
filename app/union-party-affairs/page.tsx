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
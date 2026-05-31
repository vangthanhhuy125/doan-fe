'use client';

import { useState, useEffect } from "react";
import { Users, UserCircle, Edit } from "lucide-react";
import UpdateBCHModal from "./UpdateBCHModal"; 
import Image from "next/image"

interface Props {
  getRoleStyles: (index: number) => any;
  allMembers?: any[]; 
}

export default function SectionBanChapHanh({ getRoleStyles, allMembers = [] }: Props) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [bchList, setBchList] = useState<any[]>([]);

  const fetchBCH = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/youth-union/bch`);
      const data = await res.json();
      setBchList(Array.isArray(data) ? data : []);
    } catch (error) {
      setBchList([]);
    }
  };

  useEffect(() => {
    fetchBCH();
  }, []);

  const banThuongVu = bchList.filter(m => m.isBanThuongVu);

  return (
    <section className="space-y-8 text-black">
      <div className="flex items-center justify-between border-b-2 border-[#0054a5] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0054a5] rounded-xl text-white shadow-lg shadow-blue-100">
            <Users size={24} />
          </div>
          <h2 className="text-2xl font-black uppercase text-[#0054a5] tracking-tight">Ban Chấp hành Đoàn khoa</h2>
        </div>
        <button 
          onClick={() => setIsUpdateOpen(true)}
          className="flex items-center gap-2 bg-[#1d92ff] text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-[#0054a5] transition-all active:scale-95 text-xs uppercase tracking-wider border-none outline-none"
        >
          <Edit size={16} /> Cập nhật nhân sự
        </button>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-bold uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2 ml-1">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
          1. Ban Thường vụ Đoàn khoa
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {banThuongVu.map((person, index) => {
            const styles = getRoleStyles(index);
            return (
              <div key={person._id || index} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-2xl shadow-lg ${styles.circle} ${styles.shadow} text-white group-hover:scale-110 transition-transform duration-500 relative overflow-hidden`}>
                  {person.avatar ? (
                    <Image 
                      src={person.avatar} 
                      alt={person.full_name || person.name} 
                      fill 
                      className="object-cover" 
                      unoptimized
                    />
                  ) : (
                    <span>{(person.full_name || person.name || "").split(' ').pop()?.charAt(0)}</span>
                  )}
                </div>
                <h4 className="font-bold text-base text-slate-800 tracking-tight">{person.full_name || person.name}</h4>
                <p className={`${styles.text} ${styles.bg} text-[9px] font-black mt-3 px-4 py-1.5 rounded-full inline-block border ${styles.border} tracking-wider`}>
                  {person.role}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-bold uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2 ml-1">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          2. Ban Chấp hành Đoàn khoa
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bchList.map((person, index) => {
            const styles = getRoleStyles(index);
            return (
              <div key={person._id || index} className="flex items-center gap-4 p-4 bg-white border border-slate-50 rounded-2xl shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-300">
                <div className={`w-11 h-11 ${styles.bg} rounded-xl flex items-center justify-center ${styles.text} font-bold shadow-inner relative overflow-hidden`}>
                  {person.avatar ? (
                    <Image 
                      src={person.avatar} 
                      alt={person.full_name || person.name} 
                      fill 
                      className="object-cover" 
                      unoptimized
                    />
                  ) : (
                    <UserCircle size={24} strokeWidth={2.5} />
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm leading-snug">
                    {person.full_name || person.name}
                  </p>
                  <p className={`text-[10px] ${styles.text} font-black uppercase tracking-widest mt-0.5`}>
                    {person.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isUpdateOpen && (
        <UpdateBCHModal 
          onClose={() => {
            setIsUpdateOpen(false);
            fetchBCH();
          }} 
          allMembers={allMembers} 
          currentBCH={bchList}
        />
      )}
    </section>
  );
}
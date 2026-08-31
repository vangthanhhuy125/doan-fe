'use client';

import { useState, useEffect } from "react";
import { Users, UserCircle, Edit, ShieldCheck, Sparkles, Award } from "lucide-react";
import UpdateBCHModal from "./UpdateFacultyYECModal";
import Image from "next/image";

interface Props {
  getRoleStyles: (index: number) => any;
  allMembers?: any[];
}

let memoryCachedBCH: any[] | null = null;

export default function SectionBanChapHanh({ getRoleStyles, allMembers = [] }: Props) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [bchList, setBchList] = useState<any[]>([]);

  const fetchBCH = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/youth-union/bch`);
      const data = await res.json();
      if (Array.isArray(data)) {
        memoryCachedBCH = data;
        setBchList(data);
        try {
          sessionStorage.setItem('cached_bch_list', JSON.stringify(data));
        } catch (e) {}
      } else {
        setBchList([]);
      }
    } catch (error) {
      if (!memoryCachedBCH) setBchList([]);
    }
  };

  useEffect(() => {
    if (memoryCachedBCH && memoryCachedBCH.length > 0) {
      setBchList(memoryCachedBCH);
    } else {
      try {
        const local = sessionStorage.getItem('cached_bch_list');
        if (local) {
          const parsed = JSON.parse(local);
          memoryCachedBCH = parsed;
          setBchList(parsed);
        }
      } catch (e) {}
    }

    fetchBCH();
  }, []);

  const banThuongVu = bchList.filter(m => m.isBanThuongVu);
  const uvBCH = bchList.filter(m => !m.isBanThuongVu);

  return (
    <section className="space-y-8 text-black">
      <div className="flex items-center justify-between border-b-2 border-[#0054a5] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0054a5] rounded-2xl text-white shadow-md shadow-blue-500/20">
            <Users size={22} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-[#0054a5] tracking-tight">
              Ban Chấp hành Đoàn khoa
            </h2>
            <p className="text-xs text-slate-400 font-semibold hidden sm:block">
              Cơ cấu tổ chức nhân sự Ban Thường vụ & Ban Chấp hành Đoàn khoa
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsUpdateOpen(true)}
          className="flex items-center gap-2 bg-[#0054a5] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95 text-xs uppercase tracking-wider border-none outline-none cursor-pointer"
        >
          <Edit size={15} /> <span>Cập nhật nhân sự</span>
        </button>
      </div>

      <div className="space-y-5">
        <div className="flex items-center gap-2 ml-1">
          <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></span>
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">
            1. Ban Thường vụ Đoàn khoa
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {banThuongVu.map((person, index) => {
            const styles = getRoleStyles(index);
            const avatarUrl = person.avatar || person.image_url;

            return (
              <div 
                key={person._id || index} 
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-[#0054a5]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group flex flex-col justify-between"
              >
                <div>
                  <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center font-black text-2xl shadow-md ${styles.circle} text-white group-hover:scale-105 transition-transform duration-300 relative overflow-hidden ring-4 ring-white`}>
                    {avatarUrl ? (
                      <Image 
                        src={avatarUrl} 
                        alt={person.full_name || person.name} 
                        fill 
                        className="object-cover" 
                        unoptimized 
                      />
                    ) : (
                      <span>{(person.full_name || person.name || "").split(' ').pop()?.charAt(0) || "U"}</span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-sm sm:text-base text-slate-800 tracking-tight leading-snug line-clamp-2">
                    {person.full_name || person.name || "Chưa cập nhật"}
                  </h4>
                </div>

                <div className="pt-3">
                  <span className={`${styles.text} ${styles.bg} text-[10px] font-black px-3.5 py-1.5 rounded-full inline-block border ${styles.border} tracking-wide uppercase shadow-2xs`}>
                    {person.role}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center gap-2 ml-1">
          <span className="w-2.5 h-2.5 bg-[#0054a5] rounded-full"></span>
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">
            2. Ủy viên Ban Chấp hành Đoàn khoa
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {uvBCH.map((person, index) => {
            const avatarUrl = person.avatar || person.image_url;

            return (
              <div 
                key={person._id || index} 
                className="flex items-center gap-3.5 p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-[#0054a5]/40 hover:shadow-md transition-all duration-200"
              >
                <div className="w-11 h-11 bg-blue-50 text-[#0054a5] border border-blue-100 rounded-xl flex items-center justify-center font-bold text-sm shadow-2xs relative overflow-hidden shrink-0">
                  {avatarUrl ? (
                    <Image 
                      src={avatarUrl} 
                      alt={person.full_name || person.name} 
                      fill 
                      className="object-cover" 
                      unoptimized 
                    />
                  ) : (
                    <span>{(person.full_name || person.name || "").split(' ').pop()?.charAt(0) || <UserCircle size={22} />}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-slate-800 text-xs sm:text-sm leading-snug truncate">
                    {person.full_name || person.name || "Chưa phân bổ"}
                  </p>
                  <p className="text-[10px] text-[#0054a5] font-black uppercase tracking-wider mt-0.5">
                    {person.role || "Ủy viên Ban Chấp hành"}
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
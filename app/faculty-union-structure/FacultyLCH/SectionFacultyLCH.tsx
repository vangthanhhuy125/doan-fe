'use client';

import { useState, useEffect } from "react";
import { Award, UserCircle, Edit } from "lucide-react";
import UpdateFacultyLCHModal from "./UpdateFacultyLCHModal";
import Image from "next/image";

interface Props {
  getRoleStyles: (index: number) => any;
}

export default function SectionFacultyLCH({ getRoleStyles }: Props) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [lchList, setLchList] = useState<any[]>([]);

  const fetchLCH = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-association/bch`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setLchList(data);
      } else {
        setLchList([]);
      }
    } catch {
      setLchList([]);
    }
  };

  useEffect(() => {
    fetchLCH();
  }, []);

  const thuongTrucLCH = lchList.filter(m => m.isThuongTruc || m.order < 3);
  const uvBCH = lchList.filter(m => !thuongTrucLCH.includes(m));

  return (
    <section className="space-y-8 text-black">
      <div className="flex items-center justify-between border-b-2 border-sky-600 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-600 rounded-2xl text-white shadow-md shadow-sky-500/20">
            <Award size={22} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-sky-800 tracking-tight">
              Ban Chấp hành Liên Chi hội Khoa
            </h2>
            <p className="text-xs text-slate-400 font-semibold hidden sm:block">
              Thường trực Liên Chi hội & Các Ủy viên Ban Chấp hành
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsUpdateOpen(true)}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-sky-500/20 transition-all active:scale-95 text-xs uppercase tracking-wider border-none outline-none cursor-pointer"
        >
          <Edit size={15} /> <span>Cập nhật nhân sự</span>
        </button>
      </div>

      <div className="space-y-5">
        <div className="flex items-center gap-2 ml-1">
          <span className="w-2.5 h-2.5 bg-sky-600 rounded-full animate-pulse"></span>
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">
            1. Thường trực Liên Chi hội (03 đồng chí)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {thuongTrucLCH.map((person, index) => {
            const styles = getRoleStyles(index);
            const avatarUrl = person.avatar || person.image_url;
            return (
              <div
                key={person._id || index}
                className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:border-sky-500/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group flex flex-col justify-between"
              >
                <div>
                  <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center font-black text-2xl shadow-md ${styles.circle} text-white group-hover:scale-105 transition-transform duration-300 relative overflow-hidden ring-4 ring-white`}>
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt={person.full_name || person.name} fill className="object-cover" unoptimized />
                    ) : (
                      <span>{(person.full_name || person.name || "").split(' ').pop()?.charAt(0) || "H"}</span>
                    )}
                  </div>
                  <h4 className="font-black text-base sm:text-lg text-slate-800 tracking-tight leading-snug line-clamp-2">
                    {person.full_name || person.name || "Chưa cập nhật"}
                  </h4>
                </div>
                <div className="pt-3">
                  <span className={`${styles.text} ${styles.bg} text-[11px] font-black px-4 py-1.5 rounded-full inline-block border ${styles.border} tracking-wide uppercase shadow-2xs`}>
                    {person.role || (index === 0 ? "Liên Chi hội trưởng" : "Liên Chi hội phó")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center gap-2 ml-1">
          <span className="w-2.5 h-2.5 bg-cyan-600 rounded-full"></span>
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">
            2. Ủy viên Ban Chấp hành Liên Chi hội (08 đồng chí)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {uvBCH.map((person, index) => {
            const avatarUrl = person.avatar || person.image_url;
            return (
              <div
                key={person._id || index}
                className="flex items-center gap-3.5 p-3.5 sm:p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-sky-500/40 hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 bg-sky-50 text-sky-700 border border-sky-100 rounded-xl flex items-center justify-center font-bold text-sm shadow-2xs relative overflow-hidden shrink-0">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt={person.full_name || person.name} fill className="object-cover" unoptimized />
                  ) : (
                    <span>{(person.full_name || person.name || "").split(' ').pop()?.charAt(0) || <UserCircle size={22} />}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-slate-800 text-xs sm:text-sm leading-snug truncate">
                    {person.full_name || person.name || "Chưa phân bổ"}
                  </p>
                  <p className="text-[10px] text-sky-700 font-black uppercase tracking-wider mt-0.5">
                    {person.role || "Ủy viên BCH LCH"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isUpdateOpen && (
        <UpdateFacultyLCHModal
          onClose={() => {
            setIsUpdateOpen(false);
            fetchLCH();
          }}
          currentLCH={lchList}
        />
      )}
    </section>
  );
}
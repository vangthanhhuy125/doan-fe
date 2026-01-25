'use client';

import { School, LayoutGrid, UserCircle } from "lucide-react";

interface Props {
  chiDoanTruocThuoc: any[];
}

export default function SectionChiDoan({ chiDoanTruocThuoc }: Props) {
  return (
    <section className="space-y-8">
      <div className="flex items-center gap-3 border-b-2 border-purple-600 pb-3">
        <div className="p-2 bg-purple-600 rounded-xl text-white shadow-lg shadow-purple-100">
          <LayoutGrid size={24} />
        </div>
        <h2 className="text-2xl font-black uppercase text-purple-600 tracking-tight">Chi đoàn & Tập thể trực thuộc</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {chiDoanTruocThuoc.map((unit, index) => (
          <div key={index} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="bg-gradient-to-r from-purple-50 to-white px-8 py-5 border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-200 group-hover:rotate-12 transition-transform duration-500">
                  <School size={20} />
                </div>
                <span className="font-black text-slate-800 text-base tracking-wide uppercase">{unit.ten}</span>
              </div>
            </div>
            
            <div className="p-8 grid grid-cols-2 gap-6 bg-white">
              <div className="p-4 bg-red-50/40 rounded-[1.5rem] border border-red-50 relative overflow-hidden group/item">
                <div className="absolute top-0 right-0 p-2 opacity-10 text-red-600 group-hover/item:scale-110 transition-transform">
                  <UserCircle size={40} />
                </div>
                <p className="text-[10px] font-black uppercase text-red-400 mb-2 tracking-widest">Bí thư</p>
                <p className="text-sm font-black text-slate-800 truncate">{unit.biThu}</p>
              </div>

              <div className="p-4 bg-amber-50/40 rounded-[1.5rem] border border-amber-50 relative overflow-hidden group/item">
                <div className="absolute top-0 right-0 p-2 opacity-10 text-amber-600 group-hover/item:scale-110 transition-transform">
                  <UserCircle size={40} />
                </div>
                <p className="text-[10px] font-black uppercase text-amber-500 mb-2 tracking-widest">Phó Bí thư</p>
                <p className="text-sm font-black text-slate-800 truncate">{unit.phoBiThu}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
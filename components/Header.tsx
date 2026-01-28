'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function Header() {
  const router = useRouter();

  return (
    <header className="h-16 bg-white flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <Image src="/truong-doan-khoa.png" alt="Logo" width={120} height={120} />
        <span className="font-semibold text-[#0054a5] hidden md:block text-[16px] leading-tight uppercase">
          Đoàn khoa Công nghệ Phần mềm, <br/> Đoàn trường Đại học Công nghệ Thông tin - ĐHQG-HCM   
        </span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 border-r pr-6 border-gray-100">
          <div className="text-right">
            <p className="text-sm font-black text-[#0054a5] uppercase tracking-tight">Nguyễn Văn Anh</p>
          </div>
        </div>

        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-red-600 transition-all group border-none bg-transparent outline-none"
          title="Đăng xuất"
        >
          <div className="p-2 group-hover:bg-red-50 rounded-xl transition-colors">
            <LogOut 
              size={20} 
              className="group-hover:-rotate-180 transition-transform duration-500" 
            />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest hidden lg:block">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
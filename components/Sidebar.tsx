'use client';

import { useState } from "react";
import Link from "next/link";
import { 
  Info, Flag, Trophy, UserSquare2, Settings, Network, CalendarDays, FileText, Menu, X
} from "lucide-react"; 

const menuItems = [
  { name: "Giới thiệu", href: "/gioi-thieu", icon: Info },
  { name: "Tài liệu", href: "/tai-lieu", icon: FileText },
  { name: "Chương trình năm", href: "/chuong-trinh", icon: CalendarDays },
  { name: "Công tác Đoàn - Đảng", href: "/cong-tac", icon: Flag },
  { name: "Thi đua", href: "/thi-dua", icon: Trophy },
  { name: "Tổ chức Đoàn khoa", href: "/to-chuc", icon: Network },
  { name: "Nhân sự", href: "/nhan-su", icon: UserSquare2 },
  { name: "Cài đặt", href: "/cai-dat", icon: Settings },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#0054a5] text-white rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-[#0054a5] text-white min-h-screen flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-4 text-xl text-center font-bold">
          HỆ THỐNG NGHIỆP VỤ <br /> CÔNG TÁC ĐOÀN
        </div>
        <div className="text-center">
          <div className="inline-block px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-xl
                          transition-all duration-300 ease-out
                          hover:scale-110 hover:shadow-2xl">
            <p className="text-sm font-bold text-white tracking-[0.2em] drop-shadow-md">
              SE-UIT-VNUHCM
            </p>
          </div>
        </div>      
        <nav className="flex-1 mt-4 overflow-y-auto">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-6 py-4 hover:bg-[#1d92ff] transition-colors"
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
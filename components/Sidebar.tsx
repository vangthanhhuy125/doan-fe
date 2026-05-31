'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Info, Flag, Trophy, UserSquare2, Settings, Network, CalendarDays, FileText, Menu, X, LayoutGrid
} from "lucide-react"; 

const menuItems = [
  { name: "Giới thiệu", href: "/about", icon: Info },
  { name: "Tài liệu", href: "/documents", icon: FileText },
  { name: "Chương trình năm", href: "/annual-programs", icon: CalendarDays },
  { name: "Công tác Đoàn - Đảng", href: "/union-party-affairs", icon: Flag },
  { name: "Thi đua", href: "/emulation-awards", icon: Trophy },
  { name: "Tổ chức Đoàn khoa", href: "/faculty-union-structure", icon: Network },
  { name: "Nhân sự", href: "/personnel", icon: UserSquare2 },
  { name: "Mô hình CLPI", href: "/clpi-models", icon: LayoutGrid },
  { name: "Cài đặt", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

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
        <nav className="flex-1 mt-6 overflow-y-auto px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? "bg-white/15 border border-white/30 shadow-lg translate-x-1" 
                    : "hover:bg-white/10 border border-transparent"}
                `}
              >
                <item.icon 
                  size={20} 
                  className={`transition-colors ${isActive ? "text-white" : "text-white/60 group-hover:text-white"}`} 
                />
                <span className={`text-sm transition-all ${isActive ? "font-bold text-white" : "text-white/80 group-hover:text-white"}`}>
                  {item.name}
                </span>
                {isActive && (
                   <div className="ml-auto w-1.5 h-5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
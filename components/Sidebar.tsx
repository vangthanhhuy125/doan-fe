// Sidebar.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Flag, Trophy, Users, Settings, UserSquare2, CalendarDays, FileText, Menu, X, LayoutGrid
} from "lucide-react"; 

const menuItems = [
  { id: "gioi-thieu", name: "Giới thiệu", href: "/about", icon: LayoutDashboard },
  { id: "tai-lieu", name: "Tài liệu", href: "/documents", icon: FileText },
  { id: "chuong-trinh-nam", name: "Chương trình năm", href: "/annual-programs", icon: CalendarDays },
  { id: "cong-tac-doan", name: "Công tác Đoàn - Đảng", href: "/union-party-affairs", icon: Flag },
  { id: "thi-dua", name: "Thi đua", href: "/emulation-awards", icon: Trophy },
  { id: "to-chuc-doan", name: "Tổ chức Đoàn khoa", href: "/faculty-union-structure", icon: Users },
  { id: "nhan-su", name: "Nhân sự", href: "/personnel", icon: UserSquare2 },
  { id: "mo-hinh-clb", name: "Mô hình CLPI", href: "/clpi-models", icon: LayoutGrid },
  { id: "cai-dat", name: "Cài đặt", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [allowedMenuItems, setAllowedMenuItems] = useState(menuItems);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;

        const user = JSON.parse(userStr);
        const groupId = user.group_id || user.groupId || user.permission_id;
        if (!groupId) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions/${groupId}`);
        if (res.ok) {
          const groupData = await res.json();
          const permissions: string[] = groupData.permissions || [];
          if (Array.isArray(permissions) && permissions.length > 0) {
            const filtered = menuItems.filter(item => permissions.includes(item.id));
            setAllowedMenuItems(filtered);
          }
        }
      } catch (error) {
        console.error("Lỗi tải phân quyền Sidebar:", error);
      }
    };

    fetchUserPermissions();
  }, []);

  return (
    <>
      <button 
        className="lg:hidden fixed top-3.5 left-3 z-50 p-2 bg-[#0054a5] text-white rounded-xl shadow-md border-none cursor-pointer flex items-center justify-center active:scale-95"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-[#0054a5] text-white min-h-screen flex flex-col
        transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
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
          {allowedMenuItems.map((item) => {
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
'use client';

import Link from "next/link";
import { 
  Info, Flag, Trophy, UserSquare2, Settings, Network, CalendarDays, FileText
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
  return (
    <aside className="w-64 bg-[#0054a5] text-white min-h-screen flex flex-col">
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
      <nav className="flex-1 mt-4">
        {menuItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className="flex items-center gap-3 px-6 py-4 hover:bg-[#1d92ff] transition-colors"
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
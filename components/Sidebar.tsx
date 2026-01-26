'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Info, Flag, Trophy, UserSquare2, Settings, LogOut, CalendarDays, FileText
} from "lucide-react"; 

const menuItems = [
  { name: "Giới thiệu", href: "/gioi-thieu", icon: Info },
  { name: "Tài liệu", href: "/tai-lieu", icon: FileText },
  { name: "Chương trình năm", href: "/chuong-trinh", icon: CalendarDays },
  { name: "Công tác Đoàn", href: "/cong-tac", icon: Flag },
  { name: "Thi đua", href: "/thi-dua", icon: Trophy },
  { name: "Nhân sự", href: "/nhan-su", icon: UserSquare2 },
  { name: "Cài đặt", href: "/cai-dat", icon: Settings },
];

export default function Sidebar() {
  const router = useRouter();

  return (
    <aside className="w-64 bg-[#0054a5] text-white min-h-screen flex flex-col">
      <div className="p-4 text-xl text-center font-bold">
        HỆ THỐNG NGHIỆP VỤ <br /> CÔNG TÁC ĐOÀN
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

      <div className="p-6 mt-auto">
        <button 
          onClick={() => router.push("/")}
          className="flex w-full items-center justify-center gap-3 px-6 py-4 bg-red-500/10 hover:bg-red-600 rounded-2xl transition-all duration-300 group shadow-lg hover:shadow-red-500/40 border border-red-500/20 active:scale-95"
        >
          <LogOut size={20} className="group-hover:rotate-180 transition-transform duration-500" />
          <span className="font-bold text-sm tracking-widest uppercase">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
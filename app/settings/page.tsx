'use client';

// ĐÃ SỬA: Sửa lại cú pháp import { useRouter } chuẩn của Next.js App Router
import { useRouter } from "next/navigation"; 
import { Shield, Image as ImageIcon, History, Settings2 } from "lucide-react";

export default function SettingsMenuPage() {
  const router = useRouter();

  const settingMenus = [
    {
      title: "Quản lý Quyền truy cập",
      description: "Cấp phát, phân quyền và quản lý tài khoản hệ thống",
      path: "/settings/accounts",
      icon: Shield,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      title: "Thiết lập Banner",
      description: "Quản lý dữ liệu chuỗi ảnh nền động cho trang Giới thiệu",
      path: "/settings/banner-config", 
      icon: ImageIcon,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50"
    },
    {
      title: "Lịch sử truy cập",
      description: "Xem nhật ký hoạt động và lịch sử thao tác của các tài khoản",
      path: "/settings/logs",
      icon: History,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Cấu hình Hệ thống",
      description: "Thiết lập các tham số mặc định: năm học, học kỳ, ...",
      path: "/settings/system-config",
      icon: Settings2,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="space-y-6 text-black">
      <div className="border-b-2 border-[#0054a5] pb-3">
        <h2 className="text-2xl font-black uppercase text-[#0054a5] tracking-tight">
          Cài đặt Nghiệp vụ
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
        {settingMenus.map((menu, index) => {
          const IconComponent = menu.icon;
          return (
            <div
              key={index}
              onClick={() => router.push(menu.path)}
              className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col items-center text-center justify-center min-h-[180px] sm:min-h-[220px] shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group active:scale-95"
            >
              <div className={`p-4 ${menu.bgColor} rounded-2xl group-hover:scale-110 transition-transform shadow-inner mb-4 flex items-center justify-center`}>
                <IconComponent size={32} className={`${menu.iconColor}`} />
              </div>

              <div className="space-y-1">
                <h3 className="font-black text-slate-800 text-sm sm:text-base group-hover:text-[#0054a5] transition-colors">
                  {menu.title}
                </h3>
                <p className="text-slate-400 text-[11px] sm:text-xs font-medium leading-relaxed max-w-[180px] mx-auto">
                  {menu.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
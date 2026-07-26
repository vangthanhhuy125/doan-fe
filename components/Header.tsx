'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, User, UserCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Header() {
  const router = useRouter();
  const [userName, setUserName] = useState("Khách");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.full_name || user.displayName || user.username || "Thành viên");
        setUserAvatar(user.image_url || null);
      } catch (err) {
        setUserName("Thành viên");
        setUserAvatar(null);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setIsOpen(false);
    router.push("/login");
  };

  const handleProfile = () => {
    setIsOpen(false);
    router.push("/profile");
  };

  return (
    <header className="h-16 bg-white flex items-center justify-between px-6 shadow-sm relative z-30">
      <div className="flex items-center gap-3">
        <Image src="/truong-doan-khoa.png" alt="Logo" width={120} height={120} />
        <span className="font-semibold text-[#0054a5] hidden md:block text-[16px] leading-tight uppercase">
          Đoàn khoa Công nghệ Phần mềm, <br/> Đoàn trường Đại học Công nghệ Thông tin - ĐHQG-HCM   
        </span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center rounded-full transition-all focus:outline-none ring-2 ring-transparent hover:ring-[#0054a5]/30 p-0.5 cursor-pointer"
            title="Tài khoản"
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#0054a5]"
                onError={() => setUserAvatar(null)}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#0054a5]/10 text-[#0054a5] flex items-center justify-center border-2 border-[#0054a5]">
                <User size={22} className="stroke-[2.2]" />
              </div>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tài khoản</p>
                <p className="text-sm font-bold text-[#0054a5] truncate mt-0.5">{userName}</p>
              </div>

              <div className="p-1.5 space-y-1">
                <button
                  onClick={handleProfile}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#0054a5] hover:bg-blue-50/80 rounded-xl transition-all cursor-pointer"
                >
                  <UserCircle size={18} className="text-[#0054a5]" />
                  <span>Trang cá nhân</span>
                </button>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut size={18} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
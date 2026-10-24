'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, CheckSquare, FileText, Award, 
  ClipboardCheck, Users, Calendar, 
  ChevronDown, Bell, LogOut,
  FolderKanban, BarChart3,
  UserCheck, UserCog, Layers, PlusCircle, ArrowUpRight,
  ShieldCheck, Menu, X
} from 'lucide-react';

export type UserRole = 
  | 'OFFICER' 
  | 'UNIT_MANAGER' 
  | 'REVIEWER' 
  | 'CLPI_ADMIN' 
  | 'SYS_ADMIN';

export default function ClpiPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>('UNIT_MANAGER');
  const [selectedCycle, setSelectedCycle] = useState('q2_2026');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Lấy dữ liệu người dùng thực tế từ localStorage
  const [userProfile, setUserProfile] = useState({
    fullName: 'Cán bộ Đoàn',
    position: 'Bí thư Chi đoàn',
    avatar: '',
  });

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        setUserProfile({
          fullName: u.full_name || u.displayName || u.username || 'Cán bộ Đoàn',
          position: u.chuc_vu || u.position || u.roleTitle || 'Bí thư Chi đoàn',
          avatar: u.image_url || u.avatar || '',
        });

        const roles = Array.isArray(u.roles) ? u.roles.map((r: string) => r.toLowerCase()) : [];
        const roleStr = (u.role || '').toLowerCase();
        if (roleStr === 'admin' || roles.some((r: string) => r.includes('admin') || r.includes('thường vụ') || r.includes('bí thư đoàn khoa'))) {
          setActiveRole('SYS_ADMIN');
        } else if (roles.some((r: string) => r.includes('kiểm tra') || r.includes('reviewer'))) {
          setActiveRole('REVIEWER');
        } else if (roles.some((r: string) => r.includes('bí thư') || r.includes('trưởng ban'))) {
          setActiveRole('UNIT_MANAGER');
        } else {
          setActiveRole('OFFICER');
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const navigationGroups = [
    {
      group: 'TỔNG QUAN',
      items: [
        { label: 'Trang chủ cán bộ', href: '/clpi-models', icon: Home, exact: true, roles: ['OFFICER', 'UNIT_MANAGER', 'REVIEWER', 'CLPI_ADMIN', 'SYS_ADMIN'] },
      ],
    },
    {
      group: 'CÔNG VIỆC',
      items: [
        { label: 'Công việc của tôi', href: '/clpi-models/tasks', icon: CheckSquare, exact: false, roles: ['OFFICER', 'UNIT_MANAGER', 'REVIEWER', 'CLPI_ADMIN', 'SYS_ADMIN'] },
        { label: 'Chi tiết nhiệm vụ', href: '/clpi-models/tasks/task_01', icon: FolderKanban, exact: true, roles: ['OFFICER', 'UNIT_MANAGER', 'REVIEWER', 'CLPI_ADMIN', 'SYS_ADMIN'] },
        { label: 'Báo cáo công tác tháng', href: '/clpi-models/monthly-report', icon: FileText, exact: false, roles: ['OFFICER', 'UNIT_MANAGER', 'REVIEWER', 'CLPI_ADMIN', 'SYS_ADMIN'] },
      ],
    },
    {
      group: 'CLPI TỰ ĐÁNH GIÁ',
      items: [
        { label: 'Tự đánh giá CLPI', href: '/clpi-models/self-assessment', icon: Award, exact: false, roles: ['OFFICER', 'UNIT_MANAGER', 'REVIEWER', 'CLPI_ADMIN', 'SYS_ADMIN'] },
        { label: 'Hồ sơ đánh giá đã nộp', href: '/clpi-models/evaluations/eval_current', icon: FileText, exact: true, roles: ['OFFICER', 'UNIT_MANAGER', 'REVIEWER', 'CLPI_ADMIN', 'SYS_ADMIN'] },
        { label: 'Kết quả CLPI cá nhân', href: '/clpi-models/evaluations/eval_current/result', icon: Award, exact: true, roles: ['OFFICER', 'UNIT_MANAGER', 'REVIEWER', 'CLPI_ADMIN', 'SYS_ADMIN'] },
      ],
    },
    {
      group: 'QUẢN LÝ & KIỂM TRA',
      items: [
        { label: 'Hồ sơ chờ đánh giá', href: '/clpi-models/review', icon: ClipboardCheck, exact: false, badge: '3', roles: ['REVIEWER', 'CLPI_ADMIN', 'SYS_ADMIN'] },
        { label: 'Thẩm định hồ sơ', href: '/clpi-models/review/eval_01', icon: UserCheck, exact: true, roles: ['REVIEWER', 'CLPI_ADMIN', 'SYS_ADMIN'] },
        { label: 'Đơn vị của tôi', href: '/clpi-models/unit-dashboard', icon: Users, exact: false, roles: ['UNIT_MANAGER', 'REVIEWER', 'CLPI_ADMIN', 'SYS_ADMIN'] },
      ],
    },
    {
      group: 'QUẢN TRỊ BTV & HỆ THỐNG',
      items: [
        { label: 'Bảng điều khiển BTV', href: '/clpi-models/admin-dashboard', icon: BarChart3, exact: false, roles: ['CLPI_ADMIN', 'SYS_ADMIN'] },
        { label: 'Chu kỳ đánh giá', href: '/clpi-models/cycles', icon: Calendar, exact: false, roles: ['CLPI_ADMIN', 'SYS_ADMIN'] },
        { label: 'Thiết lập chu kỳ', href: '/clpi-models/cycles/wizard', icon: PlusCircle, exact: false, roles: ['CLPI_ADMIN', 'SYS_ADMIN'] },
        { label: 'Bộ chỉ số & Trọng số', href: '/clpi-models/indicators', icon: Layers, exact: false, roles: ['CLPI_ADMIN', 'SYS_ADMIN'] },
        { label: 'Quản lý nhân sự', href: '/clpi-models/personnel', icon: UserCog, exact: false, roles: ['CLPI_ADMIN', 'SYS_ADMIN'] },
        { label: 'Báo cáo & Thống kê', href: '/clpi-models/analytics', icon: FileText, exact: false, roles: ['CLPI_ADMIN', 'SYS_ADMIN'] },
      ],
    },
  ];

  const handleRoleChange = (newRole: UserRole) => {
    setActiveRole(newRole);
    if (newRole === 'OFFICER' && (pathname.startsWith('/clpi-models/review') || pathname.startsWith('/clpi-models/unit-dashboard') || pathname.startsWith('/clpi-models/admin-dashboard'))) {
      router.push('/clpi-models');
    } else if (newRole === 'UNIT_MANAGER' && (pathname.startsWith('/clpi-models/review') || pathname.startsWith('/clpi-models/admin-dashboard'))) {
      router.push('/clpi-models');
    } else if (newRole === 'REVIEWER' && pathname.startsWith('/clpi-models/admin-dashboard')) {
      router.push('/clpi-models');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      {/* 1. TOP HEADER */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 -ml-1 text-[#0054a5] hover:bg-slate-100 rounded-xl transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center active:scale-95"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <img
            src="/truong-doan-khoa.png"
            alt="Logo Đoàn khoa"
            className="w-auto h-9 sm:h-10 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/doankhoa.png';
            }}
          />

          <div className="hidden md:block">
            <span className="font-bold text-[#0054a5] text-[14px] leading-tight block">
              Đoàn khoa Công nghệ Phần mềm,
            </span>
            <span className="font-semibold text-[#0054a5] text-[13px] leading-tight block">
              Đoàn trường Đại học Công nghệ Thông tin - ĐHQG-HCM
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline">Chu kỳ:</span>
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer border-none p-0 text-xs"
            >
              <option value="q2_2026">Quý II/2026 (Đang diễn ra)</option>
              <option value="q1_2026">Quý I/2026 (Đã công bố)</option>
              <option value="q4_2025">Quý IV/2025 (Lưu trữ)</option>
            </select>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-blue-50/80 border border-blue-200 px-2.5 py-1 rounded-xl text-xs">
            <span className="text-[#0054a5] font-semibold text-[11px]">Vai trò:</span>
            <select
              value={activeRole}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              className="bg-transparent font-bold text-[#0054a5] outline-none cursor-pointer border-none p-0 text-xs"
            >
              <option value="OFFICER">Cán bộ</option>
              <option value="UNIT_MANAGER">Bí thư / Trưởng ban</option>
              <option value="REVIEWER">Người kiểm tra</option>
              <option value="CLPI_ADMIN">BTV Đoàn Khoa</option>
              <option value="SYS_ADMIN">Quản trị viên</option>
            </select>
          </div>

          <button
            type="button"
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
            title="Thông báo"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2.5 pl-2 pr-1.5 py-1 hover:bg-slate-50 rounded-2xl transition-colors border-none bg-transparent cursor-pointer text-left"
            >
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.fullName}
                  className="w-9 h-9 rounded-full object-cover border-2 border-[#0054a5]"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#0054a5] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {userProfile.fullName.charAt(0)}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[140px]">{userProfile.fullName}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">{userProfile.position}</p>
              </div>
              <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-[#0054a5] truncate">{userProfile.fullName}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{userProfile.position}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0054a5] no-underline"
                >
                  <ShieldCheck size={14} /> Trang cá nhân
                </Link>
                <Link
                  href="/about"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0054a5] no-underline"
                >
                  <ArrowUpRight size={14} /> Trở về Website chính
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border-none bg-transparent cursor-pointer text-left"
                >
                  <LogOut size={14} /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. BODY CHÍNH */}
      <div className="flex-1 flex overflow-hidden relative">
        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          />
        )}

        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-64 bg-[#0054a5] text-white flex flex-col shrink-0
            transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
            overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="p-4 sm:p-5 text-center font-bold text-base sm:text-lg tracking-tight leading-snug">
            HỆ THỐNG ĐÁNH GIÁ <br /> NĂNG LỰC CÁN BỘ
          </div>

          <nav className="flex-1 mt-2 overflow-y-auto px-3 pb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {navigationGroups.map((group) => {
              const visibleItems = group.items.filter((it) => it.roles.includes(activeRole));
              if (visibleItems.length === 0) return null;

              return (
                <div key={group.group} className="mb-4">
                  <p className="px-4 text-[10px] font-black uppercase text-white/50 tracking-wider mb-1.5">
                    {group.group}
                  </p>
                  <div className="space-y-1">
                    {visibleItems.map((item) => {
                      const isActive = item.exact
                        ? pathname === item.href
                        : pathname === item.href || (item.href !== '/clpi-models' && pathname.startsWith(item.href));
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`
                            flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group no-underline
                            ${isActive 
                              ? 'bg-white/15 border border-white/30 shadow-lg translate-x-1' 
                              : 'hover:bg-white/10 border border-transparent'}
                          `}
                        >
                          <Icon 
                            size={18} 
                            className={`shrink-0 transition-colors ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`} 
                          />
                          <span className={`text-xs sm:text-sm truncate transition-all ${isActive ? 'font-bold text-white' : 'text-white/80 group-hover:text-white'}`}>
                            {item.label}
                          </span>
                          
                          {isActive ? (
                            <div className="ml-auto shrink-0 w-1.5 h-5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                          ) : item.badge ? (
                            <span className="ml-auto shrink-0 px-2 py-0.5 bg-amber-400 text-slate-900 font-extrabold rounded-md text-[10px]">
                              {item.badge}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 bg-[#f8fafc] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
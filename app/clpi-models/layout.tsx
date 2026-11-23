'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  CheckSquare,
  FileText,
  Award,
  ClipboardCheck,
  Users,
  Calendar,
  Bell,
  LogOut,
  BarChart3,
  UserCog,
  Layers,
  ArrowUpRight,
  UserCircle,
  LayoutGrid,
  Menu,
  X,
  User,
} from 'lucide-react';

export type UserRole =
  | 'OFFICER'
  | 'UNIT_MANAGER'
  | 'REVIEWER'
  | 'CLPI_ADMIN'
  | 'SYS_ADMIN';

interface CycleOption {
  id: string;
  name: string;
  status: string;
}

const CYCLE_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Đang diễn ra',
  REVIEWING: 'Đang thẩm định',
  COMPLETED: 'Đã công bố',
  LOCKED: 'Lưu trữ',
};

const mapClpiRoleToUserRole = (clpiRole?: string): UserRole | null => {
  const normalized = String(clpiRole || '').trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === 'clpi admin' || normalized === 'clpi_admin') return 'CLPI_ADMIN';
  if (normalized === 'reviewer') return 'REVIEWER';
  if (normalized === 'unit manager' || normalized === 'unit_manager') return 'UNIT_MANAGER';
  if (normalized === 'officer') return 'OFFICER';
  return null;
};

export default function ClpiPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>('OFFICER');
  const [cycles, setCycles] = useState<CycleOption[]>([]);
  const [selectedCycle, setSelectedCycle] = useState('');
  const [pendingReviewCount, setPendingReviewCount] = useState<number>(0);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [userProfile, setUserProfile] = useState({
    fullName: 'Cán bộ Đoàn',
    position: 'Cán bộ Đoàn - Hội',
    avatar: '',
  });

  useEffect(() => {
    const initPortalData = async () => {
      const token = localStorage.getItem('token') || '';
      let userId = '';

      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const parsed = JSON.parse(userStr);
          const u = parsed.user || parsed;
          userId = String(u._id || u.id || u.user_id || '').trim();

          const posList = Array.isArray(u.positions) && u.positions.length > 0
            ? u.positions.join(', ')
            : u.chuc_vu || u.position || u.roleTitle || 'Cán bộ Đoàn - Hội';

          setUserProfile({
            fullName: u.full_name || u.displayName || u.name || u.username || 'Cán bộ Đoàn',
            position: posList,
            avatar: u.image_url || u.avatar || '',
          });

          const mappedClpi = mapClpiRoleToUserRole(u.clpiRole);
          if (mappedClpi) {
            setActiveRole(mappedClpi);
          } else {
            const roles = Array.isArray(u.roles) ? u.roles.map((r: string) => r.toLowerCase()) : [];
            const roleStr = String(u.role || '').toLowerCase();
            if (
              roleStr === 'admin' ||
              roles.some((r: string) => r.includes('admin') || r.includes('thường vụ') || r.includes('bí thư đoàn khoa'))
            ) {
              setActiveRole('SYS_ADMIN');
            } else if (roles.some((r: string) => r.includes('kiểm tra') || r.includes('reviewer'))) {
              setActiveRole('REVIEWER');
            } else if (roles.some((r: string) => r.includes('bí thư') || r.includes('trưởng ban'))) {
              setActiveRole('UNIT_MANAGER');
            } else {
              setActiveRole('OFFICER');
            }
          }
        }
      } catch (e) {
        console.error(e);
      }

      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      if (!apiUrl) return;

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (userId) headers['x-user-id'] = userId;

      try {
        const [cyclesRes, queueRes] = await Promise.all([
          fetch(`${apiUrl}/clpi/cycles`, { headers }).catch(() => null),
          fetch(`${apiUrl}/clpi/review/queue`, { headers }).catch(() => null),
        ]);

        if (cyclesRes && cyclesRes.ok) {
          const data = await cyclesRes.json();
          const list: CycleOption[] = (Array.isArray(data) ? data : []).map((c: any) => ({
            id: String(c.id || c._id),
            name: String(c.name || '').replace(/^Chu kỳ CLPI\s+/i, ''),
            status: c.status || 'OPEN',
          }));
          setCycles(list);

          if (list.length > 0) {
            const savedCycleId = localStorage.getItem('clpi_selected_cycle');
            const matchedSaved = list.find((c) => c.id === savedCycleId);
            const openCycle = list.find((c) => c.status === 'OPEN') || list[0];
            const initialId = matchedSaved ? matchedSaved.id : openCycle.id;
            setSelectedCycle(initialId);
            localStorage.setItem('clpi_selected_cycle', initialId);
          }
        }

        if (queueRes && queueRes.ok) {
          const qData = await queueRes.json();
          const pending = (Array.isArray(qData) ? qData : []).filter((item: any) =>
            ['SUBMITTED', 'RESUBMITTED', 'UNDER_REVIEW'].includes(item.status)
          ).length;
          setPendingReviewCount(pending);
        }
      } catch (e) {
        console.error(e);
      }
    };

    initPortalData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigationGroups = [
    {
      group: 'TỔNG QUAN',
      items: [
        {
          label: 'Trang chủ cán bộ',
          href: '/clpi-models',
          icon: Home,
          exact: true,
          roles: ['OFFICER', 'UNIT_MANAGER', 'REVIEWER', 'CLPI_ADMIN', 'SYS_ADMIN'],
        },
      ],
    },
    {
      group: 'CÔNG VIỆC',
      items: [
        {
          label: 'Công việc của tôi',
          href: '/clpi-models/tasks',
          icon: CheckSquare,
          exact: false,
          roles: ['OFFICER', 'UNIT_MANAGER', 'REVIEWER', 'CLPI_ADMIN', 'SYS_ADMIN'],
        },
        {
          label: 'Báo cáo công tác tháng',
          href: '/clpi-models/monthly-report',
          icon: FileText,
          exact: false,
          roles: ['OFFICER', 'UNIT_MANAGER', 'REVIEWER', 'CLPI_ADMIN', 'SYS_ADMIN'],
        },
      ],
    },
    {
      group: 'CLPI TỰ ĐÁNH GIÁ',
      items: [
        {
          label: 'Tự đánh giá CLPI',
          href: '/clpi-models/self-assessment',
          icon: Award,
          exact: false,
          roles: ['OFFICER', 'UNIT_MANAGER', 'REVIEWER', 'CLPI_ADMIN', 'SYS_ADMIN'],
        },
        {
          label: 'Hồ sơ đánh giá đã nộp',
          href: '/clpi-models/evaluations/eval_current',
          icon: FileText,
          exact: true,
          roles: ['OFFICER', 'UNIT_MANAGER', 'REVIEWER', 'CLPI_ADMIN', 'SYS_ADMIN'],
        },
        {
          label: 'Kết quả CLPI cá nhân',
          href: '/clpi-models/evaluations/eval_current/result',
          icon: Award,
          exact: true,
          roles: ['OFFICER', 'UNIT_MANAGER', 'REVIEWER', 'CLPI_ADMIN', 'SYS_ADMIN'],
        },
      ],
    },
    {
      group: 'QUẢN LÝ & KIỂM TRA',
      items: [
        {
          label: 'Hồ sơ chờ đánh giá',
          href: '/clpi-models/review',
          icon: ClipboardCheck,
          exact: false,
          badge: pendingReviewCount > 0 ? String(pendingReviewCount) : undefined,
          roles: ['REVIEWER', 'CLPI_ADMIN', 'SYS_ADMIN'],
        },
        {
          label: 'Đơn vị của tôi',
          href: '/clpi-models/unit-dashboard',
          icon: Users,
          exact: false,
          roles: ['UNIT_MANAGER', 'REVIEWER', 'CLPI_ADMIN', 'SYS_ADMIN'],
        },
      ],
    },
    {
      group: 'QUẢN TRỊ BTV & HỆ THỐNG',
      items: [
        {
          label: 'Bảng điều khiển BTV',
          href: '/clpi-models/admin-dashboard',
          icon: BarChart3,
          exact: false,
          roles: ['CLPI_ADMIN', 'SYS_ADMIN'],
        },
        {
          label: 'Chu kỳ đánh giá',
          href: '/clpi-models/cycles',
          icon: Calendar,
          exact: false,
          roles: ['CLPI_ADMIN', 'SYS_ADMIN'],
        },
        {
          label: 'Bộ chỉ số & Trọng số',
          href: '/clpi-models/indicators',
          icon: Layers,
          exact: false,
          roles: ['CLPI_ADMIN', 'SYS_ADMIN'],
        },
        {
          label: 'Quản lý nhân sự',
          href: '/clpi-models/personnel',
          icon: UserCog,
          exact: false,
          roles: ['CLPI_ADMIN', 'SYS_ADMIN'],
        },
        {
          label: 'Báo cáo & Thống kê',
          href: '/clpi-models/analytics',
          icon: FileText,
          exact: false,
          roles: ['CLPI_ADMIN', 'SYS_ADMIN'],
        },
      ],
    },
  ];

  const handleCycleChange = (cycleId: string) => {
    setSelectedCycle(cycleId);
    localStorage.setItem('clpi_selected_cycle', cycleId);
    window.dispatchEvent(new CustomEvent('clpi-cycle-changed', { detail: cycleId }));
  };

  const handleRoleChange = (newRole: UserRole) => {
    setActiveRole(newRole);
    if (
      newRole === 'OFFICER' &&
      (pathname.startsWith('/clpi-models/review') ||
        pathname.startsWith('/clpi-models/unit-dashboard') ||
        pathname.startsWith('/clpi-models/admin-dashboard') ||
        pathname.startsWith('/clpi-models/cycles') ||
        pathname.startsWith('/clpi-models/indicators') ||
        pathname.startsWith('/clpi-models/personnel') ||
        pathname.startsWith('/clpi-models/analytics'))
    ) {
      router.push('/clpi-models');
    } else if (
      newRole === 'UNIT_MANAGER' &&
      (pathname.startsWith('/clpi-models/review') ||
        pathname.startsWith('/clpi-models/admin-dashboard') ||
        pathname.startsWith('/clpi-models/cycles') ||
        pathname.startsWith('/clpi-models/indicators') ||
        pathname.startsWith('/clpi-models/personnel') ||
        pathname.startsWith('/clpi-models/analytics'))
    ) {
      router.push('/clpi-models');
    } else if (
      newRole === 'REVIEWER' &&
      (pathname.startsWith('/clpi-models/admin-dashboard') ||
        pathname.startsWith('/clpi-models/cycles') ||
        pathname.startsWith('/clpi-models/indicators') ||
        pathname.startsWith('/clpi-models/personnel') ||
        pathname.startsWith('/clpi-models/analytics'))
    ) {
      router.push('/clpi-models');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      {/* Nút Toggle Menu Mobile */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-3.5 left-3 z-50 p-2 bg-[#0054a5] text-white rounded-xl shadow-md border-none cursor-pointer flex items-center justify-center active:scale-95"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* 1. LEFT SIDEBAR */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-[#0054a5] text-white min-h-screen flex flex-col shrink-0
          transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
          overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-4 text-[18px] sm:text-[19px] text-center font-bold leading-snug tracking-tight">
          HỆ THỐNG ĐÁNH GIÁ <br /> NĂNG LỰC CÁN BỘ
        </div>

        <div className="text-center">
          <div className="inline-block px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-xl transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl">
            <p className="text-xs sm:text-sm font-bold text-white tracking-[0.2em] drop-shadow-md">
              SE-UIT-VNUHCM
            </p>
          </div>
        </div>

        <nav className="flex-1 mt-6 overflow-y-auto px-3 pb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
                      : pathname === item.href ||
                        (item.href !== '/clpi-models' && pathname.startsWith(`${item.href}/`));
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group no-underline
                          ${
                            isActive
                              ? 'bg-white/15 border border-white/30 shadow-lg translate-x-1'
                              : 'hover:bg-white/10 border border-transparent'
                          }
                        `}
                      >
                        <Icon
                          size={19}
                          className={`shrink-0 transition-colors ${
                            isActive ? 'text-white' : 'text-white/60 group-hover:text-white'
                          }`}
                        />
                        <span
                          className={`text-xs sm:text-sm truncate transition-all ${
                            isActive ? 'font-bold text-white' : 'text-white/80 group-hover:text-white'
                          }`}
                        >
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

      {/* 2. CỘT PHẢI: TOP HEADER + MAIN CONTENT + FOOTER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white flex items-center justify-between px-4 sm:px-6 shadow-sm border-b border-slate-200/80 shrink-0 relative z-30">
          <div className="flex items-center gap-3 pl-11 lg:pl-0 min-w-0">
            <img
              src="/truong-doan-hoi-khoa.png"
              alt="Logo Đoàn - Hội Khoa CNPM"
              className="w-auto h-9 sm:h-10 object-contain shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/doankhoa.png';
              }}
            />
            <span className="font-semibold text-[#0054a5] hidden xl:block text-[14px] leading-tight truncate">
              Đoàn Thanh niên - Hội sinh viên trường Đại học Công nghệ Thông tin, ĐHQG-HCM <br />
              Đoàn khoa - Liên Chi hội khoa Công nghệ Phần mềm
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs">
              <span className="text-slate-400 font-medium hidden sm:inline">Chu kỳ:</span>
              <select
                value={selectedCycle}
                onChange={(e) => handleCycleChange(e.target.value)}
                disabled={cycles.length === 0}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer border-none p-0 text-xs disabled:text-slate-400"
              >
                {cycles.length > 0 ? (
                  cycles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({CYCLE_STATUS_LABELS[c.status] || c.status})
                    </option>
                  ))
                ) : (
                  <option value="">Chưa có chu kỳ</option>
                )}
              </select>
            </div>

            <button
              type="button"
              className="relative p-2 text-slate-500 hover:text-[#0054a5] hover:bg-blue-50/80 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
              title="Thông báo"
            >
              <Bell size={19} />
            </button>

            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center justify-center rounded-full transition-all focus:outline-none ring-2 ring-transparent hover:ring-[#0054a5]/30 p-0.5 cursor-pointer border-none bg-transparent"
                title={userProfile.fullName}
              >
                {userProfile.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.fullName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#0054a5]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#0054a5]/10 text-[#0054a5] flex items-center justify-center border-2 border-[#0054a5]">
                    <User size={21} className="stroke-[2.2]" />
                  </div>
                )}
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-[11px] font-semibold text-gray-400">Tài khoản cán bộ</p>
                    <p className="text-sm font-bold text-[#0054a5] truncate mt-0.5">
                      {userProfile.fullName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {userProfile.position}
                    </p>
                  </div>

                  <div className="px-4 py-2.5 border-b border-gray-100 bg-slate-50/70">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                      Vai trò làm việc
                    </label>
                    <select
                      value={activeRole}
                      onChange={(e) => {
                        handleRoleChange(e.target.value as UserRole);
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full p-2 bg-white border border-blue-200 rounded-xl text-xs font-bold text-[#0054a5] outline-none focus:border-[#0054a5] cursor-pointer shadow-2xs"
                    >
                      <option value="OFFICER">Cán bộ</option>
                      <option value="UNIT_MANAGER">Bí thư / Trưởng ban</option>
                      <option value="REVIEWER">Người kiểm tra</option>
                      <option value="CLPI_ADMIN">BTV Đoàn Khoa</option>
                      <option value="SYS_ADMIN">Quản trị viên</option>
                    </select>
                  </div>

                  <div className="p-1.5 space-y-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#0054a5] hover:bg-blue-50/80 rounded-xl transition-all no-underline"
                    >
                      <UserCircle size={18} className="text-[#0054a5]" />
                      <span>Trang cá nhân</span>
                    </Link>

                    <Link
                      href="/about"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#0054a5] hover:bg-blue-50/80 rounded-xl transition-all no-underline"
                    >
                      <LayoutGrid size={18} className="text-[#0054a5]" />
                      <span>Website Đoàn – Hội</span>
                      <ArrowUpRight size={14} className="ml-auto text-slate-400" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer border-none bg-transparent text-left"
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

        <main className="flex-1 overflow-y-auto bg-[#f8fafc] flex flex-col justify-between [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-7 flex-1">{children}</div>

          <footer className="bg-white border-t border-slate-200/80 px-4 sm:px-6 py-4 mt-8 shrink-0">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2.5 text-center sm:text-left">
                <span className="w-2 h-2 rounded-full bg-[#0054a5] shrink-0 hidden sm:inline-block" />
                <p className="font-semibold text-slate-700">
                  © 2026{' '}
                  <span className="text-[#0054a5] font-bold">
                    Đoàn khoa – Liên Chi hội khoa Công nghệ Phần mềm
                  </span>
                  , Trường ĐH Công nghệ Thông tin - ĐHQG-HCM
                </p>
              </div>
              <div className="flex items-center gap-4 font-medium text-[11px] text-slate-400 shrink-0">
                <span>Hệ thống Chỉ số Năng lực Cán bộ (CLPI)</span>
                <span>•</span>
                <Link href="/about" className="text-[#0054a5] hover:underline font-semibold no-underline">
                  Trang chủ Đoàn – Hội
                </Link>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
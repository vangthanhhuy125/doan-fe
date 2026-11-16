'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

const ROUTE_PERMISSION_MAP: { prefix: string; moduleId: string; label: string }[] = [
  { prefix: '/about', moduleId: 'gioi-thieu', label: 'Giới thiệu' },
  { prefix: '/documents', moduleId: 'tai-lieu', label: 'Tài liệu' },
  { prefix: '/annual-programs', moduleId: 'chuong-trinh-nam', label: 'Chương trình năm' },
  { prefix: '/union-party-affairs', moduleId: 'cong-tac-doan', label: 'Công tác' },
  { prefix: '/emulation-awards', moduleId: 'thi-dua', label: 'Thi đua' },
  { prefix: '/faculty-union-structure', moduleId: 'to-chuc-doan', label: 'Tổ chức Đoàn - Hội' },
  { prefix: '/personnel', moduleId: 'nhan-su', label: 'Nhân sự' },
  { prefix: '/clpi-models', moduleId: 'mo-hinh-clb', label: 'Mô hình CLPI' },
  { prefix: '/settings', moduleId: 'cai-dat', label: 'Cài đặt' },
];

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const router = useRouter();

  const matchedRoute = ROUTE_PERMISSION_MAP.find(
    (item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`)
  );

  const { isLoading, isAuthenticated, canAccessPage } = usePermissions(
    matchedRoute?.moduleId || ''
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (!matchedRoute) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-[#0054a5] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-400">Đang kiểm tra quyền truy cập...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!canAccessPage) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-rose-100 shadow-xl px-6 py-8 sm:px-10 text-center space-y-5">
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
            <ShieldAlert size={40} />
          </div>

          <div className="space-y-2.5">
            <span className="inline-block px-3.5 py-1 bg-rose-50 text-rose-600 text-[11px] font-black uppercase tracking-widest rounded-full">
              Không có quyền truy cập
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 sm:whitespace-nowrap">
              Bạn không được phép vào màn hình này
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-medium">
              Tài khoản của bạn chưa được cấp quyền truy cập phân hệ{' '}
              <span className="font-bold text-slate-700">{matchedRoute.label}</span>.
              <br className="hidden sm:block" />
              Vui lòng liên hệ Quản trị viên hệ thống nếu bạn cần được cấp quyền.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border-none cursor-pointer transition-all"
            >
              <ArrowLeft size={15} /> Quay lại
            </button>
            <button
              type="button"
              onClick={() => router.push('/about')}
              className="flex-1 py-3 px-4 bg-[#0054a5] hover:bg-blue-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border-none cursor-pointer shadow-md shadow-blue-200 transition-all"
            >
              <Home size={15} /> Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
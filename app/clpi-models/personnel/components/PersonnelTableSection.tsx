'use client';

import { useState, useMemo } from 'react';
import {
  Users,
  PlusCircle,
  Search,
  Filter,
  RotateCcw,
  Edit3,
  Eye,
  ShieldCheck,
  UserCheck,
  Award,
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { OfficerItem, CLPI_ROLES } from '../types';

interface Props {
  officers: OfficerItem[];
  loading: boolean;
  onOpenModal: (mode: 'add' | 'edit' | 'view', data?: OfficerItem | null) => void;
}

export default function PersonnelTableSection({ officers, loading, onOpenModal }: Props) {
  const { isAdmin, canCreate, canEdit } = usePermissions('mo-hinh-clb');
  const allowManage = isAdmin || canCreate || canEdit;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnit, setFilterUnit] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const unitOptions = useMemo(() => {
    const set = new Set<string>();
    officers.forEach((o) => {
      if (o.unit && o.unit.trim()) set.add(o.unit.trim());
    });
    return Array.from(set).sort();
  }, [officers]);

  const stats = useMemo(() => {
    const total = officers.length;
    const admins = officers.filter((o) => o.role === 'CLPI Admin').length;
    const reviewers = officers.filter((o) =>
      ['Reviewer', 'Unit Manager'].includes(o.role)
    ).length;
    const members = officers.filter((o) => o.role === 'Officer').length;
    return { total, admins, reviewers, members };
  }, [officers]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return officers.filter((o) => {
      const matchSearch =
        !q ||
        (o.name || '').toLowerCase().includes(q) ||
        (o.code || '').toLowerCase().includes(q) ||
        (o.position || '').toLowerCase().includes(q) ||
        (o.unit || '').toLowerCase().includes(q);
      const matchUnit = !filterUnit || o.unit === filterUnit;
      const matchRole = !filterRole || o.role === filterRole;
      return matchSearch && matchUnit && matchRole;
    });
  }, [officers, searchTerm, filterUnit, filterRole]);

  const getRoleBadge = (role: string) => {
    const found = CLPI_ROLES.find((r) => r.value === role) || CLPI_ROLES[0];
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border ${found.badgeStyle}`}
      >
        {role}
      </span>
    );
  };

  return (
    <section className="space-y-6">
      {/* HEADER ĐỒNG BỘ PHONG CÁCH ĐOÀN KHOA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#0054a5] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0054a5] rounded-2xl text-white shadow-md shadow-blue-500/20 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-[#0054a5] tracking-tight">
              Nhân sự & Phân quyền CLPI
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Quản lý danh sách cán bộ, chức vụ kiêm nhiệm, đơn vị trực thuộc và vai trò thẩm định
            </p>
          </div>
        </div>

        {allowManage && (
          <button
            type="button"
            onClick={() => onOpenModal('add')}
            className="bg-[#0054a5] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-95 border-none cursor-pointer shrink-0"
          >
            <PlusCircle size={16} /> <span>Thêm cán bộ</span>
          </button>
        )}
      </div>

      {/* 4 THẺ KPI NHANH */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Tổng nhân sự</p>
            <p className="text-2xl font-black text-slate-800 mt-1">
              {String(stats.total).padStart(2, '0')}
            </p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">BTV / CLPI Admin</p>
            <p className="text-2xl font-black text-[#0054a5] mt-1">
              {String(stats.admins).padStart(2, '0')}
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-[#0054a5] rounded-xl">
            <ShieldCheck size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Reviewer / Trưởng ĐV</p>
            <p className="text-2xl font-black text-amber-600 mt-1">
              {String(stats.reviewers).padStart(2, '0')}
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <UserCheck size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400">Cán bộ đánh giá</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {String(stats.members).padStart(2, '0')}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Award size={20} />
          </div>
        </div>
      </div>

      {/* BỘ LỌC TÌM KIẾM */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo họ tên, MSSV, chức vụ, chi đoàn..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0054a5]"
          />
        </div>

        <div className="relative">
          <Filter
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <select
            value={filterUnit}
            onChange={(e) => setFilterUnit(e.target.value)}
            className="w-full pl-10 pr-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0054a5] cursor-pointer"
          >
            <option value="">Tất cả đơn vị / Chi đoàn</option>
            {unitOptions.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0054a5] cursor-pointer"
          >
            <option value="">Tất cả vai trò CLPI</option>
            {CLPI_ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.value}
              </option>
            ))}
          </select>

          {(searchTerm || filterUnit || filterRole) && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilterUnit('');
                setFilterRole('');
              }}
              title="Đặt lại bộ lọc"
              className="p-2.5 bg-white text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 cursor-pointer shrink-0"
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>
      </div>

      {/* BẢNG DANH SÁCH CÁN BỘ */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[820px]">
            <thead className="bg-[#0054a5] text-white font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-4 px-4 w-12 text-center">STT</th>
                <th className="py-4 px-4 w-32">MÃ CB / MSSV</th>
                <th className="py-4 px-4">HỌ VÀ TÊN</th>
                <th className="py-4 px-4">CHỨC VỤ</th>
                <th className="py-4 px-4">ĐƠN VỊ TRỰC THUỘC</th>
                <th className="py-4 px-4 text-center">VAI TRÒ CLPI</th>
                <th className="py-4 px-4 w-28 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                [1, 2, 3, 4].map((n) => (
                  <tr key={n}>
                    <td colSpan={7} className="p-4">
                      <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((o, idx) => {
                  const initials = (o.name || 'CB')
                    .split(' ')
                    .slice(-2)
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={o.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                        {o.code || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-[#0054a5] font-black text-[11px] flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <span className="font-extrabold text-slate-900">{o.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">
                        {o.position || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">
                        {o.unit || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">{getRoleBadge(o.role)}</td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenModal('view', o)}
                            title="Xem chi tiết"
                            className="p-2 text-[#0054a5] hover:bg-blue-100 rounded-xl border-none bg-transparent cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>

                          {allowManage && (
                            <button
                              type="button"
                              onClick={() => onOpenModal('edit', o)}
                              title="Chỉnh sửa vai trò & thông tin"
                              className="p-2 text-amber-600 hover:bg-amber-100 rounded-xl border-none bg-transparent cursor-pointer"
                            >
                              <Edit3 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400 italic font-bold">
                    {officers.length === 0
                      ? 'Chưa có dữ liệu cán bộ trong hệ thống.'
                      : 'Không tìm thấy cán bộ phù hợp với điều kiện lọc.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
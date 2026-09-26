'use client';

import { useState, useEffect, useMemo } from "react";
import { 
  Plus, Edit, Trash2, Search, RotateCcw, ShieldCheck, ChevronDown, 
  User, KeyRound, GraduationCap, Building2 
} from "lucide-react";
import AccountsModal from "./AccountsModal";

const BADGE_COLOR_PALETTES = [
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-purple-50 text-purple-700 border-purple-200',
  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'bg-rose-50 text-rose-700 border-rose-200',
  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'bg-cyan-50 text-cyan-700 border-cyan-200',
  'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  'bg-teal-50 text-teal-700 border-teal-200',
  'bg-orange-50 text-orange-700 border-orange-200',
  'bg-pink-50 text-pink-700 border-pink-200',
  'bg-amber-50 text-amber-700 border-amber-200',
];

const extractIntake = (cls: string, sid: string): string => {
  const match = String(cls || '').match(/(?:19|20)\d{2}/);
  if (match) return `K${match[0]}`;
  const s = String(sid || '').trim();
  if (s.length >= 2) {
    const prefix = parseInt(s.substring(0, 2), 10);
    if (!isNaN(prefix) && prefix >= 15 && prefix <= 35) {
      return `K20${prefix}`;
    }
  }
  return '';
};

// 🟢 Trích xuất năm khóa dạng số để sắp xếp (vd: K2023 -> 2023)
const getNumericIntake = (acc: any): number => {
  const intakeStr = acc.resolvedIntake || '';
  const match = intakeStr.match(/\d{4}/);
  if (match) {
    return parseInt(match[0], 10);
  }
  const clsMatch = String(acc.resolvedClass || '').match(/(?:19|20)\d{2}/);
  if (clsMatch) {
    return parseInt(clsMatch[0], 10);
  }
  const sid = String(acc.resolvedSid || '').trim();
  if (sid.length >= 2) {
    const prefix = parseInt(sid.substring(0, 2), 10);
    if (!isNaN(prefix) && prefix >= 15 && prefix <= 35) {
      return 2000 + prefix;
    }
  }
  return 9999; // Tài khoản không có khóa (như admin) sẽ nằm ở cuối trong nhóm
};

export default function AccountsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("");
  const [selectedIntakeFilter, setSelectedIntakeFilter] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("");

  const [accounts, setAccounts] = useState<any[]>([]);
  const [nhanSuList, setNhanSuList] = useState<any[]>([]);
  const [groupsList, setGroupsList] = useState<any[]>([]);
  const [modal, setModal] = useState<any>({ open: false, mode: 'view', data: null });

  const fetchData = async () => {
    try {
      const [accRes, nsRes, groupRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/nhan-su`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions`)
      ]);
      const accData = await accRes.json();
      const nsData = await nsRes.json();
      const groupData = await groupRes.json();

      const sortedGroups = Array.isArray(groupData) ? groupData : [];
      sortedGroups.sort((a: any, b: any) => (a.order ?? 99) - (b.order ?? 99));

      setAccounts(Array.isArray(accData) ? accData : []);
      setNhanSuList(Array.isArray(nsData) ? nsData : []);
      setGroupsList(sortedGroups);
    } catch (error) {
      setAccounts([]);
      setNhanSuList([]);
      setGroupsList([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Kết nối thông tin MSSV, Lớp, Khóa từ danh sách nhân sự sang tài khoản
  const enrichedAccounts = useMemo(() => {
    const nsMap = new Map<string, any>();
    nhanSuList.forEach(ns => {
      const id = String(ns._id || ns.id || '').trim();
      const sid = String(ns.student_id || ns.mssv || '').trim().toLowerCase();
      const email = String(ns.email || ns.personal_email || '').trim().toLowerCase();
      if (id) nsMap.set(id, ns);
      if (sid) nsMap.set(sid, ns);
      if (email) nsMap.set(email, ns);
    });

    return accounts.map(acc => {
      const accId = String(acc.user_id || acc.nhan_su_id || acc.personnel_id || acc._id || '').trim();
      const accSid = String(acc.student_id || acc.mssv || '').trim().toLowerCase();
      const accUname = String(acc.username || '').trim().toLowerCase();
      const accEmail = String(acc.email || '').trim().toLowerCase();

      const matchedNs = nsMap.get(accId) || nsMap.get(accSid) || nsMap.get(accUname) || nsMap.get(accEmail);

      const resolvedSid = String(
        acc.student_id || acc.mssv || matchedNs?.student_id || matchedNs?.mssv || (accUname.match(/^\d{7,10}$/) ? accUname : '')
      ).trim();
      const resolvedClass = String(acc.class || matchedNs?.class || matchedNs?.chi_doan || '').trim();
      const resolvedIntake = extractIntake(resolvedClass, resolvedSid);

      return {
        ...acc,
        resolvedSid,
        resolvedClass,
        resolvedIntake,
      };
    });
  }, [accounts, nhanSuList]);

  // Danh sách các Khóa xuất hiện trong dữ liệu
  const availableIntakes = useMemo(() => {
    const intakes = new Set<string>(["K2021", "K2022", "K2023", "K2024", "K2025", "K2026"]);
    enrichedAccounts.forEach(acc => {
      if (acc.resolvedIntake) intakes.add(acc.resolvedIntake);
    });
    return Array.from(intakes).sort();
  }, [enrichedAccounts]);

  // Danh sách các Lớp (tự động thu hẹp theo Khóa nếu đang chọn Khóa)
  const availableClasses = useMemo(() => {
    return Array.from(
      new Set(
        enrichedAccounts
          .filter(acc => !selectedIntakeFilter || acc.resolvedIntake === selectedIntakeFilter)
          .map(acc => acc.resolvedClass)
          .filter(Boolean)
      )
    ).sort((a, b) => String(a).localeCompare(String(b), 'vi', { numeric: true }));
  }, [enrichedAccounts, selectedIntakeFilter]);

  const getGroupOrder = (groupId: any) => {
    if (!groupId) return 9999;
    const group = groupsList.find(g => String(g._id || g.id) === String(groupId));
    return group ? (group.order ?? 999) : 9999;
  };

  const getGroupBadgeStyle = (groupId: any, groupName: string) => {
    if (!groupId && !groupName) return 'bg-gray-50 text-gray-500 border-gray-200';
    
    const groupIndex = groupsList.findIndex(
      g => String(g._id || g.id) === String(groupId) || g.name === groupName
    );

    if (groupIndex !== -1) {
      return BADGE_COLOR_PALETTES[groupIndex % BADGE_COLOR_PALETTES.length];
    }

    let hash = 0;
    const str = groupName || String(groupId);
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return BADGE_COLOR_PALETTES[Math.abs(hash) % BADGE_COLOR_PALETTES.length];
  };

  // Áp dụng bộ lọc 4 tiêu chí
  const filteredAccounts = enrichedAccounts.filter(acc => {
    const s = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !s ||
      (acc.displayName || "").toLowerCase().includes(s) ||
      (acc.username || "").toLowerCase().includes(s) ||
      (acc.resolvedSid || "").toLowerCase().includes(s) ||
      (acc.resolvedClass || "").toLowerCase().includes(s);

    const accGroupId = acc.group_id || acc.groupId || acc.permission_id || "";

    let matchesGroup = true;
    if (selectedGroupFilter === "UNASSIGNED") {
      matchesGroup = !accGroupId;
    } else if (selectedGroupFilter !== "") {
      matchesGroup = String(accGroupId) === String(selectedGroupFilter);
    }

    const matchesIntake = !selectedIntakeFilter || acc.resolvedIntake === selectedIntakeFilter;
    const matchesClass = !selectedClassFilter || acc.resolvedClass === selectedClassFilter;

    return matchesSearch && matchesGroup && matchesIntake && matchesClass;
  });

  // 🟢 SẮP XẾP: NHÓM -> KHÓA TĂNG DẦN -> MSSV TĂNG DẦN -> TÊN
  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    // 1. Thứ tự nhóm quyền trước
    const groupOrderA = getGroupOrder(a.group_id || a.groupId || a.permission_id);
    const groupOrderB = getGroupOrder(b.group_id || b.groupId || b.permission_id);

    if (groupOrderA !== groupOrderB) {
      return groupOrderA - groupOrderB;
    }
    
    // 2. Trong mỗi nhóm: Khóa tăng dần (K2021 -> K2022 -> K2023 -> K2024...)
    const intakeA = getNumericIntake(a);
    const intakeB = getNumericIntake(b);
    if (intakeA !== intakeB) {
      return intakeA - intakeB;
    }

    // 3. Trong cùng khóa: MSSV tăng dần
    const mssvA = a.resolvedSid || '';
    const mssvB = b.resolvedSid || '';
    if (mssvA || mssvB) {
      if (!mssvA) return 1;
      if (!mssvB) return -1;
      const mssvCompare = mssvA.localeCompare(mssvB, undefined, { numeric: true });
      if (mssvCompare !== 0) return mssvCompare;
    }

    // 4. Nếu MSSV giống nhau hoặc không có MSSV: Xếp theo tên hiển thị tiếng Việt
    return (a.displayName || "").localeCompare(b.displayName || "", 'vi');
  });

  const handleDelete = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/${id}`, {
      method: 'DELETE',
    });
    fetchData();
  };

  const handleSave = async (payload: any) => {
    const isAdd = modal.mode === 'add';
    const url = isAdd
      ? `${process.env.NEXT_PUBLIC_API_URL}/accounts`
      : `${process.env.NEXT_PUBLIC_API_URL}/accounts/${payload._id}`;

    const res = await fetch(url, {
      method: isAdd ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lưu thông tin thất bại!');
    }

    setModal({ open: false, mode: 'view', data: null });
    fetchData();
  };

  const getGroupName = (groupId: any) => {
    if (!groupId) return null;
    const group = groupsList.find(g => String(g._id || g.id) === String(groupId));
    return group ? group.name : null;
  };

  const renderPasswordCell = (password: string) => {
    const isHashed = password?.startsWith('$2b$') || password?.startsWith('$2a$');
    if (isHashed) {
      return (
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-mono text-xs text-slate-400">••••••••</span>
          <span className="inline-flex items-center bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
            Đã mã hóa
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center gap-1.5">
        <span className="font-mono text-xs font-bold text-slate-700">{password || '123456'}</span>
        <span className="inline-flex items-center bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200 shrink-0">
          Mặc định
        </span>
      </div>
    );
  };

  const isFiltering = searchTerm !== "" || selectedGroupFilter !== "" || selectedIntakeFilter !== "" || selectedClassFilter !== "";

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedGroupFilter("");
    setSelectedIntakeFilter("");
    setSelectedClassFilter("");
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 text-black">
      {/* THANH TÌM KIẾM & BỘ LỌC ĐA NĂNG */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-center gap-3">
        {/* Tìm kiếm */}
        <div className="relative flex-1 w-full group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0054a5] transition-colors" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, MSSV, tên đăng nhập, lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white rounded-xl text-xs sm:text-sm border border-slate-200 outline-none focus:border-[#0054a5] focus:ring-2 ring-blue-100 transition-all font-bold"
          />
        </div>

        {/* Cụm 3 bộ lọc: Khóa - Lớp - Nhóm quyền */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full lg:w-auto">
          {/* 1. Lọc theo Khóa */}
          <div className="relative w-full sm:w-36">
            <select
              value={selectedIntakeFilter}
              onChange={(e) => {
                setSelectedIntakeFilter(e.target.value);
                setSelectedClassFilter("");
              }}
              className="w-full p-2.5 pl-8 pr-7 bg-white rounded-xl text-xs font-bold border border-slate-200 outline-none focus:border-[#0054a5] focus:ring-2 ring-blue-100 transition-all appearance-none cursor-pointer text-slate-700 shadow-2xs"
            >
              <option value="">Tất cả Khóa</option>
              {availableIntakes.map(intake => (
                <option key={intake} value={intake}>{intake}</option>
              ))}
            </select>
            <GraduationCap size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#0054a5] pointer-events-none" />
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* 2. Lọc theo Lớp */}
          <div className="relative w-full sm:w-44">
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full p-2.5 pl-8 pr-7 bg-white rounded-xl text-xs font-bold border border-slate-200 outline-none focus:border-[#0054a5] focus:ring-2 ring-blue-100 transition-all appearance-none cursor-pointer text-slate-700 truncate shadow-2xs"
            >
              <option value="">Tất cả Lớp</option>
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            <Building2 size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#0054a5] pointer-events-none" />
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* 3. Lọc theo Nhóm quyền */}
          <div className="relative w-full sm:w-52">
            <select
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
              className="w-full p-2.5 pl-8 pr-7 bg-white rounded-xl text-xs font-bold border border-slate-200 outline-none focus:border-[#0054a5] focus:ring-2 ring-blue-100 transition-all appearance-none cursor-pointer text-slate-700 truncate shadow-2xs"
            >
              <option value="">Tất cả nhóm quyền</option>
              <option value="UNASSIGNED">Chưa phân nhóm</option>
              {groupsList.map((g: any) => (
                <option key={g._id || g.id} value={g._id || g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <ShieldCheck size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#0054a5] pointer-events-none" />
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Nút đặt lại bộ lọc */}
        {isFiltering && (
          <button
            onClick={resetFilters}
            className="p-2.5 bg-white text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-all border-none outline-none cursor-pointer shrink-0 shadow-2xs"
            title="Đặt lại bộ lọc"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>

      {/* HEADER TỔNG SỐ VÀ NÚT CẤP TÀI KHOẢN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-bold text-gray-500 uppercase">
          Tổng số: <strong className="text-[#0054a5]">{sortedAccounts.length}</strong> tài khoản
        </span>
        <button
          onClick={() => setModal({ open: true, mode: 'add', data: null })}
          className="flex items-center justify-center gap-2 bg-[#0054a5] text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 text-xs uppercase tracking-wider border-none outline-none cursor-pointer w-full sm:w-auto"
        >
          <Plus size={16} /> <span>Cấp tài khoản mới</span>
        </button>
      </div>

      {/* GIAO DIỆN BẢNG DESKTOP */}
      <div className="hidden md:block overflow-hidden rounded-3xl border border-slate-200 shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse min-w-[760px]">
            <thead className="bg-[#0054a5] text-white font-bold text-xs uppercase tracking-wider text-center">
              <tr>
                <th className="px-4 py-4 w-14 text-center">STT</th>
                <th className="px-5 py-4 text-left">Người sở hữu</th>
                <th className="px-5 py-4 text-left">Tên đăng nhập</th>
                <th className="px-5 py-4 text-center">Nhóm quyền</th>
                <th className="px-5 py-4 text-center">Mật khẩu</th>
                <th className="px-4 py-4 text-center w-36">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedAccounts.map((item, index) => {
                const rawGroupId = item.group_id || item.groupId || item.permission_id;
                const groupName = getGroupName(rawGroupId);
                return (
                  <tr key={item._id || index} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-4 py-3.5 text-center font-bold text-slate-400 group-hover:text-[#0054a5] transition-colors text-xs">
                      {index + 1}
                    </td>
                    <td className="px-5 py-3.5 text-left">
                      <div className="font-extrabold text-slate-800 text-sm">
                        {item.displayName || "Chưa đặt tên"}
                      </div>
                      {(item.resolvedSid || item.resolvedClass) && (
                        <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
                          {item.resolvedSid ? `MSSV: ${item.resolvedSid}` : ''}
                          {item.resolvedClass ? ` — Lớp: ${item.resolvedClass}` : ''}
                          {item.resolvedIntake ? ` — ${item.resolvedIntake}` : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-[#0054a5] text-xs font-mono">
                      {item.username}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {groupName ? (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getGroupBadgeStyle(rawGroupId, groupName)}`}>
                          <ShieldCheck size={13} /> {groupName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs font-medium">Chưa phân nhóm</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">{renderPasswordCell(item.password)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => setModal({ open: true, mode: 'edit', data: item })} 
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all border-none bg-transparent cursor-pointer" 
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => setModal({ open: true, mode: 'delete', data: item })} 
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all border-none bg-transparent cursor-pointer" 
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sortedAccounts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center italic text-slate-400 font-bold">
                    Không có tài khoản nào phù hợp với bộ lọc...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GIAO DIỆN MOBILE */}
      <div className="grid grid-cols-1 gap-3.5 md:hidden">
        {sortedAccounts.length > 0 ? (
          sortedAccounts.map((item, index) => {
            const rawGroupId = item.group_id || item.groupId || item.permission_id;
            const groupName = getGroupName(rawGroupId);

            return (
              <div 
                key={item._id || index} 
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#0054a5] font-black text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                        {item.displayName || "Chưa đặt tên"}
                      </h4>
                      {(item.resolvedSid || item.resolvedClass) && (
                        <div className="text-[11px] text-slate-500 font-medium">
                          {item.resolvedSid ? `MSSV: ${item.resolvedSid}` : ''}
                          {item.resolvedClass ? ` — ${item.resolvedClass}` : ''}
                          {item.resolvedIntake ? ` — ${item.resolvedIntake}` : ''}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-[#0054a5] font-bold font-mono mt-0.5">
                        <User size={12} className="text-slate-400" />
                        <span>{item.username}</span>
                      </div>
                    </div>
                  </div>

                  {groupName ? (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getGroupBadgeStyle(rawGroupId, groupName)} shrink-0`}>
                      <ShieldCheck size={11} /> {groupName}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-[10px] font-medium bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                      Chưa phân nhóm
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <KeyRound size={13} className="text-[#0054a5]" /> Mật khẩu:
                  </span>
                  <div>{renderPasswordCell(item.password)}</div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <button 
                    onClick={() => setModal({ open: true, mode: 'edit', data: item })} 
                    className="flex-1 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border-none cursor-pointer transition-colors"
                  >
                    <Edit size={14} /> <span>Chỉnh sửa</span>
                  </button>
                  <button 
                    onClick={() => setModal({ open: true, mode: 'delete', data: item })} 
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs flex items-center justify-center border-none cursor-pointer transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs font-bold text-slate-400 italic bg-white rounded-2xl border border-slate-200">
            Không có tài khoản nào phù hợp với bộ lọc...
          </div>
        )}
      </div>

      {modal.open && (
        <AccountsModal
          mode={modal.mode}
          data={modal.data}
          onClose={() => setModal({ ...modal, open: false })}
          onConfirmDelete={handleDelete}
          onSave={handleSave}
          nhanSuList={nhanSuList}
          groupsList={groupsList}
          accountsList={accounts}
        />
      )}
    </div>
  );
}
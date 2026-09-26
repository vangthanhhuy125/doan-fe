'use client';

import { useState, useRef, useEffect, useMemo } from "react";
import { 
  X, User, Trash2, AlertCircle, PlusCircle, Eye, FileEdit, Key, 
  UserCheck, ChevronDown, Search, RotateCcw, ShieldCheck, AlertTriangle,
  GraduationCap, Building2, Check, UserPlus
} from "lucide-react";

interface Props {
  mode: 'view' | 'add' | 'edit' | 'delete';
  data?: any;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
  onSave: (payload: any) => Promise<boolean | void>;
  nhanSuList?: any[];
  groupsList?: any[];
  accountsList?: any[];
}

const POPULAR_INTAKES = ["2021", "2022", "2023", "2024", "2025", "2026"];

// 🟢 Hàm chuẩn hóa tiếng Việt không dấu
const removeVietnameseTones = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim();
};

// 🟢 Sinh tên đăng nhập: [Tên] + [Chữ đầu họ và tên lót] + @cnpm (vd: Bùi Hữu Duy -> duybh@cnpm)
const generateUsernameFromName = (fullName: string): string => {
  if (!fullName) return '';
  const clean = removeVietnameseTones(fullName).toLowerCase();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return `${words[0]}@cnpm`;

  const firstName = words[words.length - 1];
  const initials = words.slice(0, -1).map(w => w[0]).join('');
  return `${firstName}${initials}@cnpm`;
};

export default function AccountsModal({ 
  mode, 
  data, 
  onClose, 
  onConfirmDelete, 
  onSave, 
  nhanSuList = [], 
  groupsList = [],
  accountsList = []
}: Props) {
  const isView = mode === 'view';
  const isAdd = mode === 'add';
  const formRef = useRef<HTMLFormElement>(null);

  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [searchNS, setSearchNS] = useState("");
  const [filterIntake, setFilterIntake] = useState("");
  const [filterClass, setFilterClass] = useState("");

  const [selectedNS, setSelectedNS] = useState(data?.displayName || "");
  const [selectedUserId, setSelectedUserId] = useState(data?.user_id || "");
  const [selectedPersonDetail, setSelectedPersonDetail] = useState<any>(null);
  const [selectedGroupId, setSelectedGroupId] = useState(data?.group_id || data?.groupId || data?.permission_id || "");
  const [username, setUsername] = useState(data?.username || "");
  const [password, setPassword] = useState(data?.password || (isAdd ? "123456" : ""));
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentAccounts, setCurrentAccounts] = useState<any[]>(accountsList);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPassword(data?.password || (isAdd ? "123456" : ""));
    setSelectedNS(data?.displayName || "");
    setSelectedUserId(data?.user_id || "");
    setUsername(data?.username || "");
    setSelectedGroupId(data?.group_id || data?.groupId || data?.permission_id || "");
    setErrorMessage("");
  }, [data, isAdd]);

  useEffect(() => {
    if (accountsList && accountsList.length > 0) {
      setCurrentAccounts(accountsList);
    } else {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
        .then(res => res.json())
        .then(resData => {
          if (Array.isArray(resData)) setCurrentAccounts(resData);
        })
        .catch(() => {});
    }
  }, [accountsList]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isHashed = password?.startsWith('$2b$') || password?.startsWith('$2a$');
  const isOwnerEditable = isAdd;

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

  const unassignedPersonnel = useMemo(() => {
    const assignedKeys = new Set<string>();

    currentAccounts.forEach((acc: any) => {
      if (acc.user_id) assignedKeys.add(String(acc.user_id).trim().toLowerCase());
      if (acc.nhan_su_id) assignedKeys.add(String(acc.nhan_su_id).trim().toLowerCase());
      if (acc.personnel_id) assignedKeys.add(String(acc.personnel_id).trim().toLowerCase());
      if (acc._id) assignedKeys.add(String(acc._id).trim().toLowerCase());
      if (acc.id) assignedKeys.add(String(acc.id).trim().toLowerCase());

      const sid = String(acc.student_id || acc.mssv || '').trim().toLowerCase();
      if (sid) assignedKeys.add(sid);

      const uName = String(acc.username || '').trim().toLowerCase();
      if (uName) assignedKeys.add(uName);

      const email = String(acc.email || '').trim().toLowerCase();
      if (email) assignedKeys.add(email);
    });

    return nhanSuList
      .filter((ns: any) => {
        if (!isAdd && String(ns._id || ns.id) === String(selectedUserId)) {
          return true;
        }

        const nsId = String(ns._id || ns.id || '').trim().toLowerCase();
        const nsSid = String(ns.student_id || ns.mssv || '').trim().toLowerCase();
        const nsEmail = String(ns.email || ns.personal_email || '').trim().toLowerCase();

        if (nsId && assignedKeys.has(nsId)) return false;
        if (nsSid && assignedKeys.has(nsSid)) return false;
        if (nsEmail && assignedKeys.has(nsEmail)) return false;

        return true;
      })
      .map((item: any) => {
        const sid = String(item.student_id || item.mssv || '').trim();
        const cls = String(item.class || item.chi_doan || '').trim();
        const name = String(item.full_name || item.name || '').trim();
        return {
          ...item,
          student_id: sid,
          class: cls,
          full_name: name,
          intake: extractIntake(cls, sid)
        };
      });
  }, [nhanSuList, currentAccounts, isAdd, selectedUserId]);

  const availableClasses = useMemo(() => {
    return Array.from(
      new Set(
        unassignedPersonnel
          .filter(ns => !filterIntake || ns.intake === filterIntake)
          .map(ns => ns.class)
          .filter(Boolean)
      )
    ).sort((a, b) => String(a).localeCompare(String(b), 'vi', { numeric: true }));
  }, [unassignedPersonnel, filterIntake]);

  const filteredNS = useMemo(() => {
    return unassignedPersonnel.filter((ns: any) => {
      const name = (ns.full_name || ns.name || "").toLowerCase();
      const mssv = (ns.student_id || ns.mssv || "").toLowerCase();
      const cls = (ns.class || "").toLowerCase();
      const search = searchNS.toLowerCase().trim();

      const matchesSearch = !search || name.includes(search) || mssv.includes(search) || cls.includes(search);
      const matchesIntake = !filterIntake || ns.intake === filterIntake;
      const matchesClass = !filterClass || ns.class === filterClass;

      return matchesSearch && matchesIntake && matchesClass;
    });
  }, [unassignedPersonnel, searchNS, filterIntake, filterClass]);

  const handleSelectPerson = (ns: any) => {
    const fullName = ns.full_name || ns.name || "";
    setSelectedNS(fullName);
    setSelectedUserId(ns._id || ns.id);
    setSelectedPersonDetail(ns);

    if (isAdd && fullName) {
      setUsername(generateUsernameFromName(fullName));
    }
    setIsOpenDropdown(false);
    setSearchNS("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isView || isSubmitting) return;

    setErrorMessage("");

    if (!selectedNS || !selectedUserId) {
      setErrorMessage("Vui lòng chọn nhân sự sở hữu tài khoản!");
      return;
    }

    // 🟢 BẮT BUỘC CHỌN NHÓM PHÂN QUYỀN
    if (!selectedGroupId) {
      setErrorMessage("Vui lòng chọn nhóm người dùng (phân quyền) cho tài khoản!");
      return;
    }

    if (!username.trim()) {
      setErrorMessage("Vui lòng nhập tên đăng nhập!");
      return;
    }

    setIsSubmitting(true);
    const sid = selectedPersonDetail?.student_id || data?.student_id || "";
    const cls = selectedPersonDetail?.class || data?.class || "";

    const payload = {
      ...data,
      user_id: selectedUserId,
      nhan_su_id: selectedUserId,
      personnel_id: selectedUserId,
      displayName: selectedNS,
      full_name: selectedNS,
      student_id: sid,
      class: cls,
      email: sid ? `${sid}@gm.uit.edu.vn` : (selectedPersonDetail?.email || data?.email || ""),
      username: username.trim(),
      password: password || "123456",
      group_id: selectedGroupId,
      groupId: selectedGroupId,
      permission_id: selectedGroupId
    };

    try {
      await onSave(payload);
    } catch (err: any) {
      setErrorMessage(err.message || "Có lỗi xảy ra khi lưu tài khoản!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === 'delete') {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-black">
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-red-100 animate-in zoom-in duration-300">
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full mx-auto flex items-center justify-center shadow-inner">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Xác nhận xóa?</h3>
              <p className="text-sm text-slate-500 leading-relaxed px-4">
                Bạn có chắc chắn muốn thu hồi quyền truy cập của <br/>
                <span className="font-bold text-red-600">"{data?.displayName}"</span>?
              </p>
            </div>
          </div>
          <div className="flex p-4 gap-3 bg-slate-50">
            <button onClick={onClose} className="flex-1 py-3 px-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all uppercase text-[11px] tracking-widest border-none outline-none cursor-pointer">Hủy</button>
            <button onClick={() => { onConfirmDelete(data._id); onClose(); }} className="flex-1 py-3 px-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg hover:bg-red-700 transition-all uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 border-none outline-none cursor-pointer">Xóa</button>
          </div>
        </div>
      </div>
    );
  }

  const isEditMode = !isView && !isAdd;
  const headerBg = isEditMode ? "bg-[#f59e0b]" : "bg-[#0054a5]";
  const btnBg = isEditMode ? "bg-[#f59e0b] hover:bg-[#d97706]" : "bg-[#0054a5] hover:bg-[#004080]";
  const ringColor = isEditMode ? "focus:border-[#f59e0b]" : "focus:border-[#0054a5]";
  const labelColor = isView ? "text-slate-400" : isEditMode ? "text-[#f59e0b]" : "text-[#0054a5]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-4 animate-in zoom-in duration-200 text-black">
      <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-visible border border-white/20">
        <div className={`${headerBg} p-6 rounded-t-[2rem] flex items-center justify-between text-white transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {isView ? <Eye size={20} /> : isAdd ? <PlusCircle size={20} /> : <FileEdit size={20} />}
            </div>
            <h3 className="font-bold uppercase tracking-widest text-sm">
              {isView ? 'Chi tiết tài khoản' : isAdd ? 'Cấp tài khoản mới' : 'Chỉnh sửa tài khoản'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white cursor-pointer"><X size={20} /></button>
        </div>

        <form ref={formRef} className="p-6 sm:p-8 space-y-5 overflow-visible" onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-bold animate-in fade-in">
              <AlertTriangle size={18} className="shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* KHỐI CHỌN NHÂN SỰ VÀ BỘ LỌC 3-TRONG-1 */}
          <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200 relative overflow-visible" ref={dropdownRef}>
            <div className="flex items-center justify-between">
              <label className={`text-[10px] font-bold uppercase ${labelColor} flex items-center gap-1.5`}>
                <User size={14} /> Người sở hữu tài khoản <span className="text-red-500 font-bold">*</span>
              </label>
              {isAdd && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {unassignedPersonnel.length} người chưa có tài khoản
                </span>
              )}
            </div>

            {/* 🟢 3 BỘ LỌC CÙNG 1 HÀNG */}
            {isAdd && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {/* 1. Lọc theo Khóa */}
                <div className="relative">
                  <select
                    value={filterIntake}
                    onChange={(e) => {
                      setFilterIntake(e.target.value);
                      setFilterClass('');
                    }}
                    className="w-full p-2.5 pl-8 pr-7 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#0054a5] cursor-pointer appearance-none shadow-2xs"
                  >
                    <option value="">-- Tất cả Khóa --</option>
                    {POPULAR_INTAKES.map(intake => (
                      <option key={intake} value={`K${intake}`}>Khóa K{intake}</option>
                    ))}
                  </select>
                  <GraduationCap size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#0054a5] pointer-events-none" />
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* 2. Lọc theo Lớp / Chi đoàn */}
                <div className="relative">
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="w-full p-2.5 pl-8 pr-7 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#0054a5] cursor-pointer appearance-none truncate shadow-2xs"
                  >
                    <option value="">-- Tất cả Lớp --</option>
                    {availableClasses.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                  <Building2 size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#0054a5] pointer-events-none" />
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* 3. Ô tìm kiếm tên / MSSV */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Gõ tên hoặc MSSV..."
                    value={searchNS}
                    onChange={(e) => setSearchNS(e.target.value)}
                    className="w-full py-2.5 pl-8 pr-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0054a5] shadow-2xs"
                  />
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            )}

            {/* Ô BẤM CHỌN NHÂN SỰ */}
            <div className="relative pt-1 overflow-visible">
              <div
                onClick={() => isOwnerEditable && setIsOpenDropdown(!isOpenDropdown)}
                className={`w-full p-3.5 pl-4 pr-10 bg-white rounded-2xl border transition-all flex items-center justify-between relative shadow-2xs ${
                  isOwnerEditable ? 'cursor-pointer hover:border-slate-300' : 'cursor-not-allowed opacity-75 bg-gray-100'
                } ${isOpenDropdown ? 'border-[#0054a5] ring-2 ring-blue-100' : 'border-slate-300'}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <UserCheck size={18} className="text-[#0054a5] shrink-0" />
                  {selectedNS ? (
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{selectedNS}</p>
                      {selectedPersonDetail && (
                        <p className="text-[11px] text-[#0054a5] font-semibold truncate mt-0.5">
                          {selectedPersonDetail.student_id ? `MSSV: ${selectedPersonDetail.student_id}` : 'Chưa có MSSV'}
                          {selectedPersonDetail.class ? ` — Lớp: ${selectedPersonDetail.class}` : ''}
                          {selectedPersonDetail.intake ? ` — ${selectedPersonDetail.intake}` : ''}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">
                      {`Chọn nhân sự liên kết (${filteredNS.length} người phù hợp)...`}
                    </span>
                  )}
                </div>
                {isOwnerEditable && (
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpenDropdown ? 'rotate-180' : ''}`} />
                )}
              </div>

              {/* DROPDOWN KẾT QUẢ DANH SÁCH NHÂN SỰ */}
              {isOpenDropdown && isOwnerEditable && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[150] p-2 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                  {filteredNS.length > 0 ? (
                    filteredNS.map((ns: any) => {
                      const isSelected = selectedUserId === (ns._id || ns.id);
                      return (
                        <div
                          key={ns._id || ns.id}
                          onClick={() => handleSelectPerson(ns)}
                          className={`p-2.5 rounded-xl hover:bg-blue-50/80 cursor-pointer flex items-center justify-between transition-colors ${
                            isSelected ? 'bg-blue-50 text-[#0054a5]' : ''
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {ns.full_name || ns.name}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                              {ns.student_id ? `MSSV: ${ns.student_id}` : 'Chưa có MSSV'}
                              {ns.class ? ` — Lớp: ${ns.class}` : ''}
                              {ns.intake ? ` — Khóa: ${ns.intake}` : ''}
                            </p>
                          </div>
                          {isSelected ? (
                            <Check size={16} className="text-[#0054a5] shrink-0" />
                          ) : (
                            <UserPlus size={15} className="text-slate-400 shrink-0" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 italic">
                      Không tìm thấy nhân sự phù hợp chưa có tài khoản...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* NHÓM NGƯỜI DÙNG (PHÂN QUYỀN) - BẮT BUỘC CHỌN */}
          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor} flex items-center gap-1`}>
              Nhóm người dùng (Phân quyền) <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="relative">
              <select
                disabled={isView}
                required
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className={`w-full p-4 pl-12 pr-10 bg-gray-50 rounded-2xl border transition-all outline-none text-sm appearance-none cursor-pointer ${
                  !selectedGroupId ? 'border-dashed border-amber-300 bg-amber-50/30' : 'border-transparent focus:bg-white'
                } ${ringColor} disabled:opacity-70 font-bold ${!selectedGroupId ? 'text-gray-400' : 'text-slate-700'}`}
              >
                <option value="">-- Chọn nhóm quyền phân bổ (Bắt buộc) --</option>
                {groupsList.map((g: any) => (
                  <option key={g._id || g.id} value={g._id || g.id} className="text-slate-700 font-bold">
                    {g.name}
                  </option>
                ))}
              </select>
              <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              {!isView && <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
            </div>
          </div>

          {/* TÊN ĐĂNG NHẬP & MẬT KHẨU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor} flex items-center gap-1`}>
                Tên đăng nhập <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="relative">
                <input 
                  name="username" 
                  disabled={isView} 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                  className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm ${ringColor} disabled:opacity-70 font-bold`} 
                  placeholder="VD: duybh@cnpm" 
                />
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor} flex items-center gap-1`}>
                  Mật khẩu truy cập <span className="text-red-500 font-bold">*</span>
                </label>
                {!isView && isHashed && (
                  <button
                    type="button"
                    onClick={() => setPassword("123456")}
                    className="text-[10px] font-bold text-[#0054a5] hover:text-blue-700 hover:underline flex items-center gap-1 border-none bg-transparent cursor-pointer transition-all"
                  >
                    <RotateCcw size={12} /> Đặt lại (123456)
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  name="password"
                  type="text"
                  disabled={isView}
                  readOnly={isHashed}
                  value={isHashed ? "(Đã bảo mật)" : password}
                  onChange={(e) => {
                    if (!isHashed) {
                      setPassword(e.target.value);
                    }
                  }}
                  required
                  className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm ${ringColor} disabled:opacity-70 font-bold ${isHashed ? 'text-emerald-600 font-mono cursor-not-allowed focus:bg-gray-50' : ''}`}
                  placeholder="Nhập mật khẩu..."
                />
                <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {!isView && (
            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <button 
                type="button" 
                onClick={onClose} 
                disabled={isSubmitting}
                className="px-6 py-3 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all text-xs tracking-widest uppercase border-none outline-none cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className={`px-10 py-3 ${btnBg} text-white rounded-2xl font-bold shadow-lg transition-all text-xs tracking-widest uppercase flex items-center justify-center gap-2 border-none outline-none cursor-pointer disabled:opacity-50`}
              >
                {isSubmitting ? 'Đang xử lý...' : isAdd ? 'Cấp tài khoản' : 'Cập nhật'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect, useRef } from "react";
import { 
  Settings, Save, Plus, Trash2, MapPin, Mail, Facebook, 
  ChevronLeft, ChevronRight, Camera, UserCheck, Search, FileCheck2,
  FolderOpen, ShieldCheck, Award, LayoutTemplate, Edit3, Check, X,
  Calendar, GraduationCap, BookOpen, Users, FileText
} from "lucide-react";

interface SystemConfigFormProps {
  initialData: any;
  onSave: (data: any) => Promise<void>;
}

type ConfigTab = 'categories' | 'permissions' | 'achievements' | 'about';
type CategoryKey = 'years' | 'academicYears' | 'semesters' | 'classBranches' | 'documents';

const ITEMS_PER_PAGE = 10;

export default function SystemConfigForm({ initialData, onSave }: SystemConfigFormProps) {
  const [activeTab, setActiveTab] = useState<ConfigTab>('categories');
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('years');

  const [years, setYears] = useState<string[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [classBranches, setClassBranches] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);

  // State thao tác bảng Danh mục
  const [newItemValue, setNewItemValue] = useState("");
  const [searchCategoryTerm, setSearchCategoryTerm] = useState("");
  const [categoryPage, setCategoryPage] = useState(1);
  const [editingRow, setEditingRow] = useState<{ index: number; value: string } | null>(null);
  
  // Danh sách tài khoản được quyền tạo & quản lý phiếu
  const [formManagers, setFormManagers] = useState<any[]>([]);
  const [accountsList, setAccountsList] = useState<any[]>([]);
  const [searchAccount, setSearchAccount] = useState("");
  const [isOpenAccDropdown, setIsOpenAccDropdown] = useState(false);
  const accDropdownRef = useRef<HTMLDivElement>(null);

  const [contact, setContact] = useState<any>({
    address: "", email: "", fanpage: "", introduction: "", mission: "", vocation: "", structure: "", softwareIntro: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageAchievements, setPageAchievements] = useState(1);
  const fileInputRefs = useRef<any>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts`);
        if (res.ok) {
          const data = await res.json();
          setAccountsList(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Lỗi tải danh sách tài khoản:", e);
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (initialData) {
      setYears(initialData.years || []);
      setAcademicYears(initialData.academicYears || []);
      setSemesters(initialData.semesters || []);
      setClassBranches(initialData.classBranches || []);
      setAchievements(initialData.achievements || []);
      setDocuments(initialData.documents || []);
      setFormManagers(initialData.formManagers || initialData.registrationFormManagers || []);
      setContact(initialData.contact || {
        address: "", email: "", fanpage: "", introduction: "", mission: "", vocation: "", structure: "", softwareIntro: ""
      });
    }
  }, [initialData]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accDropdownRef.current && !accDropdownRef.current.contains(e.target as Node)) {
        setIsOpenAccDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cấu hình 5 bảng danh mục
  const categoryConfigs: {
    key: CategoryKey;
    label: string;
    colHeader: string;
    placeholder: string;
    inputType?: 'text' | 'number';
    icon: any;
    items: string[];
    setter: (val: string[]) => void;
  }[] = [
    {
      key: 'years',
      label: 'Danh mục Năm',
      colHeader: 'Năm hành chính',
      placeholder: 'Nhập năm mới (VD: 2027)...',
      inputType: 'number',
      icon: Calendar,
      items: years,
      setter: setYears,
    },
    {
      key: 'academicYears',
      label: 'Danh mục Năm học',
      colHeader: 'Niên khóa / Năm học',
      placeholder: 'Nhập năm học mới (VD: 2026-2027)...',
      icon: GraduationCap,
      items: academicYears,
      setter: setAcademicYears,
    },
    {
      key: 'semesters',
      label: 'Danh mục Học kỳ',
      colHeader: 'Tên học kỳ',
      placeholder: 'Nhập học kỳ mới (VD: Học kỳ 1)...',
      icon: BookOpen,
      items: semesters,
      setter: setSemesters,
    },
    {
      key: 'classBranches',
      label: 'Chi đoàn trực thuộc',
      colHeader: 'Tên Chi đoàn / Đơn vị',
      placeholder: 'Nhập tên Chi đoàn (VD: KTPM2026.1)...',
      icon: Users,
      items: classBranches,
      setter: setClassBranches,
    },
    {
      key: 'documents',
      label: 'Loại tài liệu',
      colHeader: 'Tên nhóm tài liệu / Văn bản',
      placeholder: 'Nhập loại tài liệu (VD: Kế hoạch, Báo cáo)...',
      icon: FileText,
      items: documents,
      setter: setDocuments,
    },
  ];

  const currentCat = categoryConfigs.find((c) => c.key === activeCategory) || categoryConfigs[0];

  const handleSelectCategory = (key: CategoryKey) => {
    setActiveCategory(key);
    setNewItemValue("");
    setSearchCategoryTerm("");
    setCategoryPage(1);
    setEditingRow(null);
  };

  const handleAddTableRow = () => {
    const trimmed = newItemValue.trim();
    if (!trimmed) return;
    const exists = currentCat.items.some((it) => String(it).trim().toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      alert(`Giá trị "${trimmed}" đã tồn tại trong ${currentCat.label}!`);
      return;
    }
    const nextList = [...currentCat.items, trimmed];
    currentCat.setter(nextList);
    setNewItemValue("");
    setSearchCategoryTerm("");
    setCategoryPage(Math.ceil(nextList.length / ITEMS_PER_PAGE) || 1);
  };

  const handleSaveEditRow = () => {
    if (!editingRow) return;
    const trimmed = editingRow.value.trim();
    if (!trimmed) {
      alert("Giá trị danh mục không được để trống!");
      return;
    }
    const updated = [...currentCat.items];
    updated[editingRow.index] = trimmed;
    currentCat.setter(updated);
    setEditingRow(null);
  };

  const handleDeleteTableRow = (globalIndex: number) => {
    const nextList = currentCat.items.filter((_, i) => i !== globalIndex);
    currentCat.setter(nextList);
    if (editingRow?.index === globalIndex) setEditingRow(null);
    const maxPage = Math.ceil(nextList.length / ITEMS_PER_PAGE) || 1;
    if (categoryPage > maxPage) setCategoryPage(maxPage);
  };

  // Logic Thành tích
  const handleAchievementChange = (globalIndex: number, field: string, value: string) => {
    const updated = [...achievements];
    updated[globalIndex][field] = value;
    setAchievements(updated);
  };

  const handleAchievementImage = (globalIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = [...achievements];
        updated[globalIndex].image = reader.result as string;
        setAchievements(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAchievement = () => {
    setPageAchievements(Math.ceil((achievements.length + 1) / ITEMS_PER_PAGE) || 1);
    setAchievements([...achievements, { academicYear: academicYears[0] || "", image: "", content: "" }]);
  };

  const handleRemoveAchievement = (globalIndex: number) => {
    const updatedLength = achievements.length - 1;
    if (updatedLength > 0 && (pageAchievements - 1) * ITEMS_PER_PAGE >= updatedLength) setPageAchievements(pageAchievements - 1);
    setAchievements(achievements.filter((_, i) => i !== globalIndex));
  };

  // Logic Phân quyền
  const handleAddFormManager = (acc: any) => {
    const accId = String(acc._id || acc.user_id || acc.id);
    const exists = formManagers.some(m => String(m.user_id || m._id) === accId);
    if (!exists) {
      const newManager = {
        user_id: accId,
        displayName: acc.displayName || acc.username,
        username: acc.username
      };
      setFormManagers([...formManagers, newManager]);
    }
    setIsOpenAccDropdown(false);
    setSearchAccount("");
  };

  const handleRemoveFormManager = (userId: string) => {
    setFormManagers(formManagers.filter(m => String(m.user_id || m._id) !== String(userId)));
  };

  const filteredAccounts = accountsList.filter(acc => {
    const accId = String(acc._id || acc.user_id || acc.id);
    const isAlreadyAdded = formManagers.some(m => String(m.user_id || m._id) === accId);
    const search = searchAccount.toLowerCase();
    const nameMatch = (acc.displayName || "").toLowerCase().includes(search);
    const usernameMatch = (acc.username || "").toLowerCase().includes(search);

    return !isAlreadyAdded && (nameMatch || usernameMatch);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave({ 
      years, 
      academicYears, 
      semesters, 
      classBranches, 
      achievements, 
      documents, 
      formManagers, 
      contact 
    });
    setIsSubmitting(false);
  };

  const getPaginatedItems = (list: any[], currentPage: number) => {
    return list.slice((currentPage - 1) * ITEMS_PER_PAGE, (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE);
  };

  const renderPaginationControls = (totalItems: number, currentPage: number, setCurrentPage: (p: number) => void) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3">
        <span className="text-[11px] font-semibold text-slate-400">
          Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} / {totalItems} mục
        </span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-purple-50 text-slate-600 disabled:opacity-40 transition-colors cursor-pointer bg-white">
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs font-bold text-slate-600">Trang {currentPage}/{totalPages}</span>
          <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-purple-50 text-slate-600 disabled:opacity-40 transition-colors cursor-pointer bg-white">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  // Dữ liệu bảng danh mục đang chọn (giữ nguyên globalIndex gốc để sửa/xóa chính xác kể cả khi đang tìm kiếm)
  const indexedCategoryRows = currentCat.items
    .map((val, globalIndex) => ({ val, globalIndex }))
    .filter((row) =>
      !searchCategoryTerm.trim() ||
      String(row.val).toLowerCase().includes(searchCategoryTerm.toLowerCase().trim())
    );
  const paginatedCategoryRows = getPaginatedItems(indexedCategoryRows, categoryPage);

  const tabs: { id: ConfigTab; label: string; icon: any; count?: number }[] = [
    { id: 'categories', label: 'Danh mục', icon: FolderOpen },
    { id: 'permissions', label: 'Phân quyền', icon: ShieldCheck, count: formManagers.length },
    { id: 'achievements', label: 'Thành tích', icon: Award, count: achievements.length },
    { id: 'about', label: 'Thiết lập trang Giới thiệu', icon: LayoutTemplate },
  ];

  return (
    <div className="space-y-6 text-black text-left">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b-2 border-purple-600 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-xl text-white shadow-lg shadow-purple-100">
            <Settings size={24} />
          </div>
          <h2 className="text-2xl font-black uppercase text-purple-600 tracking-tight">Cấu hình tham số hệ thống</h2>
        </div>
      </div>

      {/* THANH ĐIỀU HƯỚNG 4 TAB */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                  : 'bg-transparent text-slate-600 hover:text-purple-600 hover:bg-white/70'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border border-gray-100 shadow-xl bg-white p-6 space-y-8">
        
        {/* TAB 1: DANH MỤC (BỐ CỤC MASTER-DETAIL BẢNG DỮ LIỆU CHUYÊN NGHIỆP) */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
            {/* CỘT TRÁI (4 cols): Menu chọn loại danh mục */}
            <div className="lg:col-span-4 space-y-2">
              <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider px-1 mb-2">
                Nhóm danh mục hệ thống (5)
              </p>
              <div className="space-y-1.5">
                {categoryConfigs.map((cat, idx) => {
                  const Icon = cat.icon;
                  const isSelected = activeCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => handleSelectCategory(cat.key)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200/70'
                          : 'bg-slate-50/70 text-slate-700 border-slate-200/70 hover:bg-purple-50/50 hover:border-purple-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-xl shrink-0 ${
                          isSelected ? 'bg-white/15 text-white' : 'bg-white text-purple-600 border border-slate-200/70'
                        }`}>
                          <Icon size={16} />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-extrabold truncate">
                            {idx + 1}. {cat.label}
                          </p>
                          <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>
                            {cat.colHeader}
                          </p>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black shrink-0 ${
                        isSelected ? 'bg-white text-purple-700' : 'bg-purple-100/80 text-purple-700'
                      }`}>
                        {cat.items.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CỘT PHẢI (8 cols): Bảng dữ liệu chi tiết của danh mục đang chọn */}
            <div className="lg:col-span-8 bg-slate-50/50 p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* Header bảng */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div>
                    <h3 className="text-sm font-black uppercase text-purple-700 tracking-wide">
                      {currentCat.label} ({currentCat.items.length})
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Thêm mới, chỉnh sửa trực tiếp hoặc xóa các giá trị dùng chung trong hệ thống
                    </p>
                  </div>

                  {/* Ô lọc nhanh trong bảng */}
                  {currentCat.items.length > 5 && (
                    <div className="relative w-full sm:w-52">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchCategoryTerm}
                        onChange={(e) => {
                          setSearchCategoryTerm(e.target.value);
                          setCategoryPage(1);
                        }}
                        placeholder="Lọc nhanh..."
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-purple-500"
                      />
                    </div>
                  )}
                </div>

                {/* Thanh Thêm dòng mới vào bảng */}
                <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-purple-200/80 shadow-2xs">
                  <input
                    type={currentCat.inputType || 'text'}
                    value={newItemValue}
                    onChange={(e) => setNewItemValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTableRow();
                      }
                    }}
                    placeholder={currentCat.placeholder}
                    className="flex-1 px-3 py-1.5 bg-transparent text-xs font-bold text-slate-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTableRow}
                    disabled={!newItemValue.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-none cursor-pointer transition-all active:scale-95 disabled:opacity-40 shrink-0"
                  >
                    <Plus size={14} /> Thêm vào bảng
                  </button>
                </div>

                {/* Bảng dữ liệu chính */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/90 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4 w-16 text-center">STT</th>
                        <th className="py-3 px-4">{currentCat.colHeader}</th>
                        <th className="py-3 px-4 w-32 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedCategoryRows.length > 0 ? (
                        paginatedCategoryRows.map(({ val, globalIndex }) => {
                          const isEditing = editingRow?.index === globalIndex;

                          return (
                            <tr
                              key={globalIndex}
                              onDoubleClick={() => setEditingRow({ index: globalIndex, value: String(val) })}
                              className="hover:bg-purple-50/30 transition-colors group"
                            >
                              <td className="py-3 px-4 text-center font-bold text-slate-400">
                                {globalIndex + 1}
                              </td>

                              <td className="py-2.5 px-4">
                                {isEditing ? (
                                  <input
                                    autoFocus
                                    type={currentCat.inputType || 'text'}
                                    value={editingRow?.value ?? ''}
                                    onChange={(e) => setEditingRow({ index: globalIndex, value: e.target.value })}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSaveEditRow();
                                      } else if (e.key === 'Escape') {
                                        setEditingRow(null);
                                      }
                                    }}
                                    className="w-full px-3 py-1.5 bg-purple-50/40 border border-purple-400 rounded-lg text-xs font-bold text-slate-900 outline-none"
                                  />
                                ) : (
                                  <span className="font-bold text-slate-800 block py-1">
                                    {val || <span className="text-slate-400 italic">(Chưa nhập giá trị)</span>}
                                  </span>
                                )}
                              </td>

                              <td className="py-2.5 px-4 text-right whitespace-nowrap">
                                {isEditing ? (
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={handleSaveEditRow}
                                      title="Lưu thay đổi"
                                      className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg border-none cursor-pointer transition-colors"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingRow(null)}
                                      title="Hủy sửa"
                                      className="p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-lg border-none cursor-pointer transition-colors"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => setEditingRow({ index: globalIndex, value: String(val) })}
                                      title="Chỉnh sửa"
                                      className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg border-none bg-transparent cursor-pointer transition-colors"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTableRow(globalIndex)}
                                      title="Xóa dòng này"
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border-none bg-transparent cursor-pointer transition-colors"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-10 text-center text-slate-400 italic font-medium">
                            {currentCat.items.length === 0
                              ? `Chưa có dữ liệu trong ${currentCat.label}. Hãy nhập ở ô phía trên để thêm.`
                              : 'Không tìm thấy dòng dữ liệu nào phù hợp.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {renderPaginationControls(indexedCategoryRows.length, categoryPage, setCategoryPage)}
            </div>
          </div>
        )}

        {/* TAB 2: PHÂN QUYỀN */}
        {activeTab === 'permissions' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-black uppercase text-purple-600 tracking-wider flex items-center gap-2">
                <FileCheck2 size={18} /> Người được quản lý và tạo phiếu đăng ký chương trình ({formManagers.length})
              </h3>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Chọn các tài khoản có quyền truy cập tab <strong>TẠO PHIẾU ĐĂNG KÝ</strong> và quản lý phiếu trong hệ thống:
            </p>

            {/* Ô TÌM KIẾM VÀ CHỌN THÀNH VIÊN */}
            <div className="relative max-w-md" ref={accDropdownRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm tài khoản theo tên hoặc tên đăng nhập..."
                  value={searchAccount}
                  onFocus={() => setIsOpenAccDropdown(true)}
                  onChange={(e) => {
                    setSearchAccount(e.target.value);
                    setIsOpenAccDropdown(true);
                  }}
                  className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-purple-600 transition-all"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              {isOpenAccDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 max-h-48 overflow-y-auto">
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((acc) => (
                      <div
                        key={acc._id}
                        onClick={() => handleAddFormManager(acc)}
                        className="p-3 hover:bg-purple-50 cursor-pointer flex items-center justify-between border-b border-slate-50 last:border-none transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800">{acc.displayName || acc.username}</p>
                          <p className="text-[10px] text-slate-400">@{acc.username}</p>
                        </div>
                        <Plus size={16} className="text-purple-600" />
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 italic">
                      Không tìm thấy tài khoản phù hợp hoặc tất cả đã được thêm...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* DANH SÁCH TÀI KHOẢN ĐƯỢC ỦY QUYỀN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {formManagers.map((mgr) => {
                const mgrId = String(mgr.user_id || mgr._id);
                return (
                  <div 
                    key={mgrId}
                    className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center justify-between gap-2 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="p-2 bg-purple-600 text-white rounded-xl shrink-0">
                        <UserCheck size={16} />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{mgr.displayName || mgr.username}</p>
                        {mgr.username && <p className="text-[10px] text-purple-600 font-semibold truncate">@{mgr.username}</p>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFormManager(mgrId)}
                      className="p-1.5 text-red-500 hover:bg-red-100 rounded-xl border-none bg-transparent cursor-pointer shrink-0 transition-colors"
                      title="Gỡ quyền quản lý phiếu"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}

              {formManagers.length === 0 && (
                <div className="col-span-full p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs italic font-medium">
                  Chưa có tài khoản nào được phân quyền tạo & quản lý phiếu. (Mặc định chỉ người tạo phiếu mới có toàn quyền)
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: THÀNH TÍCH */}
        {activeTab === 'achievements' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-black uppercase text-purple-600 tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span> Thành tích đạt được qua các năm ({achievements.length})
              </h3>
              <button type="button" onClick={handleAddAchievement} className="text-[10px] font-bold uppercase bg-purple-600 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 border-none outline-none active:scale-95 transition-all cursor-pointer">
                <Plus size={12}/> Thêm thành tích
              </button>
            </div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {getPaginatedItems(achievements, pageAchievements).map((item, idx) => {
                const globalIndex = (pageAchievements - 1) * ITEMS_PER_PAGE + idx;
                return (
                  <div key={globalIndex} className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-5 items-start relative group animate-in fade-in duration-200">
                    <span className="absolute top-4 left-4 w-6 h-6 flex items-center justify-center bg-purple-100 text-purple-700 text-[10px] font-black rounded-lg">{globalIndex + 1}</span>
                    
                    <div className="w-full md:w-48 space-y-2 pt-6 md:pt-0">
                      <label className="text-[10px] font-bold text-gray-400 uppercase block ml-1">Hình ảnh minh họa</label>
                      <div 
                        onClick={() => fileInputRefs.current[globalIndex]?.click()}
                        className="w-full h-32 bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-400 cursor-pointer flex flex-col items-center justify-center overflow-hidden relative shadow-inner group-hover:bg-purple-50/10 transition-all"
                      >
                        {item.image ? (
                          <img src={item.image} alt="Achievement" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center text-gray-400 space-y-1 p-2">
                            <Camera size={20} className="mx-auto" />
                            <span className="text-[9px] font-bold block">Tải hình ảnh lên...</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" ref={el => { fileInputRefs.current[globalIndex] = el; }} onChange={(e) => handleAchievementImage(globalIndex, e)} className="hidden" />
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block ml-1">Năm học vinh danh</label>
                          <select 
                            value={item.academicYear || ""} 
                            onChange={(e) => handleAchievementChange(globalIndex, "academicYear", e.target.value)}
                            required
                            className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold outline-none focus:border-purple-500 cursor-pointer"
                          >
                            <option value="">-- Chọn năm học --</option>
                            {academicYears.filter(Boolean).map((yr, yIdx) => (
                              <option key={yIdx} value={yr}>{yr}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase block ml-1">Nội dung thành tích đạt được</label>
                        <textarea 
                          rows={4} 
                          value={item.content || ""} 
                          onChange={(e) => handleAchievementChange(globalIndex, "content", e.target.value)}
                          required
                          placeholder="Nhập chi tiết cụ thể thành tích xuất sắc, giải thưởng, phong trào đạt được trong niên khóa này..."
                          className="w-full p-3 bg-white border rounded-xl text-xs font-medium outline-none focus:border-purple-500 resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                    <button type="button" onClick={() => handleRemoveAchievement(globalIndex)} className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-xl border-none outline-none cursor-pointer"><Trash2 size={16}/></button>
                  </div>
                );
              })}

              {achievements.length === 0 && (
                <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs italic font-medium">
                  Chưa có thành tích nào được thêm. Nhấn "+ Thêm thành tích" để tạo mới.
                </div>
              )}
            </div>
            {renderPaginationControls(achievements.length, pageAchievements, setPageAchievements)}
          </div>
        )}

        {/* TAB 4: THIẾT LẬP TRANG GIỚI THIỆU */}
        {activeTab === 'about' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h3 className="text-xs font-black uppercase text-purple-600 tracking-wider flex items-center gap-2 border-b pb-2">
              <span className="w-2 h-2 bg-purple-600 rounded-full"></span> Thông tin nội dung trang GIỚI THIỆU
            </h3>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Đoạn giới thiệu chung</label>
              <textarea rows={3} value={contact.introduction || ""} onChange={(e) => setContact({ ...contact, introduction: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-medium resize-none leading-relaxed" placeholder="Nhập nội dung giới thiệu tổng quan..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Sứ mệnh</label>
                <textarea rows={4} value={contact.mission || ""} onChange={(e) => setContact({ ...contact, mission: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-medium resize-none leading-relaxed" placeholder="Nhập mục tiêu sứ mệnh..." />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Nhiệm vụ</label>
                <textarea rows={4} value={contact.vocation || ""} onChange={(e) => setContact({ ...contact, vocation: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-medium resize-none leading-relaxed" placeholder="Nhập nhiệm vụ trọng tâm..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Cơ cấu tổ chức</label>
                <textarea rows={4} value={contact.structure || ""} onChange={(e) => setContact({ ...contact, structure: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-medium resize-none leading-relaxed" placeholder="Mô tả các Ban chuyên môn..." />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Giới thiệu phần mềm</label>
                <textarea rows={4} value={contact.softwareIntro || ""} onChange={(e) => setContact({ ...contact, softwareIntro: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-medium resize-none leading-relaxed" placeholder="Nhập thông tin phần mềm..." />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Địa chỉ Văn phòng Đoàn khoa</label>
              <div className="relative">
                <input type="text" value={contact.address || ""} onChange={(e) => setContact({ ...contact, address: e.target.value })} required className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-bold" placeholder="Nhập địa chỉ..." />
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Email liên hệ</label>
                <div className="relative">
                  <input type="email" value={contact.email || ""} onChange={(e) => setContact({ ...contact, email: e.target.value })} required className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-bold" placeholder="VD: doankhoa@uit.edu.vn" />
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Đường dẫn Fanpage Facebook</label>
                <div className="relative">
                  <input type="url" value={contact.fanpage || ""} onChange={(e) => setContact({ ...contact, fanpage: e.target.value })} className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-bold" placeholder="https://facebook.com/..." />
                  <Facebook size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NÚT LƯU */}
        <div className="pt-4 flex justify-end border-t border-gray-100">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700 px-8 py-3 rounded-xl font-bold shadow-lg shadow-purple-100 transition-all text-xs uppercase tracking-widest disabled:opacity-50 border-none outline-none cursor-pointer active:scale-95"
          >
            <Save size={16} /> {isSubmitting ? "Đang lưu..." : "Cập nhật cấu hình"}
          </button>
        </div>
      </form>
    </div>
  );
}
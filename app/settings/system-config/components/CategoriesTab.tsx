'use client';

import { useState } from "react";
import { 
  Plus, Trash2, Search, Edit3, Check, X,
  ChevronLeft, ChevronRight,
  Calendar, GraduationCap, BookOpen, Users, FileText, Award
} from "lucide-react";

type CategoryKey = 'years' | 'academicYears' | 'semesters' | 'classBranches' | 'documents' | 'positions';

interface CategoriesTabProps {
  years: string[];
  setYears: (val: string[]) => void;
  academicYears: string[];
  setAcademicYears: (val: string[]) => void;
  semesters: string[];
  setSemesters: (val: string[]) => void;
  classBranches: string[];
  setClassBranches: (val: string[]) => void;
  documents: string[];
  setDocuments: (val: string[]) => void;
  positions: string[];
  setPositions: (val: string[]) => void;
}

const ITEMS_PER_PAGE = 10;

export default function CategoriesTab({
  years, setYears,
  academicYears, setAcademicYears,
  semesters, setSemesters,
  classBranches, setClassBranches,
  documents, setDocuments,
  positions, setPositions,
}: CategoriesTabProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('years');
  const [newItemValue, setNewItemValue] = useState("");
  const [searchCategoryTerm, setSearchCategoryTerm] = useState("");
  const [categoryPage, setCategoryPage] = useState(1);
  const [editingRow, setEditingRow] = useState<{ index: number; value: string } | null>(null);

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
    {
      key: 'positions',
      label: 'Danh mục Chức danh',
      colHeader: 'Tên chức danh / Chức vụ cán bộ',
      placeholder: 'Nhập chức danh (VD: Bí thư Đoàn khoa, Bí thư Chi đoàn)...',
      icon: Award,
      items: positions,
      setter: setPositions,
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

  const indexedCategoryRows = currentCat.items
    .map((val, globalIndex) => ({ val, globalIndex }))
    .filter((row) =>
      !searchCategoryTerm.trim() ||
      String(row.val).toLowerCase().includes(searchCategoryTerm.toLowerCase().trim())
    );

  const totalPages = Math.ceil(indexedCategoryRows.length / ITEMS_PER_PAGE);
  const paginatedRows = indexedCategoryRows.slice(
    (categoryPage - 1) * ITEMS_PER_PAGE,
    categoryPage * ITEMS_PER_PAGE
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      {/* CỘT TRÁI (4 cols): Menu chọn loại danh mục */}
      <div className="lg:col-span-4 space-y-2">
        <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider px-1 mb-2">
          Nhóm danh mục hệ thống ({categoryConfigs.length})
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

      {/* CỘT PHẢI (8 cols): Bảng dữ liệu chi tiết */}
      <div className="lg:col-span-8 bg-slate-50/50 p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div>
              <h3 className="text-sm font-black uppercase text-purple-700 tracking-wide">
                {currentCat.label} ({currentCat.items.length})
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Thêm mới, chỉnh sửa trực tiếp hoặc xóa các giá trị dùng chung trong hệ thống
              </p>
            </div>

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
                {paginatedRows.length > 0 ? (
                  paginatedRows.map(({ val, globalIndex }) => {
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3">
            <span className="text-[11px] font-semibold text-slate-400">
              Hiển thị {(categoryPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(categoryPage * ITEMS_PER_PAGE, indexedCategoryRows.length)} / {indexedCategoryRows.length} mục
            </span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={categoryPage === 1} onClick={() => setCategoryPage(categoryPage - 1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-purple-50 text-slate-600 disabled:opacity-40 transition-colors cursor-pointer bg-white">
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-bold text-slate-600">Trang {categoryPage}/{totalPages}</span>
              <button type="button" disabled={categoryPage === totalPages} onClick={() => setCategoryPage(categoryPage + 1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-purple-50 text-slate-600 disabled:opacity-40 transition-colors cursor-pointer bg-white">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
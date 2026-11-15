'use client';

import { useState, useRef, useEffect } from "react";
import { 
  X, User, AlertCircle, PlusCircle, Eye, FileEdit, GraduationCap, 
  Phone, Mail, Calendar, Camera, AtSign, Award, BookOpen, Search, Check 
} from "lucide-react";

const normalizePositions = (item: any): string[] => {
  if (!item) return [];
  if (Array.isArray(item.positions) && item.positions.length > 0) {
    return item.positions.filter(Boolean);
  }
  const single = item.position || item.chuc_vu || item.role;
  if (Array.isArray(single)) return single.filter(Boolean);
  if (typeof single === "string" && single.trim()) {
    return single.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

export default function NhanSuModal({ mode, data, positionsList = [], onClose, onConfirmDelete, onSave }: any) {
  const isView = mode === 'view';
  const isAdd = mode === 'add';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const posDropdownRef = useRef<HTMLDivElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(data?.image_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mssvInput, setMssvInput] = useState<string>(data?.student_id || data?.mssv || "");

  // State đa chức vụ + tìm kiếm nhanh
  const [selectedPositions, setSelectedPositions] = useState<string[]>(() => normalizePositions(data));
  const [posSearch, setPosSearch] = useState<string>("");
  const [isPosDropdownOpen, setIsPosDropdownOpen] = useState<boolean>(false);

  const allPositionOptions = Array.from(
    new Set([
      ...(Array.isArray(positionsList) ? positionsList : []),
      ...selectedPositions,
    ])
  ).filter(Boolean);

  const filteredPositionOptions = allPositionOptions.filter((pos) =>
    pos.toLowerCase().includes(posSearch.toLowerCase().trim())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (posDropdownRef.current && !posDropdownRef.current.contains(e.target as Node)) {
        setIsPosDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePosition = (pos: string) => {
    if (isView) return;
    setSelectedPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  };

  const removePosition = (pos: string) => {
    if (isView) return;
    setSelectedPositions((prev) => prev.filter((p) => p !== pos));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenDatePicker = () => {
    if (dateInputRef.current && !isView) {
      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          dateInputRef.current.showPicker();
        } catch (e) {
          dateInputRef.current.focus();
        }
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isView || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData(formRef.current!);
      const currentMssv = formData.get("mssv") as string;
      const joinedPositions = selectedPositions.join(", ");

      const payload = {
        ...data,
        name: formData.get("name"),
        full_name: formData.get("name"),
        mssv: currentMssv,
        student_id: currentMssv,
        class: formData.get("class"),
        positions: selectedPositions,
        position: joinedPositions,
        chuc_vu: joinedPositions,
        phone: formData.get("phone"),
        birthday: formData.get("birthday"),
        personal_email: formData.get("personal_email"),
        email: currentMssv ? `${currentMssv}@gm.uit.edu.vn` : "",
        image_url: avatarPreview,
      };

      await onSave(payload);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === 'delete') {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-red-100 animate-in zoom-in duration-300">
          <div className="p-6 text-center space-y-4 text-black">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full mx-auto flex items-center justify-center shadow-inner">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800">Xác nhận xóa?</h3>
              <p className="text-sm text-slate-500 leading-relaxed px-4">
                Bạn chắc chắn muốn xóa nhân sự <br/>
                <span className="font-bold text-red-600">"{data?.full_name || data?.name}"</span>?
              </p>
            </div>
          </div>
          <div className="flex p-4 gap-3 bg-slate-50">
            <button 
              type="button"
              onClick={onClose} 
              className="flex-1 py-3 px-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all uppercase text-[11px] tracking-widest border-none outline-none cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button 
              type="button"
              onClick={() => { onConfirmDelete(data._id || data.id); onClose(); }} 
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 border-none outline-none cursor-pointer"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    );
  }

  const headerBg = isView ? "bg-[#0054a5]" : "bg-[#f59e0b]";
  const btnBg = isView ? "bg-[#0054a5] hover:bg-[#004080]" : "bg-[#f59e0b] hover:bg-[#d97706]";
  const ringColor = isView ? "focus:border-[#0054a5]" : "focus:border-[#f59e0b]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
        <div className={`${headerBg} p-6 flex items-center justify-between text-white transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {isView ? <Eye size={20} /> : isAdd ? <PlusCircle size={20} /> : <FileEdit size={20} />}
            </div>
            <h3 className="font-bold uppercase tracking-widest text-sm">
              {isView ? 'Thông tin nhân sự' : isAdd ? 'Thêm nhân sự mới' : 'Cập nhật nhân sự'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white cursor-pointer"><X size={20} /></button>
        </div>
        
        <form ref={formRef} className="p-8 space-y-6 overflow-y-auto max-h-[85vh] text-black" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center space-y-3">
            <div className="relative group">
              <div className={`w-32 h-32 rounded-full border-4 ${isView ? 'border-[#0054a5]/20' : 'border-[#f59e0b]/20'} overflow-hidden bg-gray-100 flex items-center justify-center shadow-inner`}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-gray-300" />
                )}
              </div>
              {!isView && (
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-[#f59e0b] text-white rounded-full shadow-lg hover:bg-[#d97706] transition-all transform hover:scale-110 cursor-pointer border-none"
                >
                  <Camera size={18} />
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <label className="text-[10px] font-bold uppercase text-gray-400">Ảnh đại diện</label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Họ và tên</label>
              <div className="relative">
                <input name="name" disabled={isView} defaultValue={data?.full_name || data?.name} required className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm ${ringColor} disabled:opacity-70 font-bold`} placeholder="Nhập họ và tên..." />
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Mã số sinh viên</label>
              <div className="relative">
                <input 
                  name="mssv" 
                  disabled={isView} 
                  value={mssvInput} 
                  onChange={(e) => setMssvInput(e.target.value)} 
                  required 
                  className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm ${ringColor} disabled:opacity-70 font-bold`} 
                  placeholder="Nhập MSSV..." 
                />
                <GraduationCap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {/* LỚP & CHỨC VỤ (CHỌN NHIỀU + TÌM KIẾM NHANH) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Lớp</label>
              <div className="relative">
                <input name="class" disabled={isView} defaultValue={data?.class} className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm ${ringColor} disabled:opacity-70 font-semibold`} placeholder="VD: KTPM2023.1" />
                <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2" ref={posDropdownRef}>
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-bold uppercase text-gray-400">
                  Chức vụ {selectedPositions.length > 0 && `(${selectedPositions.length})`}
                </label>
                {!isView && selectedPositions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedPositions([])}
                    className="text-[10px] font-bold text-rose-500 hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    Xóa hết
                  </button>
                )}
              </div>

              <div className="relative">
                {isView ? (
                  <div className="w-full min-h-[54px] p-3.5 pl-12 bg-gray-50 rounded-2xl flex flex-wrap items-center gap-1.5">
                    <Award size={18} className="absolute left-4 top-4 text-gray-400" />
                    {selectedPositions.length > 0 ? (
                      selectedPositions.map((pos) => (
                        <span
                          key={pos}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-[#0054a5] border border-blue-100"
                        >
                          {pos}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 font-semibold">Chưa cập nhật chức vụ</span>
                    )}
                  </div>
                ) : (
                  <>
                    <div
                      onClick={() => setIsPosDropdownOpen(true)}
                      className={`w-full min-h-[54px] p-2.5 pl-11 bg-gray-50 rounded-2xl border transition-all cursor-text flex flex-wrap items-center gap-1.5 ${
                        isPosDropdownOpen
                          ? 'bg-white border-[#f59e0b] ring-2 ring-amber-100'
                          : 'border-transparent hover:border-slate-200'
                      }`}
                    >
                      <Search size={17} className="absolute left-4 top-4 text-gray-400 pointer-events-none" />

                      {selectedPositions.map((pos) => (
                        <span
                          key={pos}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200"
                        >
                          <span>{pos}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePosition(pos);
                            }}
                            className="p-0.5 rounded hover:bg-amber-200/70 text-amber-700 border-none bg-transparent cursor-pointer flex items-center"
                            title="Gỡ chức vụ này"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}

                      <input
                        type="text"
                        value={posSearch}
                        onFocus={() => setIsPosDropdownOpen(true)}
                        onChange={(e) => {
                          setPosSearch(e.target.value);
                          setIsPosDropdownOpen(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (filteredPositionOptions.length > 0) {
                              togglePosition(filteredPositionOptions[0]);
                              setPosSearch("");
                            }
                          } else if (e.key === 'Backspace' && !posSearch && selectedPositions.length > 0) {
                            removePosition(selectedPositions[selectedPositions.length - 1]);
                          }
                        }}
                        placeholder={selectedPositions.length === 0 ? "Gõ tên tìm chức vụ..." : "Thêm chức vụ..."}
                        className="flex-1 min-w-[110px] py-1 px-1 bg-transparent text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>

                    {isPosDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 max-h-52 overflow-y-auto py-1.5">
                        {filteredPositionOptions.length > 0 ? (
                          filteredPositionOptions.map((pos) => {
                            const isSelected = selectedPositions.includes(pos);
                            return (
                              <div
                                key={pos}
                                onClick={() => {
                                  togglePosition(pos);
                                  setPosSearch("");
                                }}
                                className={`px-3.5 py-2.5 text-xs font-bold cursor-pointer flex items-center justify-between transition-colors ${
                                  isSelected
                                    ? 'bg-amber-50/80 text-amber-800'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span className="truncate pr-2">{pos}</span>
                                {isSelected && <Check size={15} className="text-amber-600 shrink-0" />}
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-4 py-3 text-xs text-slate-400 italic text-center">
                            Không tìm thấy chức vụ "{posSearch}" trong danh mục
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Số điện thoại</label>
              <div className="relative">
                <input name="phone" disabled={isView} defaultValue={data?.phone} className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm ${ringColor} disabled:opacity-70 font-semibold`} placeholder="Nhập SĐT..." />
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Ngày sinh</label>
              <div 
                onClick={handleOpenDatePicker}
                className="relative cursor-pointer"
              >
                <input 
                  ref={dateInputRef}
                  name="birthday" 
                  type="date" 
                  disabled={isView} 
                  defaultValue={data?.birthday} 
                  className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm ${ringColor} disabled:opacity-70 cursor-pointer font-semibold`} 
                />
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Email sinh viên</label>
              <div className="relative">
                <input disabled value={mssvInput ? `${mssvInput}@gm.uit.edu.vn` : ""} className="w-full p-4 pl-12 bg-slate-100 rounded-2xl border-none text-sm text-slate-500 outline-none font-semibold" placeholder="mssv@gm.uit.edu.vn" />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Email cá nhân</label>
              <div className="relative">
                <input name="personal_email" disabled={isView} defaultValue={data?.personal_email} className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm ${ringColor} disabled:opacity-70 font-semibold`} placeholder="email@gmail.com" />
                <AtSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {!isView && (
            <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
              <button type="button" disabled={isSubmitting} onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all text-xs tracking-widest uppercase border-none outline-none disabled:opacity-50 cursor-pointer">Hủy bỏ</button>
              <button type="submit" disabled={isSubmitting} className={`px-10 py-3 ${btnBg} text-white rounded-2xl font-bold shadow-lg transition-all text-xs tracking-widest uppercase flex items-center justify-center gap-2 border-none outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}>
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Đang xử lý...</span>
                  </>
                ) : isAdd ? (
                  'Lưu'
                ) : (
                  'Cập nhật'
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
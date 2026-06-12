'use client';

import { useState, useRef, useEffect } from "react";
import { X, Save, User, Trash2, AlertCircle, PlusCircle, Eye, FileEdit, Key, UserCheck, ChevronDown, Search } from "lucide-react";

export default function CaiDatModal({ mode, data, onClose, onConfirmDelete, onSave, nhanSuList = [] }: any) {
  const isView = mode === 'view';
  const isAdd = mode === 'add';
  const formRef = useRef<HTMLFormElement>(null);
  
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [searchNS, setSearchNS] = useState("");
  const [selectedNS, setSelectedNS] = useState(data?.displayName || "");
  const [selectedUserId, setSelectedUserId] = useState(data?.user_id || "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredNS = nhanSuList.filter((ns: any) => {
    const name = (ns.full_name || ns.name || "").toLowerCase();
    const mssv = (ns.student_id || ns.mssv || "").toLowerCase();
    const search = searchNS.toLowerCase();
    return name.includes(search) || mssv.includes(search);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isView) return;

    const formData = new FormData(formRef.current!);
    const payload = {
      ...data,
      user_id: selectedUserId,
      displayName: selectedNS,
      username: formData.get("username"),
      password: formData.get("password"),
    };

    onSave(payload);
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
                Bạn chắc chắn muốn thu hồi quyền truy cập của <br/>
                <span className="font-bold text-red-600">"{data?.displayName}"</span>?
              </p>
            </div>
          </div>
          <div className="flex p-4 gap-3 bg-slate-50">
            <button onClick={onClose} className="flex-1 py-3 px-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all uppercase text-[11px] tracking-widest border-none outline-none">Hủy bỏ</button>
            <button onClick={() => { onConfirmDelete(data._id); onClose(); }} className="flex-1 py-3 px-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg hover:bg-red-700 transition-all uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 border-none outline-none">Xóa</button>
          </div>
        </div>
      </div>
    );
  }

  const headerBg = isView ? "bg-[#0054a5]" : "bg-[#f59e0b]";
  const btnBg = isView ? "bg-[#0054a5] hover:bg-[#004080]" : "bg-[#f59e0b] hover:bg-[#d97706]";
  const ringColor = isView ? "focus:border-[#0054a5]" : "focus:border-[#f59e0b]";
  const labelColor = isView ? "text-slate-400" : "text-[#f59e0b]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200 text-black">
      <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
        <div className={`${headerBg} p-6 flex items-center justify-between text-white transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {isView ? <Eye size={20} /> : isAdd ? <PlusCircle size={20} /> : <FileEdit size={20} />}
            </div>
            <h3 className="font-bold uppercase tracking-widest text-sm">
              {isView ? 'Chi tiết tài khoản' : isAdd ? 'Cấp tài khoản mới' : 'Chỉnh sửa tài khoản'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white"><X size={20} /></button>
        </div>
        
        <form ref={formRef} className="p-8 space-y-6 overflow-y-auto max-h-[85vh]" onSubmit={handleSubmit}>
          <div className="space-y-2" ref={dropdownRef}>
            <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Người sở hữu tài khoản</label>
            <div className="relative">
              <div 
                onClick={() => !isView && setIsOpenDropdown(!isOpenDropdown)}
                className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent flex items-center justify-between cursor-pointer transition-all ${!isView && 'hover:bg-white hover:border-gray-200'} ${isOpenDropdown && 'bg-white border-gray-200 ring-2 ring-blue-100'} ${isView && 'opacity-70 cursor-not-allowed'}`}
              >
                <span className={`text-sm ${!selectedNS ? 'text-gray-400' : 'text-slate-700 font-bold'}`}>
                  {selectedNS || "Chọn từ danh sách nhân sự..."}
                </span>
                {!isView && <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpenDropdown ? 'rotate-180' : ''}`} />}
              </div>
              <UserCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              {isOpenDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3 border-b border-gray-50">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        autoFocus
                        type="text"
                        placeholder="Gõ tên hoặc MSSV để tìm..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-xs outline-none focus:ring-1 ring-blue-400 transition-all"
                        value={searchNS}
                        onChange={(e) => setSearchNS(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredNS.length > 0 ? (
                      filteredNS.map((ns: any) => (
                        <div 
                          key={ns._id}
                          onClick={() => {
                            setSelectedNS(ns.full_name || ns.name);
                            setSelectedUserId(ns._id);
                            setIsOpenDropdown(false);
                            setSearchNS("");
                          }}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-none"
                        >
                          <div className="text-sm font-bold text-slate-700">{ns.full_name || ns.name}</div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-tighter">{ns.student_id || ns.mssv} — {ns.class}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-gray-400 italic">Không tìm thấy kết quả</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Tên đăng nhập</label>
              <div className="relative">
                <input name="username" disabled={isView} defaultValue={data?.username} required className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm ${ringColor} disabled:opacity-70 font-bold`} placeholder="VD: admin_khoa" />
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase ml-1 ${labelColor}`}>Mật khẩu truy cập</label>
              <div className="relative">
                <input name="password" type="text" disabled={isView} defaultValue={data?.password} required className={`w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white transition-all outline-none text-sm ${ringColor} disabled:opacity-70 font-bold`} placeholder="Nhập mật khẩu..." />
                <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {!isView && (
            <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
              <button type="button" onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all text-xs tracking-widest uppercase border-none outline-none">Hủy bỏ</button>
              <button type="submit" className={`px-10 py-3 ${btnBg} text-white rounded-2xl font-bold shadow-lg transition-all text-xs tracking-widest uppercase flex items-center justify-center gap-2 border-none outline-none`}>
                {isAdd ? 'Cấp tài khoản' : 'Cập nhật'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
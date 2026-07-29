'use client';

import { useState, useRef, useEffect } from "react";
import { X, Bell, Upload, FileText, Trash2, ChevronDown, User } from "lucide-react";

interface NoticeFormProps {
  data?: any;
  onClose: () => void;
  onSave: (item: any) => Promise<void>;
}

export default function NoticeForm({ data, onClose, onSave }: NoticeFormProps) {
  const [title, setTitle] = useState(data?.title || "");
  const [content, setContent] = useState(data?.content || "");
  const [sendEmail, setSendEmail] = useState(false);
  const [emailTarget, setEmailTarget] = useState<'ALL' | 'SPECIFIC'>('ALL');
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nhan-su`);
        const uData = await res.json();
        setUserList(Array.isArray(uData) ? uData : []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file);
  };

  const toggleSelectUser = (user: any) => {
    const isExist = selectedUsers.some(u => u._id === user._id);
    if (isExist) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        title,
        content,
        sendEmail,
        emailTarget,
        receiverIds: emailTarget === 'SPECIFIC' ? selectedUsers.map(u => u._id) : [],
        file: attachedFile,
        posted_at: data?.posted_at || new Date().toISOString()
      };
      await onSave(payload);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = userList.filter(u => {
    const search = searchTerm.toLowerCase();
    const fullName = (u.full_name || u.name || "").toLowerCase();
    const mssv = (u.student_id || u.mssv || "").toLowerCase();
    return fullName.includes(search) || mssv.includes(search);
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-4 animate-in zoom-in duration-200 text-black">
      <div className="bg-white w-full max-w-2xl rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 max-h-[90vh] flex flex-col">
        <div className={`p-4 sm:p-6 flex items-center justify-between text-white shrink-0 ${data ? 'bg-amber-500' : 'bg-[#1d92ff]'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg hidden sm:block"><Bell size={20} /></div>
            <h3 className="font-bold uppercase tracking-widest text-xs sm:text-sm">
              {data ? 'Cập nhật thông báo' : 'Soạn thông báo mới'}
            </h3>
          </div>
          <button type="button" disabled={isSubmitting} onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white outline-none disabled:opacity-50"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-4 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1 tracking-wider">Tiêu đề thông báo</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-sm text-black" placeholder="Nhập tiêu đề..." />
            </div>

            <div className="space-y-2 flex-1 flex flex-col">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1 tracking-wider">Nội dung chi tiết</label>
              <textarea required rows={4} value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none text-sm text-black resize-none leading-relaxed font-bold" placeholder="Nhập nội dung triển khai..." />
            </div>

            {/* Tài liệu đính kèm */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-1 tracking-wider">Tài liệu đính kèm</label>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              {!attachedFile ? (
                <button type="button" disabled={isSubmitting} onClick={() => fileInputRef.current?.click()} className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-slate-400 hover:text-blue-500 cursor-pointer disabled:opacity-50 text-xs font-bold">
                  <Upload size={16} /> Tải tệp lên hệ thống
                </button>
              ) : (
                <div className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="p-2 bg-blue-500 text-white rounded-lg shrink-0"><FileText size={16} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-700 truncate">{attachedFile.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{(attachedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setAttachedFile(null)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg shrink-0"><Trash2 size={16} /></button>
                </div>
              )}
            </div>

            {/* Cấu hình Gửi Email */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="sendEmailCheckbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="w-4 h-4 accent-blue-500 cursor-pointer" />
                <label htmlFor="sendEmailCheckbox" className="text-xs font-bold text-slate-700 cursor-pointer select-none">Đồng thời gửi email thông báo</label>
              </div>

              {sendEmail && (
                <div className="pl-6 pt-2 space-y-3 border-l-2 border-blue-200 animate-in fade-in slide-in-from-left-2 duration-200">
                  <div className="flex gap-4 text-xs font-bold">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="emailTarget" checked={emailTarget === 'ALL'} onChange={() => setEmailTarget('ALL')} className="accent-blue-500" />
                      Tất cả thành viên
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="emailTarget" checked={emailTarget === 'SPECIFIC'} onChange={() => setEmailTarget('SPECIFIC')} className="accent-blue-500" />
                      Chỉ định người nhận
                    </label>
                  </div>

                  {emailTarget === 'SPECIFIC' && (
                    <div className="relative" ref={dropdownRef}>
                      <div 
                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                        className="w-full p-3 bg-white rounded-xl text-xs font-bold border border-slate-200 shadow-sm cursor-pointer flex items-center justify-between"
                      >
                        <span className="text-slate-600 truncate">
                          {selectedUsers.length > 0 
                            ? `Đã chọn ${selectedUsers.length} người nhận` 
                            : "-- Chọn người nhận đích danh --"}
                        </span>
                        <ChevronDown size={14} className="text-slate-400" />
                      </div>

                      {showUserDropdown && (
                        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl shadow-2xl border border-slate-100 z-[160] overflow-hidden">
                          <div className="p-2 border-b border-slate-50">
                            <input autoFocus type="text" placeholder="Gõ tên hoặc MSSV để lọc nhanh..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 text-xs bg-slate-50 rounded-lg outline-none focus:ring-1 ring-blue-500" />
                          </div>
                          <div className="max-h-36 overflow-y-auto">
                            {filteredUsers.map(u => {
                              const isChecked = selectedUsers.some(su => su._id === u._id);
                              return (
                                <div key={u._id} onClick={() => toggleSelectUser(u)} className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between border-b border-slate-50 last:border-none">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700">{u.full_name || u.name}</span>
                                    <span className="text-[9px] text-slate-400 uppercase tracking-tight">{u.student_id || u.mssv} - {u.class}</span>
                                  </div>
                                  <input type="checkbox" checked={isChecked} readOnly className="w-3.5 h-3.5 accent-blue-500" />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Hiển thị badge danh sách đã chọn bên dưới */}
                      {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {selectedUsers.map(u => (
                            <span key={u._id} className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-md text-[10px]">
                              {u.full_name || u.name}
                              <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => toggleSelectUser(u)} />
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:px-8 sm:pb-8 flex justify-end gap-3 bg-white border-t border-gray-50 shrink-0">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all uppercase text-[10px] sm:text-[11px] border-none bg-transparent outline-none disabled:opacity-50">Hủy bỏ</button>
            <button type="submit" disabled={isSubmitting} className={`px-8 sm:px-10 py-2 sm:py-3 text-white rounded-xl sm:rounded-2xl font-bold shadow-lg transition-all uppercase text-[10px] sm:text-[11px] border-none outline-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${data ? 'bg-amber-500 shadow-amber-100 hover:bg-amber-600' : 'bg-[#1d92ff] shadow-blue-100 hover:bg-blue-600'}`}>
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Đang xử lý...</span>
                </>
              ) : data ? 'Cập nhật' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
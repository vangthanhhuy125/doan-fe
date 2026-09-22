'use client';

import { useState, useEffect, useRef } from "react";
import { X, Search, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

interface UpdateLCHModalProps {
  onClose: () => void;
  currentLCH: any[];
}

export default function UpdateFacultyLCHModal({ onClose, currentLCH }: UpdateLCHModalProps) {
  const fixedRoles = [
    { role: "Liên Chi hội trưởng", isThuongTruc: true },
    { role: "Liên Chi hội phó", isThuongTruc: true },
    { role: "Liên Chi hội phó", isThuongTruc: true },
    ...Array(8).fill(null).map(() => ({ role: "Ủy viên BCH Liên Chi hội", isThuongTruc: false }))
  ];

  const [formData, setFormData] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/nhan-su`)
      .then(res => res.json())
      .then(data => setUserList(Array.isArray(data) ? data : []))
      .catch(() => setUserList([]));
  }, []);

  useEffect(() => {
    const initialData = fixedRoles.map((item, idx) => {
      const existing = currentLCH[idx];
      return {
        role: item.role,
        isThuongTruc: item.isThuongTruc,
        user_id: existing?.user_id || existing?._id || null,
        name: existing?.full_name || existing?.name || "",
        avatar: existing?.avatar || existing?.image_url || "",
        order: idx
      };
    });
    setFormData(initialData);
  }, [currentLCH]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveIdx(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectUser = (idx: number, user: any) => {
    const newData = [...formData];
    newData[idx].user_id = user._id || user.id;
    newData[idx].name = user.full_name || user.name;
    newData[idx].avatar = user.image_url || user.avatar || "";
    setFormData(newData);
    setActiveIdx(null);
    setSearchTerm("");
  };

  const handleClearUser = (idx: number) => {
    const newData = [...formData];
    newData[idx].user_id = null;
    newData[idx].name = "";
    newData[idx].avatar = "";
    setFormData(newData);
  };

  const handleUpdate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = formData.filter(item => item.name !== "");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-association/bch/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Cập nhật BCH Liên Chi hội thành công!", "success");
        setTimeout(() => onClose(), 800);
      } else {
        showToast("Cập nhật thất bại!", "error");
      }
    } catch {
      showToast("Không thể kết nối máy chủ!", "error");
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-3 sm:p-4 text-black animate-in fade-in duration-200">
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[160] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold text-white ${
          toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
        <div className="bg-gradient-to-r from-sky-700 to-[#0054a5] p-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-wide text-sm sm:text-base">
                Cập nhật Ban Chấp hành Liên Chi hội
              </h3>
              <p className="text-[11px] text-sky-100 font-semibold">1 LCH Trưởng + 2 LCH Phó + 8 Ủy viên BCH</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/15 rounded-full border-none bg-transparent text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto space-y-2 flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">
                <th className="pb-3 pl-2 w-5/12">Chức vụ</th>
                <th className="pb-3 pl-2 w-7/12">Họ và tên cán bộ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {formData.map((item, idx) => (
                <tr key={idx} className="group hover:bg-slate-50/70">
                  <td className="py-3 pl-2 text-xs font-bold text-slate-700">
                    <span className={item.isThuongTruc ? 'text-sky-700 font-black' : 'text-slate-600'}>
                      {item.role} {item.isThuongTruc ? '★' : ''}
                    </span>
                  </td>
                  <td className="py-2.5 pl-2 relative">
                    <div className="relative" ref={idx === activeIdx ? dropdownRef : null}>
                      <div
                        onClick={() => { if (!isSubmitting) { setActiveIdx(idx); setSearchTerm(""); } }}
                        className={`w-full p-2.5 bg-slate-50 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 cursor-pointer flex items-center justify-between ${
                          activeIdx === idx ? 'bg-white border-sky-600 ring-2 ring-sky-100' : 'hover:bg-slate-100/80'
                        }`}
                      >
                        <span className={item.name ? "text-slate-800" : "text-slate-400 font-normal"}>
                          {item.name || "-- Chọn nhân sự --"}
                        </span>
                        <div className="flex items-center gap-1">
                          {item.name && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleClearUser(idx); }}
                              className="text-slate-400 hover:text-rose-600 p-1 border-none bg-transparent cursor-pointer"
                            >
                              <X size={13} />
                            </button>
                          )}
                          <Search size={14} className="text-slate-400" />
                        </div>
                      </div>
                      {activeIdx === idx && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[160] overflow-hidden">
                          <div className="p-2 border-b border-slate-100">
                            <input
                              autoFocus
                              type="text"
                              placeholder="Tìm theo tên hoặc MSSV..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full p-2 text-xs bg-slate-50 rounded-xl border-none outline-none font-semibold"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredUsers.length > 0 ? (
                              filteredUsers.map((u) => (
                                <div
                                  key={u._id || u.id}
                                  onClick={() => handleSelectUser(idx, u)}
                                  className="px-4 py-2.5 hover:bg-sky-50 cursor-pointer flex items-center justify-between border-b border-slate-50 last:border-none"
                                >
                                  <div>
                                    <span className="text-xs font-bold text-slate-800 block">{u.full_name || u.name}</span>
                                    <span className="text-[10px] text-slate-400 font-semibold">{u.student_id || u.mssv} - {u.class || ''}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-xs text-slate-400 italic">Không tìm thấy kết quả</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 sm:p-5 bg-slate-50 flex items-center justify-end gap-3 border-t border-slate-100 shrink-0">
          <button type="button" disabled={isSubmitting} onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 text-xs uppercase border-none cursor-pointer">
            Hủy
          </button>
          <button type="button" disabled={isSubmitting} onClick={handleUpdate} className="px-7 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md text-xs uppercase border-none cursor-pointer">
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
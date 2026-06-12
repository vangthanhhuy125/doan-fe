'use client';

import { useState, useEffect, useRef } from "react";
import { Edit, X, Search } from "lucide-react";

interface UpdateBCHModalProps {
  onClose: () => void;
  allMembers: any[];
  currentBCH: any[];
}

export default function UpdateBCHModal({ onClose, allMembers, currentBCH }: UpdateBCHModalProps) {
  const fixedRoles = [
    { role: "Bí thư Đoàn khoa", isBanThuongVu: true },
    { role: "Phó Bí thư Đoàn khoa", isBanThuongVu: true },
    { role: "Ủy viên Ban Thường vụ", isBanThuongVu: true },
    { role: "Ủy viên Ban Thường vụ", isBanThuongVu: true },
    { role: "Ủy viên Ban Thường vụ", isBanThuongVu: true },
    ...Array(10).fill(null).map(() => ({ role: "Ủy viên Ban Chấp hành", isBanThuongVu: false }))
  ];

  const [formData, setFormData] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nhan-su`);
        const data = await res.json();
        setUserList(Array.isArray(data) ? data : []);
      } catch (error) {
        setUserList([]);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const initialData = fixedRoles.map((item, idx) => {
      const existing = currentBCH[idx];
      return {
        role: item.role,
        isBanThuongVu: item.isBanThuongVu,
        user_id: existing?.user_id || existing?._id || null,
        name: existing?.full_name || existing?.name || "",
        avatar: existing?.avatar || "", 
        order: idx
      };
    });
    setFormData(initialData);
  }, [currentBCH]);

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
    newData[idx].user_id = user._id;
    newData[idx].name = user.full_name || user.name;
    newData[idx].avatar = user.image_url || ""; 
    setFormData(newData);
    setActiveIdx(null);
    setSearchTerm("");
  };

  const handleUpdate = async () => {
    try {
      const payload = formData.filter(item => item.name !== "");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/youth-union/bch/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) onClose();
    } catch (error) {
      console.error("Lỗi cập nhật BCH:", error);
    }
  };

  const filteredUsers = userList.filter(u => {
    const search = searchTerm.toLowerCase();
    const fullName = (u.full_name || u.name || "").toLowerCase();
    const mssv = (u.student_id || u.mssv || "").toLowerCase();
    return fullName.includes(search) || mssv.includes(search);
  });

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-black">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#0054a5] p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <Edit size={20} />
            <h3 className="font-bold uppercase tracking-widest text-sm">Cập nhật Ban Chấp hành</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[14px] font-black text-slate-400 border-b">
                <th className="pb-3 pl-2 w-1/3 text-left">Chức vụ</th>
                <th className="pb-3 pl-2 text-left">Họ và tên</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {formData.map((item, idx) => (
                <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 pl-2 text-xs font-bold text-slate-500 uppercase tracking-tighter w-1/3">
                    {item.role}
                  </td>
                  <td className="py-2 pl-2 relative">
                    <div className="relative" ref={idx === activeIdx ? dropdownRef : null}>
                      <div 
                        onClick={() => { setActiveIdx(idx); setSearchTerm(""); }}
                        className={`w-full p-3 bg-slate-50 rounded-xl text-sm font-bold border-2 border-transparent transition-all cursor-pointer flex items-center justify-between ${activeIdx === idx ? 'bg-white border-blue-500 shadow-md' : 'hover:bg-slate-100'}`}
                      >
                        <span className={item.name ? "text-slate-800" : "text-slate-400"}>
                          {item.name || "-- Chọn nhân sự --"}
                        </span>
                        <Search size={14} className="text-slate-400" />
                      </div>

                      {activeIdx === idx && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[160] overflow-hidden animate-in zoom-in-95 duration-200">
                          <div className="p-2 border-b border-slate-50">
                            <input 
                              autoFocus
                              type="text"
                              placeholder="Gõ tên hoặc MSSV..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full p-2 pl-3 text-xs bg-slate-50 rounded-lg outline-none focus:ring-1 ring-blue-500"
                            />
                          </div>
                          <div className="max-h-40 overflow-y-auto">
                            {filteredUsers.length > 0 ? (
                              filteredUsers.map((u) => (
                                <div 
                                  key={u._id}
                                  onClick={() => handleSelectUser(idx, u)}
                                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex flex-col transition-colors border-b border-slate-50 last:border-none"
                                >
                                  <span className="text-sm font-bold text-slate-700">{u.full_name || u.name}</span>
                                  <span className="text-[10px] text-slate-400 uppercase tracking-tight">{u.student_id || u.mssv}</span>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-xs text-slate-400">Không tìm thấy kết quả</div>
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

        <div className="p-6 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-slate-400 hover:bg-slate-200 transition-all uppercase text-[10px] tracking-widest border-none outline-none">
            Hủy bỏ
          </button>
          <button 
            onClick={handleUpdate}
            className="px-10 py-3 bg-[#0054a5] text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-800 transition-all uppercase text-[10px] tracking-widest border-none outline-none flex items-center gap-2"
          >
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
}
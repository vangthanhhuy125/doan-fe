'use client';

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, UserCheck, Search, FileCheck2 } from "lucide-react";

interface PermissionsTabProps {
  formManagers: any[];
  setFormManagers: (val: any[]) => void;
  accountsList: any[];
}

export default function PermissionsTab({
  formManagers,
  setFormManagers,
  accountsList,
}: PermissionsTabProps) {
  const [searchAccount, setSearchAccount] = useState("");
  const [isOpenAccDropdown, setIsOpenAccDropdown] = useState(false);
  const accDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accDropdownRef.current && !accDropdownRef.current.contains(e.target as Node)) {
        setIsOpenAccDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  return (
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
  );
}
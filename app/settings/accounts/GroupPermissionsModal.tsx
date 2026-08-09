'use client';

import { useState } from "react";
import { X, ShieldCheck, Check, LayoutGrid } from "lucide-react";

// Danh sách các mục tab Sidebar hệ thống
export const SIDEBAR_MENU_ITEMS = [
  { id: 'gioi-thieu', name: 'Giới thiệu', desc: 'Xem thông tin giới thiệu chung về Đoàn khoa' },
  { id: 'tai-lieu', name: 'Tài liệu', desc: 'Quản lý văn bản, biểu mẫu và tài liệu lưu trữ' },
  { id: 'chuong-trinh-nam', name: 'Chương trình năm', desc: 'Quản lý hoạt động, sự kiện và phiếu đăng ký' },
  { id: 'cong-tac-doan', name: 'Công tác Đoàn - Đảng', desc: 'Quản lý đoàn viên, phân loại và công tác phát triển' },
  { id: 'thi-dua', name: 'Thi đua', desc: 'Theo dõi điểm rèn luyện, khen thưởng và kỉ luật' },
  { id: 'to-chuc-doan', name: 'Tổ chức Đoàn khoa', desc: 'Cơ cấu ban chấp hành và danh sách các chi đoàn' },
  { id: 'nhan-su', name: 'Nhân sự', desc: 'Quản lý thông tin hồ sơ nhân sự Đoàn khoa' },
  { id: 'mo-hinh-clb', name: 'Mô hình CLPI', desc: 'Quản lý mô hình câu lạc bộ và phong trào' },
  { id: 'cai-dat', name: 'Cài đặt (Quản lý quyền)', desc: 'Cấu hình phân quyền hệ thống và tài khoản' },
];

interface Props {
  group: any;
  onClose: () => void;
  onSavePermissions: (groupId: string | number, permissions: string[]) => void;
}

export default function GroupPermissionsModal({ group, onClose, onSavePermissions }: Props) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    group?.permissions || []
  );

  const handleToggle = (id: string) => {
    setSelectedPermissions(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPermissions.length === SIDEBAR_MENU_ITEMS.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(SIDEBAR_MENU_ITEMS.map(item => item.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePermissions(group._id || group.id, selectedPermissions);
    onClose();
  };

  const isAllSelected = selectedPermissions.length === SIDEBAR_MENU_ITEMS.length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in duration-200 text-black">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
        {/* HEADER */}
        <div className="bg-[#0054a5] p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-widest text-sm">Cấu hình phân quyền Sidebar</h3>
              <p className="text-[11px] text-blue-200 font-medium mt-0.5">Nhóm: <strong className="text-white">{group?.name}</strong></p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex items-center justify-between bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100">
            <span className="text-xs font-bold text-[#0054a5] flex items-center gap-1.5">
              <LayoutGrid size={16} /> Chọn các mục menu Sidebar được phép xem & thao tác
            </span>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[11px] font-bold text-[#0054a5] hover:underline border-none bg-transparent cursor-pointer"
            >
              {isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
            {SIDEBAR_MENU_ITEMS.map((item) => {
              const checked = selectedPermissions.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    checked
                      ? 'bg-blue-50/80 border-[#0054a5] text-[#0054a5] shadow-sm'
                      : 'bg-gray-50/80 border-gray-200 text-slate-700 hover:bg-gray-100/80'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    checked ? 'bg-[#0054a5] border-[#0054a5] text-white' : 'border-gray-300 bg-white'
                  }`}>
                    {checked && <Check size={14} strokeWidth={3} />}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold">{item.name}</div>
                    <div className="text-[10px] text-gray-500 line-clamp-1">{item.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FOOTER */}
          <div className="pt-4 flex items-center justify-between border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-500">
              Đã chọn: <strong className="text-[#0054a5]">{selectedPermissions.length} / {SIDEBAR_MENU_ITEMS.length}</strong> mục
            </span>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2.5 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all text-xs tracking-widest uppercase border-none outline-none cursor-pointer"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="px-8 py-2.5 bg-[#0054a5] hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg transition-all text-xs tracking-widest uppercase border-none outline-none cursor-pointer"
              >
                Lưu phân quyền
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
'use client';

import { useState } from "react";
import { Plus, Edit, Trash2, Users } from "lucide-react";

export default function GroupsTab() {
  // Dữ liệu mẫu Nhóm người dùng
  const [groups, setGroups] = useState([
    { id: 1, name: 'Ban Biên Tập & Nội Dung', membersCount: 4, description: 'Quản lý tin tức, thông báo và nội dung truyền thông.' },
    { id: 2, name: 'Quản Trị Hệ Thống (Admin)', membersCount: 2, description: 'Toàn quyền cấu hình hệ thống, phân quyền và duyệt tài khoản.' },
    { id: 3, name: 'Ban Tổ Chức Sự Kiện', membersCount: 6, description: 'Quản lý chương trình năm, điểm danh và khảo sát nguyện vọng.' },
  ]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">
          Danh sách nhóm quyền hệ thống ({groups.length})
        </h3>
        <button className="flex items-center gap-2 bg-[#0054a5] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all border-none cursor-pointer">
          <Plus size={16} /> Thêm nhóm mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4 hover:border-[#0054a5]/40 transition-all">
            <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h4 className="font-black text-slate-800 text-sm">{group.name}</h4>
                <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-[#0054a5] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  <Users size={12} /> {group.membersCount} thành viên
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg border-none bg-transparent cursor-pointer" title="Chỉnh sửa">
                  <Edit size={14} />
                </button>
                <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border-none bg-transparent cursor-pointer" title="Xóa">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              {group.description}
            </p>
            <div className="pt-2 flex items-center justify-between border-t border-gray-50 text-[11px]">
              <span className="text-gray-400 font-semibold">Phân quyền chi tiết</span>
              <button className="text-[#0054a5] font-bold hover:underline border-none bg-transparent cursor-pointer">
                Cấu hình quyền &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState } from "react";
import { Shield, Users, UserCog } from "lucide-react";
import AccountsTab from "./AccountsTab";
import GroupsTab from "./GroupsTab";

export default function CaiDatPage() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'groups'>('accounts');

  return (
    <div className="space-y-6 text-black">
      {/* HEADER TITLE */}
      <div className="flex items-center gap-3 border-b-2 border-[#0054a5] pb-3">
        <div className="p-2 bg-[#0054a5] rounded-xl text-white shadow-lg shadow-blue-100">
          <Shield size={24} />
        </div>
        <h2 className="text-2xl font-black uppercase text-[#0054a5] tracking-tight">Quản lý quyền truy cập</h2>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-2 pb-3 font-bold text-sm transition-all border-b-2 cursor-pointer ${
            activeTab === 'accounts'
              ? 'border-[#0054a5] text-[#0054a5]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Users size={18} />
          <span>Tài khoản người dùng</span>
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center gap-2 pb-3 font-bold text-sm transition-all border-b-2 cursor-pointer ${
            activeTab === 'groups'
              ? 'border-[#0054a5] text-[#0054a5]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <UserCog size={18} />
          <span>Nhóm người dùng</span>
        </button>
      </div>

      {activeTab === 'accounts' ? <AccountsTab /> : <GroupsTab />}
    </div>
  );
}

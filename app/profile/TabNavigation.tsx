'use client';

import { User, Bell, FileCheck2, ClipboardList, CalendarCheck } from 'lucide-react';

export interface TabNavigationProps {
  activeTab: 'info' | 'notifications' | 'registrations' | 'surveys' | 'attendance';
  setActiveTab: (tab: 'info' | 'notifications' | 'registrations' | 'surveys' | 'attendance') => void;
  notifCount: number;
  registrationCount?: number;
  surveyCount?: number;
  attendanceCount?: number;
}

export default function TabNavigation({
  activeTab,
  setActiveTab,
  notifCount,
  registrationCount = 0,
  surveyCount = 0,
  attendanceCount = 0
}: TabNavigationProps) {
  return (
    <div className="flex border-b border-gray-100 px-4 pt-2 bg-gray-50/50 overflow-x-auto">
      {/* 1. Thông tin cá nhân */}
      <button
        onClick={() => setActiveTab('info')}
        className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
          activeTab === 'info'
            ? 'border-[#0054a5] text-[#0054a5] bg-white rounded-t-lg'
            : 'border-transparent text-gray-400 hover:text-gray-600'
        }`}
      >
        <User size={18} />
        <span>Thông tin cá nhân</span>
      </button>

      {/* 2. Thông báo */}
      <button
        onClick={() => setActiveTab('notifications')}
        className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
          activeTab === 'notifications'
            ? 'border-[#0054a5] text-[#0054a5] bg-white rounded-t-lg'
            : 'border-transparent text-gray-400 hover:text-gray-600'
        }`}
      >
        <Bell size={18} />
        <span>Thông báo</span>
        {notifCount > 0 && (
          <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
            {notifCount}
          </span>
        )}
      </button>

      {/* 3. Đăng ký chương trình */}
      <button
        onClick={() => setActiveTab('registrations')}
        className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
          activeTab === 'registrations'
            ? 'border-[#0054a5] text-[#0054a5] bg-white rounded-t-lg'
            : 'border-transparent text-gray-400 hover:text-gray-600'
        }`}
      >
        <FileCheck2 size={18} />
        <span>Đăng ký chương trình</span>
        {registrationCount > 0 && (
          <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
            {registrationCount}
          </span>
        )}
      </button>

      {/* 4. Phiếu khảo sát */}
      <button
        onClick={() => setActiveTab('surveys')}
        className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
          activeTab === 'surveys'
            ? 'border-[#0054a5] text-[#0054a5] bg-white rounded-t-lg'
            : 'border-transparent text-gray-400 hover:text-gray-600'
        }`}
      >
        <ClipboardList size={18} />
        <span>Phiếu khảo sát</span>
        {surveyCount > 0 && (
          <span className="ml-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
            {surveyCount}
          </span>
        )}
      </button>

      {/* 5. Điểm danh hoạt động */}
      <button
        onClick={() => setActiveTab('attendance')}
        className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
          activeTab === 'attendance'
            ? 'border-[#0054a5] text-[#0054a5] bg-white rounded-t-lg'
            : 'border-transparent text-gray-400 hover:text-gray-600'
        }`}
      >
        <CalendarCheck size={18} />
        <span>Điểm danh</span>
        {attendanceCount > 0 && (
          <span className="ml-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white animate-pulse">
            {attendanceCount}
          </span>
        )}
      </button>
    </div>
  );
}
'use client';

import { useRef } from 'react';
import { User, Mail, Phone, Calendar, GraduationCap, ShieldCheck, Save, AtSign, Loader2 } from 'lucide-react';

interface InfoTabProps {
  fullName: string;
  setFullName: (v: string) => void;
  studentId: string;
  handleStudentIdChange: (v: string) => void;
  studentEmail: string;
  personalEmail: string;
  setPersonalEmail: (v: string) => void;
  className: string;
  setClassName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  birthday: string;
  setBirthday: (v: string) => void;
  roles: string[];
  newRoleInput: string;
  setNewRoleInput: (v: string) => void;
  handleAddRole: () => void;
  handleRemoveRole: (r: string) => void;
  handleSave: () => void;
  saving: boolean;
}

export default function InfoTab({
  fullName, setFullName,
  studentId, handleStudentIdChange,
  studentEmail,
  personalEmail, setPersonalEmail,
  className, setClassName,
  phone, setPhone,
  birthday, setBirthday,
  handleSave, saving
}: InfoTabProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  // 🟢 Hàm kích hoạt mở lịch khi click vào bất kỳ đâu trong ô Ngày sinh
  const handleOpenDatePicker = () => {
    if (dateInputRef.current) {
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

  return (
    <div className="p-6 space-y-6 text-black">
      <h3 className="flex items-center gap-2 border-b pb-3 text-lg font-bold text-gray-800">
        <ShieldCheck className="text-[#0054a5]" size={20} /> Chi tiết thông tin cá nhân
      </h3>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* HỌ VÀ TÊN */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Họ và tên</label>
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all focus-within:border-[#0054a5]">
            <User size={18} className="text-[#0054a5]" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ và tên"
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400 text-black"
            />
          </div>
        </div>

        {/* MÃ SỐ SINH VIÊN */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Mã số sinh viên</label>
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all focus-within:border-[#0054a5]">
            <GraduationCap size={18} className="text-[#0054a5]" />
            <input
              type="text"
              value={studentId}
              onChange={(e) => handleStudentIdChange(e.target.value)}
              placeholder="Nhập MSSV (vd: 22520000)"
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400 text-black"
            />
          </div>
        </div>

        {/* EMAIL SINH VIÊN */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            Email sinh viên <span className="text-[10px] text-gray-400 lowercase">(tự động sinh theo mssv)</span>
          </label>
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 font-medium text-gray-600">
            <Mail size={18} className="text-gray-400" />
            <input
              type="email"
              readOnly
              value={studentEmail}
              placeholder="mssv@gm.uit.edu.vn"
              className="w-full bg-transparent text-sm font-medium outline-none cursor-not-allowed text-gray-500"
            />
          </div>
        </div>

        {/* EMAIL CÁ NHÂN */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Email cá nhân</label>
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all focus-within:border-[#0054a5]">
            <AtSign size={18} className="text-[#0054a5]" />
            <input
              type="email"
              value={personalEmail}
              onChange={(e) => setPersonalEmail(e.target.value)}
              placeholder="Nhập email cá nhân"
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400 text-black"
            />
          </div>
        </div>

        {/* LỚP SINH HOẠT */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Lớp sinh hoạt</label>
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all focus-within:border-[#0054a5]">
            <GraduationCap size={18} className="text-[#0054a5]" />
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Nhập lớp sinh hoạt (vd: KTPM2022.1)"
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400 text-black"
            />
          </div>
        </div>

        {/* 🟢 NGÀY SINH: BẤM BẤT KỲ ĐÂU TRONG KHUNG ĐỀU MỞ LỊCH */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold uppercase text-gray-500">Ngày sinh</label>
            <span className="text-[10px] text-gray-400 font-semibold">(Định dạng: Ngày / Tháng / Năm)</span>
          </div>
          <div 
            onClick={handleOpenDatePicker}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all focus-within:border-[#0054a5] cursor-pointer hover:border-gray-300 shadow-xs"
          >
            <Calendar size={18} className="text-[#0054a5] shrink-0" />
            <input
              ref={dateInputRef}
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full bg-transparent text-sm font-medium outline-none cursor-pointer text-gray-800"
            />
          </div>
        </div>

        {/* SỐ ĐIỆN THOẠI */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Số điện thoại</label>
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all focus-within:border-[#0054a5]">
            <Phone size={18} className="text-[#0054a5]" />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400 text-black"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#0054a5] px-6 py-2.5 font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 border-none"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
        </button>
      </div>
    </div>
  );
}
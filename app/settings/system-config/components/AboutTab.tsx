'use client';

import { MapPin, Mail, Facebook } from "lucide-react";

interface AboutTabProps {
  contact: any;
  setContact: (val: any) => void;
}

export default function AboutTab({ contact, setContact }: AboutTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <h3 className="text-xs font-black uppercase text-purple-600 tracking-wider flex items-center gap-2 border-b pb-2">
        <span className="w-2 h-2 bg-purple-600 rounded-full"></span> Thông tin nội dung trang GIỚI THIỆU
      </h3>

      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Đoạn giới thiệu chung</label>
        <textarea rows={3} value={contact.introduction || ""} onChange={(e) => setContact({ ...contact, introduction: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-medium resize-none leading-relaxed" placeholder="Nhập nội dung giới thiệu tổng quan..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Sứ mệnh</label>
          <textarea rows={4} value={contact.mission || ""} onChange={(e) => setContact({ ...contact, mission: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-medium resize-none leading-relaxed" placeholder="Nhập mục tiêu sứ mệnh..." />
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Nhiệm vụ</label>
          <textarea rows={4} value={contact.vocation || ""} onChange={(e) => setContact({ ...contact, vocation: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-medium resize-none leading-relaxed" placeholder="Nhập nhiệm vụ trọng tâm..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Cơ cấu tổ chức</label>
          <textarea rows={4} value={contact.structure || ""} onChange={(e) => setContact({ ...contact, structure: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-medium resize-none leading-relaxed" placeholder="Mô tả các Ban chuyên môn..." />
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Giới thiệu phần mềm</label>
          <textarea rows={4} value={contact.softwareIntro || ""} onChange={(e) => setContact({ ...contact, softwareIntro: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-medium resize-none leading-relaxed" placeholder="Nhập thông tin phần mềm..." />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Địa chỉ Văn phòng Đoàn khoa</label>
        <div className="relative">
          <input type="text" value={contact.address || ""} onChange={(e) => setContact({ ...contact, address: e.target.value })} required className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-bold" placeholder="Nhập địa chỉ..." />
          <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Email liên hệ</label>
          <div className="relative">
            <input type="email" value={contact.email || ""} onChange={(e) => setContact({ ...contact, email: e.target.value })} required className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-bold" placeholder="VD: doankhoa@uit.edu.vn" />
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">Đường dẫn Fanpage Facebook</label>
          <div className="relative">
            <input type="url" value={contact.fanpage || ""} onChange={(e) => setContact({ ...contact, fanpage: e.target.value })} className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-500 transition-all outline-none text-sm font-bold" placeholder="https://facebook.com/..." />
            <Facebook size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
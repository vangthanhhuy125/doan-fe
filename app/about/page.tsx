'use client';

import { useState, useEffect } from "react";
import { Info, Target, ShieldCheck, Award, LayoutDashboard, MapPin, Mail, Facebook, X } from "lucide-react";

export default function GioiThieuPage() {
  const [banners, setBanners] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [config, setConfig] = useState<any>({
    years: [], academicYears: [], semesters: [], classBranches: [], achievements: [],
    contact: { address: "", email: "", fanpage: "", introduction: "", mission: "", vocation: "", structure: "", softwareIntro: "" }
  });

  // State quản lý phần tử thành tích đang chọn để hiển thị PopUp Modal công trình vinh danh
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banner-config`);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.images) && data.images.length > 0) setBanners(data.images);
        }
      } catch (error) { console.error("Lỗi lấy banner:", error); }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    const fetchSystemConfig = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/system-config`);
        if (res.ok) {
          const data = await res.json();
          if (data) setConfig(data);
        }
      } catch (error) { console.error("Lỗi lấy cấu hình hệ thống:", error); }
    };
    fetchSystemConfig();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [banners]);

  const info = config.contact || {};
  const activeAchievements = config.achievements || [];

  return (
    <div className="space-y-8 text-left relative">
      {/* 1. Header Trang */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-3 pb-3">
          <div className="p-2 bg-[#0054a5] rounded-xl text-white shadow-lg shadow-blue-100">
            <LayoutDashboard size={24} />
          </div>
          <h1 className="text-2xl font-black uppercase text-[#0054a5] tracking-tight">Giới thiệu</h1>
        </div>
        <p className="text-gray-500 text-sm">
          Thông tin tổng quan về Hệ thống nghiệp vụ công tác Đoàn của Đoàn khoa Công nghệ Phần mềm,
          trực thuộc Đoàn trường Đại học Công nghệ Thông tin, Đại học Quốc gia thành phố Hồ Chí Minh.
        </p>
      </div>

      {/* 2. Banner chính */}
      <div className="relative h-64 w-full rounded-xl overflow-hidden shadow-lg bg-gray-100 block">
        <img src={banners.length > 0 ? banners[currentIndex] : "/banner-doan.jpg"} alt="Banner Đoàn" className="absolute inset-0 w-full h-full object-cover transition-all duration-500 z-0" />
        <div className="absolute inset-0 bg-blue-900/40 flex items-center px-8 z-10">
          <div className="text-white max-w-lg">
            <h2 className="text-3xl font-bold mb-2">{config.classBranches && config.classBranches.length > 0 ? config.classBranches[config.classBranches.length - 1] : "Đoàn TNCS Hồ Chí Minh khoa Công nghệ Phần mềm"}</h2>
            <p className="text-blue-50 font-medium text-sm leading-relaxed">{info.introduction}</p>
          </div>
        </div>
      </div>

      {/* 3. Lưới thông tin (Grid Sứ mệnh, Nhiệm vụ, Cơ cấu) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white mb-4 shadow-md"><Target size={24} /></div>
          <h3 className="font-bold text-gray-800 mb-2">Sứ mệnh</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{info.mission}</p>
        </div>
        <div className="p-6 bg-green-50 rounded-xl border border-green-100 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white mb-4 shadow-md"><ShieldCheck size={24} /></div>
          <h3 className="font-bold text-gray-800 mb-2">Nhiệm vụ</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{info.vocation}</p>
        </div>
        <div className="p-6 bg-purple-50 rounded-xl border border-purple-100 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white mb-4 shadow-md"><Info size={24} /></div>
          <h3 className="font-bold text-gray-800 mb-2">Cơ cấu</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{info.structure}</p>
        </div>
      </div>

      {/* ĐÃ SỬA: BIẾN KHỐI THÀNH TÍCH THÀNH LƯỚI GRID HÌNH ẢNH LỊCH SỬ KÈM NĂM HỌC */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Award size={22} className="text-yellow-500" />
          Thành tích nổi bật qua các năm học
        </h3>
        
        {activeAchievements.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeAchievements.map((ach: any, idx: number) => (
              <div 
                key={idx} 
                onClick={() => setSelectedAchievement(ach)}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-44 w-full bg-gray-50 overflow-hidden shadow-inner flex items-center justify-center text-slate-300">
                  {ach.image ? (
                    <img src={ach.image} alt={ach.academicYear} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <Award size={48} className="text-slate-200" />
                  )}
                  <div className="absolute top-3 right-3 bg-yellow-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">{ach.academicYear}</div>
                </div>
                <div className="p-4 text-center bg-slate-50 group-hover:bg-yellow-50/50 border-t transition-colors">
                  <h4 className="font-black text-slate-700 text-sm tracking-wide">NĂM HỌC {ach.academicYear}</h4>
                  <p className="text-[10px] text-purple-600 font-bold mt-1 tracking-wider">Xem tóm tắt thành tích ›</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-xl italic text-gray-400 text-sm font-bold">Chưa có dữ liệu thành tích lịch sử...</div>
        )}
      </div>

      {/* ĐÃ THÊM MỚI: BỘ POPUP MODAL HIỂN THỊ CHI TIẾT THÀNH TÍCH KHI NGƯỜI DÙNG NHẤP VÀO */}
      {selectedAchievement && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300 text-black">
            {/* Header popup màu vàng vinh danh */}
            <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Award size={22} className="animate-bounce" />
                <h3 className="font-black tracking-widest text-sm">Thành tích năm học {selectedAchievement.academicYear}</h3>
              </div>
              <button onClick={() => setSelectedAchievement(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white"><X size={20} /></button>
            </div>
            {/* Nội dung popup */}
            <div className="p-6 overflow-y-auto space-y-5">
              {selectedAchievement.image && (
                <div className="w-full h-64 rounded-2xl overflow-hidden shadow-md bg-gray-50">
                  <img src={selectedAchievement.image} alt="Bìa vinh danh" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-yellow-600 uppercase tracking-widest">Nội dung chi tiết thành tích đạt được</h4>
                <p className="text-gray-700 text-sm font-medium leading-loose whitespace-pre-line bg-amber-50/30 p-5 rounded-2xl border border-amber-100/50">
                  {selectedAchievement.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Về phần mềm quản lý & Liên hệ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-5">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><span className="w-2 h-6 bg-blue-600 rounded-full"></span>Về phần mềm quản lý</h3>
          <p className="text-gray-700 text-sm leading-loose">{info.softwareIntro}</p>
        </div>

        <div className="bg-[#0054a5] p-8 rounded-xl text-white shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-6 border-b border-white/20 pb-2">Thông tin liên hệ</h3>
            <div className="space-y-4 text-[13px] font-medium opacity-95">
              <div className="flex items-start gap-3"><MapPin size={16} className="shrink-0 mt-0.5" /><p><strong>Địa chỉ:</strong> {info.address}</p></div>
              <div className="flex items-center gap-3"><Mail size={16} className="shrink-0" /><p><strong>Email:</strong> {info.email}</p></div>
            </div>
          </div>
          {info.fanpage && (
            <div className="pt-6 border-t border-white/10 mt-6">
              <a href={info.fanpage} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all"><Facebook size={36} /><span>Fanpage Đoàn - Hội khoa Công nghệ Phần mềm, trường ĐH Công nghệ Thông tin, ĐHQG-HCM</span></a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}